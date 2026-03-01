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
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 3, md: 4 }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2.5, sm: 3 }}
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                    flex={1}
                >
                    <Avatar
                        src={profile?.profile?.avatar || undefined}
                        alt={businessName}
                        variant="rounded"
                        sx={{
                            width: { xs: 90, sm: 120 },
                            height: { xs: 90, sm: 120 },
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    />

                    <Stack spacing={1.75} sx={{ width: '100%' }}>
                        <Typography variant="h4" fontWeight={700}>
                            {businessName}
                        </Typography>

                        <Stack spacing={1}>
                            {status?.label && (
                                <Chip
                                    label={status.label}
                                    color={status.color}
                                    size="small"
                                    sx={{ fontWeight: 600, width: 'fit-content' }}
                                />
                            )}

                            {locationLabel && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <LocationOnOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: 'text.secondary' }}
                                    />
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {locationLabel}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                        {!isHomeowner && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ whiteSpace: 'pre-line' }}
                            >
                                {aboutText || 'No description provided yet.'}
                            </Typography>
                        )}
                    </Stack>
                </Stack>

                {isHomeowner ? (
                    <Button
                        variant="contained"
                        startIcon={<SvgIcon fontSize="small"><MessageChatSquareIcon /></SvgIcon>}
                        onClick={onSendMessage}
                        disabled={!onSendMessage}
                    >
                        Message
                    </Button>
                ) : (
                    <Stack
                        spacing={1.5}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<QrCode2Icon />}
                            onClick={onOpenQr}
                        >
                            QR code
                        </Button>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Tooltip title="Share profile">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<IosShareIcon />}
                                    onClick={handleShare}
                                >
                                    Share
                                </Button>
                            </Tooltip>
                            <SharingProfileMenu url={shareUrl} user={profile?.profile} />
                        </Box>
                    </Stack>
                )}
            </Stack>
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
