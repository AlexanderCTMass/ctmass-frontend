import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    useTheme,
    alpha,
    ImageList,
    ImageListItem,
    MobileStepper,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    LocationOn as LocationIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Chat as ChatIcon,
    Report as ReportIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useAuth} from 'src/hooks/use-auth';
import {useSnackbar} from 'src/hooks/use-snackbar';
import {paths} from 'src/paths';
import {listingService, LISTING_CATEGORIES} from 'src/service/listing-service';
import {BreadcrumbsSeparator} from 'src/components/breadcrumbs-separator';
import {RouterLink} from 'src/components/router-link';
import {format} from 'date-fns';
import {RelevantListings} from 'src/components/relevant-listings';
import {HtmlContent} from "src/components/html-content";
import {chatApi} from "src/api/chat/newApi";
import {messengerActions} from "src/slices/messenger";
import {useDispatch} from "react-redux";

// Компонент галереи без Swiper
const ImageGallery = ({images, title}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const handleNext = () => {
        setActiveStep((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setActiveStep((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) {
        return (
            <Box
                sx={{
                    height: 400,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2
                }}
            >
                <Typography color="text.secondary">No images available</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{position: 'relative', borderRadius: 2, overflow: 'hidden'}}>
                <Box
                    sx={{
                        height: 400,
                        cursor: 'pointer',
                        '& img': {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }
                    }}
                    onClick={() => setLightboxOpen(true)}
                >
                    <img src={images[activeStep]} alt={`${title} - ${activeStep + 1}`}/>
                </Box>

                {images.length > 1 && (
                    <>
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                '&:hover': {bgcolor: 'background.paper'}
                            }}
                        >
                            <ArrowBackIcon/>
                        </IconButton>
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                '&:hover': {bgcolor: 'background.paper'}
                            }}
                        >
                            <ArrowForwardIcon/>
                        </IconButton>
                        <MobileStepper
                            steps={images.length}
                            position="static"
                            activeStep={activeStep}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                '& .MuiMobileStepper-dot': {
                                    bgcolor: 'white'
                                },
                                '& .MuiMobileStepper-dotActive': {
                                    bgcolor: 'primary.main'
                                }
                            }}
                            backButton={<Box/>}
                            nextButton={<Box/>}
                        />
                    </>
                )}
            </Box>

            {/* Thumbnails */}
            {images.length > 1 && (
                <ImageList
                    sx={{
                        mt: 2,
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr)) !important'
                    }}
                >
                    {images.map((img, index) => (
                        <ImageListItem
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                border: index === activeStep ? 2 : 0,
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                overflow: 'hidden',
                                opacity: index === activeStep ? 1 : 0.7,
                                '&:hover': {opacity: 1}
                            }}
                            onClick={() => setActiveStep(index)}
                        >
                            <img src={img} alt={`Thumbnail ${index + 1}`}/>
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            {/* Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth="xl"
                fullWidth
            >
                <DialogContent sx={{p: 0, bgcolor: 'black', position: 'relative'}}>
                    <IconButton
                        onClick={() => setLightboxOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            zIndex: 1,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)'
                            }
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>

                    <Box
                        sx={{
                            height: '80vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img
                            src={images[activeStep]}
                            alt={`${title} - ${activeStep + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>

                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.7)'
                                    }
                                }}
                            >
                                <ArrowBackIcon/>
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.7)'
                                    }
                                }}
                            >
                                <ArrowForwardIcon/>
                            </IconButton>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

// Компонент информации о продавце
const SellerInfo = ({listing}) => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">
                        Seller Information
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            src={listing.author?.avatar}
                            sx={{width: 56, height: 56}}
                        />
                        <Box>
                            <Typography variant="subtitle1">
                                {listing.author?.name}
                            </Typography>
                            {/*<Typography variant="body2" color="text.secondary">
                                Member since {listing.author?.memberSince || 'N/A'}
                            </Typography>*/}
                            <Rating value={listing.author?.rating || 0} readOnly size="small"/>
                        </Box>
                    </Stack>

                    <Divider/>

                    <Stack spacing={1}>
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
                            Email Seller
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate(`${paths.listings.index}?author=${listing.author?.id}`)}
                        >
                            View all listings by this seller
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

