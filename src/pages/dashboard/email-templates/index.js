import { useEffect, useState } from 'react';
import {
    Box, Button, Container, Stack, Typography
} from '@mui/material';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { Seo } from 'src/components/seo';
import { emailTemplateService } from 'src/service/email-template-service';
import { EmailTemplatesTable } from './email-templates-table';
import { EmailTemplateEditorDrawer } from './email-template-editor-drawer';

const Page = () => {
    const [templates, setTemplates] = useState([]);
    const [openEditor, setOpenEditor] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetch = async () => {
        const list = await emailTemplateService.list();

        const latestActiveByTrigger = {};

        list.forEach(doc => {
            const active = Object.values(doc.versions || {})
                .find(v => v.isActive);
            if (!active) return;

            const t = doc.trigger;
            const ts = active.createdAt?.toMillis?.() ?? 0;

            if (!latestActiveByTrigger[t] || ts > latestActiveByTrigger[t].ts) {
                latestActiveByTrigger[t] = { id: doc.id, ts };
            }
        });

        const withFlag = list.map(doc => ({
            ...doc,
            latestActive: latestActiveByTrigger[doc.trigger]?.id === doc.id
        }));

        setTemplates(withFlag);
    };

    useEffect(() => { fetch(); }, []);

    const handleEdit = (tpl) => {
        setEditing(tpl);
        setOpenEditor(true);
    };

    const handleClose = () => {
        setEditing(null);
        setOpenEditor(false);
        fetch();
    };

    return (
        <>
            <Seo title="Dashboard: Email templates" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h4">Email templates</Typography>
                            <Button
                                startIcon={<PlusIcon />}
                                variant="contained"
                                onClick={() => { setEditing(null); setOpenEditor(true); }}
                            >
                                Add
                            </Button>
                        </Stack>
                        <EmailTemplatesTable items={templates} onEdit={handleEdit} />
                    </Stack>
                </Container>
            </Box>

            <EmailTemplateEditorDrawer
                open={openEditor}
                onClose={handleClose}
                template={editing}
            />
        </>
    );
};

export default Page;