import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { emailService } from 'src/service/email-service';
import toast from 'react-hot-toast';
import { btn, focusRingSx, IconTile, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';

const FREQUENCIES = [
  { value: 'immediately', title: 'Right away', text: 'As soon as something happens' },
  { value: 'daily', title: 'Daily', text: 'One summary a day' },
  { value: 'every_three_days', title: 'Every 3 days', text: 'A short digest twice a week' },
  { value: 'weekly', title: 'Weekly', text: 'One summary a week' },
  { value: 'monthly', title: 'Monthly', text: 'One summary a month' },
  { value: 'never', title: 'Off', text: 'No email notifications' }
];

const defaultPrefs = {
  email: { frequency: 'immediately', isActive: true, lastUpdated: null },
  phone: { frequency: 'immediately', isActive: false, lastUpdated: null },
  messenger: { frequency: 'immediately', isActive: false, lastUpdated: null }
};

const SOON = [
  { key: 'phone', icon: <SmsOutlinedIcon />, title: 'Text messages (SMS)' },
  { key: 'messenger', icon: <ChatBubbleOutlineRoundedIcon />, title: 'Messenger alerts' }
];

export const AccountNotificationsSettings = ({ user, handleProfileChange }) => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPrefs({ ...defaultPrefs, ...user.notificationPreferences });
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.notificationPreferences]);

  const handleChange = (channel, frequency) => {
    setDirty(true);
    setPrefs((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], frequency, lastUpdated: new Date().toISOString() }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await handleProfileChange({ notificationPreferences: prefs });
      await emailService.sendNotificationPreferencesUpdatedEmail(user, prefs.email.frequency);
      setDirty(false);
      toast.success('Notification preferences saved');
    } catch (e) {
      console.error(e);
      toast.error("We couldn't save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const current = prefs.email?.frequency || 'immediately';

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ mb: 1.5, fontSize: 14, fontWeight: 700, color: BRAND.ink }}>Email frequency</Typography>
        <Box
          role="radiogroup"
          aria-label="Email frequency"
          sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}
        >
          {FREQUENCIES.map((option) => {
            const active = current === option.value;
            return (
              <Box
                key={option.value}
                component="button"
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleChange('email', option.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 2,
                  textAlign: 'left',
                  font: 'inherit',
                  cursor: 'pointer',
                  borderRadius: RADIUS.inner,
                  border: `1.5px solid ${active ? BRAND.green : alpha(BRAND.navy, 0.12)}`,
                  bgcolor: active ? alpha(BRAND.green, 0.06) : '#FFFFFF',
                  transition: 'border-color .2s ease, background-color .2s ease',
                  '&:hover': { borderColor: active ? BRAND.green : alpha(BRAND.navy, 0.3) },
                  ...focusRingSx
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    mt: '1px',
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${active ? BRAND.green : alpha(BRAND.navy, 0.25)}`,
                    bgcolor: active ? BRAND.green : 'transparent',
                    color: '#FFFFFF',
                    '& svg': { fontSize: 14 }
                  }}
                >
                  {active && <CheckRoundedIcon />}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>{option.title}</Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 13, color: BRAND.muted }}>{option.text}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack spacing={1}>
        {SOON.map((item) => (
          <Stack
            key={item.key}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ p: 1.5, borderRadius: RADIUS.inner, bgcolor: BRAND.mist }}
          >
            <IconTile size={40} tone="navy">{item.icon}</IconTile>
            <Typography sx={{ flex: 1, fontWeight: 600, color: BRAND.ink }}>{item.title}</Typography>
            <StatusPill tone="navy">Coming soon</StatusPill>
          </Stack>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ gap: 2, pt: 1 }}>
        <Typography sx={{ fontSize: 13, color: BRAND.muted, maxWidth: 480 }}>
          By saving, you agree to receive messages at the frequency you picked.
        </Typography>
        <Button onClick={handleSave} disabled={saving || !dirty} sx={{ ...btn.green, px: 3 }}>
          {saving ? 'Saving...' : dirty ? 'Save preferences' : 'Saved'}
        </Button>
      </Stack>
    </Stack>
  );
};
