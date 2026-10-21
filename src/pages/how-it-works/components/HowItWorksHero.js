import { useEffect, useRef } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { blueprintBackdropSx, btn } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const HowItWorksHero = () => {
    const videoRef = useRef(null);
    const mediaRef = useRef(null);

    useEffect(() => {
        const el = mediaRef.current;
        if (!el) {
            return undefined;
        }

        let removeInteractionListeners = () => {};

        const tryPlay = () => {
            const playPromise = el.play();
            return playPromise && typeof playPromise.catch === 'function'
                ? playPromise
                : Promise.resolve();
        };

        const enableSound = () => {
            el.muted = false;
            el.volume = 1;
            return tryPlay();
        };

        const unmuteOnInteraction = () => {
            const events = ['pointerdown', 'touchstart', 'keydown', 'click'];
            const handler = () => {
                enableSound().catch(() => {});
                removeInteractionListeners();
            };
            events.forEach((evt) => window.addEventListener(evt, handler, { passive: true }));
            removeInteractionListeners = () => {
                events.forEach((evt) => window.removeEventListener(evt, handler));
            };
        };

        enableSound().catch(() => {
            el.muted = true;
            tryPlay().catch(() => {});
            unmuteOnInteraction();
        });

        return () => removeInteractionListeners();
    }, []);

    const handleWatchVideo = () => {
        videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <Box component="section" sx={{ ...blueprintBackdropSx, pt: { xs: 15, md: 19 }, pb: { xs: 6, md: 10 } }}>
            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' },
                        alignItems: 'end',
                        gap: { xs: 3, md: 6 }
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 36, sm: 46, md: 58 }, lineHeight: 1.04, maxWidth: 760 }}>
                            From your first request to a finished project
                        </Typography>
                        <Typography sx={{ mt: { xs: 2, md: 2.5 }, maxWidth: 560, color: BRAND.muted, fontSize: { xs: 16, md: 18 }, fontWeight: 500, lineHeight: 1.6 }}>
                            A simple, transparent process. Watch the short video, then see exactly what happens at every step.
                        </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row', md: 'column', lg: 'row' }} spacing={1.5}>
                        <Button component={RouterLink} href={paths.request.index} sx={{ ...btn.green, minHeight: 54, px: 3.5, fontSize: 16 }}>
                            Describe a project
                        </Button>
                        <Button
                            onClick={handleWatchVideo}
                            startIcon={<PlayCircleOutlineIcon />}
                            sx={{ ...btn.outline, minHeight: 54, px: 3, fontSize: 16, display: { md: 'none' } }}
                        >
                            Watch the video
                        </Button>
                    </Stack>
                </Box>

                <Box
                    ref={videoRef}
                    sx={{
                        position: 'relative',
                        mt: { xs: 4, md: 6 },
                        mx: { xs: -2, sm: 0 },
                        p: { xs: 0, sm: 1.25, md: 1.5 },
                        borderRadius: { xs: 0, sm: RADIUS.panel },
                        background: { sm: `linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)` },
                        boxShadow: { sm: SHADOW.lg }
                    }}
                >
                    <Box sx={{ overflow: 'hidden', borderRadius: { xs: 0, sm: '20px' }, bgcolor: '#000000' }}>
                        <Box
                            ref={mediaRef}
                            component="video"
                            autoPlay
                            loop
                            controls
                            playsInline
                            preload="auto"
                            sx={{
                                width: '100%',
                                display: 'block',
                                objectFit: 'cover',
                                aspectRatio: { xs: '6 / 5', sm: 'auto' }
                            }}
                        >
                            <source src="/assets/video/ctmassServiceVideo.mp4" type="video/mp4" />
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HowItWorksHero;
