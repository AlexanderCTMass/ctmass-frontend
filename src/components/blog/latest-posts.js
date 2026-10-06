import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    Stack,
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
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

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
                            color: BRAND.navy,
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

const FeaturedPost = ({ post, onClick }) => {
    const publishedDate = post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Recently';

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: RADIUS.panel,
                overflow: 'hidden',
                border: '1px solid rgba(31,45,119,0.08)',
                boxShadow: '0 14px 34px rgba(31,45,119,0.1)',
                '&:hover img': { transform: 'scale(1.04)' }
            }}
        >
            <CardActionArea onClick={() => onClick(post.id)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ position: 'relative', pt: '56%', overflow: 'hidden', bgcolor: 'grey.100' }}>
                    {post.cover ? (
                        <Box
                            component="img"
                            src={post.cover}
                            alt={post.title}
                            loading="lazy"
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s cubic-bezier(.2,.8,.2,1)' }}
                        />
                    ) : (
                        <ArticleOutlinedIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'grey.400', fontSize: 56 }} />
                    )}
                </Box>
                <Box sx={{ p: { md: 3.5 }, flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'success.main' }}>
                        {publishedDate}, {post.readTime || '1 min read'}
                    </Typography>
                    <Typography
                        sx={{
                            mt: 1,
                            fontFamily: FONT.display,
                            fontSize: 28,
                            fontWeight: 800,
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            color: BRAND.navy,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {post.title}
                    </Typography>
                    {post.shortDescription && (
                        <Typography
                            sx={{
                                mt: 1.25,
                                color: 'text.secondary',
                                fontSize: 16,
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {post.shortDescription}
                        </Typography>
                    )}
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
                            Array.from(new Array(4)).map((_, index) => (
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
                            <Box
                                sx={{
                                    gridColumn: '1 / -1',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
                                    gap: 3,
                                    alignItems: 'stretch'
                                }}
                            >
                                <FeaturedPost post={posts[0]} onClick={handlePostClick} />
                                <Stack spacing={2} justifyContent="space-between">
                                    {posts.slice(1, 5).map((post) => (
                                        <PostRow key={post.id} post={post} onClick={handlePostClick} />
                                    ))}
                                </Stack>
                            </Box>
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