// Диалог репорта
const ReportDialog = ({open, onClose, onSubmit}) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = () => {
        onSubmit({reason, details});
        setReason('');
        setDetails('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Report Listing</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{mt: 2}}>
                    <FormControl fullWidth>
                        <InputLabel>Reason</InputLabel>
                        <Select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            label="Reason"
                        >
                            <MenuItem value="spam">Spam</MenuItem>
                            <MenuItem value="inappropriate">Inappropriate content</MenuItem>
                            <MenuItem value="scam">Suspected scam</MenuItem>
                            <MenuItem value="expired">Listing expired</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        multiline
                        rows={3}
                        label="Additional details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleSubmit}
                    disabled={!reason}
                >
                    Submit Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Диалог связи с продавцом
const ContactSellerDialog = ({open, onClose, listing, onSend}) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        setSending(true);
        try {
            await onSend(message);
            onClose();
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Contact {listing.author?.name}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{mt: 2}}>
                    <Typography variant="body2" color="text.secondary">
                        Interested in: {listing.title}
                    </Typography>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Write your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                >
                    {sending ? 'Sending...' : 'Send Message'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const Page = () => {
    const navigate = useNavigate();
    const {listingId} = useParams();
    const {user} = useAuth();
    const theme = useTheme();
    const snackbar = useSnackbar();
    const dispatch = useDispatch();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    usePageView();

    const handleContactSeller = useCallback(async () => {
        if (!listing?.author?.id) {
            return;
        }

        if (!user) {
            setContactDialogOpen(true);
        } else {
            const threadId = await chatApi.startChat(user.id, listing.author.id);
            dispatch(messengerActions.selectThread(threadId));
            dispatch(messengerActions.open());
        }
    }, [dispatch, user, listing]);


    useEffect(() => {
        const loadListing = async () => {
            try {
                setLoading(true);
                const data = await listingService.getListingById(listingId);
                setListing(data);

                // Увеличиваем счетчик просмотров
                await listingService.incrementViews(listingId);

                // Проверяем, лайкнул ли пользователь
                if (user) {
                    const likedBy = data.likedBy || [];
                    setLiked(likedBy.includes(user.id));
                }

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

    const handleLike = async () => {
        if (!user) {
            navigate(paths.login.index);
            return;
        }

        try {
            const result = await listingService.toggleListingLike(listingId, user.id, !liked);
            setLiked(result.isLiked);
            setListing(prev => ({
                ...prev,
                likes: result.likes
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing.title,
                    text: listing.description,
                    url: url
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            await navigator.clipboard.writeText(url);
            snackbar.success('Link copied to clipboard');
        }
    };

    const handleContact = async (message) => {
        // Здесь будет интеграция с чатом
        console.log('Send message:', message);
        snackbar.success('Message sent!');
    };

    const handleReport = async (reason) => {
        // Здесь будет логика репорта
        console.log('Report:', reason);
        snackbar.success('Thank you for your report');
        setReportDialogOpen(false);
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
                    href={paths.listings.index}
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

    return (
        <>
            <Seo title={listing.title}/>
            <Box component="main" sx={{flexGrow: 1, py: 8}}>
                <Container maxWidth="xl">
                    {/* Навигация */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{mb: 4}}>
                        <IconButton onClick={() => navigate(-1)}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Breadcrumbs separator={<BreadcrumbsSeparator/>}>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.index}
                                variant="subtitle2"
                            >
                                Home
                            </Link>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.listings.index}
                                variant="subtitle2"
                            >
                                Listings
                            </Link>
                            <Typography color="text.secondary" variant="subtitle2">
                                {listing.title}
                            </Typography>
                        </Breadcrumbs>
                    </Stack>

                    <Grid container spacing={4}>
                        {/* Левая колонка - изображения и описание */}
                        <Grid item xs={12} md={8}>
                            <Stack spacing={4}>
                                {/* Галерея */}
                                <ImageGallery images={listing.images} title={listing.title}/>

                                {/* Информация о продавце (мобильная) */}
                                <Box sx={{display: {xs: 'block', md: 'none'}}}>
                                    <SellerInfo listing={listing}/>
                                </Box>

                                {/* Описание */}
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            Description
                                        </Typography>
                                        <HtmlContent content={listing.description}/>
                                    </CardContent>
                                </Card>

                                {/* Детали */}
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Category
                                                </Typography>
                                                <Typography variant="body2">
                                                    {LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Condition
                                                </Typography>
                                                <Typography variant="body2">
                                                    {listing.condition || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Listed
                                                </Typography>
                                                <Typography variant="body2">
                                                    {createdDate}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Views
                                                </Typography>
                                                <Typography variant="body2">
                                                    {listing.views || 0}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Accepts Offers
                                                </Typography>
                                                <Typography variant="body2">
                                                    {listing.allowOffers ? 'Yes' : 'No'}
                                                </Typography>
                                            </Grid>
                                            {listing.location && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Location
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <LocationIcon fontSize="small" color="action"/>
                                                        <Typography variant="body2">
                                                            {listing.location}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Правая колонка - цена и действия */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3} sx={{position: 'sticky', top: 24}}>
                                {/* Цена */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Typography variant="h3" color="primary.main">
                                                ${listing.price?.toLocaleString()}
                                                {listing.priceType === 'negotiable' && (
                                                    <Typography component="span" variant="body1" color="text.secondary"
                                                                sx={{ml: 1}}>
                                                        or best offer
                                                    </Typography>
                                                )}
                                            </Typography>

                                            {listing.price === 0 && (
                                                <Chip
                                                    label="Free"
                                                    color="success"
                                                    icon={<LocalOfferIcon/>}
                                                    sx={{alignSelf: 'flex-start'}}
                                                />
                                            )}

                                            <Divider/>

                                            {/* Кнопки действий */}
                                            <Stack spacing={1}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<ChatIcon/>}
                                                    onClick={handleContactSeller}
                                                >
                                                    Contact Seller
                                                </Button>

                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        startIcon={liked ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
                                                        onClick={handleLike}
                                                        color={liked ? 'error' : 'primary'}
                                                    >
                                                        {liked ? 'Liked' : 'Like'}
                                                    </Button>
                                                    <Tooltip title="Share">
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleShare}
                                                            sx={{minWidth: 'auto', px: 2}}
                                                        >
                                                            <ShareIcon/>
                                                        </Button>
                                                    </Tooltip>
                                                </Stack>

                                                <Button
                                                    fullWidth
                                                    variant="text"
                                                    color="warning"
                                                    startIcon={<ReportIcon/>}
                                                    onClick={() => setReportDialogOpen(true)}
                                                >
                                                    Report Listing
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Информация о продавце (десктоп) */}
                                <Box sx={{display: {xs: 'none', md: 'block'}}}>
                                    <SellerInfo listing={listing}/>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Похожие объявления */}
                    <Box sx={{mt: 8}}>
                        <RelevantListings
                            title="Similar Listings"
                            maxItems={4}
                            excludeListingId={listingId}
                            containerProps={{ disableGutters: true, maxWidth: false }}
                        />
                    </Box>
                </Container>
            </Box>

            {/* Диалоги */}
            <ContactSellerDialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
                listing={listing}
                onSend={handleContact}
            />

            <ReportDialog
                open={reportDialogOpen}
                onClose={() => setReportDialogOpen(false)}
                onSubmit={handleReport}
            />
        </>
    );
};

export default Page;