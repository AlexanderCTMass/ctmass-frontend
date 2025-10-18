import { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, Stack, Typography, MenuItem
} from '@mui/material';
import toast from 'react-hot-toast';
import { emailTemplateService } from 'src/service/email-template-service';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import Handlebars from 'handlebars/dist/handlebars.min.js';
import { triggerOptions } from 'src/constants/email-triggers';

const textToHtml = (t = '') =>
    '<pre style="font-family:Inter,Arial,Helvetica,sans-serif;white-space:pre-wrap">'
    + Handlebars.Utils.escapeExpression(t)
    + '</pre>';

export const EmailTemplateEditorDrawer = ({ open, onClose, template }) => {
    const [subject, setSubject] = useState('');
    const [htmlCode, setHtmlCode] = useState('');
    const [trigger, setTrigger] = useState('');
    const [textCode, setTextCode] = useState('');
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        if (!template) {
            setSubject('');
            setHtmlCode('');
            setTextCode('');
            setTrigger('');
        } else {
            const active = Object.values(template.versions).find(v => v.isActive);
            setSubject(active.subject);
            setHtmlCode(active.htmlTemplate);
            setTextCode(active.textVersion || '');
            setTrigger(template.trigger || '');
        }
    }, [template, open]);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const data = {};

                if (!Handlebars.helpers.eq) {
                    Handlebars.registerHelper('eq', (a, b) => a === b);
                }

                let htmlPreview = '';
                if (htmlCode) {
                    htmlPreview = Handlebars.compile(htmlCode, { noEscape: true })(data);
                } else if (textCode) {
                    htmlPreview = Handlebars.compile(textToHtml(textCode), { noEscape: true })(data);
                }
                setPreview(htmlPreview);
            } catch (e) {
                setPreview(`<pre style="color:red">${e.message}</pre>`);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [htmlCode, textCode]);

    const handleSave = async () => {
        if (!subject || !trigger) {
            toast.error('Subject and Trigger are required');
            return;
        }
        if (!htmlCode && !textCode) {
            toast.error('Either HTML or Text version must be provided');
            return;
        }
        try {
            await emailTemplateService.createOrUpdate(
                template?.name || subject.toLowerCase().replace(/\s/g, '_'),
                {
                    version: `v${Date.now()}`,
                    subject,
                    htmlTemplate: htmlCode,
                    textVersion: textCode,
                    category: template?.category || 'general',
                    trigger,
                    enabled: true,
                },
                'userId-from-context'
            );
            toast.success('Saved');
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Save error');
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <DialogTitle>{template ? 'Edit template' : 'New template'}</DialogTitle>
            <DialogContent dividers>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ height: '100%' }}>
                    <Box sx={{ flexBasis: '50%', height: '100%', overflow: 'auto' }}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="Event trigger"
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                helperText="Choose what event will use this template"
                            >
                                {triggerOptions.map(o => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />

                            <Typography variant="subtitle2">HTML template</Typography>
                            <CodeMirror
                                height="300px"
                                theme="light"
                                value={htmlCode}
                                extensions={[html()]}
                                onChange={(v) => setHtmlCode(v)}
                            />

                            <Typography variant="subtitle2">Text version</Typography>
                            <CodeMirror
                                height="150px"
                                theme="light"
                                value={textCode}
                                extensions={[html()]}
                                onChange={(v) => setTextCode(v)}
                            />
                        </Stack>
                    </Box>

                    <Box sx={{ flexBasis: '50%', height: '100%', overflow: 'auto', bgcolor: 'background.paper', p: 2 }}>
                        <Typography variant="subtitle2">Preview</Typography>
                        <Box
                            sx={{ border: 1, borderColor: 'divider', height: '100%', p: 1 }}
                            dangerouslySetInnerHTML={{ __html: preview }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};