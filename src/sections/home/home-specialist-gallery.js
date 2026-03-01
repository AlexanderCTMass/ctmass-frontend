import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Container,
    Typography,
    CircularProgress,
    Grid,
    Rating,
    Button,
    useMediaQuery
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from "react";
import SwipeableViews from 'react-swipeable-views';
import { roles } from "src/roles";
import { profileApi } from "src/api/profile";
import { paths } from "src/paths";
import { RouterLink } from "src/components/router-link";
import useDictionary from "src/hooks/use-dictionaries";
import { getSiteDuration } from 'src/utils/date-locale'

const WorkerCard = ({ worker }) => {
    const theme = useTheme();
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const downLg = useMediaQuery(theme.breakpoints.down('lg'));

    const imgHeight = downMd ? 138 : downLg ? 162 : 200;
    const nameFontSize = downMd ? '0.82rem' : downLg ? '0.9rem' : '1rem';
    const bodyFontSize = downMd ? '0.7rem' : downLg ? '0.75rem' : '0.8rem';
    const captionFontSize = downMd ? '0.62rem' : '0.7rem';
    const iconSize = downMd ? 12 : downLg ? 14 : 16;
    const chipFontSize = downMd ? 10 : 12;
    const ratingFontSize = downMd ? '0.82rem' : '1rem';
    const contentPb = downMd ? '36px !important' : '44px !important';
    const contentP = downMd ? 1.25 : 1.75;
    const mt = downMd ? 0.5 : 1;
    const gap = downMd ? 0.5 : 1;
    const px = downMd ? 0.75 : 1;

    const {
        id,
        businessName,
        name,
        avatar,
        specialties = [],
        address,
        hourlyRate,
        rating,
        reviewCount,
        busyUntil,
        registrationAt
    } = worker;

    const formatAddress = (address) => {
        if (!address || Object.keys(address).length === 0) {
            return 'Location not specified';
        }

        if (address?.location?.place_name) {
            const placeParts = address.location.place_name.split(', ');
            if (placeParts.length >= 2) {
                return `${placeParts[0]}, ${placeParts[1].split(' ')[0]}`; // Берём город и штат
            }
            return address.location.place_name;
        }

        return 'Location not specified';
    };

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
            style={{ textDecoration: 'none' }}
            component={RouterLink}
            href={paths.specialist.publicPage.replace(':profileId', id)}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={avatar || '/assets/avatars/defaultUser.jpg'}
                    height={imgHeight}
                    alt={businessName || name}
                    sx={{ objectFit: 'cover' }}
                />
                {hourlyRate ? (
                    <Chip
                        label={`$${hourlyRate}/hr`}
                        color="warning"
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: downMd ? 10 : 16,
                            right: downMd ? 10 : 16,
                            fontWeight: 700,
                            fontSize: chipFontSize,
                        }}
                    />
                ) : null}
            </Box>

            <CardContent sx={{ flexGrow: 1, pb: contentPb, p: contentP }}>
                {registrationAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2, fontSize: captionFontSize }}>
                        {getSiteDuration(registrationAt.toDate())}
                    </Typography>)}

                <Box sx={{ mt, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: nameFontSize }}>
                        {businessName || name}
                    </Typography>

                    <Chip
                        size="small"
                        label={busyUntil ? 'Busy' : 'Available'}
                        sx={{
                            bgcolor: busyUntil ? theme.palette.error.main : theme.palette.success.main,
                            color: '#fff',
                            fontSize: chipFontSize,
                            textTransform: 'capitalize',
                        }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: bodyFontSize }}>
                    {specialties?.length > 0
                        ? specialties
                            .filter(spec => spec)
                            .slice(0, 3)
                            .map(spec => spec.label)
                            .join(', ')
                        + (specialties.length > 3 ? '...' : '')
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
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: bodyFontSize }}>
                            {rating ? rating.toFixed(1) : '0.0'}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: iconSize, color: '#828CA8' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: bodyFontSize }}>
                            {reviewCount ?? 0}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt, fontSize: bodyFontSize }}>
                    {formatAddress(address)}
                </Typography>
            </CardContent>

            {/* <Chip
                label="PRO"
                size="small"
                color="primary"
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    fontWeight: 700,
                    backgroundColor: '#1F2D77',
                }}
            /> */}
        </Card>
    );
};

