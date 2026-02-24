import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    ImageList,
    ImageListItem,
    InputAdornment,
    InputLabel,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Rating,
    Select,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {
    Archive as ArchiveIcon,
    ArrowBack as ArrowBackIcon,
    Chat as ChatIcon,
    CheckCircle as ActiveIcon,
    Comment as CommentIcon,
    ContentCopy as CopyIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Drafts as DraftIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Favorite as FavoriteIcon,
    LocalOffer as LocalOfferIcon,
    LocationOn as LocationIcon,
    MoreVert as MoreVertIcon,
    Phone as PhoneIcon,
    Schedule as ScheduleIcon,
    Share as ShareIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {format, formatDistanceToNow} from 'date-fns';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useAuth} from 'src/hooks/use-auth';
import {useSnackbar} from 'src/hooks/use-snackbar';
import {paths} from 'src/paths';
import {LISTING_CATEGORIES, LISTING_STATUS, listingService} from 'src/service/listing-service';
import {BreadcrumbsSeparator} from 'src/components/breadcrumbs-separator';
import {RouterLink} from 'src/components/router-link';
import {HtmlContent} from "src/components/html-content";

// Компонент галереи
const ListingGallery = ({images, title}) => {
    const [activeImage, setActiveImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <Box
                sx={{
                    height: 300,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2
                }}
            >
                <Typography color="text.secondary">No images</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box
                sx={{
                    height: 500,
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    cursor: 'pointer'
                }}
            >
                <img
                    src={images[activeImage]}
                    alt={`${title} - main`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </Box>

            {images.length > 1 && (
                <ImageList
                    sx={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr)) !important'
                    }}
                >
                    {images.map((img, index) => (
                        <ImageListItem
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                border: index === activeImage ? 2 : 0,
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                overflow: 'hidden',
                                opacity: index === activeImage ? 1 : 0.7,
                                '&:hover': {opacity: 1}
                            }}
                            onClick={() => setActiveImage(index)}
                        >
                            <img src={img} alt={`Thumbnail ${index + 1}`}/>
                        </ImageListItem>
                    ))}
                </ImageList>
            )}
        </Box>
    );
};

// Компонент статуса
const StatusBadge = ({status}) => {
    const config = {
        [LISTING_STATUS.ACTIVE]: {color: 'success', icon: ActiveIcon, label: 'Active'},
        [LISTING_STATUS.DRAFT]: {color: 'default', icon: DraftIcon, label: 'Draft'},
        [LISTING_STATUS.SOLD]: {color: 'info', icon: ArchiveIcon, label: 'Sold'},
        [LISTING_STATUS.ARCHIVED]: {color: 'warning', icon: ArchiveIcon, label: 'Archived'},
        [LISTING_STATUS.EXPIRED]: {color: 'error', icon: ScheduleIcon, label: 'Expired'}
    };

    const {color, icon: Icon, label} = config[status] || config[LISTING_STATUS.DRAFT];

    return (
        <Chip
            icon={<Icon/>}
            label={label}
            color={color}
            size="small"
        />
    );
};

// Компонент статистики
const StatsCard = ({icon: Icon, label, value, trend, color = 'primary'}) => (
    <Card sx={{p: 2}}>
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Avatar sx={{bgcolor: `${color}.light`, color: `${color}.dark`, width: 40, height: 40}}>
                    <Icon/>
                </Avatar>
                {trend !== undefined && (
                    <Chip
                        size="small"
                        label={`${trend > 0 ? '+' : ''}${trend}%`}
                        color={trend >= 0 ? 'success' : 'error'}
                        variant="outlined"
                    />
                )}
            </Stack>
            <Box>
                <Typography variant="h5">{value}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Box>
        </Stack>
    </Card>
);

// Компонент вкладок
const TabPanel = ({children, value, index, ...other}) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
    >
        {value === index && <Box sx={{pt: 3}}>{children}</Box>}
    </div>
);

