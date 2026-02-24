import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Chip,
    Button,
    Pagination,
    Breadcrumbs,
    Link,
    Paper,
    Divider,
    IconButton,
    Drawer,
    useTheme,
    useMediaQuery,
    alpha,
    Avatar,
    Skeleton,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    LocationOn as LocationIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Close as CloseIcon,
    Tune as TuneIcon,
    ViewModule as ViewModuleIcon,
    ViewList as ViewListIcon,
    Sort as SortIcon
} from '@mui/icons-material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useAuth} from 'src/hooks/use-auth';
import {paths} from 'src/paths';
import {listingService, LISTING_CATEGORIES, LISTING_TYPES, LISTING_CONDITIONS} from 'src/service/listing-service';
import {BreadcrumbsSeparator} from 'src/components/breadcrumbs-separator';
import {RouterLink} from 'src/components/router-link';
import {formatDistanceToNow} from 'date-fns';
import {HtmlContent} from "src/components/html-content";

// Компонент карточки объявления
const ListingCard = ({listing, onLike, isLiked, viewMode = 'grid'}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const {user} = useAuth();

    const timeAgo = listing.createdAt
        ? formatDistanceToNow(new Date(listing.createdAt), {addSuffix: true})
        : '';

    const handleClick = () => {
        navigate(paths.listings.details.replace(':listingId', listing.id));
    };

    const categoryLabel = LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category;


    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (user) {
            onLike(listing.id, !isLiked);
        } else {
            navigate(paths.login.index);
        }
    };

    // Для спискового отображения
    if (viewMode === 'list') {
        return (
            <Card
                sx={{
                    display: 'flex',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                    }
                }}
                onClick={handleClick}
            >
                {/* Фото слева - фиксированной ширины */}
                <Box
                    sx={{
                        width: 200,
                        minWidth: 200,
                        height: 200,
                        bgcolor: 'grey.100',
                        backgroundImage: listing.images?.[0] ? `url(${listing.images[0]})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        borderRight: `1px solid ${theme.palette.divider}`
                    }}
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
                            <Typography color="text.secondary">No image</Typography>
                        </Box>
                    )}

                    {/* Бейджи на фото */}
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 1
                        }}
                    >
                        {listing.type === 'urgent' && (
                            <Chip
                                label="Urgent"
                                size="small"
                                color="error"
                                sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                            />
                        )}
                        {listing.type === 'featured' && (
                            <Chip
                                label="Featured"
                                size="small"
                                color="primary"
                                sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                            />
                        )}
                        {listing.price === 0 && (
                            <Chip
                                label="Free"
                                size="small"
                                color="success"
                                sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                            />
                        )}
                    </Stack>

                    {/* Кнопка лайка на фото */}
                    <IconButton
                        size="small"
                        onClick={handleLikeClick}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                bgcolor: 'background.paper'
                            }
                        }}
                    >
                        {isLiked ? (
                            <FavoriteIcon fontSize="small" color="error"/>
                        ) : (
                            <FavoriteBorderIcon fontSize="small"/>
                        )}
                    </IconButton>
                </Box>

                {/* Контент карточки */}
                <CardContent sx={{flex: 1, p: 2}}>
                    <Stack spacing={1.5} sx={{height: '100%'}}>
                        {/* Верхняя строка с категорией и временем */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                {categoryLabel}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {timeAgo}
                            </Typography>
                        </Stack>

                        {/* Заголовок */}
                        <Typography
                            variant="h6"
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

                        {/* Описание */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                flex: 1
                            }}
                        >
                            <div dangerouslySetInnerHTML={{__html: listing.description}}/>
                        </Typography>

                        {/* Нижняя часть с ценой и локацией */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h6" color="primary.main">
                                    ${listing.price?.toLocaleString()}
                                </Typography>
                                {listing.priceType === 'negotiable' && (
                                    <Typography variant="caption" color="text.secondary">
                                        or best offer
                                    </Typography>
                                )}
                            </Box>

                            {listing.location && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LocationIcon fontSize="small" color="action"/>
                                    <Typography variant="caption" color="text.secondary">
                                        {listing.location}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        {/* Состояние товара (если есть) */}
                        {listing.condition && (
                            <Typography variant="caption" color="text.secondary">
                                Condition: {LISTING_CONDITIONS.find(c => c.value === listing.condition)?.label || listing.condition}
                            </Typography>
                        )}

                        {/* Информация о продавце и просмотрах */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{mt: 'auto'}}>
                            <Avatar
                                src={listing.author?.avatar}
                                sx={{width: 24, height: 24}}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {listing.author?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ml: 'auto'}}>
                                {listing.views || 0} views
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    // Для сеточного отображения (оставляем как было)
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                }
            }}
            onClick={handleClick}
        >
            <Box sx={{position: 'relative', pt: '75%'}}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'grey.100',
                        backgroundImage: listing.images?.[0] ? `url(${listing.images[0]})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
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
                            <Typography color="text.secondary">No image</Typography>
                        </Box>
                    )}
                </Box>

                {/* Бейджи */}
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        right: 8,
                        zIndex: 1
                    }}
                >
                    {listing.type === 'urgent' && (
                        <Chip
                            label="Urgent"
                            size="small"
                            color="error"
                            sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                        />
                    )}
                    {listing.type === 'featured' && (
                        <Chip
                            label="Featured"
                            size="small"
                            color="primary"
                            sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                        />
                    )}
                    {listing.price === 0 && (
                        <Chip
                            label="Free"
                            size="small"
                            color="success"
                            sx={{height: 20, '& .MuiChip-label': {px: 1, fontSize: '0.625rem'}}}
                        />
                    )}
                </Stack>

                {/* Кнопка лайка */}
                <IconButton
                    size="small"
                    onClick={handleLikeClick}
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                            bgcolor: 'background.paper'
                        }
                    }}
                >
                    {isLiked ? (
                        <FavoriteIcon fontSize="small" color="error"/>
                    ) : (
                        <FavoriteBorderIcon fontSize="small"/>
                    )}
                </IconButton>
            </Box>

            <CardContent sx={{flex: 1}}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Chip
                            label={categoryLabel}
                            size="small"
                            color={'default'}
                            variant={'outlined'}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {timeAgo}
                        </Typography>
                    </Stack>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {listing.title}
                    </Typography>

                    {/*<Typography
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
                        <div dangerouslySetInnerHTML={{ __html: listing.description }} />
                    </Typography>*/}

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" color="primary.main">
                            ${listing.price?.toLocaleString()}
                            {listing.priceType === 'negotiable' && (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ml: 0.5}}>
                                    or best offer
                                </Typography>
                            )}
                        </Typography>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            {listing.location && (
                                <>
                                    <LocationIcon fontSize="small" color="action"/>
                                    <Typography variant="caption" color="text.secondary">
                                        {listing.location}
                                    </Typography>
                                </>
                            )}
                        </Stack>
                    </Stack>

                    <Divider/>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                            src={listing.author?.avatar}
                            sx={{width: 24, height: 24}}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {listing.author?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ml: 'auto'}}>
                            {listing.views || 0} views
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

