/**
 * // На странице профиля
 * <UserListings
 *   userId={profileUserId}
 *   userName={profileUserName}
 *   maxPosts={5}
 *   showActions={true}
 * />
 *
 * // В сайдбаре
 * <UserListingsMini
 *   userId={userId}
 *   maxPosts={3}
 * />
 *
 * // В дашборде с кастомными обработчиками
 * <UserListings
 *   userId={user.uid}
 *   onEdit={(id) => handleEdit(id)}
 *   onDelete={(id) => handleDelete(id)}
 *   onListingClick={(id, authorId) => customNavigate(id, authorId)}
 * />
 */
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
    Inventory as InventoryIcon,
    ViewList as ViewListIcon,
    AllInbox as AllListingsIcon,
    Favorite as FavoriteIcon,
    Visibility as VisibilityIcon,
    Schedule as ScheduleIcon,
    CheckCircle as ActiveIcon,
    LocalOffer as LocalOfferIcon,
    LocationOn as LocationIcon,
    ArrowForward as ArrowForwardIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { listingService, LISTING_STATUS, LISTING_CATEGORIES } from 'src/service/listing-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { getListingPath } from 'src/utils/navigation-utils';
import ExpandableText from "src/components/expandable-text";

// Компонент-скелетон для загрузки
const ListingSkeleton = () => (
    <ListItem alignItems="flex-start" divider>
        <ListItemAvatar>
            <Skeleton variant="rounded" width={56} height={56} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" height={24} />}
            secondary={
                <Stack spacing={1} sx={{ mt: 1 }}>
                    <Skeleton variant="text" width="90%" height={20} />
                    <Stack direction="row" spacing={1}>
                        <Skeleton variant="text" width="30%" height={20} />
                        <Skeleton variant="text" width="30%" height={20} />
                    </Stack>
                </Stack>
            }
        />
    </ListItem>
);

