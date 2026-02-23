import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
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

// Основной компонент
export const LatestPosts = ({
                                title = "Latest from our blog",
                                subtitle = "Discover the latest news, tips and insights",
                                maxPosts = 6,
                                columns = { xs: 1, sm: 2, md: 3 },
                                showViewAll = true,
                                viewAllText = "View all posts",
                                containerProps = {},
                                sx = {}
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
                {/* Заголовок секции */}
                <Stack spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #fff 0%, #ccc 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="h6" color="text.secondary" fontWeight="normal">
                            {subtitle}
                        </Typography>
                    )}
                </Stack>

                {/* Сетка постов */}
                <Grid container spacing={3}>
                    {loading ? (
                        // Показываем скелетоны во время загрузки
                        Array.from(new Array(maxPosts)).map((_, index) => (
                            <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} key={`skeleton-${index}`}>
                                <PostSkeleton />
                            </Grid>
                        ))
                    ) : posts.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No posts yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Check back later for new content
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        posts.map((post, index) => (
                            <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} key={post.id}>
                                <PostItem
                                    post={post}
                                    onClick={handlePostClick}
                                    featured={index === 0 && !isMobile} // Первый пост как featured на десктопе
                                />
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* Кнопка "Все посты" */}
                {showViewAll && !loading && posts.length > 0 && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
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