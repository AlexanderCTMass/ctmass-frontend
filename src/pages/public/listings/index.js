import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trackEvent } from 'src/libs/analytics/ga4';
import {
    Box,
    Button,
    Container,
    Drawer,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Pagination,
    Select,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { listingService, LISTING_CATEGORIES, LISTING_TYPES, LISTING_CONDITIONS } from 'src/service/listing-service';
import { RouterLink } from 'src/components/router-link';
import { ListingTile } from 'src/components/listings/listing-tile';
import { btn, cardTitleSx, EmptyState, fieldSx, focusRingSx, PageHero } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc', label: 'Price: high to low' }
];

const chipSx = (active) => ({
    flexShrink: 0,
    height: 38,
    px: 1.75,
    border: `1px solid ${active ? BRAND.navy : alpha(BRAND.navy, 0.12)}`,
    borderRadius: RADIUS.pill,
    bgcolor: active ? BRAND.navy : '#FFFFFF',
    color: active ? '#FFFFFF' : BRAND.navy,
    font: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
    '&:hover': { borderColor: BRAND.navy },
    ...focusRingSx
});

const FilterSelect = ({ label, value, onChange, emptyLabel, options }) => (
    <FormControl fullWidth sx={fieldSx}>
        <InputLabel shrink>{label}</InputLabel>
        <Select
            displayEmpty
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            input={<OutlinedInput notched label={label} />}
            renderValue={(v) => (v ? options.find((o) => o.value === v)?.label || v : <Box component="span" sx={{ color: BRAND.muted }}>{emptyLabel}</Box>)}
        >
            <MenuItem value="">{emptyLabel}</MenuItem>
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
        </Select>
    </FormControl>
);

const FilterFields = ({ filters, onFilterChange, availableCategories }) => {
    const filteredCategories = LISTING_CATEGORIES.filter((cat) => availableCategories.has(cat.value));

    return (
        <Stack spacing={2.5}>
            <FilterSelect label="Category" value={filters.category} onChange={(v) => onFilterChange('category', v)} emptyLabel="All categories" options={filteredCategories} />
            <FilterSelect label="Listing type" value={filters.type} onChange={(v) => onFilterChange('type', v)} emptyLabel="All types" options={LISTING_TYPES} />
            <FilterSelect label="Condition" value={filters.condition} onChange={(v) => onFilterChange('condition', v)} emptyLabel="Any condition" options={LISTING_CONDITIONS} />
            <Box>
                <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>Price</Typography>
                <Stack direction="row" spacing={1}>
                    {['minPrice', 'maxPrice'].map((key) => (
                        <TextField
                            key={key}
                            variant="outlined"
                            placeholder={key === 'minPrice' ? 'Min' : 'Max'}
                            value={filters[key] || ''}
                            onChange={(e) => onFilterChange(key, e.target.value.replace(/[^0-9.]/g, ''))}
                            inputProps={{ inputMode: 'decimal', 'aria-label': key === 'minPrice' ? 'Minimum price' : 'Maximum price' }}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            sx={fieldSx}
                        />
                    ))}
                </Stack>
            </Box>
            <TextField
                fullWidth
                variant="outlined"
                label="Location"
                placeholder="City or town"
                InputLabelProps={{ shrink: true }}
                value={filters.location || ''}
                onChange={(e) => onFilterChange('location', e.target.value)}
                sx={fieldSx}
            />
        </Stack>
    );
};

