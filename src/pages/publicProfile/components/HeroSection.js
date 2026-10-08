import PropTypes from 'prop-types';
import { Avatar, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import IosShareIcon from '@mui/icons-material/IosShare';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { SharingProfileMenu } from 'src/components/sharing-profile-menu';
import { useLatestTrade } from 'src/queries/use-trades';
import { btn, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const HeroSection = ({
    profile,
    profileId,
    status,
    locationLabel,
    onOpenQr,
    shareUrl,
    isHomeowner,
    onSendMessage
}) => {
    const { data: latestTrade } = useLatestTrade(profileId);
    const businessName =
        profile?.profile?.businessName ||
        profile?.profile?.displayName ||
        profile?.profile?.name ||
        profile?.profile?.email ||
        'Specialist';

    const aboutText = profile?.profile?.bio || latestTrade?.story?.about;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: businessName, url: shareUrl });
                return;
            }
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch {
            return;
        }
    };

    return (
        <Box
            sx={{
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.sm
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: 96, sm: 128 },
                    background: `radial-gradient(60% 120% at 100% 100%, ${alpha(BRAND.green, 0.35)} 0%, ${alpha(BRAND.green, 0)} 60%), linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.07)} 1px, transparent 1px)`,
                        backgroundSize: '32px 32px',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 70%)',
                        maskImage: 'linear-gradient(90deg, transparent 0%, #000 70%)'
                    }
                }}
            />

            <Box sx={{ px: { xs: 2.5, sm: 3, md: 4 }, pb: { xs: 3, md: 4 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
                    sx={{ mt: { xs: '-48px', sm: '-60px' }, mb: 2.5, gap: 2 }}
                >
                    <Avatar
                        src={profile?.profile?.avatar || undefined}
                        alt={businessName}
                        variant="rounded"
                        sx={{
                            position: 'relative',
                            width: { xs: 96, sm: 120 },
                            height: { xs: 96, sm: 120 },
                            borderRadius: '28px',
                            border: '4px solid #FFFFFF',
                            boxShadow: SHADOW.md,
                            bgcolor: BRAND.navy,
                            fontFamily: FONT.display,
                            fontWeight: 800,
                            fontSize: { xs: 36, sm: 44 }
                        }}
                    >
                        {businessName.charAt(0).toUpperCase()}
                    </Avatar>

                    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                        {isHomeowner ? (
                            <Button
                                startIcon={<ChatBubbleOutlineRoundedIcon />}
                                onClick={onSendMessage}
                                disabled={!onSendMessage}
                                sx={btn.navy}
                            >
                                Message
                            </Button>
                        ) : (
                            <>
                                <Button startIcon={<QrCode2Icon />} onClick={onOpenQr} sx={{ ...btn.outline, minHeight: 42 }}>
                                    QR code
                                </Button>
                                <Tooltip title="Share profile">
                                    <Button startIcon={<IosShareIcon />} onClick={handleShare} sx={{ ...btn.outline, minHeight: 42 }}>
                                        Share
                                    </Button>
                                </Tooltip>
                                <SharingProfileMenu url={shareUrl} user={profile?.profile} />
                            </>
                        )}
                    </Stack>
                </Stack>

                <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 28, sm: 34, md: 40 }, overflowWrap: 'anywhere' }}>
                    {businessName}
                </Typography>

                <Stack direction="row" flexWrap="wrap" alignItems="center" sx={{ mt: 1.25, gap: 1 }}>
                    {status?.label && (
                        <StatusPill tone={status.color === 'warning' ? 'amber' : 'green'}>
                            {status.label}
                        </StatusPill>
                    )}
                    {locationLabel && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: BRAND.muted }}>
                            <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{locationLabel}</Typography>
                        </Stack>
                    )}
                </Stack>

                {!isHomeowner && (
                    <Typography
                        sx={{
                            mt: 2,
                            maxWidth: 720,
                            whiteSpace: 'pre-line',
                            fontSize: { xs: 15, md: 16 },
                            lineHeight: 1.7,
                            color: aboutText ? BRAND.ink : BRAND.muted
                        }}
                    >
                        {aboutText || 'No description added yet.'}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

HeroSection.propTypes = {
    profile: PropTypes.object,
    profileId: PropTypes.string,
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
    profileId: undefined,
    status: {
        label: '',
        color: 'default'
    },
    locationLabel: '',
    isHomeowner: false,
    onSendMessage: undefined
};

export default HeroSection;
