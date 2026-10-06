import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    ListItemIcon,
    Menu,
    MenuItem,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import { AD_PLACEMENT_MAP, AD_PLACEMENTS, AD_STATUSES, getDisplayStatus } from 'src/constants/partner-ads';
import { formatNumber, formatPeriod, formatUsd } from './date-utils';
import { StatusChip } from './status-chip';
import { cardSx, inputSx, outlinedButtonSx, pa } from './tokens';

const ACTIVE_STATUS_FILTERS = ['active', 'scheduled', 'ended', 'paused', 'draft'];

const headCellSx = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: pa.textMuted,
    bgcolor: pa.surfaceMuted,
    borderBottom: `1px solid ${pa.border}`,
    whiteSpace: 'nowrap'
};

const cellSx = { borderBottom: `1px solid ${pa.border}`, py: 2, verticalAlign: 'middle' };

const RowMenu = ({ banner, archived, onAction }) => {
    const [anchor, setAnchor] = useState(null);
    const status = banner.status;
    const items = archived
        ? [
            { key: 'stats', label: 'View statistics', icon: InsightsOutlinedIcon },
            { key: 'restore', label: 'Restore', icon: UnarchiveOutlinedIcon },
            { key: 'delete', label: 'Delete permanently', icon: DeleteOutlineIcon, danger: true }
        ]
        : [
            { key: 'edit', label: 'Edit', icon: EditOutlinedIcon },
            { key: 'stats', label: 'View statistics', icon: InsightsOutlinedIcon },
            status === 'active' ? { key: 'pause', label: 'Pause', icon: PauseCircleOutlineIcon } : null,
            status === 'paused' ? { key: 'resume', label: 'Resume', icon: PlayCircleOutlineIcon } : null,
            status === 'draft' || status === 'pending'
                ? { key: 'publish', label: 'Publish', icon: PlayCircleOutlineIcon }
                : null,
            { key: 'archive', label: 'Archive', icon: Inventory2OutlinedIcon },
            { key: 'delete', label: 'Delete', icon: DeleteOutlineIcon, danger: true }
        ].filter(Boolean);

    return (
        <>
            <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)} aria-label={`Actions for ${banner.id}`}>
                <MoreHorizIcon />
            </IconButton>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { borderRadius: '12px', minWidth: 200, border: `1px solid ${pa.border}` } }}
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <MenuItem
                            key={item.key}
                            onClick={() => {
                                setAnchor(null);
                                onAction(item.key, banner);
                            }}
                            sx={{ fontSize: 14, color: item.danger ? pa.danger : pa.text }}
                        >
                            <ListItemIcon sx={{ color: item.danger ? pa.danger : pa.textSecondary }}>
                                <Icon fontSize="small" />
                            </ListItemIcon>
                            {item.label}
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};

RowMenu.propTypes = {
    banner: PropTypes.object.isRequired,
    archived: PropTypes.bool,
    onAction: PropTypes.func.isRequired
};

const FilterSelect = ({ value, onChange, children, width = 170 }) => (
    <TextField select size="small" value={value} onChange={(event) => onChange(event.target.value)} sx={{ ...inputSx, width }}>
        {children}
    </TextField>
);

FilterSelect.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    width: PropTypes.number
};

