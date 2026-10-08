import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { listingService, LISTING_CATEGORIES } from 'src/service/listing-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { getListingPath } from 'src/utils/navigation-utils';
import { ListingTile } from 'src/components/listings/listing-tile';
import { btn, EmptyState } from 'src/components/ctmass-ui';
import { SectionHeading } from 'src/sections/home/home-section';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';

const ListingSkeleton = () => (
    <Box sx={{ bgcolor: '#FFFFFF', borderRadius: RADIUS.card, border: `1px solid ${alpha(BRAND.navy, 0.08)}`, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 11', height: 'auto' }} />
        <Box sx={{ p: 1.75 }}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="85%" height={24} />
            <Skeleton variant="text" width="55%" height={18} />
        </Box>
    </Box>
);

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

    const handleOpen = useCallback((listing) => {
        handleListingClick(listing.id, listing.author?.id);
    }, [handleListingClick]);

    if (error) {
        return (
            <Container {...containerProps}>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    const gridSx = {
        display: 'grid',
        gap: { xs: 1.5, md: 2.5 },
        gridAutoFlow: { xs: 'column', sm: 'row' },
        gridAutoColumns: { xs: '64%', sm: 'auto' },
        gridTemplateColumns: {
            sm: `repeat(${Math.min(columns.sm || 2, 3)}, minmax(0, 1fr))`,
            md: `repeat(${Math.max(columns.md || 3, 4)}, minmax(0, 1fr))`
        },
        overflowX: { xs: 'auto', sm: 'visible' },
        scrollSnapType: { xs: 'x mandatory', sm: 'none' },
        scrollPaddingLeft: 16,
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        pb: { xs: 1, sm: 0 },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        '& > *': { scrollSnapAlign: 'start', minWidth: 0 }
    };

    return (
        <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default', ...sx }}>
            <Container {...containerProps}>
                <SectionHeading
                    title={title}
                    subtitle={subtitle}
                    action={showViewAll && listings.length > 0 ? (
                        <Button onClick={handleViewAllClick} endIcon={<ArrowForwardRoundedIcon />} sx={{ ...btn.text, display: { xs: 'none', sm: 'inline-flex' } }}>
                            {viewAllText}
                        </Button>
                    ) : null}
                />

                {loading ? (
                    <Box sx={gridSx}>
                        {Array.from(new Array(Math.min(maxPosts, 4))).map((_, index) => (
                            <ListingSkeleton key={`skeleton-${index}`} />
                        ))}
                    </Box>
                ) : listings.length === 0 ? (
                    <EmptyState
                        icon={<LocalOfferOutlinedIcon />}
                        title="No listings yet"
                        text="Tools, materials and services from local pros will show up here."
                        sx={{ bgcolor: '#FFFFFF', borderRadius: RADIUS.card, border: `1px solid ${alpha(BRAND.navy, 0.08)}` }}
                    />
                ) : (
                    <Box sx={gridSx}>
                        {listings.map((listing) => (
                            <ListingTile
                                key={listing.id}
                                listing={listing}
                                onOpen={handleOpen}
                                onLike={handleLike}
                                isLiked={likedListings.has(listing.id)}
                                canLike={!!user}
                                compact
                            />
                        ))}
                    </Box>
                )}

                {(showViewAll || onAddNew) && !loading && (
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="center"
                        sx={{ mt: { xs: 3, md: 4 } }}
                    >
                        {showViewAll && listings.length > 0 && (
                            <Button onClick={handleViewAllClick} endIcon={<ArrowForwardRoundedIcon />} sx={{ ...btn.outline, minHeight: 50, px: 3.5 }}>
                                {viewAllText}
                            </Button>
                        )}
                        {onAddNew && (
                            <Button onClick={onAddNew} startIcon={<AddRoundedIcon />} sx={{ ...btn.green, minHeight: 50, px: 3.5 }}>
                                {addNewText}
                            </Button>
                        )}
                    </Stack>
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