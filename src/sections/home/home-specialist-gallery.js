import {Box, Button, CircularProgress, Container, Grid, Typography, useMediaQuery} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useTheme} from '@mui/material/styles';
import {useMemo, useState} from "react";
import SwipeableViews from 'react-swipeable-views';
import {paths} from "src/paths";
import {RouterLink} from "src/components/router-link";
import useDictionary from "src/hooks/use-dictionaries";
import {useWorkerShowcase} from "src/queries/use-worker-profiles";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";

export const HomeSpecialistGallery = () => {
    const theme = useTheme();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const { specialties } = useDictionary();
    const { data: workers = [], isLoading: loading } = useWorkerShowcase(12);
    const [slide, setSlide] = useState(0);

    const currentWorkers = useMemo(
        () => workers.slice(0, 12).map((worker) => ({
            ...worker,
            specialties: worker.specialties
                ? worker.specialties.map((specialty) => specialties.byId[specialty])
                : worker.specialties
        })),
        [workers, specialties]
    );
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
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" sx={{ mb: { xs: 2, md: 3 } }}>
                        PRO specialists
                    </Typography>

                    <Box
                        sx={{
                            maxWidth: 760,
                            mx: 'auto',
                            p: { xs: 2.5, md: 3.5 },
                            borderRadius: 4,
                            border: '1px solid #D7DBE9',
                            backgroundColor: 'rgba(255, 255, 255, 0.55)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#2B2F38', fontWeight: 700 }}>
                            Use Advanced Search to find contractors by ZIP code, location, driving distance, trade and more
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#5D6681' }}>
                            Search filters: Location, Distance, Trade, Rating, and Availability.
                        </Typography>
                        <Button
                            component={RouterLink}
                            href={paths.services.index}
                            variant="contained"
                            size="large"
                            startIcon={<SearchIcon />}
                            sx={{ mt: 1, px: 4, py: 1.25, borderRadius: 2 }}
                        >
                            All PRO specialists
                        </Button>
                    </Box>
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
                                    <Grid item xs={12} sm={4} md={3} key={worker.id}>
                                        <Box
                                            component={RouterLink}
                                            href={paths.specialist.publicPage.replace(':profileId', worker.id)}
                                            sx={{ textDecoration: 'none', display: 'block' }}
                                        >
                                            <VerticalPreviewCard
                                                data={mapWorkerToPreviewData(worker, theme)}
                                                theme={theme}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {downSm && (
                            <>
                                <SwipeableViews index={slide} onChangeIndex={setSlide} enableMouseEvents>
                                    {slidesMobile.map((worker) => (
                                        <Box key={worker.id} sx={{ px: 1 }}>
                                            <Box
                                                component={RouterLink}
                                                href={paths.specialist.publicPage.replace(':profileId', worker.id)}
                                                sx={{ textDecoration: 'none', display: 'block', mx: 'auto', '@media (max-width:420px)': { maxWidth: 220 } }}
                                            >
                                                <VerticalPreviewCard
                                                    data={mapWorkerToPreviewData(worker, theme)}
                                                    theme={theme}
                                                />
                                            </Box>
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
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};