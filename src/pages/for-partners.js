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
import HandshakeIcon from '@mui/icons-material/Handshake';
import CampaignIcon from '@mui/icons-material/Campaign';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmailIcon from '@mui/icons-material/Email';
import { useEffect, useState } from 'react';
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";

const videos = ["guitar", "woman", "phone", "cleaning"];

const Page = () => {
    usePageView();
    const [video, setVideo] = useState('');

    useEffect(() => {
        setVideo(videos[Math.floor(Math.random() * videos.length)]);
    }, []);

    return (
        <>
            <Seo title="For Partners" />
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
                                    For Partners
                                </Typography>
                            </Typography>
                            <Typography variant="h4" sx={{ maxWidth: '800px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Grow your business with our network of contractors and homeowners
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.partners.apply}
                                component={RouterLink}
                                startIcon={<EmailIcon />}
                                sx={{ mt: 3 }}
                            >
                                Apply Now
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
                            If your target audience includes local contractors and homeowners, this is for you
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'primary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <HandshakeIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Partnership Opportunities
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            We're a local startup from Western Massachusetts building a free platform connecting contractors and homeowners.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'secondary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <CampaignIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            High-Impact Marketing
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Reach your audience through our digital marketing with 1,000+ daily views.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'info.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <AnalyticsIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Performance-Based
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Pay only for real leads - 2–3x cheaper than alternatives with no upfront payment.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 8 }} />

                        <Box sx={{ mb: 8 }}>
                            <Typography variant="h3" align="center" gutterBottom>
                                Our Services for Partners
                            </Typography>
                            <Grid container spacing={4} sx={{ mt: 4 }}>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Digital Marketing Campaigns
                                            </Typography>
                                            <Typography>
                                                Google, Instagram, Facebook advertising tailored for your audience.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Web Solutions
                                            </Typography>
                                            <Typography>
                                                Custom landing pages, website design, and support services.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Marketplace Integration
                                            </Typography>
                                            <Typography>
                                                Connect your products/services with our growing network.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                SEO Optimization
                                            </Typography>
                                            <Typography>
                                                Improve your online visibility and search rankings.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                CRM Solutions
                                            </Typography>
                                            <Typography>
                                                Setup and support for customer relationship management.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Network Access
                                            </Typography>
                                            <Typography>
                                                Direct access to our contractor network with detailed analytics.
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
                                <HandshakeIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="h3" component="h2" gutterBottom>
                                Let's Build Success Together
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                                Our team of marketing and software professionals is here to help your business grow.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.partners.apply}
                                component={RouterLink}
                                startIcon={<EmailIcon />}
                                sx={{ mt: 2, px: 6, py: 2 }}
                            >
                                Apply Now
                            </Button>
                            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                                Email: support@ctmass.com
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default Page;