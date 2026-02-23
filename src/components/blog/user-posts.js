import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
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
    Tooltip,
    Badge
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
import { format, formatDistanceToNow } from 'date-fns';
import { blogService } from 'src/service/blog-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';

// Компонент-скелетон для загрузки
const PostSkeleton = () => (
    <ListItem alignItems="flex-start" divider>
        <ListItemAvatar>
            <Skeleton variant="circular" width={48} height={48} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" height={24} />}
            secondary={
                <Stack spacing={1} sx={{ mt: 1 }}>
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                </Stack>
            }
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
            icon={<Icon sx={{ fontSize: 14 }} />}
            label={config.label}
            color={config.color}
            variant="outlined"
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
                              onPostClick,
                              variant = 'list' // 'list' или 'grid'
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
            // По умолчанию переходим в зависимости от авторизации
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
                <Typography variant="h6" gutterBottom>
                    {userName ? `${userName}'s Recent Posts` : 'Recent Posts'}
                </Typography>
                <List>
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
                <Alert severity="error">{error}</Alert>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...sx
            }}
            {...containerProps}
        >
            {/* Заголовок */}
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h6">
                    {!isAuthor && userName ? `${userName}'s Recent Posts` : 'Recent Posts'}
                </Typography>

                {/* Мини-статистика */}
                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                    <Tooltip title="Total posts" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ArticleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {stats.total}
                            </Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Published" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <PublishedIcon fontSize="small" color="success" />
                            <Typography variant="body2" color="text.secondary">
                                {stats.published}
                            </Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Total likes" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <FavoriteIcon fontSize="small" color="error" />
                            <Typography variant="body2" color="text.secondary">
                                {stats.totalLikes}
                            </Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Total comments" arrow>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <CommentIcon fontSize="small" color="info" />
                            <Typography variant="body2" color="text.secondary">
                                {stats.totalComments}
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Список постов */}
            {posts.length === 0 ? (
                <Box
                    sx={{
                        py: 4,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: 2
                    }}
                >
                    <Typography color="text.secondary" gutterBottom>
                        No posts yet
                    </Typography>
                    {isAuthor && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(paths.dashboard.blog.postCreate)}
                            sx={{ mt: 1 }}
                        >
                            Create your first post
                        </Button>
                    )}
                </Box>
            ) : (
                <List sx={{ flex: 1, overflow: 'auto' }}>
                    {posts.map((post, index) => {
                        const publishedDate = post.publishedAt
                            ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                            : 'Draft';

                        const timeAgo = post.publishedAt
                            ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                            : '';

                        const commentCount = countAllComments(post.comments);

                        return (
                            <ListItem
                                key={post.id}
                                disablePadding
                                divider={index < posts.length - 1}
                                secondaryAction={
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title={`${post.likes || 0} likes`} arrow>
                                            <Badge
                                                badgeContent={post.likes || 0}
                                                color="error"
                                                max={99}
                                                showZero
                                            >
                                                <FavoriteIcon
                                                    fontSize="small"
                                                    color={post.likes > 0 ? 'error' : 'action'}
                                                />
                                            </Badge>
                                        </Tooltip>

                                        <Tooltip title={`${commentCount} comments`} arrow>
                                            <Badge
                                                badgeContent={commentCount}
                                                color="info"
                                                max={99}
                                                showZero
                                            >
                                                <CommentIcon fontSize="small" color="action" />
                                            </Badge>
                                        </Tooltip>
                                    </Stack>
                                }
                            >
                                <ListItemButton
                                    onClick={() => handlePostClick(post.id)}
                                    sx={{ borderRadius: 1, pr: 12 }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={post.cover}
                                            variant="rounded"
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: 'grey.100',
                                                mr: 2
                                            }}
                                        >
                                            {!post.cover && <ArticleIcon />}
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="subtitle2">
                                                    {post.title}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}
                                                >
                                                    {post.shortDescription}
                                                </Typography>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption" color="text.secondary">
                                                        {publishedDate}
                                                    </Typography>
                                                    {timeAgo && (
                                                        <>
                                                            <Typography variant="caption" color="text.disabled">•</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {timeAgo}
                                                            </Typography>
                                                        </>
                                                    )}
                                                    <Typography variant="caption" color="text.disabled">•</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {post.readTime || '1 min read'}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            )}

            {/* Действия */}
            {showActions && posts.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }} />

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="center"
                    >
                        {isAuthor ? (
                            // Автор профиля
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate(paths.dashboard.blog.postCreate)}
                                    fullWidth
                                >
                                    New Post
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(paths.dashboard.blog.myPosts)}
                                    fullWidth
                                >
                                    My Posts
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<AllPostsIcon />}
                                    onClick={() => navigate(paths.dashboard.blog.index)}
                                    fullWidth
                                >
                                    CTMass Tech Blog
                                </Button>
                            </>
                        ) : (
                            // Гость профиля
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(`${paths.blog.index}?author=${userId}`)}
                                    fullWidth
                                >
                                    View {userName || 'Author'}'s Posts
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<AllPostsIcon />}
                                    onClick={() => navigate(paths.blog.index)}
                                    fullWidth
                                >
                                    CTMass Tech Blog
                                </Button>
                            </>
                        )}
                    </Stack>
                </>
            )}


        </Paper>
    );
};

// Альтернативная версия в виде карточек (для сетки)
export const UserPostsGrid = ({
                                  userId,
                                  userName,
                                  maxPosts = 6,
                                  columns = { xs: 1, sm: 2, md: 3 },
                                  ...props
                              }) => {
    return (
        <UserPosts
            userId={userId}
            userName={userName}
            maxPosts={maxPosts}
            variant="grid"
            {...props}
        />
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