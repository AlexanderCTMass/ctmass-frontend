import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Stack,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Avatar,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Tooltip,
    Badge,
    Paper,
    Divider,
    Menu,
    ListItemIcon,
    ListItemText,
    useTheme,
    alpha,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    MoreVert as MoreVertIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    CheckCircle as PublishedIcon,
    Schedule as ScheduledIcon,
    Drafts as DraftIcon,
    Archive as ArchiveIcon,
    TrendingUp as TrendingUpIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    PostAdd as PostAddIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import { RouterLink } from 'src/components/router-link';
import { BlogHeader, BlogHeaderActions } from 'src/sections/dashboard/blog/blog-header';

// Статусы постов
const POST_STATUS = {
    published: { label: 'Published', color: 'success', icon: PublishedIcon },
    draft: { label: 'Draft', color: 'default', icon: DraftIcon },
    scheduled: { label: 'Scheduled', color: 'info', icon: ScheduledIcon },
    archived: { label: 'Archived', color: 'warning', icon: ArchiveIcon }
};

// Компонент для отображения статистики
const StatCard = ({ icon: Icon, label, value, color = 'primary', trend, tooltip }) => (
    <Tooltip title={tooltip || ''} arrow>
        <Card sx={{ p: 2, height: '100%', cursor: tooltip ? 'help' : 'default' }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
                        <Icon />
                    </Avatar>
                    {trend && (
                        <Chip
                            size="small"
                            label={`+${trend}%`}
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Stack>
                <Box>
                    <Typography variant="h4">{value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    </Tooltip>
);

// Функция для подсчета общего количества комментариев (включая ответы)
const countAllComments = (comments) => {
    if (!comments) return 0;

    let count = 0;
    const countRecursive = (items) => {
        for (const item of items) {
            count++;
            if (item.replies && item.replies.length > 0) {
                countRecursive(item.replies);
            }
        }
    };

    countRecursive(comments);
    return count;
};

// Компонент строки таблицы
const PostRow = ({ post, onEdit, onDelete, onView }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const StatusIcon = POST_STATUS[post.status]?.icon || DraftIcon;
    const statusColor = POST_STATUS[post.status]?.color || 'default';

    const publishedDate = post.publishedAt
        ? format(new Date(post.publishedAt), 'MMM d, yyyy')
        : 'Not published';

    const timeAgo = post.updatedAt
        ? formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })
        : '';

    // Подсчет всех комментариев для поста
    const totalComments = countAllComments(post.comments);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        handleMenuClose();
        switch (action) {
            case 'edit':
                onEdit(post.id);
                break;
            case 'delete':
                onDelete(post.id);
                break;
            case 'view':
                onView(post.id);
                break;
        }
    };

    return (
        <TableRow
            hover
            sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
            }}
            onClick={() => onView(post.id)}
        >
            <TableCell padding="checkbox">
                <Avatar src={post.author?.avatar} sx={{ width: 40, height: 40 }} />
            </TableCell>

            <TableCell>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 300 }}>
                        {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                        {post.shortDescription}
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell>
                <Chip
                    size="small"
                    icon={<StatusIcon />}
                    label={POST_STATUS[post.status]?.label || 'Draft'}
                    color={statusColor}
                    variant="outlined"
                />
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {post.category || 'Uncategorized'}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {publishedDate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                </Typography>
            </TableCell>

            <TableCell align="center">
                <Tooltip title={`${totalComments} total comments`} arrow>
                    <Badge
                        badgeContent={totalComments}
                        color="primary"
                        max={999}
                        showZero
                    >
                        <CommentIcon fontSize="small" color="action" />
                    </Badge>
                </Tooltip>
            </TableCell>

            <TableCell align="center">
                <Tooltip title={`${post.likes || 0} likes`} arrow>
                    <Badge
                        badgeContent={post.likes || 0}
                        color="error"
                        max={999}
                        showZero
                    >
                        <FavoriteIcon fontSize="small" color="action" />
                    </Badge>
                </Tooltip>
            </TableCell>

            <TableCell align="right">
                <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={() => handleAction('view')}>
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>View</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleAction('edit')}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </TableCell>
        </TableRow>
    );
};

