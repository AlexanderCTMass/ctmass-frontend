import {
    Box, CircularProgress,
    Container,
    Typography,
    useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import { INFO } from "src/libs/log";
import useDictionary from "src/hooks/use-dictionaries";
import SpecialistsCloud from "src/sections/home/specialist-cloud";
import {profileApi} from "src/api/profile";
import {roles} from "src/roles";

const slideTitles = {
    1: "PLUMBER",
    2: "HANDYMAN",
    3: "HVAC",
    4: "PLUMBER",
    5: "PLUMBER",
    6: "PLUMBER",
    7: "DESIGNER",
    8: "ROOFER",
    9: "PLUMBER",
    10: "WASHER"
};

export const useSpecialties = (userId) => {
    const { categories, specialties, services } = useDictionary();
    const [filteredSpecialties, setFilteredSpecialties] = useState([])

    useEffect(() => {
        const fetch = async () => {
            const userSpecialtiesSnapshot = await getDocs(collection(firestore, "userSpecialties"))
            const userSpecialtiesData = userSpecialtiesSnapshot.docs.map(doc => doc.data().specialty);
            INFO("userSpecialtiesData", userSpecialtiesData);
            INFO("specialties", specialties);
            const filteredSpecialties = specialties.allIds
                .filter(id => userSpecialtiesData?.includes(id))
                .map((id) => {
                    const specialty = specialties.byId[id];
                    return {
                        label: specialty.label,
                        id: specialty.id,
                        fullId: specialty.path,
                        popularity: userSpecialtiesData.filter(id => id === specialty.id).length / userSpecialtiesData.length || 0
                    };
                })

                .slice(0, 20);

            INFO("filteredSpecialties", filteredSpecialties);

            setFilteredSpecialties(filteredSpecialties);
        };

        if (specialties) {
            fetch();
        }
    }, [specialties]);

    return filteredSpecialties;
};

export const HomeHero = () => {
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const {specialties} = useDictionary();
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [slideImage, setSlideImage] = useState(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSlideImage(prevSlideImage => prevSlideImage < 10 ? prevSlideImage + 1 : 1);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

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

                const recentAdded = [...workers]
                    // .filter((w) => w.reviewCount > 0)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 6);

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
        <Box
            sx={{
                position: 'relative',
                pt: { md: 6 },
                overflow: 'hidden',
                // mt: downMd ? 10 : 9,
                minHeight: '450px',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url("/assets/home-hero-states.svg")',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: { xs: '140%', sm: '100%', md: 'contain' },
                    backgroundPosition: { xs: '50% 100%', md: '60% 42%' },
                    pointerEvents: 'none',
                }}
            />

            <Container sx={{ position: 'relative', pt: downSm || downMd ? 20 : 8 }}>
                <Grid container alignItems={downMd ? 'flex-start' : 'center'} direction={downMd ? 'column-reverse' : 'row'}>
                    <Grid xs={12} md={6} style={{ maxWidth: downMd ? '90vw' : 'none' }} flexDirection={downMd ? 'row' : 'column'} display='flex'>
                        <Box>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#1F2D77', fontSize: downMd ? '20px' : '48px' }}>
                                Find and book a
                                <br />
                                <Typography
                                    component="span"
                                    variant="inherit"
                                    color="#16B364"
                                    fontSize={downMd ? '38px' : '58px'}
                                >
                                    LOCAL {slideTitles[slideImage]}
                                </Typography>
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mb: 6, color: '#717381', fontSize: '18px', fontStyle: 'italic' }}>
                                in Connecticut or Massachusetts
                            </Typography>
                        </Box>

                        {downMd && (
                            <Grid
                                xs={12}
                                md={5}
                                sx={{
                                    width: '100%',
                                    height: { xs: 220, sm: 300, md: 380 },
                                    background: `url(/assets/gallery/plumbers/${slideImage}.png) center/contain no-repeat`,
                                    transition: 'background 0.4s ease',
                                }}
                            />
                        )}
                    </Grid>

                    {!downMd && (
                        <Grid
                            xs={12}
                            md={5}
                        >
                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', py: 10}}>
                                    <CircularProgress/>
                                </Box>
                            ) : (
                                <>
                                    <SpecialistsCloud specialists={recent}/>
                                </>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box >
    );
};
