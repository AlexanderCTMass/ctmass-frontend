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
import { format } from 'date-fns';
import { listingService, LISTING_STATUS, LISTING_CATEGORIES } from 'src/service/listing-service';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { getListingPath } from 'src/utils/navigation-utils';

// Компонент-скелетон для загрузки
const ListingSkeleton = () => (
    <ListItem alignItems="center" divider sx={{ py: 1 }}>
        <ListItemAvatar>
            <Skeleton variant="rounded" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" height={20} />}
            secondary={<Skeleton variant="text" width="30%" height={16} />}
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
            icon={<Icon sx={{ fontSize: 12 }} />}
            label={config.label}
            color={config.color}
            variant="outlined"
            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } }}
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
                                 dense = false // добавим пропс для сверхплотного отображения
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
                <Typography variant="subtitle1" gutterBottom>
                    {userName ? `${userName}'s Listings` : 'Recent Listings'}
                </Typography>
                <List dense>
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
                    {!isAuthor && userName ? `${userName}'s Listings` : 'My Listings'}
                </Typography>

                {/* Мини-статистика */}
                {showStats && (
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                        <Tooltip title="Total listings" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <InventoryIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">{stats.total}</Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Active" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ActiveIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption">{stats.active}</Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Views" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <VisibilityIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">{stats.totalViews}</Typography>
                            </Stack>
                        </Tooltip>

                        <Tooltip title="Likes" arrow>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <FavoriteIcon sx={{ fontSize: 16, color: 'error.light' }} />
                                <Typography variant="caption">{stats.totalLikes}</Typography>
                            </Stack>
                        </Tooltip>
                    </Stack>
                )}
            </Stack>

            {/* Список объявлений */}
            {listings.length === 0 ? (
                <Box
                    sx={{
                        py: 3,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: 1
                    }}
                >
                    <InventoryIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No listings yet
                    </Typography>
                    {isAuthor && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(paths.dashboard.listings.create)}
                            sx={{ mt: 1 }}
                        >
                            Create Listing
                        </Button>
                    )}
                </Box>
            ) : (
                <List dense disablePadding sx={{ flex: 1 }}>
                    {listings.map((listing, index) => {
                        const createdDate = listing.createdAt
                            ? format(new Date(listing.createdAt), 'MMM d')
                            : '';

                        const categoryLabel = LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category;

                        return (
                            <ListItem
                                key={listing.id}
                                disablePadding
                                secondaryAction={
                                    isAuthor && (
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                edge="end"
                                                onClick={(e) => handleEditClick(e, listing.id)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                edge="end"
                                                onClick={(e) => handleDeleteClick(e, listing.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    )
                                }
                                sx={{ mb: index < listings.length - 1 ? 0.5 : 0 }}
                            >
                                <ListItemButton
                                    onClick={() => handleListingClick(listing.id, listing.author?.id)}
                                    sx={{
                                        borderRadius: 1,
                                        py: 1,
                                        pr: isAuthor ? 8 : 2
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 52 }}>
                                        <Avatar
                                            src={listing.images?.[0]}
                                            variant="rounded"
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'grey.100'
                                            }}
                                        >
                                            <InventoryIcon sx={{ fontSize: 20 }} />
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 180 }}>
                                                    {listing.title}
                                                </Typography>
                                                {isAuthor && (
                                                    <ListingStatusBadge status={listing.status} />
                                                )}
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.25 }}>
                                                <Typography variant="caption" fontWeight={600} color="primary.main">
                                                    ${listing.price?.toLocaleString()}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    • {categoryLabel}
                                                </Typography>

                                                {listing.location && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        • <LocationIcon sx={{ fontSize: 12, mx: 0.25 }} /> {listing.location}
                                                    </Typography>
                                                )}

                                                <Typography variant="caption" color="text.secondary">
                                                    • {createdDate}
                                                </Typography>
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
                    sx={{ mt: 2, alignSelf: 'center', fontSize: '0.75rem' }}
                >
                    View all {stats.total} listings
                </Button>
            )}

            {/* Действия */}
            {showActions && listings.length > 0 && (
                <>
                    <Divider sx={{ my: 1.5 }} />

                    <Stack direction="row" spacing={1} justifyContent="center">
                        {isAuthor ? (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate(paths.dashboard.listings.create)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    New
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => navigate(paths.dashboard.listings.index)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    All
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<ViewListIcon />}
                                onClick={() => navigate(`${paths.listings.index}?author=${userId}`)}
                                sx={{ fontSize: '0.75rem', py: 0.5 }}
                            >
                                View All
                            </Button>
                        )}
                    </Stack>
                </>
            )}
        </Paper>
    );
};

// Мини-версия для сайдбара (максимально компактная)
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
            dense={true}
            {...props}
        />
    );
};