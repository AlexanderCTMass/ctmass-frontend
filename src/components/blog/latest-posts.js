import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Avatar,
    Stack,
    Chip,
    Skeleton,
    Alert,
    Button,
    useTheme,
    useMediaQuery,
    Paper,
    alpha
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { blogService } from 'src/service/blog-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { format } from 'date-fns';

// Компонент-скелетон для загрузки
const PostSkeleton = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
            <Stack spacing={2}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="100%" height={60} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width={80} height={20} />
                    </Stack>
                    <Skeleton variant="text" width={60} height={20} />
                </Stack>
            </Stack>
        </CardContent>
    </Card>
);

// Основной компонент поста
const PostItem = ({ post, onClick, featured = false }) => {
    const theme = useTheme();
    const publishedDate = post.publishedAt
        ? format(new Date(post.publishedAt), 'MMM d, yyyy')
        : 'Recently';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[10]
                },
                ...(featured && {
                    border: '2px solid',
                    borderColor: 'primary.main',
                    position: 'relative',
                    '&::before': {
                        content: '"New"',
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        zIndex: 1
                    }
                })
            }}
        >
            <CardActionArea onClick={() => onClick(post.id)} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {post.cover ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={post.cover}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 200,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography color="text.secondary" variant="body2">
                            No image
                        </Typography>
                    </Box>
                )}

                <CardContent sx={{ flex: 1, p: 3 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Chip
                                label={post.category || 'Uncategorized'}
                                size="small"
                                color={featured ? 'primary' : 'default'}
                                variant={featured ? 'filled' : 'outlined'}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {publishedDate} • {post.readTime || '1 min read'}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {post.title}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {post.shortDescription}
                        </Typography>

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 'auto', pt: 2 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar
                                    src={post.author?.avatar}
                                    sx={{ width: 28, height: 28 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {post.author?.name}
                                </Typography>
                            </Stack>

                            <Typography variant="caption" color="text.secondary">
                                {post.likes || 0} ❤️
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const PostRow = ({ post, onClick }) => {
    const publishedDate = post.publishedAt ? format(new Date(post.publishedAt), 'MMM d') : 'Recently';

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: '18px',
                borderColor: 'rgba(31,45,119,0.1)',
                boxShadow: '0 6px 18px rgba(31,45,119,0.06)'
            }}
        >
            <CardActionArea onClick={() => onClick(post.id)} sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box
                    sx={{
                        width: 84,
                        height: 84,
                        flexShrink: 0,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {post.cover ? (
                        <Box component="img" src={post.cover} alt={post.title} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <ArticleOutlinedIcon sx={{ color: 'grey.400', fontSize: 32 }} />
                    )}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'success.main' }}
                    >
                        {publishedDate} · {post.readTime || '1 min read'}
                    </Typography>
                    <Typography
                        sx={{
                            mt: 0.5,
                            fontSize: 15,
                            fontWeight: 800,
                            lineHeight: 1.3,
                            color: '#1F2D77',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {post.title}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
};

// Основной компонент
export const LatestPosts = ({
    title = "Latest from our blog",
    subtitle = "Discover the latest news, tips and insights",
    maxPosts = 6,
    columns = { xs: 1, sm: 2, md: 3 },
    showViewAll = true,
    viewAllText = "View all posts",
    containerProps = {},
    sx = {},
    onAddNew = null,
    addNewText = "Add new post"
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLatestPosts = async () => {
            try {
                setLoading(true);
                const data = await blogService.getPosts(maxPosts);

                // Сортируем по дате публикации (самые новые первые)
                const sortedPosts = data.sort((a, b) => {
                    const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
                    const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
                    return dateB - dateA;
                });

                setPosts(sortedPosts.slice(0, maxPosts));
                setError(null);
            } catch (err) {
                console.error('Error loading latest posts:', err);
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        loadLatestPosts();
    }, [maxPosts]);

    const handlePostClick = useCallback((postId) => {
        // Определяем путь в зависимости от авторизации
        if (user) {
            navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
        } else {
            navigate(paths.blog.details.replace(':postId', postId));
        }
    }, [navigate, user]);

    const handleViewAllClick = useCallback(() => {
        if (user) {
            navigate(paths.dashboard.blog.index);
        } else {
            navigate(paths.blog.index);
        }
    }, [navigate, user]);

    // Адаптивное количество колонок
    const gridColumns = isMobile ? 1 : columns;

    if (error) {
        return (
            <Container {...containerProps}>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default', ...sx }}>
            <Container {...containerProps}>
                <Box sx={{ mb: { xs: 2.5, md: 4 } }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            fontSize: { xs: 26, md: 44 },
                            color: theme.palette.mode === 'dark' ? 'common.white' : '#1F2D77'
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: { xs: 14, md: 17 } }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Сетка постов — десктоп и планшет */}
                {!isMobile && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 3
                        }}
                    >
                        {loading ? (
                            Array.from(new Array(maxPosts)).map((_, index) => (
                                <PostSkeleton key={`skeleton-${index}`} />
                            ))
                        ) : posts.length === 0 ? (
                            <Paper
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    gridColumn: '1 / -1'
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No posts yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Check back later for new content
                                </Typography>
                            </Paper>
                        ) : (
                            posts.map((post, index) => (
                                <PostItem
                                    key={post.id}
                                    post={post}
                                    onClick={handlePostClick}
                                    featured={index === 0}
                                />
                            ))
                        )}
                    </Box>
                )}

                {/* Горизонтальный свайпер — мобильные */}
                {isMobile && (
                    <>
                        {loading ? (
                            <Box sx={{ px: 1 }}>
                                <PostSkeleton />
                            </Box>
                        ) : posts.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>No posts yet</Typography>
                                <Typography variant="body2" color="text.secondary">Check back later for new content</Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1.5}>
                                {posts.slice(0, 3).map((post) => (
                                    <PostRow key={post.id} post={post} onClick={handlePostClick} />
                                ))}
                            </Stack>
                        )}
                    </>
                )}

                {/* Кнопки действий */}
                {(showViewAll || onAddNew) && !loading && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {showViewAll && posts.length > 0 && (
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleViewAllClick}
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    borderRadius: 28,
                                    px: 4,
                                    py: 1.5,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2
                                    }
                                }}
                            >
                                {viewAllText}
                            </Button>
                        )}
                        {onAddNew && (
                            <Button
                                variant="contained"
                                size="large"
                                onClick={onAddNew}
                                sx={{
                                    borderRadius: 28,
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                {addNewText}
                            </Button>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

// Вариант с каруселью (альтернативный)
export const LatestPostsCarousel = ({
    title = "Latest from our blog",
    maxPosts = 6,
    autoplay = true,
    ...props
}) => {
    // Можно реализовать карусель с помощью Swiper или Splide
    // Но для простоты используем обычную сетку
    return <LatestPosts title={title} maxPosts={maxPosts} {...props} />;
};

// Минимальная версия для сайдбара
export const LatestPostsSidebar = ({
    maxPosts = 3,
    showImages = true,
    ...props
}) => {
    const theme = useTheme();

    return (
        <LatestPosts
            maxPosts={maxPosts}
            showViewAll={false}
            columns={{ xs: 1, sm: 1, md: 1 }}
            containerProps={{ maxWidth: 'md' }}
            sx={{ py: 3 }}
            {...props}
        />
    );
};