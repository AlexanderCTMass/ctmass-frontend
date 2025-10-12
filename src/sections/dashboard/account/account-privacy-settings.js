import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'src/store';
import { savePrivacyThunk } from 'src/thunks/profilePrivacy';

const Row = ({ label, value, onChange }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
        <div>
            <Typography variant="subtitle2">{label}</Typography>
            <Typography variant="caption" color="text.secondary">Visible to other users</Typography>
        </div>
        <FormControlLabel
            control={<Switch checked={value} onChange={(e) => onChange(e.target.checked)} />}
            label=""
        />
    </Box>
);

export const AccountPrivacySettings = () => {
    const dispatch = useDispatch();
    const settings = useSelector(s => s.profile.privacySettings);

    const handle = (key) => (checked) => {
        dispatch(savePrivacyThunk({ [key]: checked }));
    };

    return (
        <Box sx={{ maxWidth: 480 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Privacy Settings</Typography>
            <Row label="Name" value={settings.name} onChange={handle('name')} />
            <Row label="Email" value={settings.email} onChange={handle('email')} />
            <Row label="Phone" value={settings.phone} onChange={handle('phone')} />
            <Row label="Location" value={settings.location} onChange={handle('location')} />
        </Box>
    );
};