const Page = () => {
    const navigate = useNavigate();
    const {listingId} = useParams();
    const {user} = useAuth();
    const theme = useTheme();
    const snackbar = useSnackbar();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    usePageView();

    // Загрузка объявления
    useEffect(() => {
        const loadListing = async () => {
            try {
                setLoading(true);
                const data = await listingService.getListingById(listingId);

                // Проверка прав
                if (data.author.id !== user.id && user.role !== 'admin') {
                    setError('You do not have permission to view this listing');
                    return;
                }

                setListing(data);
                setError(null);
            } catch (err) {
                console.error('Error loading listing:', err);
                setError('Listing not found');
            } finally {
                setLoading(false);
            }
        };

        loadListing();
    }, [listingId, user]);

    const handleEdit = () => {
        navigate(paths.dashboard.listings.edit.replace(':listingId', listingId));
    };

    const handleDelete = async () => {
        try {
            await listingService.deleteListing(listingId, user);
            snackbar.success('Listing deleted successfully');
            navigate(paths.dashboard.listings.index);
        } catch (error) {
            console.error('Error deleting listing:', error);
            snackbar.error('Failed to delete listing');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus) return;

        try {
            await listingService.updateListing(
                listingId,
                {status: newStatus},
                user,
                [],
                []
            );

            setListing(prev => ({...prev, status: newStatus}));
            snackbar.success(`Listing marked as ${newStatus}`);
            setStatusDialogOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
            snackbar.error('Failed to update status');
        }
    };

    const handleDuplicate = async () => {
        try {
            const {id, ...listingData} = listing;
            const newListing = {
                ...listingData,
                title: `${listing.title} (Copy)`,
                status: LISTING_STATUS.DRAFT
            };

            await listingService.createListing(newListing, user, []);
            snackbar.success('Listing duplicated successfully');
            navigate(paths.dashboard.listings.index);
        } catch (error) {
            console.error('Error duplicating listing:', error);
            snackbar.error('Failed to duplicate listing');
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/listings/${listingId}`;
        await navigator.clipboard.writeText(url);
        snackbar.success('Link copied to clipboard');
        setShareDialogOpen(false);
    };

    const handleExport = () => {
        const data = {
            'Title': listing.title,
            'Description': listing.description,
            'Price': listing.price,
            'Category': listing.category,
            'Condition': listing.condition,
            'Location': listing.location,
            'Status': listing.status,
            'Created': format(new Date(listing.createdAt), 'yyyy-MM-dd HH:mm'),
            'Views': listing.views,
            'Likes': listing.likes
        };

        const csv = Object.entries(data)
            .map(([key, value]) => `${key},"${value}"`)
            .join('\n');

        const blob = new Blob([csv], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `listing-${listingId}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{py: 8}}>
                <Skeleton variant="text" height={40} width={200}/>
                <Grid container spacing={4} sx={{mt: 2}}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" height={400}/>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={400}/>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error || !listing) {
        return (
            <Container maxWidth="xl" sx={{py: 8}}>
                <Alert severity="error">{error || 'Listing not found'}</Alert>
                <Button
                    component={RouterLink}
                    href={paths.dashboard.listings.index}
                    sx={{mt: 2}}
                >
                    Back to Listings
                </Button>
            </Container>
        );
    }

    const createdDate = listing.createdAt
        ? format(new Date(listing.createdAt), 'MMMM d, yyyy')
        : '';
    const timeAgo = listing.createdAt
        ? formatDistanceToNow(new Date(listing.createdAt), {addSuffix: true})
        : '';

    return (
        <>
            <Seo title={`${listing.title} | Dashboard`}/>
            <Box component="main" sx={{flexGrow: 1, py: 8}}>
                <Container maxWidth="xl">
                    {/* Навигация */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{mb: 4}}>
                        <IconButton onClick={() => navigate(paths.dashboard.listings.index)}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Breadcrumbs separator={<BreadcrumbsSeparator/>}>
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
                                {listing.title}
                            </Typography>
                        </Breadcrumbs>
                    </Stack>

                    {/* Заголовок и действия */}
                    <Paper sx={{p: 3, mb: 4}}>
                        <Stack
                            direction={{xs: 'column', sm: 'row'}}
                            justifyContent="space-between"
                            alignItems={{xs: 'flex-start', sm: 'center'}}
                            spacing={2}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h4">
                                        {listing.title}
                                    </Typography>
                                    <StatusBadge status={listing.status}/>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Created {timeAgo} • Last
                                    updated {listing.updatedAt && formatDistanceToNow(new Date(listing.updatedAt), {addSuffix: true})}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon/>}
                                    onClick={handleEdit}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<MoreVertIcon/>}
                                    onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                                >
                                    Actions
                                </Button>

                                <Menu
                                    anchorEl={actionMenuAnchor}
                                    open={Boolean(actionMenuAnchor)}
                                    onClose={() => setActionMenuAnchor(null)}
                                >
                                    <MenuItem onClick={() => {
                                        setActionMenuAnchor(null);
                                        window.open(`/listings/${listingId}`, '_blank');
                                    }}>
                                        <ListItemIcon>
                                            <VisibilityIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>View Public Page</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => {
                                        setActionMenuAnchor(null);
                                        setStatusDialogOpen(true);
                                    }}>
                                        <ListItemIcon>
                                            <ArchiveIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Change Status</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => {
                                        setActionMenuAnchor(null);
                                        handleDuplicate();
                                    }}>
                                        <ListItemIcon>
                                            <CopyIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Duplicate</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => {
                                        setActionMenuAnchor(null);
                                        setShareDialogOpen(true);
                                    }}>
                                        <ListItemIcon>
                                            <ShareIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Share</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={handleExport}>
                                        <ListItemIcon>
                                            <DownloadIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Export Data</ListItemText>
                                    </MenuItem>

                                    <Divider/>

                                    <MenuItem
                                        onClick={() => {
                                            setActionMenuAnchor(null);
                                            setDeleteDialogOpen(true);
                                        }}
                                        sx={{color: 'error.main'}}
                                    >
                                        <ListItemIcon>
                                            <DeleteIcon fontSize="small" color="error"/>
                                        </ListItemIcon>
                                        <ListItemText>Delete</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Статистика */}
                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                icon={VisibilityIcon}
                                label="Total Views"
                                value={listing.views || 0}
                                trend={12}
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                icon={FavoriteIcon}
                                label="Total Likes"
                                value={listing.likes || 0}
                                trend={5}
                                color="error"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                icon={CommentIcon}
                                label="Inquiries"
                                value={listing.inquiries || 0}
                                trend={-2}
                                color="warning"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                icon={LocalOfferIcon}
                                label="Price"
                                value={`$${listing.price?.toLocaleString()}`}
                                color="success"
                            />
                        </Grid>
                    </Grid>

                    {/* Табы с информацией */}
                    <Paper sx={{mb: 4}}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            sx={{px: 2, borderBottom: 1, borderColor: 'divider'}}
                        >
                            <Tab label="Overview"/>
                            <Tab label="Details"/>
                            <Tab label="Analytics"/>
                            <Tab label="Activity"/>
                        </Tabs>

                        {/* Overview Tab */}
                        <TabPanel value={activeTab} index={0}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={8}>
                                    <ListingGallery images={listing.images} title={listing.title}/>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Stack spacing={3}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Quick Summary
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Category
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Condition
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {listing.condition || 'Not specified'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Location
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <LocationIcon fontSize="small" color="action"/>
                                                            <Typography variant="body1">
                                                                {listing.location || 'Not specified'}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Listed on
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {createdDate}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Contact Info
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Avatar src={listing.author?.avatar}/>
                                                        <Box>
                                                            <Typography variant="subtitle2">
                                                                {listing.author?.name}
                                                            </Typography>
                                                            <Rating value={listing.author?.rating} size="small" readOnly/>
                                                        </Box>
                                                    </Stack>

                                                    {listing.contactInfo?.phone && listing.showPhone && (
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={<PhoneIcon/>}
                                                            href={`tel:${listing.contactInfo.phone}`}
                                                        >
                                                            {listing.contactInfo.phone}
                                                        </Button>
                                                    )}

                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        startIcon={<EmailIcon/>}
                                                        href={`mailto:${listing.author?.email}`}
                                                    >
                                                        Email
                                                    </Button>

                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        startIcon={<ChatIcon/>}
                                                    >
                                                        Open Chat
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Details Tab */}
                        <TabPanel value={activeTab} index={1}>
                            <Card>
                                <CardContent>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Description
                                            </Typography>
                                            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
                                                <HtmlContent content={listing.description}/>
                                            </Typography>
                                        </Box>

                                        <Divider/>

                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Full Details
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Listing ID
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {listingId}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <StatusBadge status={listing.status}/>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Price Type
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {listing.priceType === 'fixed' ? 'Fixed Price' :
                                                            listing.priceType === 'negotiable' ? 'Negotiable' : 'Free'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Allow Offers
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {listing.allowOffers ? 'Yes' : 'No'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Show Phone
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {listing.showPhone ? 'Yes' : 'No'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Preferred Contact
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {listing.contactInfo?.preferContactMethod || 'Any'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Divider/>

                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Images
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {listing.images?.length || 0} images uploaded
                                            </Typography>
                                            <ImageList
                                                sx={{
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr)) !important'
                                                }}
                                            >
                                                {listing.images?.map((img, index) => (
                                                    <ImageListItem key={index}>
                                                        <img src={img} alt={`Listing image ${index + 1}`}/>
                                                    </ImageListItem>
                                                ))}
                                            </ImageList>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </TabPanel>

                        {/* Analytics Tab */}
                        <TabPanel value={activeTab} index={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Performance Analytics
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Coming soon: Detailed analytics including views over time, conversion rates, and
                                        more.
                                    </Typography>
                                    {/* Здесь будет график */}
                                </CardContent>
                            </Card>
                        </TabPanel>

                        {/* Activity Tab */}
                        <TabPanel value={activeTab} index={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Activity Log
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Paper variant="outlined" sx={{p: 2}}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">
                                                    Listing created
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(listing.createdAt), 'MMM d, yyyy HH:mm')}
                                                </Typography>
                                            </Stack>
                                        </Paper>

                                        <Paper variant="outlined" sx={{p: 2}}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">
                                                    Last updated
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {listing.updatedAt && format(new Date(listing.updatedAt), 'MMM d, yyyy HH:mm')}
                                                </Typography>
                                            </Stack>
                                        </Paper>

                                        <Paper variant="outlined" sx={{p: 2}}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">
                                                    Total views
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {listing.views || 0}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </TabPanel>
                    </Paper>

                    {/* Релевантные объявления */}
                    <Box sx={{mt: 8}}>
                        <Typography variant="h5" gutterBottom>
                            Your Other Listings
                        </Typography>
                        {/* Здесь будет компонент с другими объявлениями пользователя */}
                    </Box>
                </Container>
            </Box>

            {/* Диалог изменения статуса */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>Change Listing Status</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 2, minWidth: 300}}>
                        <FormControl fullWidth>
                            <InputLabel>New Status</InputLabel>
                            <Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                label="New Status"
                            >
                                <MenuItem value={LISTING_STATUS.ACTIVE}>Active</MenuItem>
                                <MenuItem value={LISTING_STATUS.DRAFT}>Draft</MenuItem>
                                <MenuItem value={LISTING_STATUS.SOLD}>Sold</MenuItem>
                                <MenuItem value={LISTING_STATUS.ARCHIVED}>Archived</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleStatusChange}
                        variant="contained"
                        disabled={!newStatus}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Listing</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог шаринга */}
            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                <DialogTitle>Share Listing</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 2, minWidth: 400}}>
                        <TextField
                            fullWidth
                            value={`${window.location.origin}/listings/${listingId}`}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleShare}>
                                            <CopyIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Share this link with others to let them view your listing
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Page;