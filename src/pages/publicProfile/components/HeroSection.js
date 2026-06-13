import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import IosShareIcon from '@mui/icons-material/IosShare';
import MessageChatSquareIcon from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import { SharingProfileMenu } from 'src/components/sharing-profile-menu';

const HeroSection = ({
    profile,
    status,
    locationLabel,
    onOpenQr,
    shareUrl,
    isHomeowner,
    onSendMessage
}) => {
    const businessName =
        profile?.profile?.businessName ||
        profile?.profile?.displayName ||
        profile?.profile?.name ||
        profile?.profile?.email ||
        'Specialist';

    const aboutText = profile?.profile?.about;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: businessName,
                    url: shareUrl
                });
                return;
            }
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch {
            /* ignore */
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                overflow: 'hidden'
            }}
        >
            {/* Glassmorphism cover band */}
            <Box
                sx={{
                    height: { xs: 80, sm: 100 },
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#0f1929' : '#f0f6ff'
                }}
            >
                <Box sx={{
                    position: 'absolute', borderRadius: '50%',
                    width: 220, height: 220,
                    top: -80, left: -40,
                    background: 'rgba(0, 174, 124, 0.5)',
                    filter: 'blur(55px)'
                }} />
                <Box sx={{
                    position: 'absolute', borderRadius: '50%',
                    width: 200, height: 200,
                    top: -60, left: '35%',
                    background: 'rgba(14, 165, 233, 0.45)',
                    filter: 'blur(60px)'
                }} />
                <Box sx={{
                    position: 'absolute', borderRadius: '50%',
                    width: 180, height: 180,
                    top: -50, right: -30,
                    background: 'rgba(139, 92, 246, 0.35)',
                    filter: 'blur(50px)'
                }} />
            </Box>

            {/* Main content area */}
            <Box sx={{ px: { xs: 2.5, sm: 3, md: 4 }, pb: { xs: 3, md: 4 } }}>
                {/* Avatar row — overlapping the banner */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
                    sx={{ mt: { xs: '-44px', sm: '-52px' }, mb: { xs: 2, sm: 1.5 } }}
                >
                    <Avatar
                        src={profile?.profile?.avatar || undefined}
                        alt={businessName}
                        variant="rounded"
                        sx={{
                            width: { xs: 80, sm: 96, md: 112 },
                            height: { xs: 80, sm: 96, md: 112 },
                            borderRadius: 3,
                            border: '3px solid',
                            borderColor: 'background.paper',
                            boxShadow: 4,
                            flexShrink: 0,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    />

                    {/* Action buttons – aligned to the right on sm+ */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ gap: 1, mt: { xs: 1.5, sm: 0 } }}
                    >
                        {isHomeowner ? (
                            <Button
                                variant="contained"
                                startIcon={<SvgIcon fontSize="small"><MessageChatSquareIcon /></SvgIcon>}
                                onClick={onSendMessage}
                                disabled={!onSendMessage}
                                size="small"
                                sx={{ minWidth: 120 }}
                            >
                                Message
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<QrCode2Icon />}
                                    onClick={onOpenQr}
                                    size="small"
                                >
                                    QR code
                                </Button>
                                <Tooltip title="Share profile">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<IosShareIcon />}
                                        onClick={handleShare}
                                        size="small"
                                    >
                                        Share
                                    </Button>
                                </Tooltip>
                                <SharingProfileMenu url={shareUrl} user={profile?.profile} />
                            </>
                        )}
                    </Stack>
                </Stack>

                {/* Name + status + description */}
                <Stack spacing={1.5}>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                            fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                            wordBreak: 'break-word',
                            lineHeight: 1.2
                        }}
                    >
                        {businessName}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" alignItems="center" sx={{ gap: 1 }}>
                        {status?.label && (
                            <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                        {locationLabel && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <LocationOnOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: 'text.secondary', fontSize: 16 }}
                                />
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {locationLabel}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    {!isHomeowner && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                whiteSpace: 'pre-line',
                                maxWidth: 680,
                                lineHeight: 1.6
                            }}
                        >
                            {aboutText || 'No description provided yet.'}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

HeroSection.propTypes = {
    profile: PropTypes.object,
    status: PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'])
    }),
    locationLabel: PropTypes.string,
    onOpenQr: PropTypes.func.isRequired,
    shareUrl: PropTypes.string.isRequired,
    isHomeowner: PropTypes.bool,
    onSendMessage: PropTypes.func
};

HeroSection.defaultProps = {
    profile: null,
    status: {
        label: '',
        color: 'default'
    },
    locationLabel: '',
    isHomeowner: false,
    onSendMessage: undefined
};

export default HeroSection;
