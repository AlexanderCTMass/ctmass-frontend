import { useState } from 'react';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControlLabel, IconButton, Stack, Typography, Chip, SvgIcon
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RecommendIcon from '@mui/icons-material/Recommend';
import PlaceIcon from '@mui/icons-material/Place';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { sendFriendRequestWithCategories } from 'src/service/friend-service'
import { useNavigate, useLocation } from 'react-router-dom';
import { paths } from 'src/paths';

export const CATEGORY_META = {
    trustedColleagues: { title: 'Trusted Colleagues', color: 'success', icon: <RecommendIcon fontSize="small" /> },
    localPros: { title: 'Local Pros', color: 'info', icon: <PlaceIcon fontSize="small" /> },
    pastClients: { title: 'Past Clients', color: 'warning', icon: <HandshakeIcon fontSize="small" /> },
    interestedHomeowners: { title: 'Interested Homeowners', color: 'secondary', icon: <VisibilityIcon fontSize="small" /> }
};

export default function ConnectViaQRDialog({ open, onClose, targetUserId, targetName }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cats, setCats] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleContinue = async () => {
        if (!cats.length) {
            toast.error('Choose at least one category');
            return;
        }

        if (!user) {
            localStorage.setItem('qrConnect', JSON.stringify({
                targetUserId,
                cats
            }));
            navigate(paths.register.index, { state: { from: location.pathname } });
            return;
        }

        try {
            setSaving(true);
            await sendFriendRequestWithCategories(user, targetUserId, cats);
            toast.success('Request sent ✅');
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pr: 6 }}>
                Want to connect with {targetName}?
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={saving}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Typography sx={{ mb: 2 }}>
                    Select how you know this person – we will send a friend request with these categories.
                </Typography>

                <Stack spacing={0}>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <FormControlLabel
                            key={key}
                            control={
                                <Checkbox
                                    checked={cats.includes(key)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCats(prev =>
                                            checked ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
                                        );
                                    }}
                                />
                            }
                            sx={{
                                m: 0, px: 2, alignItems: 'center',
                                '& .MuiFormControlLabel-label': { width: '100%' }
                            }}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SvgIcon>{meta.icon}</SvgIcon>
                                    <Typography>{meta.title}</Typography>
                                    {cats.includes(key) &&
                                        <Chip size="small" color={meta.color} label="Selected" />}
                                </Stack>
                            }
                        />
                    ))}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">Skip</Button>
                <Button variant="contained" onClick={handleContinue} disabled={saving}>
                    {saving ? 'Saving…' : 'Continue'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
