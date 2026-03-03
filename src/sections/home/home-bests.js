import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Typography,
    Rating,
    Grid,
    CircularProgress,
    useMediaQuery,
    Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import { roles } from 'src/roles';
import { profileApi } from 'src/api/profile';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import useDictionary from 'src/hooks/use-dictionaries';
import { getSiteDuration } from 'src/utils/date-locale';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";

const CompactWorkerCard = ({ worker }) => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const downLg = useMediaQuery(theme.breakpoints.down('lg'));
    const downXl = useMediaQuery(theme.breakpoints.down('xl'));

    const cardWidth = downSm ? '315px' : downMd ? '265px' : downLg ? '300px' : downXl ? '355px' : '400px';
    const cardHeight = downMd ? 178 : downLg ? 192 : downXl ? 207 : 220;
    const avatarWidth = downSm ? '120px' : downMd ? '100px' : downLg ? '114px' : downXl ? '138px' : '156px';
    const iconSize = downMd ? 12 : downLg ? 13 : 15;
    const nameFontSize = downMd ? '0.78rem' : downLg ? '0.85rem' : downXl ? '0.9rem' : '0.95rem';
    const smallFontSize = downMd ? '0.68rem' : downLg ? '0.72rem' : '0.78rem';
    const captionFontSize = downMd ? '0.6rem' : '0.68rem';
    const chipFontSize = downMd ? 9 : 11;
    const ratingFontSize = downMd ? '0.82rem' : '1rem';
    const contentPx = downSm ? 1 : downMd ? 1.25 : 1.75;
    const contentPt = downSm ? 6 : downMd ? 1.25 : 1.75;
    const mt = downMd ? 0.5 : 1;
    const gap = downMd ? 0.5 : 1;
    const px = downMd ? 0.75 : 1;

    const {
        id,
        businessName,
        name,
        avatar,
        specialties = [],
        hourlyRate,
        rating,
        reviewCount,
        busyUntil,
        registrationAt,
        address
    } = worker;

    const formatAddress = (addr) => {
        if (!addr || Object.keys(addr).length === 0) return 'Location not specified';
        if (addr?.location?.place_name) {
            const [city, rest] = addr.location.place_name.split(', ');
            return `${city}${rest ? `, ${rest.split(' ')[0]}` : ''}`;
        }
        return 'Location not specified';
    };

    return (
        <Card
            component={RouterLink}
            href={paths.specialist.publicPage.replace(':profileId', id)}
            sx={{
                display: 'flex',
                height: cardHeight,
                overflow: 'hidden',
                borderRadius: 3,
                textDecoration: 'none',
                position: 'relative',
                transition: 'transform .25s',
                '&:hover': { transform: 'translateY(-4px)' },
                width: cardWidth,
                backgroundColor: '#F5F8FB',
            }}
        >
            <Chip
                size="small"
                label={busyUntil ? 'Busy' : 'Available'}
                sx={{
                    position: 'absolute',
                    top: 14,
                    right: 8,
                    textTransform: 'capitalize',
                    bgcolor: busyUntil ? theme.palette.error.main : theme.palette.success.main,
                    color: '#fff',
                    fontSize: chipFontSize,
                    fontWeight: 600,
                    zIndex: 2
                }}
            />

            <Box sx={{ width: avatarWidth, flexShrink: 0, position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={avatar || '/assets/avatars/defaultUser.jpg'}
                    alt={businessName || name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {hourlyRate && (
                    <Chip
                        label={`$${hourlyRate}/hr`}
                        color="warning"
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            fontWeight: 700,
                            fontSize: downMd ? 9 : 11,
                            borderRadius: 0,
                            borderTopLeftRadius: 8,
                            borderBottomRightRadius: 4
                        }}
                    />
                )}
            </Box>

            <CardContent sx={{ p: contentPx, pt: contentPt, pr: 3, overflow: 'hidden', width: '100%' }}>
                {registrationAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: captionFontSize }}>
                        {getSiteDuration(registrationAt.toDate())}
                    </Typography>
                )}

                <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{ fontWeight: 600, mb: 0.25, maxWidth: '90%', fontSize: nameFontSize }}
                >
                    {businessName || name}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: smallFontSize }}
                >
                    {specialties?.length
                        ? specialties
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((s) => s.label)
                            .join(', ') + (specialties.length > 2 ? '…' : '')
                        : 'Specialist'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap, mt }}>
                    <Rating size="small" value={Number(rating) || 0} readOnly precision={0.5} sx={{ fontSize: ratingFontSize }} />

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: theme.palette.grey[200],
                            px,
                            py: 0.25,
                            borderRadius: 10,
                            gap: 0.5
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: smallFontSize }}>
                            {rating ? rating.toFixed(1) : '0.0'}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: iconSize, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: smallFontSize }}>
                            {reviewCount ?? 0}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt, fontSize: smallFontSize }}>
                    {formatAddress(address)}
                </Typography>
            </CardContent>
        </Card>
    );
};

const Section = ({ title, workers }) => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const [slide, setSlide] = useState(0);

    if (!workers) return null;

    return (
        <Box sx={{ mb: { xs: 8, md: 14 } }}>
            <Typography variant="h4" align="center" sx={{ mb: 4 }}>
                {title}
            </Typography>

            {!downSm && (
                <Grid container spacing={{ sm: 2, md: 2, lg: 2, xl: 2}} justifyContent="center" sx={{ px: { lg: 2 } }}>
                    {workers.map((w) => (
                        <Grid item key={w.id} xs={12} sm={4} md={4}>
                            <HorizontalPreviewCard
                                data={mapWorkerToPreviewData(w, theme)}
                                theme={theme}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {downSm && (
                <>
                    <SwipeableViews enableMouseEvents index={slide} onChangeIndex={setSlide}>
                        {workers.map((w) => (
                            <Box key={w.id} sx={{ px: 1, width: '90%', mx: 'auto' }}>
                                <HorizontalPreviewCard
                                    data={mapWorkerToPreviewData(w, theme)}
                                    theme={theme}
                                />
                            </Box>
                        ))}
                    </SwipeableViews>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                        {workers.map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor:
                                        slide === i ? theme.palette.primary.main : theme.palette.grey[400]
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export const HomeBests = () => {
    const { specialties } = useDictionary();
    const [bestReviews, setBestReviews] = useState(null);
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 12);

                workers.forEach((w) => {
                    if (w.specialties) {
                        w.specialties = w.specialties.map((id) => specialties.byId[id]);
                    }
                });

                const best = [...workers]
                    .filter((w) => w.reviewCount > 0)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);

                const recentAdded = [...workers]
                    .sort((a, b) => {
                        const aDate = a.registrationAt?.toDate?.() || new Date(0);
                        const bDate = b.registrationAt?.toDate?.() || new Date(0);
                        return bDate - aDate;
                    })
                    .slice(0, 3);

                setBestReviews(best);
                setRecent(recentAdded);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (specialties) load();
    }, [specialties]);

    return (
        <Box sx={{ py: { xs: 4, md: 10 } }}>
            <Container maxWidth="lg">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Section title="Best reviews" workers={bestReviews} />
                        <Section title="Recently added" workers={recent} />
                    </>
                )}
            </Container>
        </Box>
    );
};