import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Chip,
    Stack,
    Avatar,
    IconButton,
    Skeleton,
    Alert,
    Button,
    Divider,
    useTheme,
    alpha,
    Paper,
    Tooltip
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Visibility as VisibilityIcon,
    LocationOn as LocationIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { listingService, LISTING_STATUS } from 'src/service/listing-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';

const ListingSkeleton = () => (
    <Card sx={{ height: '100%' }}>
        <Skeleton variant="rectangular" height={160} />
        <CardContent>
            <Stack spacing={1}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Stack direction="row" justifyContent="space-between">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={40} />
                </Stack>
            </Stack>
        </CardContent>
    </Card>
);

const ListingItem = ({ listing, onClick }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(listing.likes || 0);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return;

        try {
            const result = await listingService.toggleListingLike(listing.id, user.id, !liked);
            setLiked(result.isLiked);
            setLikeCount(result.likes);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const timeAgo = listing.createdAt
        ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })
        : '';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                }
            }}
        >
            <CardActionArea onClick={() => onClick(listing.id)} sx={{ flex: 1 }}>
                {listing.images?.[0] ? (
                    <CardMedia
                        component="img"
                        height="160"
                        image={listing.images[0]}
                        alt={listing.title}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 160,
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

                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip
                                label={listing.category}
                                size="small"
                                variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {timeAgo}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {listing.title}
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
                            {listing.description}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" color="primary.main">
                                ${listing.price?.toLocaleString()}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                                {listing.location && (
                                    <Tooltip title={listing.location} arrow>
                                        <LocationIcon fontSize="small" color="action" />
                                    </Tooltip>
                                )}

                                <IconButton
                                    size="small"
                                    onClick={handleLike}
                                    disabled={!user}
                                    sx={{ p: 0.5 }}
                                >
                                    {liked ? (
                                        <FavoriteIcon fontSize="small" color="error" />
                                    ) : (
                                        <FavoriteBorderIcon fontSize="small" />
                                    )}
                                </IconButton>
                                <Typography variant="caption" color="text.secondary">
                                    {likeCount}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                src={listing.author?.avatar}
                                sx={{ width: 24, height: 24 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {listing.author?.name}
                            </Typography>
                            <VisibilityIcon fontSize="small" color="action" sx={{ ml: 'auto' }} />
                            <Typography variant="caption" color="text.secondary">
                                {listing.views || 0}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export const RelevantListings = ({
                                     title = "You might also like",
                                     maxItems = 6,
                                     excludeListingId = null,
                                     columns = { xs: 1, sm: 2, md: 3 },
                                     showViewAll = true,
                                     containerProps = {},
                                     sx = {}
                                 }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const loadListings = async () => {
            try {
                setLoading(true);
                const data = await listingService.getRelevantListings(
                    user?.id || 'guest',
                    excludeListingId,
                    maxItems
                );
                setListings(data);
                setError(null);
            } catch (err) {
                console.error('Error loading relevant listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        loadListings();
    }, [user, excludeListingId, maxItems]);

    const handleListingClick = (listingId) => {
        // Проверяем, принадлежит ли объявление текущему пользователю
        const listing = listings.find(l => l.id === listingId);

        if (listing?.author?.id === user?.id) {
            // Свое объявление - открываем в дашборде
            navigate(`/dashboard/listings/${listingId}`);
        } else {
            // Чужое объявление - открываем в публичной части
            navigate(`/listings/${listingId}`);
        }
    };

    const handleViewAll = () => {
        if (user) {
            navigate('/dashboard/listings');
        } else {
            navigate('/listings');
        }
    };

    if (error) {
        return (
            <Container {...containerProps}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ py: 4, ...sx }}>
            <Container {...containerProps}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h5">
                            {title}
                        </Typography>
                        {showViewAll && listings.length > 0 && (
                            <Button
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleViewAll}
                            >
                                View all
                            </Button>
                        )}
                    </Stack>

                    <Grid container spacing={3}>
                        {loading ? (
                            Array.from(new Array(maxItems)).map((_, index) => (
                                <Grid
                                    item
                                    xs={columns.xs}
                                    sm={columns.sm}
                                    md={columns.md}
                                    key={`skeleton-${index}`}
                                >
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
                                    <Typography color="text.secondary">
                                        No relevant listings found
                                    </Typography>
                                </Paper>
                            </Grid>
                        ) : (
                            listings.map((listing) => (
                                <Grid
                                    item
                                    xs={columns.xs}
                                    sm={columns.sm}
                                    md={columns.md}
                                    key={listing.id}
                                >
                                    <ListingItem
                                        listing={listing}
                                        onClick={handleListingClick}
                                    />
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
};

// Мини-версия для сайдбара
export const RelevantListingsMini = (props) => (
    <RelevantListings
        maxItems={3}
        columns={{ xs: 1, sm: 1, md: 1 }}
        showViewAll={false}
        {...props}
    />
);