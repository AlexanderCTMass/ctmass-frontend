import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import IosShareIcon from '@mui/icons-material/IosShare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import SpeedIcon from '@mui/icons-material/Speed';
import { usePwaInstall } from 'src/hooks/use-pwa-install';

export const MOBILE_APP_LINKS = {
    appStore: '',
    googlePlay: '',
    apk: ''
};

const PWA_BENEFITS = [
    { icon: <NotificationsActiveIcon fontSize="small" />, label: 'Instant push notifications for new projects and messages' },
    { icon: <OfflineBoltIcon fontSize="small" />, label: 'Works offline and loads from your home screen' },
    { icon: <SpeedIcon fontSize="small" />, label: 'No app store, no download size — installs in one tap' }
];

const NativeAppCard = () => (
    <Card
        elevation={0}
        sx={{
            height: '100%',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            color: 'common.white',
            background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            boxShadow: (theme) => theme.shadows[12]
        }}
    >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
                <Chip
                    label="Recommended"
                    size="small"
                    sx={{
                        alignSelf: 'flex-start',
                        backgroundColor: 'rgba(255,255,255,0.22)',
                        color: 'common.white',
                        fontWeight: 700
                    }}
                />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        CTMASS Mobile App
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.9 }}>
                        The full native experience for iOS and Android — the fastest way to manage projects,
                        chat with specialists and get notified the moment something happens.
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {MOBILE_APP_LINKS.appStore && (
                        <Button
                            variant="contained"
                            size="large"
                            href={MOBILE_APP_LINKS.appStore}
                            target="_blank"
                            rel="noopener"
                            startIcon={<AppleIcon />}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                backgroundColor: 'common.white',
                                color: 'primary.dark',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: 'grey.100' }
                            }}
                        >
                            App Store
                        </Button>
                    )}
                    {MOBILE_APP_LINKS.googlePlay && (
                        <Button
                            variant="contained"
                            size="large"
                            href={MOBILE_APP_LINKS.googlePlay}
                            target="_blank"
                            rel="noopener"
                            startIcon={<ShopIcon />}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                backgroundColor: 'common.white',
                                color: 'primary.dark',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: 'grey.100' }
                            }}
                        >
                            Google Play
                        </Button>
                    )}
                </Stack>

                {MOBILE_APP_LINKS.apk && (
                    <>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.25)' }} />
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                        >
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Prefer not to use the store? Get the Android package directly.
                            </Typography>
                            <Button
                                variant="outlined"
                                href={MOBILE_APP_LINKS.apk}
                                startIcon={<AndroidIcon />}
                                sx={{
                                    flexShrink: 0,
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    color: 'common.white',
                                    '&:hover': { borderColor: 'common.white', backgroundColor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Download APK
                            </Button>
                        </Stack>
                    </>
                )}
            </Stack>
        </CardContent>
    </Card>
);

const PwaCard = ({ compact }) => {
    const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();

    const renderAction = () => {
        if (isInstalled) {
            return (
                <Button
                    variant="outlined"
                    size="large"
                    disabled
                    startIcon={<CheckCircleIcon />}
                    sx={{ py: 1.5 }}
                >
                    Already installed
                </Button>
            );
        }

        if (canInstall) {
            return (
                <Button
                    variant="contained"
                    size="large"
                    onClick={promptInstall}
                    startIcon={<GetAppIcon />}
                    sx={{ py: 1.5, fontWeight: 700 }}
                >
                    Install Web App
                </Button>
            );
        }

        if (isIos) {
            return (
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography variant="body2">Tap</Typography>
                    <IosShareIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                        Share in Safari, then choose “Add to Home Screen”.
                    </Typography>
                </Box>
            );
        }

        return (
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Open your browser menu and choose “Install app” or “Add to Home Screen”.
                </Typography>
            </Box>
        );
    };

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'primary.alpha12',
                                color: 'primary.main'
                            }}
                        >
                            <LanguageIcon />
                        </Box>
                        <Box>
                            <Typography variant={compact ? 'h5' : 'h4'} sx={{ fontWeight: 800 }}>
                                CTMASS Web App
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Available right now on every device
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography color="text.secondary">
                        Install CTMASS straight from your browser — no store account, no waiting. It lives on your
                        home screen and behaves like a regular app.
                    </Typography>

                    <Stack spacing={1.25}>
                        {PWA_BENEFITS.map((benefit) => (
                            <Stack key={benefit.label} direction="row" spacing={1.5} alignItems="flex-start">
                                <Box sx={{ color: 'primary.main', display: 'flex', mt: '2px' }}>{benefit.icon}</Box>
                                <Typography variant="body2" color="text.secondary">
                                    {benefit.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {renderAction()}
                </Stack>
            </CardContent>
        </Card>
    );
};

export const AppDownload = () => {
    const hasNativeApps = Boolean(
        MOBILE_APP_LINKS.appStore || MOBILE_APP_LINKS.googlePlay || MOBILE_APP_LINKS.apk
    );

    return (
        <Box sx={{ py: { xs: 6, md: 10 } }}>
            <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
                <Chip label="Get the app" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                <Typography variant="h3">Take CTMASS with you</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, fontWeight: 400 }}>
                    Everything we build for our clients, we build for ourselves first. Install CTMASS on your phone
                    and see the quality of our work in your own hands.
                </Typography>
            </Stack>

            {hasNativeApps ? (
                <Grid container spacing={4} alignItems="stretch">
                    <Grid xs={12} md={7}>
                        <NativeAppCard />
                    </Grid>
                    <Grid xs={12} md={5}>
                        <PwaCard compact />
                    </Grid>
                </Grid>
            ) : (
                <Stack spacing={3} alignItems="center">
                    <Box sx={{ width: '100%', maxWidth: 620 }}>
                        <PwaCard />
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <AppleIcon fontSize="small" />
                        <AndroidIcon fontSize="small" />
                        <Typography variant="body2">
                            Native iOS and Android apps are on the way — stores and a direct APK download will appear here.
                        </Typography>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
};
