import { useEffect, useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

const HowItWorksHero = () => {
    const [video, setVideo] = useState('');

    useEffect(() => {
        const videos = ['People_Technology', 'People_Technology_2'];
        setVideo(videos[Math.floor(Math.random() * videos.length)]);
    }, []);

    return (
        <Box
            sx={{
                position: 'relative',
                height: '60vh',
                minHeight: 500,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'common.white',
                textAlign: 'center',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    zIndex: 1,
                },
            }}
        >
            {video && (
                <Box
                    component="video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 0,
                    }}
                >
                    <source src={`/assets/video/${video}.mp4`} type="video/mp4" />
                </Box>
            )}

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Stack spacing={3} alignItems="center">
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary.main"
                        display="block"
                        sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        How It Works
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{ maxWidth: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        From your first request to project completion — a simple, transparent process
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        href={paths.request.index}
                        startIcon={<ArrowDownwardIcon />}
                        sx={{ mt: 3 }}
                    >
                        Post Your Request — It's Free
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
};

export default HowItWorksHero;
