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
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
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
            <Seo title="For Homeowners" />
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
                                    For Homeowners
                                </Typography>
                            </Typography>
                            <Typography variant="h4" sx={{ maxWidth: '800px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Connect with trusted local professionals for all your home needs
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                href={paths.register.customer}
                                // target="_blank"
                                sx={{ mt: 3 }}
                            >
                                Join Now - CTMASS.com
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
                            Right now, we're building the CTMASS contractor community
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'primary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <HowToRegIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Register as a homeowner
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Create your free account to access our growing network of local professionals.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'secondary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <GroupAddIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Invite Trusted Pros
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Know any reputable contractors? Invite them to join CTMASS and grow our community.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'info.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <FavoriteIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Build Your Favorites
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Save your preferred professionals to help others discover quality services.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

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
                                <LocalActivityIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="h3" component="h2" gutterBottom>
                                Together, we can build better
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                                A community where quality, trust, and local expertise come first.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.register.customer}
                                // target="_blank"
                                component={RouterLink}
                                sx={{ mt: 2, px: 6, py: 2 }}
                            >
                                Start here 👉 CTMASS.com
                            </Button>
                            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                                Thank you for supporting local businesses!
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default Page;