import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import { partnerAdsApi } from 'src/api/partner-ads';
import { ctr, getDisplayStatus } from 'src/constants/partner-ads';
import { useAuth } from 'src/hooks/use-auth';
import { BannerFormDialog } from './banner-form-dialog';
import { BannerStatsDialog } from './banner-stats-dialog';
import { BannersTable } from './banners-table';
import { ConfirmDialog } from './confirm-dialog';
import { formatNumber } from './date-utils';
import { StatCard } from './stat-card';
import { primaryButtonSx, pa } from './tokens';
import { usePartnerAdsData } from './use-partner-ads-data';

const CONFIRMS = {
    archive: (banner) => ({
        title: 'Archive this banner?',
        message: `“${banner.title}” will stop showing in the app right away. You can restore it from the Archive later.`,
        confirmLabel: 'Archive'
    }),
    delete: (banner) => ({
        title: 'Delete this banner permanently?',
        message: `“${banner.title}”, its images and all of its statistics will be deleted. This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true
    })
};

export const BannersManager = ({ archived = false }) => {
    const { user } = useAuth();
    const { banners, stats, loading, metricsById } = usePartnerAdsData();
    const [form, setForm] = useState({ open: false, banner: null, key: 0 });
    const [statsBannerId, setStatsBannerId] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const visible = useMemo(
        () => banners.filter((banner) => (archived ? banner.status === 'archived' : banner.status !== 'archived')),
        [banners, archived]
    );
    const existingIds = useMemo(() => new Set(banners.map((banner) => banner.id)), [banners]);

    const totals = useMemo(() => {
        const now = Date.now();
        const current = banners.filter((banner) => banner.status !== 'archived');
        const impressions = banners.reduce((sum, b) => sum + (metricsById[b.id]?.impressions || 0), 0);
        const clicks = banners.reduce((sum, b) => sum + (metricsById[b.id]?.clicks || 0), 0);
        return {
            total: current.length,
            live: current.filter((banner) => getDisplayStatus(banner, now) === 'active').length,
            scheduled: current.filter((banner) => getDisplayStatus(banner, now) === 'scheduled').length,
            impressions,
            clicks,
            ctr: ctr(clicks, impressions)
        };
    }, [banners, metricsById]);

    const run = async (task, success) => {
        try {
            await task();
            toast.success(success);
        } catch (error) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleAction = (action, banner) => {
        switch (action) {
            case 'edit':
                setForm((prev) => ({ open: true, banner, key: prev.key + 1 }));
                break;
            case 'stats':
                setStatsBannerId(banner.id);
                break;
            case 'pause':
                run(() => partnerAdsApi.setStatus(banner, 'paused', user), 'Banner paused');
                break;
            case 'resume':
            case 'publish':
                run(() => partnerAdsApi.setStatus(banner, 'active', user), action === 'publish' ? 'Banner published' : 'Banner resumed');
                break;
            case 'restore':
                run(() => partnerAdsApi.restore(banner, user), 'Banner restored');
                break;
            case 'archive':
                setConfirm({
                    ...CONFIRMS.archive(banner),
                    onConfirm: () => run(() => partnerAdsApi.archive(banner, user), 'Banner archived')
                });
                break;
            case 'delete':
                setConfirm({
                    ...CONFIRMS.delete(banner),
                    onConfirm: () => run(() => partnerAdsApi.remove(banner), 'Banner deleted')
                });
                break;
            default:
                break;
        }
    };

    const statsBanner = banners.find((banner) => banner.id === statsBannerId) || null;

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
                        {archived ? 'Archive' : 'Banner management'}
                    </Typography>
                    <Typography sx={{ color: pa.textSecondary, fontSize: 14.5 }}>
                        {archived
                            ? 'Archived banners are hidden from the app. Restore them or delete them for good.'
                            : 'Create, schedule and track partner banners shown in the CTMASS mobile app.'}
                    </Typography>
                </Box>
                {!archived ? (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ ...primaryButtonSx, px: 2.5, py: 1.25, flexShrink: 0 }}
                        onClick={() => setForm((prev) => ({ open: true, banner: null, key: prev.key + 1 }))}
                    >
                        Create banner
                    </Button>
                ) : null}
            </Stack>

            {!archived ? (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }
                    }}
                >
                    <StatCard
                        label="Banners"
                        value={loading ? '—' : formatNumber(totals.total)}
                        caption={`${totals.live} live now · ${totals.scheduled} scheduled`}
                        icon={FlagOutlinedIcon}
                    />
                    <StatCard
                        label="Impressions"
                        value={loading ? '—' : formatNumber(totals.impressions)}
                        caption="All time, all banners"
                        icon={VisibilityOutlinedIcon}
                    />
                    <StatCard
                        label="Clicks"
                        value={loading ? '—' : formatNumber(totals.clicks)}
                        caption="Taps that opened the partner link"
                        icon={TouchAppOutlinedIcon}
                    />
                    <StatCard
                        label="Average CTR"
                        value={loading ? '—' : `${totals.ctr.toFixed(2)}%`}
                        caption="Clicks ÷ impressions"
                        icon={PercentOutlinedIcon}
                    />
                </Box>
            ) : null}

            <BannersTable
                banners={visible}
                metricsById={metricsById}
                loading={loading}
                archived={archived}
                onAction={handleAction}
            />

            {form.open ? (
                <BannerFormDialog
                    key={form.key}
                    open
                    banner={form.banner}
                    user={user}
                    existingIds={existingIds}
                    onClose={() => setForm((prev) => ({ ...prev, open: false }))}
                />
            ) : null}

            {statsBanner ? (
                <BannerStatsDialog
                    banner={statsBanner}
                    stats={stats[statsBanner.id]}
                    onClose={() => setStatsBannerId(null)}
                />
            ) : null}

            {confirm ? (
                <ConfirmDialog
                    open
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.confirmLabel}
                    danger={confirm.danger}
                    onConfirm={confirm.onConfirm}
                    onClose={() => setConfirm(null)}
                />
            ) : null}
        </Stack>
    );
};

BannersManager.propTypes = {
    archived: PropTypes.bool
};