const Page = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [availableCategories, setAvailableCategories] = useState(new Set());
    const [viewMode, setViewMode] = useState('grid'); // grid или list
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [likedListings, setLikedListings] = useState(new Set());

    // Состояние фильтров
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        type: searchParams.get('type') || '',
        condition: searchParams.get('condition') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        location: searchParams.get('location') || '',
        sortBy: searchParams.get('sortBy') || 'newest',
        search: searchParams.get('search') || '',
        author: searchParams.get('author') || ''
    });

    usePageView();

    // Загрузка лайкнутых объявлений пользователя
    useEffect(() => {
        const loadLikedListings = async () => {
            if (!user) return;

            try {
                const liked = await listingService.getFavoriteListings(user.id);
                setLikedListings(new Set(liked.map(l => l.id)));
            } catch (error) {
                console.error('Error loading liked listings:', error);
            }
        };

        loadLikedListings();
    }, [user]);

    // Загрузка объявлений
    useEffect(() => {
        const loadListings = async () => {
            try {
                setLoading(true);
                const data = await listingService.getActiveListings(null, 200);

                const cats = new Set(data.map(l => l.category).filter(Boolean));
                setAvailableCategories(cats);

                // Применяем фильтры на клиенте
                let filtered = [...data];

                if (filters.category) {
                    filtered = filtered.filter(l => l.category === filters.category);
                }
                if (filters.type) {
                    filtered = filtered.filter(l => l.type === filters.type);
                }
                if (filters.condition) {
                    filtered = filtered.filter(l => l.condition === filters.condition);
                }
                if (filters.minPrice) {
                    filtered = filtered.filter(l => l.price >= parseFloat(filters.minPrice));
                }
                if (filters.maxPrice) {
                    filtered = filtered.filter(l => l.price <= parseFloat(filters.maxPrice));
                }
                if (filters.location) {
                    const loc = filters.location.toLowerCase();
                    filtered = filtered.filter(l => l.location?.toLowerCase().includes(loc));
                }
                if (filters.author) {
                    filtered = filtered.filter(l => l.author?.id === filters.author);
                }
                if (filters.search) {
                    const query = filters.search.toLowerCase();
                    filtered = filtered.filter(l =>
                        l.title.toLowerCase().includes(query) ||
                        l.description.toLowerCase().includes(query)
                    );
                }

                // Сортировка
                filtered.sort((a, b) => {
                    switch (filters.sortBy) {
                        case 'price-asc':
                            return (a.price || 0) - (b.price || 0);
                        case 'price-desc':
                            return (b.price || 0) - (a.price || 0);
                        case 'newest':
                        default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });

                setListings(filtered);
                setTotalCount(filtered.length);
                setError(null);

                if (filters.search && filters.search.trim().length >= 2) {
                    if (filtered.length === 0) {
                        trackEvent('search_no_results', { query: filters.search.trim() });
                    } else {
                        trackEvent('search_perform', { query: filters.search.trim(), results_count: filtered.length });
                    }
                }
            } catch (err) {
                console.error('Error loading listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        loadListings();
    }, [filters]);

    // Обновление URL при изменении фильтров (replace, чтобы не засорять историю)
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        setFiltersOpen(false);
    };

    const handleClearFilters = () => {
        setFilters({
            category: '',
            type: '',
            condition: '',
            minPrice: '',
            maxPrice: '',
            location: '',
            sortBy: 'newest',
            search: '',
            author: ''
        });
    };

    const handleLike = async (listingId, isLiking) => {
        try {
            await listingService.toggleListingLike(listingId, user.id, isLiking);
            setLikedListings(prev => {
                const newSet = new Set(prev);
                if (isLiking) {
                    newSet.add(listingId);
                } else {
                    newSet.delete(listingId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const itemsPerPage = 12;
    const paginatedListings = listings.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const activeFilterCount = ['category', 'type', 'condition', 'minPrice', 'maxPrice', 'location', 'author'].filter((key) => filters[key]).length;
    const filteredCategories = LISTING_CATEGORIES.filter((cat) => availableCategories.has(cat.value));
    const openListing = (listing) => navigate(paths.listings.details.replace(':listingId', listing.id));

    useEffect(() => {
        setPage(1);
    }, [filters]);

    return (
        <>
            <Seo title="Browse Listings" />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: BRAND.mist, pb: 10 }}>
                <PageHero
                    title="Listings"
                    subtitle="Tools, materials and deals from homeowners and pros in Connecticut and Massachusetts."
                    back={null}
                    action={user ? (
                        <Button component={RouterLink} href={paths.dashboard.listings.create} startIcon={<AddRoundedIcon />} sx={{ ...btn.green, minHeight: 52, px: 3, width: { xs: '100%', md: 'auto' } }}>
                            Post a listing
                        </Button>
                    ) : null}
                    maxWidth="xl"
                >
                    <Box
                        role="search"
                        sx={{
                            mt: { xs: 3, md: 4 },
                            p: 1,
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) 220px' },
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: '#FFFFFF',
                            borderRadius: RADIUS.card,
                            border: `1px solid ${alpha(BRAND.navy, 0.1)}`,
                            boxShadow: SHADOW.md
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search listings"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            inputProps={{ 'aria-label': 'Search listings' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ color: BRAND.navy }} />
                                    </InputAdornment>
                                ),
                                endAdornment: filters.search ? (
                                    <InputAdornment position="end">
                                        <IconButton aria-label="Clear search" size="small" onClick={() => handleFilterChange('search', '')}>
                                            <CloseRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                            sx={{
                                gridColumn: { xs: '1 / 2', md: 'auto' },
                                '& .MuiOutlinedInput-root': { height: 52, borderRadius: RADIUS.tile, fontWeight: 500 },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent !important' },
                                '& .MuiOutlinedInput-root.Mui-focused': { bgcolor: BRAND.mist, boxShadow: `inset 0 0 0 2px ${alpha(BRAND.green, 0.5)}` }
                            }}
                        />
                        {isMobile ? (
                            <Button onClick={() => setFiltersOpen(true)} startIcon={<TuneRoundedIcon />} sx={{ ...btn.navy, height: 52, px: 2 }}>
                                {activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
                            </Button>
                        ) : (
                            <FormControl sx={{ ...fieldSx, '& .MuiOutlinedInput-root': { height: 52, borderRadius: RADIUS.tile } }}>
                                <Select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    input={<OutlinedInput />}
                                    inputProps={{ 'aria-label': 'Sort by' }}
                                >
                                    {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </PageHero>

                <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
                    {filteredCategories.length > 0 && (
                        <Box
                            role="group"
                            aria-label="Categories"
                            sx={{
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                mx: { xs: -2, sm: 0 },
                                px: { xs: 2, sm: 0 },
                                pb: 0.5,
                                mb: { xs: 3, md: 4 },
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}
                        >
                            <Box component="button" type="button" aria-pressed={!filters.category} onClick={() => handleFilterChange('category', '')} sx={chipSx(!filters.category)}>
                                All
                            </Box>
                            {filteredCategories.map((cat) => (
                                <Box
                                    key={cat.value}
                                    component="button"
                                    type="button"
                                    aria-pressed={filters.category === cat.value}
                                    onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                                    sx={chipSx(filters.category === cat.value)}
                                >
                                    {cat.label}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)' },
                            gap: { xs: 3, md: 4 },
                            alignItems: 'start'
                        }}
                    >
                        {!isMobile && (
                            <Box
                                component="aside"
                                sx={{
                                    position: 'sticky',
                                    top: 100,
                                    p: 3,
                                    bgcolor: '#FFFFFF',
                                    borderRadius: RADIUS.card,
                                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                                    boxShadow: SHADOW.sm
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                                    <Typography component="h2" sx={cardTitleSx}>Filters</Typography>
                                    {activeFilterCount > 0 && (
                                        <Button onClick={handleClearFilters} sx={{ ...btn.text, minHeight: 36, fontSize: 13 }}>Reset all</Button>
                                    )}
                                </Stack>
                                <FilterFields filters={filters} onFilterChange={handleFilterChange} availableCategories={availableCategories} />
                            </Box>
                        )}

                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5, gap: 1 }}>
                                <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                                {filters.author && (
                                    <Box component="button" type="button" onClick={() => handleFilterChange('author', '')} sx={{ ...chipSx(true), display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                        One seller
                                        <CloseRoundedIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                )}
                                <Typography sx={{ fontWeight: 600, color: BRAND.muted }}>
                                    {loading ? 'Loading listings' : `${totalCount} ${totalCount === 1 ? 'listing' : 'listings'}`}
                                </Typography>
                                </Stack>
                                {!isMobile && (
                                    <Stack direction="row" spacing={0.5} sx={{ p: 0.5, borderRadius: RADIUS.tile, bgcolor: alpha(BRAND.navy, 0.06) }}>
                                        {[
                                            { value: 'grid', label: 'Grid view', icon: <GridViewRoundedIcon fontSize="small" /> },
                                            { value: 'list', label: 'List view', icon: <ViewAgendaOutlinedIcon fontSize="small" /> }
                                        ].map((mode) => (
                                            <IconButton
                                                key={mode.value}
                                                aria-label={mode.label}
                                                aria-pressed={viewMode === mode.value}
                                                onClick={() => setViewMode(mode.value)}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: '10px',
                                                    color: viewMode === mode.value ? '#FFFFFF' : BRAND.navy,
                                                    bgcolor: viewMode === mode.value ? BRAND.navy : 'transparent',
                                                    '&:hover': { bgcolor: viewMode === mode.value ? BRAND.navyHover : alpha(BRAND.navy, 0.08) }
                                                }}
                                            >
                                                {mode.icon}
                                            </IconButton>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>

                            {loading ? (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 } }}>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Skeleton key={index} variant="rounded" height={340} sx={{ borderRadius: RADIUS.card }} />
                                    ))}
                                </Box>
                            ) : error || paginatedListings.length === 0 ? (
                                <EmptyState
                                    icon={<LocalOfferOutlinedIcon />}
                                    title={error ? "We couldn't load listings" : 'No listings found'}
                                    text={error ? 'Check your connection and try again.' : 'Try another category or clear the filters.'}
                                    action={activeFilterCount > 0 || filters.search
                                        ? <Button onClick={handleClearFilters} sx={btn.outline}>Clear filters</Button>
                                        : null}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: viewMode === 'list' && !isMobile
                                            ? 'minmax(0, 1fr)'
                                            : { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                                        gap: { xs: 2, md: 2.5 }
                                    }}
                                >
                                    {paginatedListings.map((listing) => (
                                        <ListingTile
                                            key={listing.id}
                                            listing={listing}
                                            layout={isMobile ? 'grid' : viewMode}
                                            onOpen={openListing}
                                            onLike={user ? handleLike : () => navigate(paths.login.index)}
                                            isLiked={likedListings.has(listing.id)}
                                        />
                                    ))}
                                </Box>
                            )}

                            {totalCount > itemsPerPage && (
                                <Stack alignItems="center" sx={{ mt: 5 }}>
                                    <Pagination
                                        count={Math.ceil(totalCount / itemsPerPage)}
                                        page={page}
                                        onChange={(e, value) => {
                                            setPage(value);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        shape="rounded"
                                        size={isMobile ? 'medium' : 'large'}
                                        sx={{
                                            '& .MuiPaginationItem-root': { fontWeight: 700, color: BRAND.navy, borderRadius: '12px' },
                                            '& .MuiPaginationItem-root.Mui-selected': { bgcolor: BRAND.navy, color: '#FFFFFF', '&:hover': { bgcolor: BRAND.navyHover } }
                                        }}
                                    />
                                </Stack>
                            )}
                        </Box>
                    </Box>
                </Container>

                {isMobile && (
                    <Drawer
                        anchor="bottom"
                        open={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                        PaperProps={{ sx: { borderRadius: `${RADIUS.panel} ${RADIUS.panel} 0 0`, maxHeight: '88dvh' } }}
                    >
                        <Box sx={{ px: 2.5, pt: 1.5, pb: 'calc(env(safe-area-inset-bottom) + 20px)', overflowY: 'auto' }}>
                            <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: alpha(BRAND.navy, 0.15), mx: 'auto', mb: 2 }} />
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                                <Typography component="h2" sx={cardTitleSx}>Filters</Typography>
                                <IconButton aria-label="Close filters" onClick={() => setFiltersOpen(false)} sx={{ color: BRAND.navy }}>
                                    <CloseRoundedIcon />
                                </IconButton>
                            </Stack>
                            <Stack spacing={2.5}>
                                <FilterSelect
                                    label="Sort by"
                                    value={filters.sortBy}
                                    onChange={(v) => handleFilterChange('sortBy', v || 'newest')}
                                    emptyLabel="Newest first"
                                    options={SORT_OPTIONS.filter((o) => o.value !== 'newest')}
                                />
                                <FilterFields filters={filters} onFilterChange={handleFilterChange} availableCategories={availableCategories} />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                                <Button fullWidth onClick={handleClearFilters} sx={btn.outline}>Reset</Button>
                                <Button fullWidth onClick={handleApplyFilters} sx={btn.green}>
                                    Show {totalCount} {totalCount === 1 ? 'listing' : 'listings'}
                                </Button>
                            </Stack>
                        </Box>
                    </Drawer>
                )}
            </Box>
        </>
    );
};

export default Page;
