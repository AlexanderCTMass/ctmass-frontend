import { useEffect, useState, useRef } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, Stack, Typography, MenuItem, InputAdornment
} from '@mui/material';
import toast from 'react-hot-toast';
import { emailTemplateService } from 'src/service/email-template-service';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { VARIABLE_SCHEMAS } from 'src/constants/email-variables';
import { VariablePicker } from './variable-picker';
import { insertAtCursor } from 'src/utils/insertAtCursor';
import Handlebars from 'handlebars/dist/handlebars.min.js';
import { triggerOptions } from 'src/constants/email-triggers';

const textToHtml = (t = '') =>
    '<pre style="font-family:Inter,Arial,Helvetica,sans-serif;white-space:pre-wrap">'
    + Handlebars.Utils.escapeExpression(t)
    + '</pre>';

export const EmailTemplateEditorDrawer = ({ open, onClose, template }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [htmlCode, setHtmlCode] = useState('');
    const [trigger, setTrigger] = useState('');
    const [textCode, setTextCode] = useState('');
    const [preview, setPreview] = useState('');
    const [focus, setFocus] = useState(null);

    const subjectRef = useRef(null);
    const htmlViewRef = useRef();
    const textViewRef = useRef();

    const variablesForTrigger = VARIABLE_SCHEMAS[trigger]?.variables ?? [];

    useEffect(() => {
        if (!open) {
            return;
        }

        if (!template) {
            setName('');
            setSubject('');
            setHtmlCode('');
            setTextCode('');
            setTrigger('');
        } else {
            const versions = Object.values(template.versions || {});
            const ver =
                versions.find(v => v.isActive) ||
                versions.sort((a, b) =>
                    (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
                )[0];

            setName(template.name ?? template.id);
            setSubject(ver?.subject || '');
            setHtmlCode(ver?.htmlTemplate || '');
            setTextCode(ver?.textVersion || '');
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

    const insertVariable = (tmpl) => {
        switch (focus) {
            case 'subject':
                if (subjectRef.current) insertAtCursor(subjectRef.current, tmpl);
                setSubject(subjectRef.current.value);
                break;

            case 'html':
                if (htmlViewRef.current) {
                    const v = htmlViewRef.current;
                    v.dispatch({ changes: { from: v.state.selection.main.from, to: v.state.selection.main.to, insert: tmpl } });
                    setHtmlCode(v.state.doc.toString());
                }
                break;

            case 'text':
                if (textViewRef.current) {
                    const v = textViewRef.current;
                    v.dispatch({ changes: { from: v.state.selection.main.from, to: v.state.selection.main.to, insert: tmpl } });
                    setTextCode(v.state.doc.toString());
                }
                break;

            default:
        }
    };

    const handleSave = async () => {
        if (!subject || !trigger || !name) {
            toast.error('Name, Subject and Trigger are required');
            return;
        }
        if (!htmlCode && !textCode) {
            toast.error('Either HTML or Text version must be provided');
            return;
        }
        try {
            await emailTemplateService.createOrUpdate(
                name,
                {
                    version: `v${Date.now()}`,
                    subject,
                    htmlTemplate: htmlCode,
                    textVersion: textCode,
                    trigger,
                    enabled: true,
                    variableSchema: VARIABLE_SCHEMAS[trigger] ?? {}
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
            <DialogContent dividers sx={{ p: 0 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ height: '100%' }}>
                    <Box sx={{ flexBasis: '50%', height: '100%', overflow: 'auto', p: 3 }}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="Event trigger"
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                helperText="Choose event that uses this template"
                            >
                                {triggerOptions.map(o => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Template name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => setFocus('name')}
                            />

                            <TextField
                                inputRef={subjectRef}
                                label="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                onFocus={() => setFocus('subject')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <VariablePicker variables={variablesForTrigger} onSelect={insertVariable} disabled={!trigger} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                HTML template <VariablePicker variables={variablesForTrigger} onSelect={insertVariable} disabled={!trigger} />
                            </Typography>
                            <CodeMirror
                                height="300px"
                                theme="light"
                                value={htmlCode}
                                basicSetup={{ lineNumbers: true }}
                                extensions={[html()]}
                                onFocus={() => setFocus('html')}
                                onCreateEditor={(v) => { htmlViewRef.current = v; }}
                                onChange={(v) => setHtmlCode(v)}
                            />

                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                Text version <VariablePicker variables={variablesForTrigger} onSelect={insertVariable} disabled={!trigger} />
                            </Typography>
                            <CodeMirror
                                height="150px"
                                theme="light"
                                value={textCode}
                                basicSetup={{ lineNumbers: true }}
                                extensions={[html()]}
                                onFocus={() => setFocus('text')}
                                onCreateEditor={(v) => { textViewRef.current = v; }}
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