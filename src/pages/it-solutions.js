import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Stack,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CloudIcon from '@mui/icons-material/Cloud';
import EmailIcon from '@mui/icons-material/Email';
import GetAppIcon from '@mui/icons-material/GetApp';
import LayersIcon from '@mui/icons-material/Layers';
import { useEffect, useState } from 'react';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { AppDownload } from 'src/sections/it-solutions/app-download';
import { ItServices } from 'src/sections/it-solutions/it-services';

const HIGHLIGHTS = [
    {
        icon: <CodeIcon fontSize="large" />,
        color: 'primary.main',
        title: 'Full-Cycle Development',
        description: 'From concept to deployment — design, code, infrastructure and support handled by one team.'
    },
    {
        icon: <DesignServicesIcon fontSize="large" />,
        color: 'secondary.main',
        title: 'Custom Solutions',
        description: 'No cookie-cutter templates. We build exactly what your business needs, around how it really works.'
    },
    {
        icon: <CloudIcon fontSize="large" />,
        color: 'info.main',
        title: 'Modern Stack & AI',
        description: 'React, React Native, Firebase, cloud functions and AI automation — future-proof from day one.'
    }
];

const Page = () => {
    usePageView();
    const [video, setVideo] = useState('');

    useEffect(() => {
        const videos = ['People_Technology', 'People_Technology_2'];
        setVideo(videos[Math.floor(Math.random() * videos.length)]);
    }, []);

    const handleScrollTo = (id) => (event) => {
        event.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <Seo
                title="Professional IT Solutions"
                description="Custom web and mobile development, AI automation, CRM systems and tech support from the CTMASS IT team. Install the CTMASS app and see our work first-hand."
            />
            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}
            >
                {/* Hero Section with Video Background */}
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
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1
                        }
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
                                zIndex: 0
                            }}
                        >
                            <source src={`/assets/video/${video}.mp4`} type="video/mp4" />
                        </Box>
                    )}

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                        <Stack spacing={3} alignItems="center">
                            <Typography variant="h1" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', pt: 4 }}>
                                <Typography component="span" variant="h2" color="primary.main" display="block">
                                    Professional IT Solutions
                                </Typography>
                            </Typography>
                            <Typography variant="h4" sx={{ maxWidth: '800px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Your complete tech team - we build custom solutions that drive business growth
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mt: 3 }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    href={paths.contact}
                                    component={RouterLink}
                                    startIcon={<EmailIcon />}
                                >
                                    Get a Free Consultation
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    href="#get-the-app"
                                    onClick={handleScrollTo('get-the-app')}
                                    startIcon={<GetAppIcon />}
                                    sx={{
                                        color: 'common.white',
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        '&:hover': { borderColor: 'common.white', backgroundColor: 'rgba(255,255,255,0.12)' }
                                    }}
                                >
                                    Get the App
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    href="#our-it-services"
                                    onClick={handleScrollTo('our-it-services')}
                                    startIcon={<LayersIcon />}
                                    sx={{
                                        color: 'common.white',
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        '&:hover': { borderColor: 'common.white', backgroundColor: 'rgba(255,255,255,0.12)' }
                                    }}
                                >
                                    Check Out Our IT Services
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>

                <Box id="get-the-app" sx={{ backgroundColor: 'background.paper', scrollMarginTop: 80 }}>
                    <Container maxWidth="lg">
                        <AppDownload />
                    </Container>
                </Box>

                {/* Content Section */}
                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.900'
                            : 'neutral.100',
                        py: 8
                    }}
                >
                    <Container maxWidth="lg">
                        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6 }}>
                            The CTMASS IT Team - Your Full-Service Technology Partner
                        </Typography>

                        <Grid container spacing={4}>
                            {HIGHLIGHTS.map((highlight) => (
                                <Grid xs={12} sm={6} md={4} key={highlight.title}>
                                    <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                        <CardContent>
                                            <Avatar sx={{ bgcolor: highlight.color, mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                                {highlight.icon}
                                            </Avatar>
                                            <Typography variant="h5" component="h3" gutterBottom>
                                                {highlight.title}
                                            </Typography>
                                            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                                {highlight.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 8 }} />

                        <Box id="our-it-services" sx={{ scrollMarginTop: 80 }}>
                            <ItServices />
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            p: 6,
                            textAlign: 'center',
                            boxShadow: (theme) => theme.shadows[4]
                        }}>
                            <Avatar sx={{
                                bgcolor: 'warning.main',
                                mb: 3,
                                mx: 'auto',
                                width: 80,
                                height: 80,
                                '& .MuiSvgIcon-root': { fontSize: '2.5rem' }
                            }}>
                                <CodeIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="h3" component="h2" gutterBottom>
                                No Project Too Big or Too Small
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                                Whether you need a simple business website or a complex enterprise system -
                                we have the skills, experience, and dedication to deliver exceptional results.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.contact}
                                component={RouterLink}
                                startIcon={<EmailIcon />}
                                sx={{ mt: 2, px: 6, py: 2 }}
                            >
                                Start Your Project Today
                            </Button>
                            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                                Email: support@ctmass.com | Response within 24 hours
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default Page;
