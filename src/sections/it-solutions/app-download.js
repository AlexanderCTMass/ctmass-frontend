import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import { usePwaInstall } from 'src/hooks/use-pwa-install';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from 'src/constants/mobile-apps';

const PWA_BENEFITS = [
    { icon: <NotificationsActiveIcon fontSize="small" />, label: 'Instant push notifications for new projects and messages' },
    { icon: <OfflineBoltIcon fontSize="small" />, label: 'Works offline and loads from your home screen' },
    { icon: <SpeedIcon fontSize="small" />, label: 'No app store, no download size — installs in one tap' }
];

const STORE_APPS = [
    {
        key: 'ios',
        title: 'CTMASS for iPhone',
        subtitle: 'Native iOS app on the App Store',
        description:
            'The full native experience for iPhone and iPad — manage projects, chat with specialists and get notified the moment something happens.',
        icon: <AppleIcon />,
        buttonIcon: <AppleIcon />,
        buttonLabel: 'Download on the App Store',
        url: APP_STORE_URL,
        benefits: [
            { icon: <NotificationsActiveIcon fontSize="small" />, label: 'Real-time push notifications for projects and messages' },
            { icon: <ChatIcon fontSize="small" />, label: 'Chat, photos and video stories built for iOS' },
            { icon: <SecurityIcon fontSize="small" />, label: 'Sign in with Apple, Google or email' }
        ]
    },
    {
        key: 'android',
        title: 'CTMASS for Android',
        subtitle: 'Native Android app on Google Play',
        description:
            'Everything CTMASS offers, tuned for Android phones — find specialists, track your projects and stay in touch on the go.',
        icon: <AndroidIcon />,
        buttonIcon: <ShopIcon />,
        buttonLabel: 'Get it on Google Play',
        url: GOOGLE_PLAY_URL,
        benefits: [
            { icon: <NotificationsActiveIcon fontSize="small" />, label: 'Real-time push notifications for projects and messages' },
            { icon: <ChatIcon fontSize="small" />, label: 'Chat, photos and video stories built for Android' },
            { icon: <SecurityIcon fontSize="small" />, label: 'Sign in with Google or email' }
        ]
    }
];

const CardHeader = ({ icon, title, subtitle, highlighted }) => (
    <Stack direction="row" spacing={2} alignItems="center">
        <Box
            sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: highlighted ? 'common.black' : 'primary.alpha12',
                color: highlighted ? 'common.white' : 'primary.main'
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
    </Stack>
);

const BenefitList = ({ benefits }) => (
    <Stack spacing={1.25}>
        {benefits.map((benefit) => (
            <Stack key={benefit.label} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ color: 'primary.main', display: 'flex', mt: '2px' }}>{benefit.icon}</Box>
                <Typography variant="body2" color="text.secondary">
                    {benefit.label}
                </Typography>
            </Stack>
        ))}
    </Stack>
);

const cardSx = {
    height: '100%',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider'
};

const StoreAppCard = ({ app }) => (
    <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={2.5} sx={{ height: '100%' }}>
                <CardHeader icon={app.icon} title={app.title} subtitle={app.subtitle} highlighted />
                <Typography color="text.secondary">{app.description}</Typography>
                <BenefitList benefits={app.benefits} />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    size="large"
                    href={app.url}
                    target="_blank"
                    rel="noopener"
                    startIcon={app.buttonIcon}
                    sx={{
                        py: 1.5,
                        fontWeight: 700,
                        backgroundColor: 'common.black',
                        color: 'common.white',
                        '&:hover': { backgroundColor: 'grey.800' }
                    }}
                >
                    {app.buttonLabel}
                </Button>
            </Stack>
        </CardContent>
    </Card>
);

const PwaCard = () => {
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
        <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
                <Stack spacing={2.5} sx={{ height: '100%' }}>
                    <CardHeader
                        icon={<LanguageIcon />}
                        title="CTMASS Web App"
                        subtitle="Available right now on every device"
                    />
                    <Typography color="text.secondary">
                        Install CTMASS straight from your browser — no store account, no waiting. It lives on your
                        home screen and behaves like a regular app.
                    </Typography>
                    <BenefitList benefits={PWA_BENEFITS} />
                    <Box sx={{ flexGrow: 1 }} />
                    {renderAction()}
                </Stack>
            </CardContent>
        </Card>
    );
};

export const AppDownload = () => (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Chip label="Get the app" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
            <Typography variant="h3">Take CTMASS with you</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, fontWeight: 400 }}>
                Everything we build for our clients, we build for ourselves first. Install CTMASS on your phone
                and see the quality of our work in your own hands.
            </Typography>
        </Stack>

        <Grid container spacing={4} alignItems="stretch">
            {STORE_APPS.map((app) => (
                <Grid key={app.key} xs={12} md={4}>
                    <StoreAppCard app={app} />
                </Grid>
            ))}
            <Grid xs={12} md={4}>
                <PwaCard />
            </Grid>
        </Grid>
    </Box>
);
