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
                p: { xs: 2.5, sm: 3, md: 4 }
            }}
        >
            <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={{ xs: 2.5, lg: 4 }}
                alignItems={{ xs: 'stretch', lg: 'center' }}
                justifyContent="space-between"
            >
                {/* Left: avatar + info */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 2.5 }}
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                    flex={1}
                    minWidth={0}
                >
                    <Avatar
                        src={profile?.profile?.avatar || undefined}
                        alt={businessName}
                        variant="rounded"
                        sx={{
                            width: { xs: 80, sm: 100, md: 120 },
                            height: { xs: 80, sm: 100, md: 120 },
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            flexShrink: 0
                        }}
                    />

                    <Stack spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' },
                                wordBreak: 'break-word'
                            }}
                        >
                            {businessName}
                        </Typography>

                        <Stack spacing={0.75}>
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
                                variant="body2"
                                color="text.secondary"
                                sx={{ whiteSpace: 'pre-line' }}
                            >
                                {aboutText || 'No description provided yet.'}
                            </Typography>
                        )}
                    </Stack>
                </Stack>

                {/* Right: action buttons */}
                {isHomeowner ? (
                    <Box sx={{ flexShrink: 0 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<SvgIcon fontSize="small"><MessageChatSquareIcon /></SvgIcon>}
                            onClick={onSendMessage}
                            disabled={!onSendMessage}
                            sx={{ minWidth: 120 }}
                        >
                            Message
                        </Button>
                    </Box>
                ) : (
                    <Stack
                        spacing={1}
                        direction={{ xs: 'row', lg: 'row' }}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ flexShrink: 0, gap: 1 }}
                    >
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
