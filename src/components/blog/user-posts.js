import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemButton,
    Avatar,
    Chip,
    Stack,
    Button,
    Divider,
    Skeleton,
    Alert,
    Paper,
    useTheme,
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Article as ArticleIcon,
    ViewList as ViewListIcon,
    AllInbox as AllPostsIcon,
    Favorite as FavoriteIcon,
    Comment as CommentIcon,
    Schedule as ScheduleIcon,
    CheckCircle as PublishedIcon,
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { blogService } from 'src/service/blog-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';

// Компонент-скелетон для загрузки
const PostSkeleton = () => (
    <ListItem alignItems="center" divider sx={{ py: 1 }}>
        <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" height={20} />}
            secondary={<Skeleton variant="text" width="30%" height={16} />}
        />
    </ListItem>
);

// Компонент для отображения статуса поста
const PostStatusBadge = ({ status }) => {
    const statusConfig = {
        published: { icon: PublishedIcon, color: 'success', label: 'Published' },
        scheduled: { icon: ScheduleIcon, color: 'info', label: 'Scheduled' },
        draft: { icon: ArticleIcon, color: 'default', label: 'Draft' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
        <Chip
            size="small"
            icon={<Icon sx={{ fontSize: 12 }} />}
            label={config.label}
            color={config.color}
            variant="outlined"
            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } }}
        />
    );
};

// Основной компонент
export const UserPosts = ({
                              userId,
                              userName,
                              maxPosts = 6,
                              showActions = true,
                              containerProps = {},
                              sx = {},
                              onPostClick
                          }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const theme = useTheme();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        totalLikes: 0,
        totalComments: 0
    });

    // Подсчет всех комментариев (включая ответы)
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

    // Загрузка постов пользователя
    useEffect(() => {
        const loadUserPosts = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const allPosts = await blogService.getPosts(50);

                // Фильтруем посты пользователя
                const userPosts = allPosts
                    .filter(post => post.author?.id === userId)
                    .sort((a, b) => {
                        const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
                        const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
                        return dateB - dateA;
                    })
                    .slice(0, maxPosts);

                setPosts(userPosts);

                // Подсчет статистики
                const published = allPosts.filter(p => p.author?.id === userId && p.status === 'published').length;
                const totalComments = allPosts
                    .filter(p => p.author?.id === userId)
                    .reduce((sum, post) => sum + countAllComments(post.comments), 0);
                const totalLikes = allPosts
                    .filter(p => p.author?.id === userId)
                    .reduce((sum, post) => sum + (post.likes || 0), 0);

                setStats({
                    total: allPosts.filter(p => p.author?.id === userId).length,
                    published,
                    totalLikes,
                    totalComments
                });

                setError(null);
            } catch (err) {
                console.error('Error loading user posts:', err);
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        loadUserPosts();
    }, [userId, maxPosts]);

    const handlePostClick = (postId) => {
        if (onPostClick) {
            onPostClick(postId);
        } else {
            if (currentUser) {
                navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
            } else {
                navigate(paths.blog.details.replace(':postId', postId));
            }
        }
    };

    const isAuthor = currentUser?.id === userId;

    if (loading) {
        return (
            <Paper sx={{ p: 2, ...sx }} {...containerProps}>
                <Typography variant="subtitle1" gutterBottom>
                    {userName ? `${userName}'s Posts` : 'Recent Posts'}
                </Typography>
                <List dense>
                    {Array.from(new Array(3)).map((_, index) => (
                        <PostSkeleton key={index} />
                    ))}
                </List>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2, ...sx }} {...containerProps}>
                <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...sx
            }}
            {...containerProps}
        >
            {/* Заголовок */}
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                    {!isAuthor && userName ? `${userName}'s Posts` : 'Recent Posts'}
                </Typography>

                {/* Мини-статистика */}
                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                    <Tooltip title="Total posts" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ArticleIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">{stats.total}</Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Published" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <PublishedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption">{stats.published}</Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Likes" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <FavoriteIcon sx={{ fontSize: 16, color: 'error.light' }} />
                            <Typography variant="caption">{stats.totalLikes}</Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Comments" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <CommentIcon sx={{ fontSize: 16, color: 'info.light' }} />
                            <Typography variant="caption">{stats.totalComments}</Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Список постов */}
            {posts.length === 0 ? (
                <Box
                    sx={{
                        py: 3,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: 1
                    }}
                >
                    <ArticleIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No posts yet
                    </Typography>
                    {isAuthor && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(paths.dashboard.blog.postCreate)}
                            sx={{ mt: 1 }}
                        >
                            Create Post
                        </Button>
                    )}
                </Box>
            ) : (
                <List dense disablePadding sx={{ flex: 1 }}>
                    {posts.map((post, index) => {
                        const publishedDate = post.publishedAt
                            ? format(new Date(post.publishedAt), 'MMM d')
                            : 'Draft';

                        const commentCount = countAllComments(post.comments);

                        return (
                            <ListItem
                                key={post.id}
                                disablePadding
                                sx={{ mb: index < posts.length - 1 ? 0.5 : 0 }}
                            >
                                <ListItemButton
                                    onClick={() => handlePostClick(post.id)}
                                    sx={{
                                        borderRadius: 1,
                                        py: 1,
                                        pr: 2
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 48 }}>
                                        <Avatar
                                            src={post.cover}
                                            variant="rounded"
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: 'grey.100'
                                            }}
                                        >
                                            <ArticleIcon sx={{ fontSize: 18 }} />
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 150 }}>
                                                    {post.title}
                                                </Typography>
                                                {post.status !== 'published' && (
                                                    <PostStatusBadge status={post.status} />
                                                )}
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.25 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {publishedDate}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    • {post.readTime || '1 min'}
                                                </Typography>

                                                {post.likes > 0 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        • <FavoriteIcon sx={{ fontSize: 10, mx: 0.25, color: 'error.light' }} /> {post.likes}
                                                    </Typography>
                                                )}

                                                {commentCount > 0 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        • <CommentIcon sx={{ fontSize: 10, mx: 0.25, color: 'info.light' }} /> {commentCount}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            )}

            {/* Кнопка "View All" если больше постов */}
            {stats.total > maxPosts && (
                <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                        if (isAuthor) {
                            navigate(paths.dashboard.blog.myPosts);
                        } else {
                            navigate(`${paths.blog.index}?author=${userId}`);
                        }
                    }}
                    sx={{ mt: 2, alignSelf: 'center', fontSize: '0.75rem' }}
                >
                    View all {stats.total} posts
                </Button>
            )}

            {/* Действия */}
            {showActions && posts.length > 0 && (
                <>
                    <Divider sx={{ my: 1.5 }} />

                    <Stack direction="row" spacing={1} justifyContent="center">
                        {isAuthor ? (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate(paths.dashboard.blog.postCreate)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    New
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(paths.dashboard.blog.myPosts)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    All
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<AllPostsIcon />}
                                    onClick={() => navigate(paths.blog.index)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    Blog
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(`${paths.blog.index}?author=${userId}`)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    View All
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<AllPostsIcon />}
                                    onClick={() => navigate(paths.blog.index)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    Blog
                                </Button>
                            </>
                        )}
                    </Stack>
                </>
            )}
        </Paper>
    );
};

// Мини-версия для сайдбара
export const UserPostsMini = ({
                                  userId,
                                  userName,
                                  maxPosts = 3,
                                  ...props
                              }) => {
    return (
        <UserPosts
            userId={userId}
            userName={userName}
            maxPosts={maxPosts}
            showActions={false}
            {...props}
        />
    );
};