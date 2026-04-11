/**
 * // На главной странице
 * <LatestListings
 *   title="Fresh listings"
 *   subtitle="New items added daily"
 *   maxPosts={6}
 * />
 *
 * // В категории
 * <CategoryListings
 *   category="electronics"
 *   maxPosts={8}
 * />
 *
 * // В сайдбаре
 * <LatestListingsSidebar maxPosts={3} />
 *
 * // Похожие объявления на странице товара
 * <SimilarListings
 *   listingId={currentListing.id}
 *   category={currentListing.category}
 *   excludeUserId={currentListing.author.id}
 * />
 */
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
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    LocationOn as LocationIcon,
    Visibility as VisibilityIcon,
    LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { listingService, LISTING_CATEGORIES, LISTING_STATUS } from 'src/service/listing-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { getListingPath } from 'src/utils/navigation-utils';

// Компонент-скелетон для загрузки
const ListingSkeleton = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
            <Stack spacing={2}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="100%" height={40} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton variant="text" width={60} height={20} />
                    </Stack>
                    <Skeleton variant="text" width={60} height={20} />
                </Stack>
            </Stack>
        </CardContent>
    </Card>
);

// Основной компонент объявления
const ListingItem = ({ listing, onClick, featured = false, onLike, isLiked }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const createdDate = listing.createdAt
        ? format(new Date(listing.createdAt), 'MMM d, yyyy')
        : 'Recently';

    const categoryLabel = LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category;

    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (onLike) {
            onLike(listing.id, !isLiked);
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[10]
                },
                ...(featured && {
                    border: '2px solid',
                    borderColor: 'primary.main'
                })
            }}
        >
            {/* Бейдж "Featured" или "Sold" */}
            {featured && (
                <Box
                    sx={{
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
                    }}
                >
                    Featured
                </Box>
            )}

            {listing.status === LISTING_STATUS.SOLD && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'info.main',
                        color: 'info.contrastText',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        zIndex: 1
                    }}
                >
                    Sold
                </Box>
            )}

            <CardActionArea onClick={() => onClick(listing.id, listing.author?.id)}
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {listing.images?.[0] ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={listing.images[0]}
                        alt={listing.title}
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
                        <LocalOfferIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                    </Box>
                )}

                <CardContent sx={{ flex: 1, p: 3 }}>
                    <Stack spacing={2}>
                        {/* Категория и дата */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Chip
                                label={categoryLabel}
                                size="small"
                                color={featured ? 'primary' : 'default'}
                                variant={featured ? 'filled' : 'outlined'}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {createdDate}
                            </Typography>
                        </Stack>

                        {/* Заголовок */}
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
                            {listing.title}
                        </Typography>


                        {/* Цена и локация */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <Typography variant="h5" color="primary.main" sx={{ flexShrink: 0 }}>
                                ${listing.price?.toLocaleString()}
                                {listing.priceType === 'negotiable' && (
                                    <Typography component="span" variant="caption" color="text.secondary"
                                        sx={{ ml: 0.5 }}>
                                        (nego)
                                    </Typography>
                                )}
                            </Typography>

                            {listing.location && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {listing.location}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        {/* Автор и статистика */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 'auto', pt: 2 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                                <Avatar
                                    src={listing.author?.avatar}
                                    sx={{ width: 28, height: 28, flexShrink: 0 }}
                                />
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {listing.author?.name}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Tooltip title="Views" arrow>
                                    <Stack direction="row" spacing={0.3} alignItems="center">
                                        <VisibilityIcon sx={{ fontSize: 16, color: 'action.active' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {listing.views || 0}
                                        </Typography>
                                    </Stack>
                                </Tooltip>

                                {user ? (
                                    <IconButton
                                        size="small"
                                        onClick={handleLikeClick}
                                        sx={{ p: 0.5 }}
                                    >
                                        {isLiked ? (
                                            <FavoriteIcon sx={{ fontSize: 18, color: 'error.main' }} />
                                        ) : (
                                            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </IconButton>
                                ) : (
                                    <Tooltip title="Sign in to like" arrow>
                                        <Stack direction="row" spacing={0.3} alignItems="center">
                                            <FavoriteBorderIcon sx={{ fontSize: 16, color: 'action.disabled' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {listing.likes || 0}
                                            </Typography>
                                        </Stack>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

// Основной компонент
export const LatestListings = ({
    title = "Latest listings",
    subtitle = "Discover the latest items from our community",
    maxPosts = 6,
    columns = { xs: 1, sm: 2, md: 3 },
    showViewAll = true,
    viewAllText = "View all listings",
    containerProps = {},
    sx = {},
    category = null,
    excludeUserId = null,
    hideLiked = false,
    onAddNew = null,
    addNewText = "Add new listing"
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedListings, setLikedListings] = useState(new Set());

    useEffect(() => {
        const loadLatestListings = async () => {
            try {
                setLoading(true);
                let data = await listingService.getActiveListings(category, maxPosts * 2);

                // Фильтруем по userId если нужно
                if (excludeUserId) {
                    data = data.filter(listing => listing.author?.id !== excludeUserId);
                }

                // Сортируем по дате публикации (самые новые первые)
                const sortedListings = data.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });

                setListings(sortedListings.slice(0, maxPosts));

                // Проверяем лайки для пользователя
                if (user && !hideLiked) {
                    const liked = new Set();
                    sortedListings.slice(0, maxPosts).forEach(listing => {
                        if (listing.likedBy?.includes(user.id)) {
                            liked.add(listing.id);
                        }
                    });
                    setLikedListings(liked);
                }

                setError(null);
            } catch (err) {
                console.error('Error loading latest listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        loadLatestListings();
    }, [maxPosts, category, excludeUserId, user, hideLiked]);

    const handleListingClick = useCallback((listingId, authorId) => {
        const path = getListingPath(listingId, authorId, user);
        navigate(path);
    }, [navigate, user]);

    const handleViewAllClick = useCallback(() => {
        if (category) {
            navigate(`${paths.listings.index}?category=${category}`);
        } else {
            navigate(paths.listings.index);
        }
    }, [navigate, category]);

    const handleLike = useCallback(async (listingId, isLiking) => {
        if (!user) {
            navigate(paths.login.index);
            return;
        }

        try {
            const result = await listingService.toggleListingLike(listingId, user.id, isLiking);

            setLikedListings(prev => {
                const newSet = new Set(prev);
                if (result.isLiked) {
                    newSet.add(listingId);
                } else {
                    newSet.delete(listingId);
                }
                return newSet;
            });

            // Обновляем количество лайков в списке
            setListings(prev => prev.map(listing =>
                listing.id === listingId
                    ? { ...listing, likes: result.likes }
                    : listing
            ));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }, [user, navigate]);

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

                {/* Сетка объявлений */}
                <Grid container spacing={3}>
                    {loading ? (
                        // Показываем скелетоны во время загрузки
                        Array.from(new Array(maxPosts)).map((_, index) => (
                            <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md}
                                key={`skeleton-${index}`}>
                                <ListingSkeleton />
                            </Grid>
                        ))
                    ) : listings.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                                }}
                            >
                                <LocalOfferIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No listings yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Check back later for new items
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        listings.map((listing, index) => (
                            <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} key={listing.id}>
                                <ListingItem
                                    listing={listing}
                                    onClick={handleListingClick}
                                    onLike={handleLike}
                                    isLiked={likedListings.has(listing.id)}
                                    featured={index === 0 && !isMobile && !category} // Первый пост как featured на десктопе, если нет категории
                                />
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* Кнопки действий */}
                {(showViewAll || onAddNew) && !loading && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {showViewAll && listings.length > 0 && (
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

// Вариант с фильтром по категории
export const CategoryListings = ({
    category,
    title,
    ...props
}) => {
    const categoryLabel = LISTING_CATEGORIES.find(c => c.value === category)?.label || category;

    return (
        <LatestListings
            category={category}
            title={title || `${categoryLabel} listings`}
            {...props}
        />
    );
};

// Минимальная версия для сайдбара
export const LatestListingsSidebar = ({
    maxPosts = 3,
    ...props
}) => {
    return (
        <LatestListings
            maxPosts={maxPosts}
            showViewAll={false}
            columns={{ xs: 1, sm: 1, md: 1 }}
            containerProps={{ maxWidth: 'md' }}
            sx={{ py: 3 }}
            {...props}
        />
    );
};

// Версия для похожих объявлений
export const SimilarListings = ({
    listingId,
    category,
    excludeUserId,
    maxPosts = 4,
    ...props
}) => {
    return (
        <LatestListings
            category={category}
            excludeUserId={excludeUserId}
            maxPosts={maxPosts}
            showViewAll={false}
            title="Similar listings"
            subtitle="You might also like"
            {...props}
        />
    );
};