// Компонент для отображения статуса объявления
const ListingStatusBadge = ({ status }) => {
    const statusConfig = {
        [LISTING_STATUS.ACTIVE]: { icon: ActiveIcon, color: 'success', label: 'Active' },
        [LISTING_STATUS.DRAFT]: { icon: ScheduleIcon, color: 'default', label: 'Draft' },
        [LISTING_STATUS.SOLD]: { icon: LocalOfferIcon, color: 'info', label: 'Sold' },
        [LISTING_STATUS.ARCHIVED]: { icon: InventoryIcon, color: 'warning', label: 'Archived' },
        [LISTING_STATUS.EXPIRED]: { icon: ScheduleIcon, color: 'error', label: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig[LISTING_STATUS.DRAFT];
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
export const UserListings = ({
                                 userId,
                                 userName,
                                 maxPosts = 6,
                                 showActions = true,
                                 showStats = true,
                                 containerProps = {},
                                 sx = {},
                                 onListingClick,
                                 onEdit,
                                 onDelete,
                                 variant = 'list' // 'list' или 'grid'
                             }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const theme = useTheme();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        sold: 0,
        totalViews: 0,
        totalLikes: 0,
        totalValue: 0
    });

    // Загрузка объявлений пользователя
    useEffect(() => {
        const loadUserListings = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const userListings = await listingService.getUserListings(userId, null, 50);

                // Сортируем по дате
                const sortedListings = userListings
                    .sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                        return dateB - dateA;
                    })
                    .slice(0, maxPosts);

                setListings(sortedListings);

                // Подсчет статистики
                const userStats = await listingService.getUserStats(userId);
                setStats(userStats);

                setError(null);
            } catch (err) {
                console.error('Error loading user listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        loadUserListings();
    }, [userId, maxPosts]);

    const handleListingClick = (listingId, authorId) => {
        if (onListingClick) {
            onListingClick(listingId, authorId);
        } else {
            const path = getListingPath(listingId, authorId, currentUser);
            navigate(path);
        }
    };

    const handleEditClick = (e, listingId) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(listingId);
        } else {
            navigate(paths.dashboard.listings.edit.replace(':listingId', listingId));
        }
    };

    const handleDeleteClick = (e, listingId) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(listingId);
        }
    };

    const isAuthor = currentUser?.id === userId;

    if (loading) {
        return (
            <Paper sx={{ p: 2, ...sx }} {...containerProps}>
                <Typography variant="h6" gutterBottom>
                    {userName ? `${userName}'s Listings` : 'Recent Listings'}
                </Typography>
                <List>
                    {Array.from(new Array(3)).map((_, index) => (
                        <ListingSkeleton key={index} />
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
                    {!isAuthor && userName ? `${userName}'s Listings` : 'My Listings'}
                </Typography>

                {/* Мини-статистика */}
                {showStats && (
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} flexWrap="wrap">
                        <Tooltip title="Total listings" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <InventoryIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {stats.total}
                                </Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Active" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ActiveIcon fontSize="small" color="success" />
                                <Typography variant="body2" color="text.secondary">
                                    {stats.active}
                                </Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Sold" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocalOfferIcon fontSize="small" color="info" />
                                <Typography variant="body2" color="text.secondary">
                                    {stats.sold}
                                </Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Total views" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <VisibilityIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {stats.totalViews}
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
                    </Stack>
                )}
            </Stack>

            {/* Список объявлений */}
            {listings.length === 0 ? (
                <Box
                    sx={{
                        py: 4,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: 2
                    }}
                >
                    <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary" gutterBottom>
                        No listings yet
                    </Typography>
                    {isAuthor && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(paths.dashboard.listings.create)}
                            sx={{ mt: 2 }}
                        >
                            Create Your First Listing
                        </Button>
                    )}
                </Box>
            ) : (
                <List sx={{ flex: 1, overflow: 'auto' }}>
                    {listings.map((listing, index) => {
                        const createdDate = listing.createdAt
                            ? format(new Date(listing.createdAt), 'MMM d, yyyy')
                            : 'Recently';

                        const timeAgo = listing.createdAt
                            ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })
                            : '';

                        const categoryLabel = LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category;

                        return (
                            <ListItem
                                key={listing.id}
                                disablePadding
                                divider={index < listings.length - 1}
                                secondaryAction={
                                    isAuthor && (
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleEditClick(e, listing.id)}
                                                color="primary"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleDeleteClick(e, listing.id)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    )
                                }
                            >
                                <ListItemButton
                                    onClick={() => handleListingClick(listing.id, listing.author?.id)}
                                    sx={{
                                        borderRadius: 1,
                                        pr: isAuthor ? 10 : 2,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04)
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={listing.images?.[0]}
                                            variant="rounded"
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: 'grey.100',
                                                mr: 2
                                            }}
                                        >
                                            {!listing.images?.[0] && <InventoryIcon />}
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="subtitle2">
                                                    {listing.title}
                                                </Typography>
                                                {isAuthor && (
                                                    <ListingStatusBadge status={listing.status} />
                                                )}
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
                                                    <ExpandableText html={listing.description} expandEnable={false}/>
                                                </Typography>

                                                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                                    {/* Цена */}
                                                    <Typography variant="subtitle2" color="primary.main">
                                                        ${listing.price?.toLocaleString()}
                                                        {listing.priceType === 'negotiable' && (
                                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                                (nego)
                                                            </Typography>
                                                        )}
                                                    </Typography>

                                                    {/* Категория */}
                                                    <Chip
                                                        size="small"
                                                        label={categoryLabel}
                                                        variant="outlined"
                                                        sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } }}
                                                    />

                                                    {/* Локация */}
                                                    {listing.location && (
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {listing.location}
                                                            </Typography>
                                                        </Stack>
                                                    )}

                                                    {/* Дата */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {createdDate}
                                                    </Typography>
                                                </Stack>

                                                {/* Статистика */}
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Tooltip title="Views" arrow>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <VisibilityIcon sx={{ fontSize: 14, color: 'action.active' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {listing.views || 0}
                                                            </Typography>
                                                        </Stack>
                                                    </Tooltip>

                                                    <Tooltip title="Likes" arrow>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <FavoriteIcon sx={{ fontSize: 14, color: 'error.light' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {listing.likes || 0}
                                                            </Typography>
                                                        </Stack>
                                                    </Tooltip>

                                                    <Tooltip title="Seller" arrow>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Avatar
                                                                src={listing.author?.avatar}
                                                                sx={{ width: 16, height: 16 }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {listing.author?.name}
                                                            </Typography>
                                                        </Stack>
                                                    </Tooltip>
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

            {/* Кнопка "View All" если больше постов */}
            {stats.total > maxPosts && (
                <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                        if (isAuthor) {
                            navigate(paths.dashboard.listings.index);
                        } else {
                            navigate(`${paths.listings.index}?author=${userId}`);
                        }
                    }}
                    sx={{ mt: 2, alignSelf: 'center' }}
                >
                    View all {stats.total} listings
                </Button>
            )}

            {/* Действия */}
            {showActions && listings.length > 0 && (
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
                                    onClick={() => navigate(paths.dashboard.listings.create)}
                                    fullWidth
                                >
                                    New Listing
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(paths.dashboard.listings.index)}
                                    fullWidth
                                >
                                    My Listings
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<AllListingsIcon />}
                                    onClick={() => navigate(paths.listings.index)}
                                    fullWidth
                                >
                                    Browse All
                                </Button>
                            </>
                        ) : (
                            // Гость профиля
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(`${paths.listings.index}?author=${userId}`)}
                                    fullWidth
                                >
                                    View {userName || 'User'}'s Listings
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<AllListingsIcon />}
                                    onClick={() => navigate(paths.listings.index)}
                                    fullWidth
                                >
                                    Browse All
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
export const UserListingsGrid = ({
                                     userId,
                                     userName,
                                     maxPosts = 6,
                                     columns = { xs: 1, sm: 2, md: 3 },
                                     ...props
                                 }) => {
    return (
        <UserListings
            userId={userId}
            userName={userName}
            maxPosts={maxPosts}
            variant="grid"
            {...props}
        />
    );
};

// Мини-версия для сайдбара
export const UserListingsMini = ({
                                     userId,
                                     userName,
                                     maxPosts = 3,
                                     ...props
                                 }) => {
    return (
        <UserListings
            userId={userId}
            userName={userName}
            maxPosts={maxPosts}
            showActions={false}
            showStats={false}
            {...props}
        />
    );
};