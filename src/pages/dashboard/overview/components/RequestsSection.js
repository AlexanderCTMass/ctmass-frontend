import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { projectsApi } from 'src/api/projects';
import { format } from 'date-fns';

const STATUS_MAPPING = {
    'in_progress': 'In Progress',
    'new': 'New',
    'completed': 'Completed'
};

const STATUS_COLORS = {
    'In Progress': 'info',
    'New': 'warning',
    'Completed': 'success'
};

const RequestsSection = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const request = {
                filters: {
                    contractor: user,
                    state: undefined
                },
                rowsPerPage: 5,
                lastVisible: null,
                removedProjects: []
            };

            const response = await projectsApi.getProjects(request);
            const projectsList = response.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .slice(0, 5);

            setProjects(projectsList);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const displayProjects = useMemo(() => {
        return projects.slice(0, 5);
    }, [projects]);

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            const dateObj = date.toDate ? date.toDate() : new Date(date);
            return format(dateObj, 'dd.MM.yyyy');
        } catch {
            return '-';
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}
        >
            <Stack spacing={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <WorkOutlineIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Current Jobs & Requests
                        </Typography>
                    </Stack>
                </Stack>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
                            <CircularProgress size={32} />
                        </Stack>
                    ) : displayProjects.length > 0 ? (
                        <Box sx={{ overflowX: 'auto', flex: 1 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Task</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Client</TableCell>
                                        <TableCell>Due Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayProjects.map((project) => {
                                        const rawStatus = project.state || 'new';
                                        const statusLabel = STATUS_MAPPING[rawStatus] || STATUS_MAPPING['new'];
                                        const statusColor = STATUS_COLORS[statusLabel] || 'default';

                                        return (
                                            <TableRow key={project.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {project.title || project.name || 'Untitled Project'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={statusLabel}
                                                        color={statusColor}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {project.customerName || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(project.dueDate || project.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                No current jobs or requests
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        component={RouterLink}
                        href={paths.cabinet.projects.find.index}
                        variant="outlined"
                        size="small"
                    >
                        Find new Jobs & Requests
                    </Button>
                    <Button
                        component={RouterLink}
                        href={paths.cabinet.projects.contractor}
                        variant="contained"
                        size="small"
                    >
                        Manage My Jobs & Requests
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

RequestsSection.propTypes = {
    user: PropTypes.object
};

export default RequestsSection;
