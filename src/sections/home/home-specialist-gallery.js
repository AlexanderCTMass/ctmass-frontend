import {Box, CircularProgress, Container, Stack, Typography, useMediaQuery, Link} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import {useEffect, useState} from "react";
import {roles} from "src/roles";
import {profileApi} from "src/api/profile";
import {INFO} from "src/libs/log";
import {SpecialistMicroPreview} from "src/sections/components/specialist/specialist-micro-preview";
import {paths} from "src/paths";
import {RouterLink} from "src/components/router-link";
import useDictionary from "src/hooks/use-dictionaries";

export const HomeSpecialistGallery = () => {
    const theme = useTheme();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [workersMap, setWorkersMap] = useState(null);
    const {specialties} = useDictionary();
    const [currentWorkers, setCurrentWorkers] = useState([]);
    const [allWorkers, setAllWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true);
                const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 12); // Берем больше специалистов для ротации
                workers.forEach(worker => {
                    if (worker.specialties) {
                        worker.specialties = worker.specialties.map(specialty => specialties.byId[specialty])
                    }
                });
                setAllWorkers(workers);
                setCurrentWorkers(workers.slice(0, 12)); // Первоначально показываем 12
                setLoading(false);
            } catch (error) {
                console.error("Error fetching workers:", error);
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

    return (
        <Box sx={{pt: "0px", pb: '40px'}}>
            <Container maxWidth="lg" sx={{py: 2}}>
                <Typography
                    align="center"
                    variant="h3"
                    sx={{mb: 8}}
                >
                    Specialists Gallery
                </Typography>
                {loading ? (
                    <CircularProgress/>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 3,
                                justifyContent: downSm ? 'center' : 'flex-start',
                                '& > *': {
                                    flex: downSm ? '0 0 100%' : '0 0 calc(33.333% - 16px)',
                                    maxWidth: downSm ? '100%' : 'calc(33.333% - 16px)',
                                    [theme.breakpoints.down('md')]: {
                                        flex: '0 0 calc(50% - 16px)',
                                        maxWidth: 'calc(50% - 16px)'
                                    },
                                    [theme.breakpoints.down('sm')]: {
                                        flex: '0 0 calc(100% - 16px)',
                                        maxWidth: 'calc(100% - 16px)'
                                    },
                                    transition: 'opacity 0.5s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.03)',
                                        transition: 'transform 0.3s ease-in-out'
                                    }
                                }
                            }}
                        >
                            {currentWorkers.map((worker, index) => (
                                <SpecialistMicroPreview
                                    key={`${worker.id}-${index}`}
                                    specialist={worker}
                                    to={paths.specialist.publicPage.replace(':profileId', worker.id)}
                                />
                            ))}
                        </Box>
                        <Box sx={{mt: 4, textAlign: 'center'}}>
                            <Link
                                component={RouterLink}
                                href={paths.specialist.all}
                                sx={{
                                    fontSize: '1.1rem',
                                    fontWeight: 500,
                                    '&:hover': {
                                        color: theme.palette.primary.dark
                                    }
                                }}
                            >
                                View All Specialists →
                            </Link>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
};