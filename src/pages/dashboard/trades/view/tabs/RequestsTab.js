import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Chip,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { projectsApi } from 'src/api/projects';
import { profileApi } from 'src/api/profile';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STATUS_MAPPING = {
    'published': 'Published',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'draft': 'Draft'
};

const STATUS_COLORS = {
    'Published': 'warning',
    'In Progress': 'info',
    'Completed': 'success',
    'Cancelled': 'error',
    'Draft': 'default'
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'draft', label: 'Draft' }
];

const RequestsTab = ({ trade }) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState(null);
    const [consumerProfiles, setConsumerProfiles] = useState({});

    const formatDate = useCallback((date) => {
        if (!date) return '-';
        try {
            const dateObj = date.toDate ? date.toDate() : new Date(date);
            return format(dateObj, 'MMM dd, yyyy');
        } catch {
            return '-';
        }
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!trade?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await projectsApi.getProjects({
                    filters: {},
                    rowsPerPage: 1000,
                    lastVisible: null
                });

                const allProjects = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const tradeProjects = allProjects.filter(project => {
                    if (project.tradeId === trade.id) return true;

                    const respondedSpecialists = project.respondedSpecialists || [];
                    return respondedSpecialists.some(rs => rs.tradeId === trade.id);
                });

                setProjects(tradeProjects);

                const consumerIds = [...new Set(tradeProjects.map(p => p.userId).filter(Boolean))];
                if (consumerIds.length > 0) {
                    const profiles = await profileApi.getProfilesById(consumerIds);
                    const profilesMap = {};
                    profiles.forEach(profile => {
                        profilesMap[profile.id] = profile;
                    });
                    setConsumerProfiles(profilesMap);
                }
            } catch (error) {
                console.error('Failed to load projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [trade?.id]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = !searchQuery ||
                project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !statusFilter || project.state === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchQuery, statusFilter]);

    const paginatedProjects = useMemo(() => {
        return filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredProjects, page, rowsPerPage]);

    const handleFilterClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleFilterClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleStatusChange = useCallback((status) => {
        setStatusFilter(status);
        setPage(0);
        handleFilterClose();
    }, [handleFilterClose]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleConsumerClick = useCallback((consumerId) => {
        if (!consumerId) return;
        const href = paths.specialist.publicPage.replace(':profileId', consumerId);
        navigate(href);
    }, [navigate]);

    const selectedStatusLabel = useMemo(() => {
        const option = STATUS_OPTIONS.find(opt => opt.value === statusFilter);
        return option?.label || 'All Statuses';
    }, [statusFilter]);

    const TABLE_MIN_HEIGHT = 600;

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                    Request Management
                </Typography>
                <Button
                    component={RouterLink}
                    href={paths.cabinet.projects.find.index}
                    variant="contained"
                >
                    Find new requests
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={handleFilterClick}
                        sx={{ minWidth: 180 }}
                    >
                        {selectedStatusLabel}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleFilterClose}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                selected={statusFilter === option.value}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>

                    <TextField
                        size="small"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        sx={{ width: 300 }}
                        InputProps={{
                            sx: {
                                height: 44,
                                display: 'flex',
                                alignItems: 'center',
                                '& .MuiInputBase-input': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    lineHeight: 1,
                                    py: 0,
                                },
                                '& .MuiInputAdornment-root': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                    maxHeight: '100%',
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: 22,
                                },
                            },
                        }}
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    Total {filteredProjects.length} requests
                </Typography>
            </Stack>

            <TableContainer
                component={Paper}
                sx={{
                    minHeight: TABLE_MIN_HEIGHT
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>STATUS</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>CONSUMER</TableCell>
                            <TableCell>LOCATION</TableCell>
                            <TableCell>PROJECT</TableCell>
                            <TableCell align="right">ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Loading requests...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {filteredProjects.length === 0 && projects.length > 0
                                            ? 'No requests found matching your search'
                                            : 'No requests yet'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProjects.map((project) => {
                                const rawStatus = project.state || 'draft';
                                const statusLabel = STATUS_MAPPING[rawStatus] || STATUS_MAPPING['draft'];
                                const statusColor = STATUS_COLORS[statusLabel] || 'default';
                                const consumer = consumerProfiles[project.userId];

                                return (
                                    <TableRow key={project.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={statusLabel}
                                                color={statusColor}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(project.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{
                                                    cursor: consumer ? 'pointer' : 'default',
                                                    '&:hover': consumer ? { opacity: 0.7 } : {}
                                                }}
                                                onClick={() => handleConsumerClick(project.userId)}
                                            >
                                                <Avatar
                                                    src={consumer?.avatar || project.customerAvatar}
                                                    sx={{ width: 32, height: 32 }}
                                                >
                                                    {(consumer?.name || project.customerName || 'U')[0]}
                                                </Avatar>
                                                <Typography variant="body2">
                                                    {consumer?.name || project.customerName || 'Unknown'}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {project.location?.place_name ||
                                                    project.location?.address ||
                                                    '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {project.title || project.name || 'Untitled Project'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                            >
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredProjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Stack>
    );
};

RequestsTab.propTypes = {
    trade: PropTypes.object.isRequired
};

export default RequestsTab;
