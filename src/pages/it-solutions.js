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
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import { useEffect, useState } from 'react';
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";

const Page = () => {
    usePageView();
    const [video, setVideo] = useState('');

    useEffect(() => {
        const videos = ["People_Technology", "People_Technology_2"];
        setVideo(videos[Math.floor(Math.random() * videos.length)]);
    }, []);

    return (
        <>
            <Seo title="Professional IT Solutions" />
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
                            <Typography variant="h1" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                <Typography component="span" variant="h2" color="primary.main" display="block">
                                    Professional IT Solutions
                                </Typography>
                            </Typography>
                            <Typography variant="h4" sx={{ maxWidth: '800px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Your complete tech team - we build custom solutions that drive business growth
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.contact}
                                component={RouterLink}
                                startIcon={<EmailIcon />}
                                sx={{ mt: 3 }}
                            >
                                Get a Free Consultation - support@ctmass.com
                            </Button>
                        </Stack>
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
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'primary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <CodeIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Full-Cycle Development
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            From concept to deployment - we handle every aspect of your project with expertise.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'secondary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <DesignServicesIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Custom Solutions
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            No cookie-cutter software - we build exactly what your business needs.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'info.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <CloudIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Modern Technologies
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            We use cutting-edge tools and frameworks to future-proof your solutions.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 8 }} />

                        <Box sx={{ mb: 8 }}>
                            <Typography variant="h3" align="center" gutterBottom>
                                Our IT Services
                            </Typography>
                            <Grid container spacing={4} sx={{ mt: 4 }}>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Web Applications
                                            </Typography>
                                            <Typography>
                                                Powerful, scalable web platforms tailored to your business processes.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Mobile Apps
                                            </Typography>
                                            <Typography>
                                                iOS and Android applications that engage your customers and streamline operations.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Business Automation
                                            </Typography>
                                            <Typography>
                                                Custom software to eliminate manual work and boost efficiency.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Database Solutions
                                            </Typography>
                                            <Typography>
                                                Secure, optimized data management systems for your critical information.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                API Integration
                                            </Typography>
                                            <Typography>
                                                Connect your systems with third-party services seamlessly.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Cloud Solutions
                                            </Typography>
                                            <Typography>
                                                Migration, setup, and management of cloud infrastructure.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 8 }} />

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