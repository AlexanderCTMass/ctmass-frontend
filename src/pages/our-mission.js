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
                                world where finding trusted, high-quality services is effortless, and where professionals
                                can showcase their expertise to build meaningful, long-lasting relationships with
                                clients.
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
                                            From home repairs and cleaning to personal care and tutoring, our platform
                                            offers a comprehensive range of services tailored to meet the diverse needs of our
                                            customers.
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
                                            We believe that trust, clear communication, and mutual respect are the
                                            cornerstones of successful relationships between service providers and customers.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card sx={{textAlign: 'center', p: 2}}>
                                    <CardContent>
                                        <Avatar sx={{bgcolor: 'success.main', mb: 2, mx: 'auto'}}>
                                            <StarIcon/>
                                        </Avatar>
                                        <Typography variant="h5" component="h3">
                                            Commitment to Quality
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            We thoroughly vet all service providers to ensure they deliver exceptional
                                            results and provide a safe, secure environment for our customers.
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
                                            Customers can share feedback through ratings and reviews, fostering informed
                                            decisions and enhancing the quality of services.
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
                                            Driving Progress
                                        </Typography>
                                        <Typography sx={{mt: 1, color: 'gray'}}>
                                            At CTMASS, we are passionate about creating meaningful connections that
                                            positively impact lives, moving closer to our goal of redefining collaboration.
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