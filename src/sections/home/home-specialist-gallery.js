import {Box, Button, CircularProgress, Container, Grid, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useEffect, useState} from "react";
import SwipeableViews from 'react-swipeable-views';
import {roles} from "src/roles";
import {profileApi} from "src/api/profile";
import {paths} from "src/paths";
import {RouterLink} from "src/components/router-link";
import useDictionary from "src/hooks/use-dictionaries";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";

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
                                    <Grid item xs={12} sm={4} md={3} key={worker.id}>
                                        <VerticalPreviewCard
                                            data={mapWorkerToPreviewData(worker, theme)}
                                            theme={theme}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {downSm && (
                            <>
                                <SwipeableViews index={slide} onChangeIndex={setSlide} enableMouseEvents>
                                    {slidesMobile.map((worker) => (
                                        <Box key={worker.id} sx={{ px: 1 }}>
                                            <VerticalPreviewCard
                                                data={mapWorkerToPreviewData(worker, theme)}
                                                theme={theme}
                                            />
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