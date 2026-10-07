import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Box, Button, CircularProgress, Skeleton, Stack, Switch, TextField, Typography } from '@mui/material';
import { partnerAdsApi } from 'src/api/partner-ads';
import { AD_PLACEMENTS, getDisplayStatus } from 'src/constants/partner-ads';
import { cardSx, inputSx, outlinedButtonSx, pa, primaryButtonSx } from './tokens';
import { usePartnerAdsData } from './use-partner-ads-data';

const clampInt = (value, min, max) => {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, number));
};

export const PlacementsSettings = () => {
    const { settings, banners } = usePartnerAdsData();
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings && !draft) setDraft(settings);
    }, [settings, draft]);

    const dirty = draft && settings && JSON.stringify(draft) !== JSON.stringify(settings);

    const change = (key, field, value) => {
        setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    };

    const save = async () => {
        setSaving(true);
        try {
            const normalized = {};
            AD_PLACEMENTS.forEach(({ key }) => {
                const item = draft[key];
                normalized[key] = {
                    enabled: Boolean(item.enabled),
                    maxItems: clampInt(item.maxItems, 1, 10),
                    autoplayMs: clampInt(item.autoplayMs, 0, 30000),
                    every: clampInt(item.every, 1, 20)
                };
            });
            await partnerAdsApi.saveSettings(normalized);
            setDraft(normalized);
            toast.success('Placement settings saved');
        } catch (error) {
            toast.error(error?.message || 'Could not save the settings');
        } finally {
            setSaving(false);
        }
    };

    const liveCount = (key) =>
        banners.filter((banner) => banner.placements?.[key] && getDisplayStatus(banner) === 'active').length;

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
            >
                <Box>
                    <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 800, color: pa.text, letterSpacing: '-0.4px' }}>
                        Placements
                    </Typography>
                    <Typography sx={{ color: pa.textSecondary, fontSize: 14.5 }}>
                        Where banners appear in the app and how they behave. Changes reach the app the next time it refreshes its
                        banner config (within about 10 minutes).
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" sx={outlinedButtonSx} disabled={!dirty || saving} onClick={() => setDraft(settings)}>
                        Discard
                    </Button>
                    <Button
                        variant="contained"
                        sx={primaryButtonSx}
                        disabled={!dirty || saving}
                        onClick={save}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Save changes
                    </Button>
                </Stack>
            </Stack>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
                {AD_PLACEMENTS.map((placement) => {
                    const item = draft?.[placement.key];
                    return (
                        <Stack key={placement.key} spacing={2} sx={{ ...cardSx, p: 3 }}>
                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: pa.text }}>{placement.label}</Typography>
                                    <Typography sx={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: pa.primaryHover }}>
                                        {placement.key}
                                    </Typography>
                                </Box>
                                {item ? (
                                    <Switch
                                        checked={item.enabled}
                                        onChange={(event) => change(placement.key, 'enabled', event.target.checked)}
                                        sx={{
                                            '& .Mui-checked': { color: `${pa.primary} !important` },
                                            '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${pa.primary} !important` }
                                        }}
                                        inputProps={{ 'aria-label': `Show banners in ${placement.label}` }}
                                    />
                                ) : null}
                            </Stack>
                            <Typography sx={{ fontSize: 13.5, color: pa.textSecondary }}>
                                {placement.description} Audience: {placement.audience.toLowerCase()}.
                            </Typography>
                            {item ? (
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        label="Max banners"
                                        value={item.maxItems}
                                        onChange={(event) => change(placement.key, 'maxItems', event.target.value)}
                                        inputProps={{ min: 1, max: 10 }}
                                        sx={inputSx}
                                        fullWidth
                                    />
                                    {placement.kind === 'carousel' ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Auto-scroll (seconds)"
                                            value={item.autoplayMs / 1000}
                                            onChange={(event) =>
                                                change(placement.key, 'autoplayMs', Math.round(Number(event.target.value) * 1000))
                                            }
                                            inputProps={{ min: 0, max: 30, step: 0.5 }}
                                            helperText="0 turns auto-scroll off"
                                            sx={inputSx}
                                            fullWidth
                                        />
                                    ) : (
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Show after every N cards"
                                            value={item.every}
                                            onChange={(event) => change(placement.key, 'every', event.target.value)}
                                            inputProps={{ min: 1, max: 20 }}
                                            sx={inputSx}
                                            fullWidth
                                        />
                                    )}
                                </Stack>
                            ) : (
                                <Skeleton variant="rounded" height={40} />
                            )}
                            <Typography sx={{ fontSize: 12.5, color: pa.textMuted }}>
                                {liveCount(placement.key)} banner{liveCount(placement.key) === 1 ? '' : 's'} live here now
                            </Typography>
                        </Stack>
                    );
                })}
            </Box>
        </Stack>
    );
};