export const BannersTable = ({ banners, metricsById, loading, archived = false, onAction }) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [placement, setPlacement] = useState('all');
    const [partner, setPartner] = useState('all');

    const partners = useMemo(
        () => Array.from(new Set(banners.map((b) => b.partnerName).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [banners]
    );

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        const now = Date.now();
        return banners
            .filter((banner) => {
                if (query) {
                    const haystack = `${banner.id} ${banner.title} ${banner.subtitle} ${banner.partnerName}`.toLowerCase();
                    if (!haystack.includes(query)) return false;
                }
                if (!archived && status !== 'all' && getDisplayStatus(banner, now) !== status) return false;
                if (placement !== 'all' && !banner.placements?.[placement]) return false;
                if (partner !== 'all' && banner.partnerName !== partner) return false;
                return true;
            })
            .sort((a, b) =>
                archived ? (b.archivedAt || 0) - (a.archivedAt || 0) : (b.updatedAt || 0) - (a.updatedAt || 0)
            );
    }, [banners, search, status, placement, partner, archived]);

    const filtered = search || status !== 'all' || placement !== 'all' || partner !== 'all';

    const reset = () => {
        setSearch('');
        setStatus('all');
        setPlacement('all');
        setPartner('all');
    };

    return (
        <Box sx={{ ...cardSx, overflow: 'hidden' }}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center" sx={{ p: 2.5 }}>
                <TextField
                    size="small"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, partner or ID…"
                    sx={{ ...inputSx, flex: '1 1 240px', maxWidth: 360 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: pa.textMuted }} fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                />
                {!archived ? (
                    <FilterSelect value={status} onChange={setStatus}>
                        <MenuItem value="all">All statuses</MenuItem>
                        {ACTIVE_STATUS_FILTERS.map((key) => (
                            <MenuItem key={key} value={key}>
                                {AD_STATUSES[key].label}
                            </MenuItem>
                        ))}
                    </FilterSelect>
                ) : null}
                <FilterSelect value={placement} onChange={setPlacement} width={200}>
                    <MenuItem value="all">All placements</MenuItem>
                    {AD_PLACEMENTS.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                            {item.label}
                        </MenuItem>
                    ))}
                </FilterSelect>
                <FilterSelect value={partner} onChange={setPartner}>
                    <MenuItem value="all">All partners</MenuItem>
                    {partners.map((name) => (
                        <MenuItem key={name} value={name}>
                            {name}
                        </MenuItem>
                    ))}
                </FilterSelect>
                <Box sx={{ flex: 1 }} />
                <Button
                    variant="outlined"
                    startIcon={<FilterAltOffOutlinedIcon />}
                    onClick={reset}
                    disabled={!filtered}
                    sx={outlinedButtonSx}
                >
                    Reset
                </Button>
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1040 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={headCellSx}>ID / Preview</TableCell>
                            <TableCell sx={headCellSx}>Name / Partner</TableCell>
                            <TableCell sx={headCellSx}>Placements</TableCell>
                            <TableCell sx={headCellSx}>Period</TableCell>
                            <TableCell sx={headCellSx}>Budget</TableCell>
                            <TableCell sx={headCellSx}>Statistics</TableCell>
                            <TableCell sx={headCellSx}>Status</TableCell>
                            <TableCell sx={{ ...headCellSx, width: 56 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 4 }).map((_, index) => (
                                <TableRow key={index}>
                                    {Array.from({ length: 8 }).map((__, cell) => (
                                        <TableCell key={cell} sx={cellSx}>
                                            <Skeleton variant="rounded" height={cell === 0 ? 32 : 16} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : rows.map((banner) => {
                                const metrics = metricsById[banner.id] || { impressions: 0, clicks: 0, ctr: 0 };
                                return (
                                    <TableRow
                                        key={banner.id}
                                        hover
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: `${pa.surfaceMuted} !important` } }}
                                        onClick={() => onAction(archived ? 'stats' : 'edit', banner)}
                                    >
                                        <TableCell sx={cellSx}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box
                                                    component="img"
                                                    src={banner.imageUrl}
                                                    alt=""
                                                    sx={{
                                                        width: 84,
                                                        height: 28,
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                        bgcolor: pa.surfaceMuted,
                                                        border: `1px solid ${pa.border}`
                                                    }}
                                                />
                                                <Typography
                                                    sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700, color: pa.primaryHover }}
                                                >
                                                    {banner.id}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, maxWidth: 240 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: pa.text }} noWrap>
                                                {banner.title || 'Untitled'}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12.5, color: pa.textMuted }} noWrap>
                                                {banner.partnerName || '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: 220 }}>
                                                {Object.keys(banner.placements || {}).map((key) => (
                                                    <Tooltip key={key} title={AD_PLACEMENT_MAP[key]?.label || key}>
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                px: 1,
                                                                py: 0.25,
                                                                borderRadius: 999,
                                                                border: `1px solid ${pa.borderStrong}`,
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                color: pa.textSecondary,
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {AD_PLACEMENT_MAP[key]?.short || key}
                                                        </Box>
                                                    </Tooltip>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap', fontSize: 13.5, color: pa.text }}>
                                            {formatPeriod(banner.startAt, banner.endAt)}
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, fontSize: 14, fontWeight: 700, color: pa.text }}>
                                            {formatUsd(banner.budgetUsd)}
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <Stack spacing={0.25}>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <VisibilityOutlinedIcon sx={{ fontSize: 15, color: pa.textMuted }} />
                                                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: pa.text }}>
                                                        {formatNumber(metrics.impressions)}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <TouchAppOutlinedIcon sx={{ fontSize: 15, color: pa.textMuted }} />
                                                    <Typography sx={{ fontSize: 13, color: pa.textSecondary }}>
                                                        {formatNumber(metrics.clicks)} · {metrics.ctr.toFixed(1)}% CTR
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <StatusChip status={archived ? 'archived' : getDisplayStatus(banner)} />
                                        </TableCell>
                                        <TableCell sx={cellSx} onClick={(event) => event.stopPropagation()}>
                                            <RowMenu banner={banner} archived={archived} onAction={onAction} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        {!loading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} sx={{ py: 8, textAlign: 'center', borderBottom: 0 }}>
                                    <Typography sx={{ fontWeight: 700, color: pa.text }}>
                                        {filtered ? 'No banners match these filters' : archived ? 'The archive is empty' : 'No banners yet'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, color: pa.textMuted, mt: 0.5 }}>
                                        {filtered
                                            ? 'Try another search or reset the filters.'
                                            : archived
                                                ? 'Archived banners show up here. You can restore or delete them.'
                                                : 'Create the first banner to start showing partner offers in the app.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
};

BannersTable.propTypes = {
    banners: PropTypes.array.isRequired,
    metricsById: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    archived: PropTypes.bool,
    onAction: PropTypes.func.isRequired
};
