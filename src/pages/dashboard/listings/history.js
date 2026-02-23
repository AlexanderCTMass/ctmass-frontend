import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    Button,
    Chip,
    Avatar,
    Divider,
    Breadcrumbs,
    Link,
    IconButton,
    Tooltip,
    Paper,
    Alert,
    Skeleton,
    Tab,
    Tabs,
    alpha,
    useTheme,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination
} from '@mui/material';
import {
    History as HistoryIcon,
    Favorite as FavoriteIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Clear as ClearIcon,
    ArrowBack as ArrowBackIcon,
    AccessTime as AccessTimeIcon,
    LocalOffer as LocalOfferIcon,
    LocationOn as LocationIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import { listingService, LISTING_CATEGORIES } from 'src/service/listing-service';
import { BreadcrumbsSeparator } from 'src/components/breadcrumbs-separator';
import { RouterLink } from 'src/components/router-link';
import {HtmlContent} from "src/components/html-content";

// Компонент карточки для истории/избранного
const ListingHistoryCard = ({user, item, type, onRemove, onClick }) => {
    const theme = useTheme();
    const listing = type === 'history' ? item.listing : item;

    const viewedTime = type === 'history' && item.viewedAt
        ? formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })
        : '';

    const createdTime = listing.createdAt
        ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })
        : '';

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            {/* Изображение */}
            <Box
                sx={{
                    width: { xs: '100%', sm: 120 },
                    height: { xs: 120, sm: 'auto' },
                    bgcolor: 'grey.100',
                    backgroundImage: listing.images?.[0] ? `url(${listing.images[0]})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => onClick(listing.id, listing.author?.id)} // Передаем authorId
            >
                {!listing.images?.[0] && (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            No image
                        </Typography>
                    </Box>
                )}

                {/* Бейдж статуса */}
                {listing.status === 'sold' && (
                    <Chip
                        label="Sold"
                        size="small"
                        color="info"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            height: 20,
                            '& .MuiChip-label': { px: 1, fontSize: '0.625rem' }
                        }}
                    />
                )}
            </Box>

            {/* Контент */}
            <Box sx={{ flex: 1, p: 2 }}>
                <Stack spacing={1}>
                    {/* Заголовок и категория */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    '&:hover': { color: 'primary.main' }
                                }}
                                onClick={() => onClick(listing.id)}
                            >
                                {listing.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category}
                            </Typography>
                        </Box>

                        <Chip
                            size="small"
                            icon={type === 'history' ? <AccessTimeIcon /> : <FavoriteIcon />}
                            label={type === 'history' ? viewedTime || 'Recently' : 'Saved'}
                            color={type === 'history' ? 'default' : 'error'}
                            variant="outlined"
                        />
                    </Stack>

                    {/* Описание */}
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
                        <HtmlContent content={listing.description} />
                    </Typography>

                    {/* Детали */}
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Typography variant="h6" color="primary.main">
                            ${listing.price?.toLocaleString()}
                        </Typography>

                        {listing.location && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                    {listing.location}
                                </Typography>
                            </Stack>
                        )}

                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
                            <VisibilityIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                                {listing.views || 0}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <FavoriteBorderIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                                {listing.likes || 0}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Продавец и дата */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mt: 1 }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                src={listing.author?.avatar}
                                sx={{ width: 24, height: 24 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {listing.author?.name}
                            </Typography>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                            Listed {createdTime}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            {/* Кнопка удаления */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderLeft: { xs: 'none', sm: `1px solid ${theme.palette.divider}` }
                }}
            >
                <Tooltip title={type === 'history' ? 'Remove from history' : 'Remove from favorites'}>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item, type);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>

                {listing.author?.id === user?.id && (
                    <Chip
                        size="small"
                        label="My listing"
                        color="primary"
                        variant="outlined"
                        sx={{position: 'absolute', top: 8, right: 8}}
                    />
                )}
            </Box>
        </Card>
    );
};

// Компонент скелетона
const HistorySkeleton = () => (
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Skeleton variant="rectangular" width={{ xs: '100%', sm: 120 }} height={120} />
        <Box sx={{ flex: 1, p: 2 }}>
            <Stack spacing={1}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Stack direction="row" justifyContent="space-between">
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="20%" />
                </Stack>
            </Stack>
        </Box>
    </Card>
);

// Компонент фильтров
const HistoryFilters = ({ filters, onFilterChange, onClear, type }) => (
    <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                    Filters
                </Typography>
                <Button
                    size="small"
                    onClick={onClear}
                    startIcon={<ClearIcon />}
                >
                    Clear
                </Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filters.category}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                        label="Category"
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        {LISTING_CATEGORIES.map((cat) => (
                            <MenuItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {type === 'history' && (
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Time</InputLabel>
                        <Select
                            value={filters.timeRange}
                            onChange={(e) => onFilterChange('timeRange', e.target.value)}
                            label="Time"
                        >
                            <MenuItem value="all">All time</MenuItem>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This week</MenuItem>
                            <MenuItem value="month">This month</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Stack>
        </Stack>
    </Paper>
);

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
    >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

const Page = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const snackbar = useSnackbar();

    const [activeTab, setActiveTab] = useState(0);
    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        timeRange: 'all'
    });

    const itemsPerPage = 10;

    usePageView();

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const [historyData, favoritesData] = await Promise.all([
                    listingService.getViewHistory(user.id, 50),
                    listingService.getFavoriteListings(user.id)
                ]);

                setHistory(historyData);
                setFavorites(favoritesData);
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Фильтрация данных
    const getFilteredData = (data, type) => {
        return data.filter(item => {
            const listing = type === 'history' ? item.listing : item;

            // Поиск
            if (filters.search && !listing.title.toLowerCase().includes(filters.search.toLowerCase()) &&
                !listing.description.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Категория
            if (filters.category !== 'all' && listing.category !== filters.category) {
                return false;
            }

            // Временной диапазон (только для истории)
            if (type === 'history' && filters.timeRange !== 'all') {
                const viewedDate = new Date(item.viewedAt);
                const now = new Date();

                switch (filters.timeRange) {
                    case 'today':
                        if (viewedDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        if (viewedDate < new Date(now.setDate(now.getDate() - 7))) return false;
                        break;
                    case 'month':
                        if (viewedDate <  new Date(now.setMonth(now.getMonth() - 1))) return false;
                        break;
                }
            }

            return true;
        });
    };

    const filteredHistory = getFilteredData(history, 'history');
    const filteredFavorites = getFilteredData(favorites, 'favorite');

    // Пагинация
    const paginatedHistory = filteredHistory.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const paginatedFavorites = filteredFavorites.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleListingClick = (listingId, listingAuthorId) => {
        if (listingAuthorId === user?.id) {
            // Свое объявление - открываем в дашборде
            navigate(paths.dashboard.listings.details.replace(':listingId', listingId));
        } else {
            // Чужое объявление - открываем в публичной части
            navigate(paths.listings.details.replace(':listingId', listingId));
        }
    };


    const handleRemoveFromHistory = async (item, type) => {
        try {
            if (type === 'history') {
                await listingService.removeFromViewHistory(item.historyId);
                setHistory(prev => prev.filter(h => h.historyId !== item.historyId));
                snackbar.success('Removed from history');
            } else {
                await listingService.toggleListingLike(item.id, user.id, false);
                setFavorites(prev => prev.filter(f => f.id !== item.id));
                snackbar.success('Removed from favorites');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            snackbar.error('Failed to remove item');
        }
    };

    const handleClearHistory = async () => {
        try {
            await listingService.clearViewHistory(user.id);
            setHistory([]);
            snackbar.success('History cleared');
        } catch (error) {
            console.error('Error clearing history:', error);
            snackbar.error('Failed to clear history');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            category: 'all',
            timeRange: 'all'
        });
    };

    const activeData = activeTab === 0 ? filteredHistory : filteredFavorites;
    const paginatedData = activeTab === 0 ? paginatedHistory : paginatedFavorites;

    return (
        <>
            <Seo title="My Activity" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    {/* Навигация */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <IconButton onClick={() => navigate(paths.dashboard.overview)}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Breadcrumbs separator={<BreadcrumbsSeparator />}>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.dashboard.overview}
                                variant="subtitle2"
                            >
                                Dashboard
                            </Link>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.dashboard.listings.index}
                                variant="subtitle2"
                            >
                                Listings
                            </Link>
                            <Typography color="text.secondary" variant="subtitle2">
                                My Activity
                            </Typography>
                        </Breadcrumbs>
                    </Stack>

                    {/* Заголовок */}
                    <Typography variant="h3" gutterBottom>
                        My Activity
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Track your viewed listings and saved favorites
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Табы */}
                    <Paper sx={{ mb: 4 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => {
                                setActiveTab(v);
                                setPage(1);
                            }}
                            sx={{ px: 2 }}
                        >
                            <Tab
                                icon={<HistoryIcon />}
                                label={`View History (${filteredHistory.length})`}
                                iconPosition="start"
                            />
                            <Tab
                                icon={<FavoriteIcon />}
                                label={`Favorites (${filteredFavorites.length})`}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>

                    {/* Фильтры */}
                    <HistoryFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                        type={activeTab === 0 ? 'history' : 'favorite'}
                    />

                    {/* Действия */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ my: 3 }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {paginatedData.length} of {activeData.length} items
                        </Typography>

                        {activeTab === 0 && history.length > 0 && (
                            <Button
                                size="small"
                                color="error"
                                onClick={handleClearHistory}
                                startIcon={<DeleteIcon />}
                            >
                                Clear History
                            </Button>
                        )}
                    </Stack>

                    {/* Список */}
                    {loading ? (
                        <Stack spacing={2}>
                            {Array.from(new Array(3)).map((_, i) => (
                                <HistorySkeleton key={i} />
                            ))}
                        </Stack>
                    ) : paginatedData.length === 0 ? (
                        <Paper sx={{ p: 8, textAlign: 'center' }}>
                            <Stack spacing={2} alignItems="center">
                                {activeTab === 0 ? (
                                    <>
                                        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No viewing history
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Start browsing listings to see your history here
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <FavoriteBorderIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No favorites yet
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Click the ❤️ button on listings to save them here
                                        </Typography>
                                    </>
                                )}
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    href={paths.listings.index}
                                >
                                    Browse Listings
                                </Button>
                            </Stack>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {paginatedData.map((item) => (
                                <ListingHistoryCard
                                    user={user}
                                    key={activeTab === 0 ? item.historyId : item.id}
                                    item={item}
                                    type={activeTab === 0 ? 'history' : 'favorite'}
                                    onRemove={handleRemoveFromHistory}
                                    onClick={(id, authorId) => handleListingClick(id, authorId)} // Передаем authorId
                                />
                            ))}

                            {/* Пагинация */}
                            {activeData.length > itemsPerPage && (
                                <Stack alignItems="center" sx={{ mt: 4 }}>
                                    <Pagination
                                        count={Math.ceil(activeData.length / itemsPerPage)}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                    />
                                </Stack>
                            )}
                        </Stack>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default Page;