const Page = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMounted = useMounted();
    const snackbar = useSnackbar();
    const theme = useTheme();

    // Состояния
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        totalComments: 0,
        totalLikes: 0
    });

    usePageView();

    // Загрузка постов текущего пользователя
    const loadMyPosts = useCallback(async () => {
        try {
            setLoading(true);
            const allPosts = await blogService.getPosts(100);

            // Фильтруем только посты текущего пользователя
            const myPosts = allPosts.filter(post => post.author?.id === user?.id);

            if (isMounted()) {
                setPosts(myPosts);
                setFilteredPosts(myPosts);

                // Extract unique categories
                const uniqueCategories = [...new Set(myPosts.map(post => post.category).filter(Boolean))];
                setCategories(uniqueCategories);

                // Calculate stats
                const published = myPosts.filter(p => p.status === 'published').length;

                // Подсчет всех комментариев
                const totalComments = myPosts.reduce((sum, post) => {
                    return sum + countAllComments(post.comments);
                }, 0);

                const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

                setStats({
                    total: myPosts.length,
                    published,
                    totalComments,
                    totalLikes
                });

                setError(null);
            }
        } catch (err) {
            console.error('Error loading my posts:', err);
            if (isMounted()) {
                setError('Failed to load your posts');
            }
        } finally {
            if (isMounted()) {
                setLoading(false);
            }
        }
    }, [user, isMounted]);

    useEffect(() => {
        if (user) {
            loadMyPosts();
        }
    }, [user, loadMyPosts]);

    // Фильтрация постов
    useEffect(() => {
        let filtered = posts;

        // Поиск
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(post =>
                post.title?.toLowerCase().includes(query) ||
                post.shortDescription?.toLowerCase().includes(query) ||
                post.content?.toLowerCase().includes(query)
            );
        }

        // Фильтр по статусу
        if (statusFilter !== 'all') {
            if (statusFilter === 'published') {
                filtered = filtered.filter(post => post.status === 'published');
            } else if (statusFilter === 'draft') {
                filtered = filtered.filter(post => !post.status || post.status === 'draft');
            } else if (statusFilter === 'scheduled') {
                filtered = filtered.filter(post => post.status === 'scheduled');
            } else if (statusFilter === 'archived') {
                filtered = filtered.filter(post => post.status === 'archived');
            }
        }

        // Фильтр по категории
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(post => post.category === categoryFilter);
        }

        setFilteredPosts(filtered);
    }, [searchQuery, statusFilter, categoryFilter, posts]);

    // Обработчики действий
    const handlePostClick = (postId) => {
        navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
    };

    const handleEditClick = (postId) => {
        navigate(paths.dashboard.blog.postEdit.replace(':postId', postId));
    };

    const handleDeleteClick = (postId) => {
        setPostToDelete(postId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;

        try {
            await blogService.deletePost(postToDelete, user);
            snackbar.success('Post deleted successfully');
            loadMyPosts(); // Перезагружаем список
        } catch (error) {
            console.error('Error deleting post:', error);
            snackbar.error('Failed to delete post');
        } finally {
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
    };

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all';

    // Пагинация
    const paginatedPosts = filteredPosts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Seo title="My Posts" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <BlogHeader
                        title="My Posts"
                        breadcrumbs={[{ label: 'My Posts' }]}
                        action={
                            <Button
                                component={RouterLink}
                                href={paths.dashboard.blog.postCreate}
                                variant="contained"
                                startIcon={<AddIcon />}
                            >
                                New Post
                            </Button>
                        }
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Статистика - 4 карточки */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={PostAddIcon}
                                label="Total Posts"
                                value={stats.total}
                                color="primary"
                                tooltip="All your posts (including drafts)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={PublishedIcon}
                                label="Published"
                                value={stats.published}
                                color="success"
                                tooltip="Posts that are live on your blog"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={CommentIcon}
                                label="Total Comments"
                                value={stats.totalComments}
                                color="info"
                                tooltip="All comments across your posts (including replies)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={FavoriteIcon}
                                label="Total Likes"
                                value={stats.totalLikes}
                                color="error"
                                tooltip="Total likes received on all your posts"
                            />
                        </Grid>
                    </Grid>

                    {/* Фильтры */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                    Your Posts
                                </Typography>
                                {hasActiveFilters && (
                                    <Button
                                        size="small"
                                        onClick={clearFilters}
                                        startIcon={<ClearIcon />}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Search your posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    size="small"
                                    sx={{ flex: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchQuery('')}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <FormControl size="small" variant={"filled"} sx={{ minWidth: 150 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="published">Published</MenuItem>
                                        <MenuItem value="draft">Draft</MenuItem>
                                        <MenuItem value="scheduled">Scheduled</MenuItem>
                                        <MenuItem value="archived">Archived</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" variant={"filled"}  sx={{ minWidth: 150 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        label="Category"
                                    >
                                        <MenuItem value="all">All Categories</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Таблица постов */}
                    <Card>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox"></TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="center">Comments</TableCell>
                                        <TableCell align="center">Likes</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                                <Stack spacing={2} alignItems="center">
                                                    <Typography variant="h6" color="text.secondary">
                                                        No posts found
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {hasActiveFilters
                                                            ? 'Try adjusting your filters'
                                                            : 'Create your first post to get started'}
                                                    </Typography>
                                                    {!hasActiveFilters && (
                                                        <Button
                                                            variant="contained"
                                                            component={RouterLink}
                                                            href={paths.dashboard.blog.postCreate}
                                                            startIcon={<AddIcon />}
                                                        >
                                                            Create New Post
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedPosts.map((post) => (
                                            <PostRow
                                                key={post.id}
                                                post={post}
                                                onEdit={handleEditClick}
                                                onDelete={handleDeleteClick}
                                                onView={handlePostClick}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>

                        <TablePagination
                            component="div"
                            count={filteredPosts.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </Card>
                </Container>
            </Box>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Page;