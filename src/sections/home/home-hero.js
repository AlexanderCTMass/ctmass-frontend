import {
    Box, CircularProgress,
    Container,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { BRAND, displayTitleSx, reducedMotion } from 'src/theme/ctmass-tokens';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useMemo, useState } from "react";
import useDictionary from "src/hooks/use-dictionaries";
import SpecialistsCloud from "src/sections/home/specialist-cloud";
import { useWorkerShowcase } from "src/queries/use-worker-profiles";
import { useUserSpecialtyIds } from "src/queries/use-user-specialties";

const rise = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
`;

const rollIn = keyframes`
    from { opacity: 0; transform: translateY(0.45em); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

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
    const { specialties } = useDictionary();
    const { data: userSpecialtyIds = [] } = useUserSpecialtyIds();

    return useMemo(
        () => specialties.allIds
            .filter((id) => userSpecialtyIds.includes(id))
            .map((id) => {
                const specialty = specialties.byId[id];
                return {
                    label: specialty.label,
                    id: specialty.id,
                    fullId: specialty.path,
                    popularity: userSpecialtyIds.filter((x) => x === specialty.id).length / userSpecialtyIds.length || 0
                };
            })
            .slice(0, 20),
        [specialties, userSpecialtyIds]
    );
};

export const HomeHero = () => {
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const {specialties} = useDictionary();
    const {data: workers = [], isLoading: loading} = useWorkerShowcase(12);

    const [slideImage, setSlideImage] = useState(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                setSlideImage((prev) => (prev < 10 ? prev + 1 : 1));
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const recent = useMemo(() => {
        const mapped = workers.map((w) => ({
            ...w,
            specialties: w.specialties ? w.specialties.map((id) => specialties.byId[id]) : w.specialties
        }));

        return [...mapped]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6);
    }, [workers, specialties]);

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: downMd ? 0 : 450, pt: { md: 6 } }}>
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url("/assets/home-hero-states.svg")',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: { xs: '150%', sm: '100%', md: 'contain' },
                    backgroundPosition: { xs: '30% 100%', md: '60% 42%' },
                    opacity: { xs: 0.7, md: 1 },
                    pointerEvents: 'none'
                }}
            />

            <Container sx={{ position: 'relative', pt: downSm ? 18 : downMd ? 20 : 8, pb: downMd ? 3 : 0 }}>
                <Grid container alignItems="center">
                    <Grid xs={12} md={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    component="h1"
                                    sx={{
                                        ...displayTitleSx,
                                        fontSize: { xs: 28, sm: 40, md: 52 },
                                        animation: `${rise} .6s cubic-bezier(.2,.7,.2,1) both`,
                                        [reducedMotion]: { animation: 'none' }
                                    }}
                                >
                                    Find and book a
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            mt: 0.5,
                                            color: BRAND.green,
                                            fontSize: { xs: 38, sm: 52, md: 68 },
                                            lineHeight: 1.02,
                                            minHeight: { xs: '2.04em', sm: '1.02em' }
                                        }}
                                    >
                                        LOCAL{' '}
                                        <Box
                                            key={slideImage}
                                            component="span"
                                            sx={{
                                                display: 'inline-block',
                                                animation: `${rollIn} .55s cubic-bezier(.2,.8,.2,1) both`,
                                                [reducedMotion]: { animation: 'none' }
                                            }}
                                        >
                                            {slideTitles[slideImage]}
                                        </Box>
                                    </Box>
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: { xs: 1.5, md: 2.5 },
                                        mb: { xs: 2.5, md: 6 },
                                        color: BRAND.muted,
                                        fontSize: { xs: 15, md: 18 },
                                        fontWeight: 500,
                                        animation: `${rise} .6s .12s cubic-bezier(.2,.7,.2,1) both`,
                                        [reducedMotion]: { animation: 'none' }
                                    }}
                                >
                                    Trusted pros in Connecticut and Massachusetts.
                                    <Box component="br" sx={{ display: { xs: 'none', sm: 'block' } }} />
                                    {' '}Free for homeowners, always.
                                </Typography>
                            </Box>

                            {downMd && (
                                <Box
                                    aria-hidden
                                    sx={{
                                        flexShrink: 0,
                                        width: { xs: 120, sm: 200 },
                                        height: { xs: 150, sm: 240 },
                                        background: `url(/assets/gallery/plumbers/${slideImage}.png) center/contain no-repeat`,
                                        transition: 'background .4s ease'
                                    }}
                                />
                            )}
                        </Stack>
                    </Grid>

                    {!downMd && (
                        <Grid xs={12} md={5}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <SpecialistsCloud specialists={recent} />
                            )}
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export const HomeHeroShell = ({ children }) => (
    <Box
        component="section"
        sx={{
            position: 'relative',
            pb: { xs: 6, md: 10 },
            backgroundImage: `
                radial-gradient(90% 60% at 0% 0%, rgba(9,133,221,0.13) 0%, rgba(9,133,221,0) 60%),
                radial-gradient(90% 60% at 100% 85%, rgba(0,174,128,0.13) 0%, rgba(0,174,128,0) 60%)
            `,
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: `
                    linear-gradient(${alpha(BRAND.navy, 0.06)} 1px, transparent 1px),
                    linear-gradient(90deg, ${alpha(BRAND.navy, 0.06)} 1px, transparent 1px),
                    linear-gradient(${alpha(BRAND.navy, 0.025)} 1px, transparent 1px),
                    linear-gradient(90deg, ${alpha(BRAND.navy, 0.025)} 1px, transparent 1px)
                `,
                backgroundSize: '96px 96px, 96px 96px, 24px 24px, 24px 24px',
                WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 85%)',
                maskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 85%)'
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '1px',
                pointerEvents: 'none',
                background: `linear-gradient(90deg, transparent, ${alpha(BRAND.navy, 0.12)}, transparent)`
            }
        }}
    >
        {children}
    </Box>
);
