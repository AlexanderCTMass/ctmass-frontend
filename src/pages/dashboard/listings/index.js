import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon, Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import { LISTING_CATEGORIES, LISTING_STATUS, listingService } from 'src/service/listing-service';
import { ListingList } from 'src/sections/dashboard/listings/listing-list';
import { RelevantListings } from 'src/components/relevant-listings';
import { RouterLink } from 'src/components/router-link';
import { BreadcrumbsSeparator } from 'src/components/breadcrumbs-separator';
import { StatsCards, StatsCardsClickable } from 'src/sections/dashboard/listings/stats-cards';

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

    // Состояния
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        sold: 0,
        archived: 0,
        totalViews: 0,
        totalLikes: 0,
        totalValue: 0
    });

    // Пагинация
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Фильтры
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Диалог удаления
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);

    usePageView();

    // Загрузка объявлений
    const loadListings = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await listingService.getUserListings(user.id);
            const userStats = await listingService.getUserStats(user.id);

            setListings(data);
            setFilteredListings(data);
            setStats(userStats);
            setError(null);
        } catch (err) {
            console.error('Error loading listings:', err);
            setError('Failed to load listings');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    // Фильтрация и сортировка
    useEffect(() => {
        let filtered = [...listings];

        // Фильтр по табу
        if (activeTab !== 'all') {
            filtered = filtered.filter(listing => listing.status === activeTab);
        }

        // Поиск
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(listing =>
                listing.title?.toLowerCase().includes(query) ||
                listing.description?.toLowerCase().includes(query) ||
                listing.category?.toLowerCase().includes(query)
            );
        }

        // Фильтр по категории
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(listing => listing.category === categoryFilter);
        }

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                default:
                    return 0;
            }
        });

        setFilteredListings(filtered);
        setPage(0);
    }, [listings, activeTab, searchQuery, categoryFilter, sortBy]);

    // Обработчики действий
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setSortBy('newest');
    };

    const handleCreateClick = () => {
        navigate(paths.dashboard.listings.create);
    };

    const handleEditClick = (listingId) => {
        navigate(paths.dashboard.listings.edit.replace(':listingId', listingId));
    };

    const handleViewClick = (listingId) => {
        navigate(paths.dashboard.listings.details.replace(':listingId', listingId));
    };

    const handleDeleteClick = (listingId) => {
        setListingToDelete(listingId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!listingToDelete || !user) return;

        try {
            await listingService.deleteListing(listingToDelete, user);
            snackbar.success('Listing deleted successfully');
            loadListings();
        } catch (error) {
            console.error('Error deleting listing:', error);
            snackbar.error('Failed to delete listing');
        } finally {
            setDeleteDialogOpen(false);
            setListingToDelete(null);
        }
    };

    const handleArchiveClick = async (listingId) => {
        try {
            await listingService.updateListing(listingId, { status: LISTING_STATUS.SOLD }, user, [], []);
            snackbar.success('Listing marked as sold');
            loadListings();
        } catch (error) {
            console.error('Error archiving listing:', error);
            snackbar.error('Failed to archive listing');
        }
    };

    const handleDuplicateClick = async (listingId) => {
        try {
            const original = await listingService.getListingById(listingId);
            const { id, ...listingData } = original;

            // Создаем копию с новым заголовком и статусом DRAFT
            const newListing = {
                ...listingData,
                title: `${original.title} (Copy)`,
                status: LISTING_STATUS.DRAFT,
                images: original.images // Копируем ссылки на изображения
            };

            await listingService.createListing(newListing, user, []);
            snackbar.success('Listing duplicated');
            loadListings();
        } catch (error) {
            console.error('Error duplicating listing:', error);
            snackbar.error('Failed to duplicate listing');
        }
    };

    const handleExport = () => {
        // Экспорт в CSV
        const headers = ['Title', 'Category', 'Price', 'Status', 'Views', 'Likes', 'Created'];
        const data = filteredListings.map(l => [
            l.title,
            l.category,
            l.price,
            l.status,
            l.views || 0,
            l.likes || 0,
            l.createdAt?.toLocaleDateString()
        ]);

        const csv = [headers, ...data].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `listings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const hasActiveFilters = searchQuery || categoryFilter !== 'all' || sortBy !== 'newest';

    // Пагинация
    const paginatedListings = filteredListings.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }


    return (
        <>
            <Seo title="My Listings" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    {/* Хлебные крошки */}
                    <Stack spacing={1} sx={{ mb: 4 }}>
                        <Typography variant="h3">
                            My Listings
                        </Typography>
                        <Breadcrumbs separator={<BreadcrumbsSeparator />}>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.dashboard.overview}
                                variant="subtitle2"
                            >
                                Dashboard
                            </Link>
                            <Typography color="text.secondary" variant="subtitle2">
                                Listings
                            </Typography>
                        </Breadcrumbs>
                    </Stack>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Статистика */}
                    <StatsCards stats={stats} onFilterChange={setActiveTab} />

                    {/* Действия */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ mt: 4, mb: 3 }}
                    >
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateClick}
                            >
                                New Listing
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                                disabled={filteredListings.length === 0}
                            >
                                Export
                            </Button>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredListings.length} of {listings.length} listings
                        </Typography>
                    </Stack>

                    {/* Табы */}
                    <Paper sx={{ mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                px: 2,
                                '& .MuiTab-root': {
                                    minHeight: 48
                                }
                            }}
                        >
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>All</span>
                                        <Chip size="small" label={stats.total} />
                                    </Stack>
                                }
                                value="all"
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>Active</span>
                                        <Chip size="small" label={stats.active} color="success" />
                                    </Stack>
                                }
                                value={LISTING_STATUS.ACTIVE}
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>Drafts</span>
                                        <Chip size="small" label={stats.draft} color="warning" />
                                    </Stack>
                                }
                                value={LISTING_STATUS.DRAFT}
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>Sold</span>
                                        <Chip size="small" label={stats.sold} color="info" />
                                    </Stack>
                                }
                                value={LISTING_STATUS.SOLD}
                            />
                        </Tabs>
                    </Paper>

                    {/* Фильтры */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2">
                                    Filters
                                </Typography>
                                {hasActiveFilters && (
                                    <Button
                                        size="small"
                                        onClick={clearFilters}
                                        startIcon={<ClearIcon />}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    placeholder="Search listings..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    size="small"
                                    sx={{ flex: 2 }}
                                    InputProps={{
                                        sx: {
                                            height: 44,
                                            display: 'flex',
                                            alignItems: 'center',
                                            '& .MuiInputBase-input': {
                                                display: 'flex',
                                                alignItems: 'center',
                                                lineHeight: 1,
                                                py: 0,
                                            },
                                            '& .MuiInputAdornment-root': {
                                                display: 'flex',
                                                alignItems: 'center',
                                                height: '100%',
                                                maxHeight: '100%',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 22,
                                            },
                                        },
                                        startAdornment: (
                                            <InputAdornment position="start" style={{ paddingBottom: 12 }}>
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={categoryFilter}
                                        onChange={handleCategoryChange}
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

                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Sort by</InputLabel>
                                    <Select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        label="Sort by"
                                    >
                                        <MenuItem value="newest">Newest first</MenuItem>
                                        <MenuItem value="oldest">Oldest first</MenuItem>
                                        <MenuItem value="price-high">Price: High to Low</MenuItem>
                                        <MenuItem value="price-low">Price: Low to High</MenuItem>
                                        <MenuItem value="views">Most viewed</MenuItem>
                                        <MenuItem value="likes">Most liked</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Список объявлений */}
                    <ListingList
                        listings={paginatedListings}
                        total={filteredListings.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onView={handleViewClick}
                        onArchive={handleArchiveClick}
                        onDuplicate={handleDuplicateClick}
                        emptyMessage={
                            hasActiveFilters
                                ? "No listings match your filters"
                                : "You haven't created any listings yet"
                        }
                    />

                    {/* Релевантные объявления */}
                    <Box sx={{ mt: 8 }}>
                        <RelevantListings
                            title="You might also like"
                            maxItems={6}
                            excludeListingId={null}
                        />
                    </Box>
                </Container>
            </Box>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Listing</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this listing? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Page;