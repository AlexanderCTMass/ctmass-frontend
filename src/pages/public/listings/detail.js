import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import IosShareIcon from '@mui/icons-material/IosShare';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import { listingService, LISTING_CATEGORIES, LISTING_CONDITIONS } from 'src/service/listing-service';
import { RouterLink } from 'src/components/router-link';
import { format } from 'date-fns';
import { RelevantListings } from 'src/components/relevant-listings';
import { HtmlContent } from 'src/components/html-content';
import { chatApi } from 'src/api/chat/newApi';
import { messengerActions } from 'src/slices/messenger';
import { useDispatch } from 'react-redux';
import { formatListingPrice } from 'src/components/listings/listing-tile';
import { BackLink, btn, cardTitleSx, EmptyState, fieldSx, formScopeSx, StatusPill, Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const navButtonSx = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: 12,
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    bgcolor: alpha('#FFFFFF', 0.92),
    color: BRAND.navy,
    boxShadow: SHADOW.md,
    '&:hover': { bgcolor: '#FFFFFF' }
});

const ImageGallery = ({ images, title }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const total = images?.length || 0;

    const handleNext = (e) => {
        e?.stopPropagation();
        setActiveStep((prev) => (prev + 1) % total);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setActiveStep((prev) => (prev - 1 + total) % total);
    };

    if (!total) {
        return (
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                    aspectRatio: { xs: '4 / 3', md: '16 / 10' },
                    borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                    bgcolor: '#FFFFFF',
                    border: `1px dashed ${alpha(BRAND.navy, 0.18)}`,
                    color: alpha(BRAND.navy, 0.35)
                }}
            >
                <LocalOfferOutlinedIcon sx={{ fontSize: 56 }} />
                <Typography sx={{ mt: 1, color: BRAND.muted, fontWeight: 600 }}>No photos yet</Typography>
            </Stack>
        );
    }

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    aspectRatio: { xs: '4 / 3', md: '16 / 10' },
                    borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                    bgcolor: BRAND.navyDeep,
                    boxShadow: SHADOW.md,
                    cursor: 'zoom-in'
                }}
                onClick={() => setLightboxOpen(true)}
            >
                <Box
                    component="img"
                    src={images[activeStep]}
                    alt={`${title}, photo ${activeStep + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {total > 1 && (
                    <>
                        <IconButton aria-label="Previous photo" onClick={handlePrev} sx={navButtonSx('left')}>
                            <ChevronLeftRoundedIcon />
                        </IconButton>
                        <IconButton aria-label="Next photo" onClick={handleNext} sx={navButtonSx('right')}>
                            <ChevronRightRoundedIcon />
                        </IconButton>
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 14,
                                bottom: 14,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: RADIUS.pill,
                                bgcolor: alpha(BRAND.navyDeep, 0.7),
                                color: '#FFFFFF',
                                fontSize: 13,
                                fontWeight: 700
                            }}
                        >
                            {activeStep + 1} / {total}
                        </Box>
                    </>
                )}
            </Box>

            {total > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 1.5,
                        overflowX: 'auto',
                        pb: 0.5,
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' }
                    }}
                >
                    {images.map((img, index) => (
                        <Box
                            key={img}
                            component="button"
                            type="button"
                            aria-label={`Show photo ${index + 1}`}
                            onClick={() => setActiveStep(index)}
                            sx={{
                                flexShrink: 0,
                                width: 84,
                                height: 64,
                                p: 0,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                border: `2px solid ${index === activeStep ? BRAND.green : 'transparent'}`,
                                opacity: index === activeStep ? 1 : 0.65,
                                transition: 'opacity .2s ease, border-color .2s ease',
                                '&:hover': { opacity: 1 }
                            }}
                        >
                            <Box component="img" src={img} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </Box>
                    ))}
                </Box>
            )}

            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#000000', borderRadius: { xs: 0, sm: RADIUS.card }, m: { xs: 1, sm: 4 }, width: { xs: 'calc(100% - 16px)', sm: 'auto' } } }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        aria-label="Close"
                        onClick={() => setLightboxOpen(false)}
                        sx={{ position: 'absolute', right: 12, top: 12, zIndex: 1, color: '#FFFFFF', bgcolor: alpha('#000000', 0.5), '&:hover': { bgcolor: alpha('#000000', 0.7) } }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                    <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box component="img" src={images[activeStep]} alt={`${title}, photo ${activeStep + 1}`} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </Box>
                    {total > 1 && (
                        <>
                            <IconButton aria-label="Previous photo" onClick={handlePrev} sx={navButtonSx('left')}>
                                <ChevronLeftRoundedIcon />
                            </IconButton>
                            <IconButton aria-label="Next photo" onClick={handleNext} sx={navButtonSx('right')}>
                                <ChevronRightRoundedIcon />
                            </IconButton>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

const SellerCard = ({ listing }) => {
    const name = listing.author?.name || 'CTMASS member';

    return (
        <Surface sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND.muted }}>Seller</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                <Avatar src={listing.author?.avatar} sx={{ width: 52, height: 52, bgcolor: BRAND.navy, fontFamily: FONT.display, fontWeight: 800 }}>
                    {name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: BRAND.navy }}>{name}</Typography>
                    {listing.author?.id && (
                        <Box
                            component={RouterLink}
                            href={paths.specialist.publicPage.replace(':profileId', listing.author.id)}
                            sx={{ fontSize: 13, fontWeight: 600, color: BRAND.green, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            View profile
                        </Box>
                    )}
                </Box>
            </Stack>
            <Stack spacing={1} sx={{ mt: 2.5 }}>
                {listing.contactInfo?.phone && listing.showPhone && (
                    <Button fullWidth startIcon={<PhoneRoundedIcon />} href={`tel:${listing.contactInfo.phone}`} sx={btn.outline}>
                        {listing.contactInfo.phone}
                    </Button>
                )}
                {listing.author?.email && (
                    <Button fullWidth startIcon={<MailOutlineRoundedIcon />} href={`mailto:${listing.author.email}`} sx={btn.outline}>
                        Email the seller
                    </Button>
                )}
                {listing.author?.id && (
                    <Button
                        fullWidth
                        component={RouterLink}
                        href={`${paths.listings.index}?author=${listing.author.id}`}
                        sx={btn.text}
                    >
                        More from this seller
                    </Button>
                )}
            </Stack>
        </Surface>
    );
};

const ReportDialog = ({ open, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const handleSubmit = () => {
        onSubmit({ reason, details });
        setReason('');
        setDetails('');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{ sx: { borderRadius: { xs: 0, sm: RADIUS.card }, boxShadow: SHADOW.lg, ...formScopeSx } }}
        >
            <Box sx={{ px: 3, pt: { xs: 'calc(env(safe-area-inset-top) + 20px)', sm: 3 }, pb: 2, borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                <Typography component="h2" sx={{ ...cardTitleSx, fontSize: 22 }}>Report this listing</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 14, color: BRAND.muted }}>Tell us what is wrong. We review every report.</Typography>
            </Box>
            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={2.5}>
                    <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Reason</InputLabel>
                        <Select value={reason} onChange={(e) => setReason(e.target.value)} input={<OutlinedInput label="Reason" />}>
                            <MenuItem value="spam">Spam</MenuItem>
                            <MenuItem value="inappropriate">Inappropriate content</MenuItem>
                            <MenuItem value="scam">Suspected scam</MenuItem>
                            <MenuItem value="expired">Listing expired</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        multiline
                        minRows={3}
                        variant="outlined"
                        label="Details (optional)"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        sx={fieldSx}
                    />
                </Stack>
            </DialogContent>
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1} sx={{ px: 3, pt: 2, pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 }, borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                <Button onClick={onClose} sx={btn.text}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!reason} sx={btn.navy}>Send report</Button>
            </Stack>
        </Dialog>
    );
};

const Page = () => {
    const navigate = useNavigate();
    const { listingId } = useParams();
    const { user } = useAuth();
    const snackbar = useSnackbar();
    const dispatch = useDispatch();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    usePageView();

    const handleContactSeller = useCallback(async () => {
        if (!listing?.author?.id) {
            return;
        }

        if (!user) {
            navigate(`${paths.login.index}?returnTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const threadId = await chatApi.startChat(user.id, listing.author.id);
        dispatch(messengerActions.selectThread(threadId));
        dispatch(messengerActions.open());
    }, [dispatch, navigate, user, listing]);

    useEffect(() => {
        const loadListing = async () => {
            try {
                setLoading(true);
                const data = await listingService.getListingById(listingId);
                setListing(data);

                await listingService.incrementViews(listingId);

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
            setListing((prev) => ({
                ...prev,
                likes: result.likes
            }));
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: listing.title, url });
            } catch (err) {
                return;
            }
        } else {
            await navigator.clipboard.writeText(url);
            snackbar.success('Link copied');
        }
    };

    const handleReport = async () => {
        snackbar.success('Report sent. Thank you.');
        setReportDialogOpen(false);
    };

    if (loading) {
        return (
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 15, md: 18 }, pb: 8, bgcolor: BRAND.mist }}>
                <Container maxWidth="xl">
                    <Skeleton variant="rounded" height={56} sx={{ maxWidth: 520, borderRadius: RADIUS.inner, mb: 3 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 380px' }, gap: 4 }}>
                        <Skeleton variant="rounded" sx={{ aspectRatio: '16 / 10', height: 'auto', borderRadius: RADIUS.panel }} />
                        <Skeleton variant="rounded" height={360} sx={{ borderRadius: RADIUS.card }} />
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error || !listing) {
        return (
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 15, md: 18 }, pb: 10, bgcolor: BRAND.mist }}>
                <Container maxWidth="sm">
                    <EmptyState
                        icon={<LocalOfferOutlinedIcon />}
                        title="Listing not found"
                        text="It may have been sold or removed by the seller."
                        action={<Button component={RouterLink} href={paths.listings.index} sx={btn.green}>Browse listings</Button>}
                    />
                </Container>
            </Box>
        );
    }

    const createdDate = listing.createdAt ? format(new Date(listing.createdAt), 'MMMM d, yyyy') : '';
    const categoryLabel = LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label || listing.category;
    const conditionLabel = LISTING_CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition;
    const isOwner = user?.id && user.id === listing.author?.id;

    const facts = [
        { label: 'Category', value: categoryLabel || 'Other' },
        { label: 'Condition', value: conditionLabel || 'Not specified' },
        { label: 'Listed', value: createdDate || 'Recently' },
        { label: 'Views', value: listing.views || 0 },
        { label: 'Accepts offers', value: listing.allowOffers ? 'Yes' : 'No' }
    ];

    return (
        <>
            <Seo title={listing.title} />
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 14, md: 17 }, pb: 10, bgcolor: BRAND.mist }}>
                <Container maxWidth="xl">
                    <BackLink href={paths.listings.index}>All listings</BackLink>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 380px' },
                            gap: { xs: 3, md: 4 },
                            alignItems: 'start'
                        }}
                    >
                        <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ minWidth: 0 }}>
                            <ImageGallery images={listing.images} title={listing.title} />

                            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mb: 1.25 }}>
                                    {categoryLabel && <StatusPill tone="navy">{categoryLabel}</StatusPill>}
                                    {listing.type === 'urgent' && <StatusPill tone="danger">Urgent</StatusPill>}
                                </Stack>
                                <Typography component="h1" sx={{ ...displayTitleSx, fontSize: 28 }}>{listing.title}</Typography>
                            </Box>

                            <Surface>
                                <SurfaceHeader icon={<DescriptionOutlinedIcon />} title="Description" />
                                <Box sx={{ color: BRAND.ink, fontSize: 16, lineHeight: 1.7, overflowWrap: 'anywhere' }}>
                                    <HtmlContent content={listing.description} />
                                </Box>
                            </Surface>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' },
                                    gap: '1px',
                                    overflow: 'hidden',
                                    bgcolor: alpha(BRAND.navy, 0.08),
                                    borderRadius: RADIUS.card,
                                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                                    boxShadow: SHADOW.sm
                                }}
                            >
                                {facts.map((fact) => (
                                    <Box key={fact.label} sx={{ bgcolor: '#FFFFFF', px: 2.25, py: 2 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: BRAND.muted }}>{fact.label}</Typography>
                                        <Typography sx={{ mt: 0.5, fontWeight: 700, color: BRAND.ink, overflowWrap: 'anywhere' }}>{fact.value}</Typography>
                                    </Box>
                                ))}
                                {facts.length % 2 === 1 && <Box sx={{ bgcolor: '#FFFFFF', display: { xs: 'block', sm: 'none' } }} />}
                            </Box>
                        </Stack>

                        <Stack spacing={2.5} sx={{ position: { md: 'sticky' }, top: { md: 100 }, minWidth: 0 }}>
                            <Surface sx={{ p: { xs: 2.5, md: 3 } }}>
                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
                                        {categoryLabel && <StatusPill tone="navy">{categoryLabel}</StatusPill>}
                                        {listing.type === 'urgent' && <StatusPill tone="danger">Urgent</StatusPill>}
                                        {listing.type === 'featured' && <StatusPill>Featured</StatusPill>}
                                    </Stack>
                                    <Typography component="h1" sx={{ ...displayTitleSx, fontSize: 28, overflowWrap: 'anywhere' }}>
                                        {listing.title}
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{
                                        mt: { xs: 0, md: 2 },
                                        fontFamily: FONT.display,
                                        fontWeight: 800,
                                        fontSize: { xs: 34, md: 40 },
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.1,
                                        color: listing.price === 0 ? BRAND.green : BRAND.navy
                                    }}
                                >
                                    {formatListingPrice(listing)}
                                </Typography>
                                {listing.priceType === 'negotiable' && (
                                    <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 600, color: BRAND.muted }}>or best offer</Typography>
                                )}
                                {listing.location && (
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5, color: BRAND.muted }}>
                                        <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{listing.location}</Typography>
                                    </Stack>
                                )}

                                <Stack spacing={1} sx={{ mt: 3 }}>
                                    {!isOwner && (
                                        <Button fullWidth startIcon={<ChatBubbleOutlineRoundedIcon />} onClick={handleContactSeller} sx={{ ...btn.green, minHeight: 52, fontSize: 16 }}>
                                            Message the seller
                                        </Button>
                                    )}
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            fullWidth
                                            startIcon={liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                                            onClick={handleLike}
                                            sx={{ ...btn.outline, ...(liked && { color: BRAND.danger, borderColor: alpha(BRAND.danger, 0.4) }) }}
                                        >
                                            {liked ? 'Saved' : 'Save'}
                                        </Button>
                                        <Tooltip title="Share">
                                            <Button aria-label="Share" onClick={handleShare} sx={{ ...btn.outline, minWidth: 52, px: 0 }}>
                                                <IosShareIcon />
                                            </Button>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Surface>

                            <SellerCard listing={listing} />

                            {!isOwner && (
                                <Button
                                    startIcon={<FlagOutlinedIcon />}
                                    onClick={() => setReportDialogOpen(true)}
                                    sx={{ ...btn.text, alignSelf: 'center', color: BRAND.muted, fontWeight: 600 }}
                                >
                                    Report this listing
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ mt: { xs: 6, md: 8 } }}>
                        <RelevantListings
                            title="Similar listings"
                            maxItems={4}
                            excludeListingId={listingId}
                            containerProps={{ disableGutters: true, maxWidth: false }}
                        />
                    </Box>
                </Container>
            </Box>

            <ReportDialog
                open={reportDialogOpen}
                onClose={() => setReportDialogOpen(false)}
                onSubmit={handleReport}
            />
        </>
    );
};

export default Page;
