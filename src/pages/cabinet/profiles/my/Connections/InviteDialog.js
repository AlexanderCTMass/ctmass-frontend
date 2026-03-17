import { useCallback, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    Divider,
    IconButton,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import * as Yup from 'yup'
import { emailService } from 'src/service/email-service';
import { useAuth } from "src/hooks/use-auth";
import { CATEGORY_META } from './utils';

const CategoryCard = ({ categoryKey, meta, selected, onSelect }) => {
    const theme = useTheme();
    return (
        <Box
            onClick={() => onSelect(categoryKey)}
            sx={{
                flex: '1 1 calc(50% - 8px)',
                minWidth: 0,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: selected ? theme.palette[meta.color]?.main || 'primary.main' : 'divider',
                bgcolor: selected ? `${meta.color}.lighter` : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                    borderColor: theme.palette[meta.color]?.main || 'primary.main',
                    bgcolor: `${meta.color}.lighter`
                }
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Box sx={{ color: `${meta.color}.main` }}>{meta.icon}</Box>
                <Typography variant="body2" fontWeight={selected ? 700 : 500} noWrap>
                    {meta.title}
                </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                {meta.description}
            </Typography>
        </Box>
    );
};

export const InviteDialog = ({ open, onClose, categoryMeta: categoryMetaProp, profileId }) => {
    const [channel, setChannel] = useState('email');
    const [to, setTo] = useState('');
    const [text, setText] = useState('');
    const [selectedCategoryKey, setSelectedCategoryKey] = useState('trustedColleagues');
    const { user } = useAuth();

    const activeMeta = categoryMetaProp || CATEGORY_META[selectedCategoryKey];

    const schema = Yup.object({
        to: channel === 'email'
            ? Yup.string().email('Invalid e-mail').required()
            : Yup.string()
                .matches(/^\+1\d{10}$/, 'Use format +1XXXXXXXXXX')
                .required()
    });
    const valid = schema.isValidSync({ to });

    const handleSend = useCallback(async () => {
        await emailService.sendInviteEmail({
            inviterName: user?.name || 'CTMASS user',
            toEmail: to,
            categoryTitle: activeMeta.title,
            profileId,
            personalText: text
        });
        onClose();
    }, [user?.name, to, activeMeta.title, profileId, text, onClose]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Invite a Friend
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <Box sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                    {!categoryMetaProp && (
                        <Box>
                            <Typography variant="body2" fontWeight={600} mb={1.5}>
                                Add to category
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                                    <CategoryCard
                                        key={key}
                                        categoryKey={key}
                                        meta={meta}
                                        selected={selectedCategoryKey === key}
                                        onSelect={setSelectedCategoryKey}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {categoryMetaProp && (
                        <Typography variant="body2" color="text.secondary">
                            Inviting to: <strong>{activeMeta.title}</strong>
                        </Typography>
                    )}

                    <RadioGroup row value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <Stack direction="row" spacing={3}>
                            <label><Radio value="email" />Email</label>
                            <label><Radio value="phone" disabled />Phone (soon)</label>
                        </Stack>
                    </RadioGroup>

                    <TextField
                        label={channel === 'email' ? 'E-mail address' : 'Phone number'}
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        fullWidth
                        error={!valid && !!to}
                        helperText={!valid && to ? (channel === 'email'
                            ? 'Enter a valid e-mail'
                            : 'Use format +1XXXXXXXXXX') : ' '}
                    />

                    <TextField
                        label="Personal message (optional)"
                        multiline
                        minRows={4}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        fullWidth
                        placeholder="I'd love to connect with you on CTMASS…"
                    />

                    <Typography variant="caption" color="text.secondary">
                        Recipient will receive an invitation to join CTMASS in category «{activeMeta.title}».
                        {text && ' Personal note is attached.'}
                    </Typography>

                    <Box textAlign="right">
                        <Button variant="contained" disabled={!valid} onClick={handleSend}>
                            Send invitation
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Dialog>
    );
};