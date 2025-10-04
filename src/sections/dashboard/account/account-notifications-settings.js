import {
  Box, Button, FormControlLabel, Paper, Radio, RadioGroup,
  Stack, Typography, Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { profileApi } from 'src/api/profile';
import { emailService } from 'src/service/email-service';
import toast from 'react-hot-toast';

const freqValues = [
  ['immediately', 'Immediately – receive notifications as soon as updates happen'],
  ['daily', 'Once a day – daily summary'],
  ['every_three_days', 'Once every three days'],
  ['weekly', 'Once a week – weekly updates'],
  ['monthly', 'Once a month – monthly updates'],
  ['never', 'I do not want to receive any notifications']
];

const defaultPrefs = {
  email: { frequency: 'immediately', isActive: true, lastUpdated: null },
  phone: { frequency: 'immediately', isActive: false, lastUpdated: null },
  messenger: { frequency: 'immediately', isActive: false, lastUpdated: null }
};

const ChannelBlock = ({ label, channelKey, disabled, value, onChange }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 1 }}>{label}</Typography>

    {disabled &&
      <Alert severity="warning" icon={false} sx={{ mb: 2 }}>
        ⚠️ This channel is under development, the functionality will appear soon.
      </Alert>}

    <RadioGroup
      value={value}
      onChange={(e) => onChange(channelKey, e.target.value)}
    >
      {freqValues.map(([val, txt]) => (
        <FormControlLabel
          key={val} value={val} control={<Radio />}
          label={txt} disabled={disabled}
        />
      ))}
    </RadioGroup>
  </Paper>
);

export const AccountNotificationsSettings = ({ user, handleProfileChange }) => {
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    setPrefs({ ...defaultPrefs, ...user.notificationPreferences });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.notificationPreferences]);

  const handleChange = (channel, frequency) => {
    setPrefs(prev => ({
      ...prev,
      [channel]: { ...prev[channel], frequency, lastUpdated: new Date().toISOString() }
    }));
  };

  const handleSave = async () => {
    try {
      await handleProfileChange({ notificationPreferences: prefs });
      await emailService.sendNotificationPreferencesUpdatedEmail(user, prefs.email.frequency);

      toast.success('Notification preferences saved');
    } catch (e) {
      console.error(e)
      toast.error('Failed to save preferences')
    }
  };

  return (
    <Stack spacing={3}>
      <ChannelBlock
        label="Email notifications"
        channelKey="email"
        value={prefs.email?.frequency}
        onChange={handleChange}
        disabled={false}
      />
      <ChannelBlock
        label="Phone notifications (SMS)"
        channelKey="phone"
        value={prefs.phone?.frequency}
        onChange={handleChange}
        disabled
      />
      <ChannelBlock
        label="Internal messenger notifications"
        channelKey="messenger"
        value={prefs.messenger?.frequency}
        onChange={handleChange}
        disabled
      />
      <Typography variant="caption">
        By checking a box, you consent to receive communications according to your selected preference.
      </Typography>
      <Box>
        <Button variant="contained" onClick={handleSave}>Save notification preferences</Button>
      </Box>
    </Stack>
  );
};