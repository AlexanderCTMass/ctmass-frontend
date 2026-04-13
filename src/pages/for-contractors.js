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
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
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
            <Seo title="For Contractors" />
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
                                    For Contractors
                                </Typography>
                            </Typography>
                            <Typography variant="h4" sx={{ maxWidth: '800px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                From One Contractor to Another – Why I Built CTMASS
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                href={paths.register.serviceProvider}
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
                            Thank you for your valuable time — I know as a contractor, your schedule is packed with ongoing projects.
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'primary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <ConstructionIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Free Premium Account
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            For the first 1000 contractors in MA & CT. No hidden fees — ever.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'secondary.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <GroupsIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Connect & Grow
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Build your network with local colleagues and homeowners.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                    <CardContent>
                                        <Avatar sx={{ bgcolor: 'info.main', mb: 3, mx: 'auto', width: 60, height: 60 }}>
                                            <EmojiEventsIcon fontSize="large" />
                                        </Avatar>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Build Your Reputation
                                        </Typography>
                                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                                            Showcase your work and collect reviews from clients.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 8 }} />

                        <Box sx={{ mb: 8 }}>
                            <Typography variant="h3" align="center" gutterBottom>
                                Meet Yakov - The Founder
                            </Typography>
                            <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4 }}>
                                "I'm a contractor just like you, building something better for our community"
                            </Typography>
                            <Grid container spacing={4}>
                                <Grid xs={12} md={6}>
                                    <Card sx={{ p: 3, height: '100%' }}>
                                        <CardContent>
                                            <Typography paragraph>
                                                Hi, I'm Yakov. I live and work in Western Massachusetts and work as a maintenance engineer at Hilton Hartford and Cooley Dickinson Center. I also do house flipping across MA and CT and have a Construction Supervisor License.
                                            </Typography>
                                            <Typography paragraph>
                                                I'm also an HVAC installer and Computer Science engineer — probably a lot like you: working hard every day to support my family and build a solid reputation.
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                component={RouterLink}
                                                href="/contractors/first1000/I2snJZ2WOXc8MoTfqQ5f4IjVtLw1"
                                                startIcon={<ConnectWithoutContactIcon />}
                                            >
                                                Visit My Profile
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <Card sx={{ p: 3, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Why I built CTMASS:
                                            </Typography>
                                            <Typography paragraph>
                                                One problem I kept facing was finding and connecting with reliable, reputable contractors in the area. So I decided to build a solution. CTMASS.com is a <Box component="span" sx={{ fontWeight: 700 }}>Completely FREE</Box>, local platform for Massachusetts and Connecticut where contractors and homeowners can connect, work together, and grow their network.
                                            </Typography>
                                            <Typography paragraph>
                                                You can post projects, connect with trusted professionals, leave reviews, share articles, and use a built-in marketplace to rent or sell tools, equipment and materials.
                                            </Typography>
                                            <Typography paragraph>
                                                I’m building this for the community — your feedback matters. Join early and help shape the platform.
                                            </Typography>
                                            <Typography component="div" paragraph>
                                                <Box component="span" sx={{ fontWeight: 700, display: 'block' }}>Earn coins for every action — post, connect, invite.</Box>
                                                <Box component="span" sx={{ display: 'block' }}>Use them later for promotion and visibility.</Box>
                                                <Box component="span" sx={{ display: 'block' }}>Early users earn the most — rewards decrease as we grow.</Box>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 8 }} />

                        <Box sx={{ mb: 8 }}>
                            <Typography variant="h3" align="center" gutterBottom>
                                Coming Soon Features
                            </Typography>
                            <Grid container spacing={4}>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Messaging System
                                            </Typography>
                                            <Typography>
                                                No need to use Facebook to communicate with clients and colleagues.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Local Deals
                                            </Typography>
                                            <Typography>
                                                See competitive prices from nearby supply stores.
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
                                                iOS & Android apps with powerful tools for your business.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Video Profiles
                                            </Typography>
                                            <Typography>
                                                Introduce yourself and your services through video.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} sm={6} md={4}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                Knowledge Sharing
                                            </Typography>
                                            <Typography>
                                                Share tips and stories through posts and blogs.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 8 }} />

                        <Box sx={{ mb: 8 }}>
                            <Typography variant="h3" align="center" gutterBottom>
                                Future Plans (Your Feedback Needed!)
                            </Typography>
                            <Grid container spacing={4}>
                                <Grid xs={12} md={4}>
                                    <Card sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'primary.light' }}>
                                        <CardContent>
                                            <Typography variant="h5" color="primary" gutterBottom>
                                                BASIC (Free Forever)
                                            </Typography>
                                            <Typography paragraph>
                                                Perfect for getting started — and it will always stay free.
                                            </Typography>
                                            <Typography component="div">
                                                <ul>
                                                    <li>Post and find projects</li>
                                                    <li>Make updates and posts</li>
                                                    <li>Search and connect with other contractors</li>
                                                    <li>View and explore portfolios</li>
                                                    <li>Homeowners can message you (with limitations)</li>
                                                </ul>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} md={4}>
                                    <Card sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'secondary.light' }}>
                                        <CardContent>
                                            <Typography variant="h5" color="secondary" gutterBottom>
                                                PRO ($15–$20/month)
                                            </Typography>
                                            <Typography paragraph>
                                                Ideal for active contractors looking to grow.
                                            </Typography>
                                            <Typography component="div">
                                                <ul>
                                                    <li>Everything in BASIC, plus:</li>
                                                    <li>Advanced contractor search</li>
                                                    <li>Direct messaging from homeowners</li>
                                                    <li>Calendar sync with Google Calendar</li>
                                                    <li>Create your own Building Community networks</li>
                                                </ul>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid xs={12} md={4}>
                                    <Card sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'warning.light' }}>
                                        <CardContent>
                                            <Typography variant="h5" color="warning.main" gutterBottom>
                                                PREMIUM ($200+/month)
                                            </Typography>
                                            <Typography paragraph>
                                                For businesses serious about visibility and leads.
                                            </Typography>
                                            <Typography component="div">
                                                <ul>
                                                    <li>Everything in PRO, plus:</li>
                                                    <li>Dedicated digital marketing specialist</li>
                                                    <li>50% of fee goes to Facebook/Instagram/Google ads</li>
                                                    <li>Personal marketing expert support</li>
                                                    <li>Weekly performance reports</li>
                                                    <li>Guaranteed boost in visibility</li>
                                                </ul>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                                Try any plan FREE for 2 weeks — no obligation, just results.
                            </Typography>
                        </Box>

                        <Box sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            p: 6,
                            textAlign: 'center',
                            boxShadow: (theme) => theme.shadows[4]
                        }}>
                            <Avatar sx={{
                                bgcolor: 'success.main',
                                mb: 3,
                                mx: 'auto',
                                width: 80,
                                height: 80,
                                '& .MuiSvgIcon-root': { fontSize: '2.5rem' }
                            }}>
                                <ConstructionIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="h3" component="h2" gutterBottom>
                                Join the Contractor Revolution
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                                A platform built by contractors, for contractors.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                href={paths.register.serviceProvider}
                                component={RouterLink}
                                sx={{ mt: 2, px: 6, py: 2 }}
                            >
                                Get Started - CTMASS.com
                            </Button>
                            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                                Free Premium account for the first 1000 contractors in MA & CT
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default Page;