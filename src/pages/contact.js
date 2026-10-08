import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Map } from 'react-map-gl';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { ContactForm } from 'src/sections/contact/contact-form';
import { mapboxConfig } from 'src/config';
import { useConfig } from 'src/contexts/remote-config-context';
import { blueprintBackdropSx, cardTitleSx, IconTile, Surface } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const coordinates = { longitude: -72.516, latitude: 42.256 };

const ContactMap = () => (
    <Box
        sx={{
            position: 'relative',
            height: { xs: 200, md: 240 },
            overflow: 'hidden',
            borderRadius: RADIUS.card,
            border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
            boxShadow: SHADOW.sm,
            '& .mapboxgl-canvas-container': { height: '100%', width: '100%' }
        }}
    >
        <Map
            initialViewState={{ ...coordinates, zoom: 7.4 }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxConfig.apiKey}
            interactive={false}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
        />
        <Box
            sx={{
                position: 'absolute',
                left: 16,
                bottom: 16,
                px: 1.5,
                py: 0.75,
                borderRadius: RADIUS.pill,
                bgcolor: '#FFFFFF',
                boxShadow: SHADOW.md,
                fontSize: 13,
                fontWeight: 700,
                color: BRAND.navy
            }}
        >
            Serving Connecticut and Massachusetts
        </Box>
    </Box>
);

const ContactRow = ({ icon, label, children }) => (
    <Stack direction="row" spacing={2} alignItems="flex-start">
        <IconTile size={44}>{icon}</IconTile>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND.muted }}>{label}</Typography>
            <Box sx={{ mt: 0.25, fontSize: 16, fontWeight: 600, color: BRAND.ink, overflowWrap: 'anywhere' }}>{children}</Box>
        </Box>
    </Stack>
);

const Page = () => {
    usePageView();
    const { config } = useConfig();
    const info = config?.contactInfo;
    const email = info?.email || 'support@ctmass.com';

    return (
        <>
            <Seo title="Contact" />
            <Box component="main" sx={{ ...blueprintBackdropSx, pt: { xs: 15, md: 19 }, pb: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg" sx={{ position: 'relative' }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.85fr) minmax(0, 1.15fr)' },
                            gap: { xs: 4, md: 7 },
                            alignItems: 'start'
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 36, sm: 46, md: 56 } }}>
                                Contact us
                            </Typography>
                            <Typography sx={{ mt: 2, maxWidth: 460, color: BRAND.muted, fontSize: { xs: 16, md: 18 }, fontWeight: 500, lineHeight: 1.6 }}>
                                Questions about CTMASS, a problem with your account or an idea for the platform? Send us a message and a real person will reply.
                            </Typography>

                            <Stack spacing={2.5} sx={{ mt: { xs: 4, md: 5 } }}>
                                <ContactRow icon={<MailOutlineIcon />} label="Email">
                                    <Link href={`mailto:${email}`} sx={{ color: BRAND.navy }}>{email}</Link>
                                </ContactRow>
                                {info?.phones?.length > 0 && (
                                    <ContactRow icon={<PhoneOutlinedIcon />} label="Phone">
                                        {info.phones.map((phone) => (
                                            <Box key={phone}>
                                                <Link href={`tel:${phone.replace(/[^\d+]/g, '')}`} sx={{ color: BRAND.navy }}>{phone}</Link>
                                            </Box>
                                        ))}
                                    </ContactRow>
                                )}
                                {info?.address && (
                                    <ContactRow icon={<PlaceOutlinedIcon />} label="Address">
                                        {info.address}
                                    </ContactRow>
                                )}
                            </Stack>

                            <Box sx={{ mt: { xs: 4, md: 5 } }}>
                                <ContactMap />
                            </Box>
                        </Box>

                        <Surface sx={{ boxShadow: SHADOW.md }}>
                            <Typography component="h2" sx={{ ...cardTitleSx, fontSize: { xs: 22, md: 26 } }}>
                                Send a message
                            </Typography>
                            <Typography sx={{ mt: 0.75, mb: 3, color: BRAND.muted, fontSize: 15 }}>
                                We appreciate every suggestion.
                            </Typography>
                            <ContactForm />
                        </Surface>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default Page;
