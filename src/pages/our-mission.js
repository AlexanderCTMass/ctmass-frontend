import {
    Box,
    Container,
    Divider,
    Stack,
    Typography,
    Unstable_Grid2 as Grid,
    Avatar,
    Card,
    CardContent,
} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {HomeCta} from '../sections/home/home-cta';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StarIcon from '@mui/icons-material/Star';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="Our mission"/>
            <Box
                component="main"
                sx={{flexGrow: 1}}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.800'
                            : 'neutral.50',
                        pb: '40px',
                        pt: '120px'
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={3} alignItems="center">
                            <Typography variant="h1" align="center">
                                <Typography component="span" variant="h3" color="primary.main" display="block">
                                    Empowering Connections
                                </Typography>
                                <Typography component="span" variant="h3" color="primary.main" display="block" sx={{ mt: 1.4 }}>
                                    Building Trust
                                </Typography>
                            </Typography>
                            <Typography variant="body1" align="center" sx={{color: 'gray', maxWidth: '700px'}}>
                                At CTMASS, our mission is to create a reliable, secure and innovative platform where
                                service providers and customers seamlessly connect to achieve their goals. We envision a
                                world where finding trusted professionals that provide high-quality services is
                                effortless.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.900'
                            : 'neutral.100',
                        py: 5
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'primary.main', mb: 2, mx: 'auto'}}>
                                            <EmojiObjectsIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Solutions for Every Need
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            Find the ideal local professional for any home project, from minor repairs to major renovations, all in one convenient place.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'secondary.main', mb: 2, mx: 'auto'}}>
                                            <HandshakeIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Building Relationships
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            Connect directly with skilled, experienced, and local contractors ready to address your home service needs.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>

                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'info.main', mb: 2, mx: 'auto'}}>
                                            <TrendingUpIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Commitment to Quality
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            We are committed to building a trusted community for homeowners and professionals, ensuring quality service and reliable connections.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{my: 1}}/>

                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6} md={6}>
                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'warning.main', mb: 2, mx: 'auto'}}>
                                            <FitnessCenterIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Empowering Customers
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            Expand your business and connect with customers – list your services on CTMASS at no cost.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={6}>
                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'info.main', mb: 2, mx: 'auto'}}>
                                            <TrendingUpIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Verified Professionals
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            Hire with confidence, knowing you are selecting from trusted professionals with verified reviews.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;