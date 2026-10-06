import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Dialog,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Chart } from 'src/components/chart';
import { AD_PLACEMENT_MAP, ctr, getDisplayStatus } from 'src/constants/partner-ads';
import { BannerPreview } from './banner-preview';
import { formatNumber, formatPeriod, formatUsd } from './date-utils';
import { StatusChip } from './status-chip';
import { pa, sectionLabelSx } from './tokens';

const DAYS = 30;

const lastDays = () => {
    const result = [];
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i -= 1) {
        const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
        result.push(date.toISOString().slice(0, 10));
    }
    return result;
};

const dayLabel = (key) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${key}T00:00:00Z`));

const DailyChart = ({ title, total, days, values }) => {
    const options = {
        chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit', parentHeightOffset: 0 },
        colors: [pa.primary],
        plotOptions: { bar: { columnWidth: '58%', borderRadius: 3, borderRadiusApplication: 'end' } },
        dataLabels: { enabled: false },
        grid: { borderColor: pa.border, strokeDashArray: 3, xaxis: { lines: { show: false } } },
        xaxis: {
            categories: days.map(dayLabel),
            tickAmount: 6,
            labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: pa.textMuted, fontSize: '11px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: { formatter: (value) => formatNumber(value), style: { colors: pa.textMuted, fontSize: '11px' } }
        },
        tooltip: { y: { formatter: (value) => formatNumber(value) } },
        states: { hover: { filter: { type: 'darken', value: 0.85 } } }
    };
    return (
        <Box sx={{ border: `1px solid ${pa.border}`, borderRadius: pa.radius, p: 2, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: pa.text }}>{title}</Typography>
                <Typography sx={{ fontSize: 12.5, color: pa.textMuted }}>
                    {formatNumber(total)} in the last {DAYS} days
                </Typography>
            </Stack>
            <Chart type="bar" height={180} options={options} series={[{ name: title, data: values }]} />
        </Box>
    );
};

DailyChart.propTypes = {
    title: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    days: PropTypes.array.isRequired,
    values: PropTypes.array.isRequired
};

const Metric = ({ label, value }) => (
    <Box sx={{ flex: '1 1 120px' }}>
        <Typography sx={{ fontSize: 12.5, color: pa.textMuted, fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: pa.text, letterSpacing: '-0.3px' }}>{value}</Typography>
    </Box>
);

Metric.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired
};

export const BannerStatsDialog = ({ banner, stats, onClose }) => {
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const days = useMemo(lastDays, []);

    const data = useMemo(() => {
        const daily = stats?.daily || {};
        const impressions = days.map((day) => daily[day]?.impressions || 0);
        const clicks = days.map((day) => daily[day]?.clicks || 0);
        const placements = Object.keys({ ...(banner?.placements || {}), ...(stats?.placements || {}) }).map((key) => {
            const item = stats?.placements?.[key] || {};
            return {
                key,
                label: AD_PLACEMENT_MAP[key]?.label || key,
                impressions: item.impressions || 0,
                clicks: item.clicks || 0
            };
        });
        return {
            impressions,
            clicks,
            impressionsTotal: impressions.reduce((sum, v) => sum + v, 0),
            clicksTotal: clicks.reduce((sum, v) => sum + v, 0),
            placements
        };
    }, [stats, banner, days]);

    if (!banner) return null;

    const totalImpressions = stats?.impressions || 0;
    const totalClicks = stats?.clicks || 0;

    return (
        <Dialog
            open
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: fullScreen ? 0 : '20px' } }}
        >
            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ px: { xs: 2.5, md: 4 }, pt: 3, pb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: pa.text }}>{banner.title || 'Untitled'}</Typography>
                        <StatusChip status={banner.status === 'archived' ? 'archived' : getDisplayStatus(banner)} />
                    </Stack>
                    <Typography sx={{ color: pa.textSecondary, fontSize: 14 }}>
                        {banner.id} · {banner.partnerName || 'No partner'} · {formatPeriod(banner.startAt, banner.endAt)}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Divider sx={{ borderColor: pa.border }} />
            <Stack spacing={3} sx={{ p: { xs: 2.5, md: 4 }, overflowY: 'auto' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 300 }, flexShrink: 0 }}>
                        <BannerPreview banner={banner} scale={0.82} />
                    </Box>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2} sx={{ flex: 1 }}>
                        <Metric label="Impressions" value={formatNumber(totalImpressions)} />
                        <Metric label="Clicks" value={formatNumber(totalClicks)} />
                        <Metric label="CTR" value={`${ctr(totalClicks, totalImpressions).toFixed(2)}%`} />
                        <Metric label="Budget" value={formatUsd(banner.budgetUsd)} />
                    </Stack>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <DailyChart title="Impressions" total={data.impressionsTotal} days={days} values={data.impressions} />
                    <DailyChart title="Clicks" total={data.clicksTotal} days={days} values={data.clicks} />
                </Box>

                <Box>
                    <Typography sx={{ ...sectionLabelSx, mb: 1 }}>By placement</Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 480 }}>
                            <TableHead>
                                <TableRow>
                                    {['Placement', 'Impressions', 'Clicks', 'CTR'].map((label, index) => (
                                        <TableCell
                                            key={label}
                                            align={index === 0 ? 'left' : 'right'}
                                            sx={{ color: pa.textMuted, fontWeight: 700, fontSize: 12, borderColor: pa.border }}
                                        >
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.placements.map((row) => (
                                    <TableRow key={row.key}>
                                        <TableCell sx={{ borderColor: pa.border, fontWeight: 600 }}>{row.label}</TableCell>
                                        <TableCell align="right" sx={{ borderColor: pa.border }}>
                                            {formatNumber(row.impressions)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderColor: pa.border }}>
                                            {formatNumber(row.clicks)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderColor: pa.border }}>
                                            {ctr(row.clicks, row.impressions).toFixed(2)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: pa.textMuted, mt: 1.5 }}>
                        An impression is counted when at least half of the banner is on screen; repeat views of the same banner in
                        the same spot within 5 minutes count once. Daily numbers use UTC days.
                    </Typography>
                </Box>
            </Stack>
        </Dialog>
    );
};

BannerStatsDialog.propTypes = {
    banner: PropTypes.object,
    stats: PropTypes.object,
    onClose: PropTypes.func.isRequired
};
