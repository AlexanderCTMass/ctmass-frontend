import { useEffect, useRef } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

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
        <>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'common.white',
                    textAlign: 'center',
                    py: { xs: 7, md: 10 },
                    px: 2,
                    background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack spacing={3} alignItems="center">
                        <Typography
                            component="span"
                            variant="overline"
                            sx={{ letterSpacing: 4, opacity: 0.85 }}
                        >
                            How It Works
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800 }}>
                            From your first request to project completion
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ maxWidth: 680, fontWeight: 400, opacity: 0.9 }}
                        >
                            A simple, transparent process — see exactly what happens at every step.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                href={paths.request.index}
                                startIcon={<ArrowDownwardIcon />}
                                sx={{
                                    px: 4,
                                    py: 1.25,
                                    backgroundColor: 'common.white',
                                    color: 'primary.main',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    '&:hover': { backgroundColor: 'grey.100' },
                                    '@media (max-width:400px)': { px: 2, fontSize: '0.8125rem' },
                                }}
                            >
                                Post Your Request — It's Free
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleWatchVideo}
                                startIcon={<PlayCircleOutlineIcon />}
                                sx={{
                                    px: 4,
                                    py: 1.25,
                                    color: 'common.white',
                                    borderColor: 'rgba(255,255,255,0.7)',
                                    '&:hover': {
                                        borderColor: 'common.white',
                                        backgroundColor: 'rgba(255,255,255,0.12)',
                                    },
                                    '@media (max-width:400px)': { px: 2, fontSize: '0.8125rem' },
                                }}
                            >
                                Watch the video
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: { xs: 6, md: 8 }, px: { xs: 0, sm: 3 } }}>
                <Stack spacing={3} alignItems="center" ref={videoRef}>
                    <Typography variant="h4" align="center" sx={{ px: { xs: 2, sm: 0 } }}>
                        Watch how CTMASS works
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: { xs: 0, sm: 4 },
                            overflow: 'hidden',
                            boxShadow: (theme) => theme.shadows[8],
                        }}
                    >
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
                                backgroundColor: 'common.black',
                                objectFit: 'cover',
                                aspectRatio: { xs: '6 / 5', sm: 'auto' },
                            }}
                        >
                            <source src="/assets/video/ctmassServiceVideo.mp4" type="video/mp4" />
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </>
    );
};

export default HowItWorksHero;