export const HomeSpecialistGallery = () => {
    const theme = useTheme();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const { specialties } = useDictionary();
    const [currentWorkers, setCurrentWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true);
                const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 12);
                workers.forEach(worker => {
                    if (worker.specialties) {
                        worker.specialties = worker.specialties.map(specialty => specialties.byId[specialty])
                    }
                });
                setCurrentWorkers(workers.slice(0, 12)); // Первоначально показываем 12
            } catch (error) {
                console.error("Error fetching workers:", error);
            } finally {
                setLoading(false);
            }
        };
        if (specialties) {
            fetchWorkers();
        }
    }, [specialties]);
    /*
        useEffect(() => {
            if (allWorkers.length === 0) return;

            const timers = [];

            // Для каждого из 12 слотов создаем таймер с разной задержкой
            for (let i = 0; i < 12; i++) {
                const delay = 7000 + Math.random() * 17000; // Задержка от 3 до 10 секунд
                const timer = setInterval(() => {
                    setCurrentWorkers(prev => {
                        const newWorkers = [...prev];
                        // Выбираем случайного специалиста из оставшихся
                        const availableWorkers = allWorkers.filter(w => !newWorkers.includes(w));
                        if (availableWorkers.length > 0) {
                            const randomIndex = Math.floor(Math.random() * availableWorkers.length);
                            newWorkers[i] = availableWorkers[randomIndex];
                        }
                        return newWorkers;
                    });
                }, delay);

                timers.push(timer);
            }

            return () => {
                // Очищаем все таймеры при размонтировании
                timers.forEach(timer => clearInterval(timer));
            };
        }, [allWorkers]);*/

    const slidesMobile = currentWorkers;

    return (
        <Box sx={{ py: { xs: 6, md: 10 }, background: 'linear-gradient(0deg, #F5F8FB, #F5F8FB), radial-gradient(54.09% 186.87% at -5.6% 119.55%, #D5ECF7 0%, rgba(245, 248, 251, 0) 100%), radial-gradient(38.42% 203.54% at 102.14% -7.98%, #E4E6FA 0%, rgba(245, 248, 251, 0) 100%)' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6, position: 'relative' }}>
                    <Typography variant="h3" textAlign="center" sx={{ flexGrow: 1 }}>
                        PRO specialists
                    </Typography>

                    <Button
                        component={RouterLink}
                        href={paths.services.index}
                        variant="outlined"
                        size="small"
                        sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: '#5D6681', borderColor: '#D7DBE9', position: 'absolute', right: '0', top: '15%' }}
                    >
                        All PRO specialists
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {!downSm && (
                            <Grid container spacing={{ sm: 2, md: 3, lg: 4 }}>
                                {currentWorkers.map((worker) => (
                                    <Grid item xs={12} sm={6} md={4} key={worker.id}>
                                        <WorkerCard worker={worker} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {downSm && (
                            <>
                                <SwipeableViews index={slide} onChangeIndex={setSlide} enableMouseEvents>
                                    {slidesMobile.map((worker) => (
                                        <Box key={worker.id} sx={{ px: 1 }}>
                                            <WorkerCard worker={worker} />
                                        </Box>
                                    ))}
                                </SwipeableViews>

                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                                    {slidesMobile.map((_, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                backgroundColor: slide === i ? theme.palette.primary.main : theme.palette.grey[400],
                                                transition: 'background-color .3s',
                                            }}
                                        />
                                    ))}
                                </Box>

                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Button component={RouterLink} href={paths.services.index} variant="outlined" size="medium">
                                        All PRO specialists
                                    </Button>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};