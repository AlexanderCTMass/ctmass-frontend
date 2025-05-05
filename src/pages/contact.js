import {Box, Container, Stack, Typography, useMediaQuery} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {ContactForm} from 'src/sections/contact/contact-form';
import {mapboxConfig} from "src/config";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Map, Marker} from 'react-map-gl';
import {alpha, useTheme} from "@mui/material/styles";
import {useConfig} from "src/contexts/remote-config-context";

const ContactMap = () => {
    const theme = useTheme();
    const coordinates = {longitude: -72.516, latitude: 42.256};
    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
    return (
        <Box sx={{
            height: 400,
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            mt: 2,
            '& .mapboxgl-canvas-container': {
                height: '100%',
                width: '100%'
            }
        }}>
            {/* Основной контейнер карты */}
            <Map
                initialViewState={{
                    ...coordinates,
                    zoom: 10
                }}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxConfig.apiKey}
                interactive={false}
                sx={{width: '100%', height: '100%'}}
            >
            </Map>

            {/* Градиентный overlay */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? `linear-gradient(to bottom, ${alpha(theme.palette.neutral[800], 1)} 0%, ${alpha(theme.palette.neutral[800], 0)} 100%)`
                        : `linear-gradient(to bottom, ${alpha(theme.palette.neutral[50], 1)} 0%, ${alpha(theme.palette.neutral[50], 0)} 100%)`,
                pointerEvents: 'none',
                zIndex: 10000
            }}/>
        </Box>
    );
};
const Page = () => {
    usePageView();
    const {config, loading} = useConfig();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    return (
        <>
            <Seo title="Contact"/>
            <Container maxWidth="lg">
                <Box
                    component="main"
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            lg: '2fr 3fr',
                            xs: 'repeat(1, 1fr)'
                        },
                        flexGrow: 1,
                        pb: '40px',
                        pt: '120px',
                    }}
                >
                    <Box
                        sx={{
                            p: 0,
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                ? 'neutral.800'
                                : 'neutral.50',

                        }}
                    >
                        <Container maxWidth="md" sx={{p: "0 !important"}}>
                            <Stack spacing={3} my={3} mx={4} mt={5}>
                                <Typography variant="h2">
                                    Contact us
                                </Typography>
                            </Stack>

                            <Typography sx={{m: 4, mb: 3}} variant="body1">
                                If you have any questions about our service, fill out the form below and a senior web
                                expert
                                will contact you shortly.
                            </Typography>

                            <Typography color="primary" sx={{m: 4, mb: 3}} variant="h6">
                                We appreciate any suggestions you have.
                            </Typography>

                            {/* Контакты в колонку */}
                            {config?.contactInfo &&
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    m: 4,
                                    mb: 4,
                                    p: 3,
                                    backgroundColor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <MailOutlineIcon color="primary"/>
                                        <div>
                                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                            <Typography variant="body1">{config.contactInfo.email}</Typography>
                                        </div>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <PhoneIcon color="primary"/>
                                        <div>
                                            <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                            {config.contactInfo.phones.map((phone, index) => (
                                                <Typography variant="body1">{phone}</Typography>))}
                                        </div>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <LocationOnIcon color="primary"/>
                                        <div>
                                            <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                            <Typography variant="body1">{config.contactInfo.address}</Typography>
                                        </div>
                                    </Stack>
                                </Box>
                            }

                            <ContactMap/>
                        </Container>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: 'background.paper',
                            px: smUp ? 6 : 1,
                            py: smUp ? 15 : 5
                        }}
                    >
                        <Container
                            maxWidth="md"
                        >
                            <Typography
                                sx={{pb: 3}}
                                variant="h6"
                            >
                                Fill the form below
                            </Typography>
                            <ContactForm/>
                        </Container>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Page;