// Компонент фильтров
const FiltersPanel = ({
                          open,
                          onClose,
                          filters,
                          onFilterChange,
                          onApply,
                          onClear,
                          isMobile
                      }) => {
    const content = (
        <Stack spacing={3} sx={{p: 2}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Filters</Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            </Stack>

            <Divider/>

            {/* Категория */}
            <FormControl fullWidth size="small" variant="filled">
                <InputLabel>Category</InputLabel>
                <Select
                    value={filters.category || ''}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    label="Category"
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {LISTING_CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Тип */}
            <FormControl fullWidth size="small" variant="filled">
                <InputLabel>Listing Type</InputLabel>
                <Select
                    value={filters.type || ''}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    label="Listing Type"
                >
                    <MenuItem value="">All Types</MenuItem>
                    {LISTING_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Состояние */}
            <FormControl fullWidth size="small" variant="filled">
                <InputLabel>Condition</InputLabel>
                <Select
                    value={filters.condition || ''}
                    onChange={(e) => onFilterChange('condition', e.target.value)}
                    label="Condition"
                >
                    <MenuItem value="">Any Condition</MenuItem>
                    {LISTING_CONDITIONS.map((cond) => (
                        <MenuItem key={cond.value} value={cond.value}>
                            {cond.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Цена */}
            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Price Range
                </Typography>
                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        label="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => onFilterChange('minPrice', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                    />
                    <TextField
                        size="small"
                        label="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                    />
                </Stack>
            </Box>

            {/* Локация */}
            <TextField
                fullWidth
                size="small"
                variant="filled"
                label="Location"
                value={filters.location || ''}
                onChange={(e) => onFilterChange('location', e.target.value)}
            />

            {/* Кнопки действий */}
            <Stack direction="row" spacing={1}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onApply}
                >
                    Apply Filters
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClear}
                >
                    Clear
                </Button>
            </Stack>
        </Stack>
    );

    if (isMobile) {
        return (
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                PaperProps={{sx: {width: '80%', maxWidth: 400}}}
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Paper sx={{height: 'fit-content', position: 'sticky', top: 24}}>
            {content}
        </Paper>
    );
};

const Page = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const {user} = useAuth();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
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
        search: searchParams.get('search') || ''
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
                const data = await listingService.getActiveListings(filters.category, 50);

                // Применяем фильтры на клиенте (в реальном проекте лучше делать на сервере)
                let filtered = [...data];

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
            } catch (err) {
                console.error('Error loading listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        loadListings();
    }, [filters]);

    // Обновление URL при изменении фильтров
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({...prev, [key]: value}));
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
            search: ''
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

    return (
        <>
            <Seo title="Browse Listings"/>
            <Box component="main" sx={{flexGrow: 1, py: 8}}>
                <Container maxWidth="xl">
                    {/* Хлебные крошки */}
                    <Breadcrumbs separator={<BreadcrumbsSeparator/>} sx={{mb: 4}}>
                        <Link
                            color="text.primary"
                            component={RouterLink}
                            href={paths.index}
                            variant="subtitle2"
                        >
                            Home
                        </Link>
                        <Typography color="text.secondary" variant="subtitle2">
                            Listings
                        </Typography>
                    </Breadcrumbs>

                    {/* Заголовок */}
                    <Typography variant="h3" gutterBottom>
                        Browse Listings
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Find great deals and unique items from our community
                    </Typography>

                    {/* Поиск и сортировка */}
                    <Paper sx={{p: 2, mb: 3}}>
                        <Stack spacing={2}>
                            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Search listings..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: filters.search && (
                                            <InputAdornment position="end">
                                                <IconButton size="small"
                                                            onClick={() => handleFilterChange('search', '')}>
                                                    <ClearIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <FormControl size="small" variant="filled" sx={{minWidth: 150}}>
                                    <InputLabel>Sort by</InputLabel>
                                    <Select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        label="Sort by"
                                    >
                                        <MenuItem value="newest">Newest first</MenuItem>
                                        <MenuItem value="price-asc">Price: Low to High</MenuItem>
                                        <MenuItem value="price-desc">Price: High to Low</MenuItem>
                                    </Select>
                                </FormControl>

                                {isMobile && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<FilterIcon/>}
                                        onClick={() => setFiltersOpen(true)}
                                    >
                                        Filters
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>

                    <Grid container spacing={3}>
                        {/* Фильтры (десктоп) */}
                        {!isMobile && (
                            <Grid item md={3}>
                                <FiltersPanel
                                    open={filtersOpen}
                                    onClose={() => setFiltersOpen(false)}
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onApply={handleApplyFilters}
                                    onClear={handleClearFilters}
                                    isMobile={isMobile}
                                />
                            </Grid>
                        )}

                        {/* Список объявлений */}
                        <Grid item xs={12} md={!isMobile ? 9 : 12}>
                            {/* Переключение вида и статистика */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{mb: 2}}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    {totalCount} listings found
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        size="small"
                                        color={viewMode === 'grid' ? 'primary' : 'default'}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <ViewModuleIcon/>
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color={viewMode === 'list' ? 'primary' : 'default'}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <ViewListIcon/>
                                    </IconButton>
                                </Stack>
                            </Stack>

                            {/* Результаты */}
                            {error ? (
                                <Alert severity="error">{error}</Alert>
                            ) : loading ? (
                                <Grid container spacing={3}>
                                    {Array.from(new Array(6)).map((_, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Skeleton variant="rectangular" height={300}/>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : paginatedListings.length === 0 ? (
                                <Paper sx={{p: 8, textAlign: 'center'}}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No listings found
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Try adjusting your filters or check back later
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={3}>
                                    {paginatedListings.map((listing) => (
                                        <Grid
                                            item
                                            key={listing.id}
                                            xs={12}
                                            sm={viewMode === 'grid' ? 6 : 12}
                                            md={viewMode === 'grid' ? 4 : 12}
                                        >
                                            <ListingCard
                                                listing={listing}
                                                onLike={handleLike}
                                                isLiked={likedListings.has(listing.id)}
                                                viewMode={viewMode}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}

                            {/* Пагинация */}
                            {totalCount > itemsPerPage && (
                                <Stack alignItems="center" sx={{mt: 4}}>
                                    <Pagination
                                        count={Math.ceil(totalCount / itemsPerPage)}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                        size={isMobile ? 'small' : 'medium'}
                                    />
                                </Stack>
                            )}
                        </Grid>
                    </Grid>

                    {/* Мобильные фильтры (drawer) */}
                    {isMobile && (
                        <FiltersPanel
                            open={filtersOpen}
                            onClose={() => setFiltersOpen(false)}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onApply={handleApplyFilters}
                            onClear={handleClearFilters}
                            isMobile={isMobile}
                        />
                    )}
                </Container>
            </Box>
        </>
    );
};

export default Page;