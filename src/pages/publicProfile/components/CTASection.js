import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PopoverMenu } from 'src/components/popover-menu';
import { btn, navyPanelSx } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const ghostSx = {
    ...btn.outline,
    bgcolor: 'transparent',
    color: '#FFFFFF',
    borderColor: alpha('#FFFFFF', 0.32),
    '&:hover': { bgcolor: alpha('#FFFFFF', 0.1), borderColor: '#FFFFFF' },
    '&.Mui-disabled': { color: alpha('#FFFFFF', 0.4), borderColor: alpha('#FFFFFF', 0.14) }
};

const CTASection = ({
    phone,
    onCall,
    onSendMessage,
    requestItems,
    goToProfileHref,
    isOwnProfile
}) => {
    const hasRequestOptions = Array.isArray(requestItems) && requestItems.length > 0;

    return (
        <Box
            sx={{
                ...navyPanelSx,
                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                boxShadow: SHADOW.lg,
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
                sx={{ position: 'relative', gap: 3 }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography component="h2" sx={{ ...displayTitleSx, color: '#FFFFFF', fontSize: { xs: 24, md: 30 } }}>
                        Ready to start your project?
                    </Typography>
                    <Typography sx={{ mt: 1, maxWidth: 440, color: alpha('#FFFFFF', 0.74), fontSize: 15, lineHeight: 1.6 }}>
                        Call, send a message or request a service. Hiring through CTMASS is free for homeowners.
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ flexShrink: 0 }}>
                    {phone && (
                        <Button startIcon={<PhoneRoundedIcon />} disabled={isOwnProfile} onClick={onCall} sx={ghostSx}>
                            Call
                        </Button>
                    )}
                    <Button
                        startIcon={<ChatBubbleOutlineRoundedIcon />}
                        disabled={!onSendMessage || isOwnProfile}
                        onClick={onSendMessage}
                        sx={ghostSx}
                    >
                        Message
                    </Button>
                    {goToProfileHref ? (
                        <Button startIcon={<OpenInNewIcon />} href={goToProfileHref} component="a" sx={btn.green}>
                            Go to profile
                        </Button>
                    ) : (
                        hasRequestOptions && (
                            <Box
                                sx={{
                                    '& .MuiButton-root': {
                                        ...btn.green,
                                        width: { xs: '100%', sm: 'auto' }
                                    }
                                }}
                            >
                                <PopoverMenu
                                    title="Request services"
                                    icon={<EventAvailableIcon />}
                                    variant="contained"
                                    fullWidth={false}
                                    items={requestItems}
                                />
                            </Box>
                        )
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

CTASection.propTypes = {
    phone: PropTypes.string,
    onCall: PropTypes.func,
    onSendMessage: PropTypes.func,
    requestItems: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired
        })
    ),
    goToProfileHref: PropTypes.string,
    isOwnProfile: PropTypes.bool
};

CTASection.defaultProps = {
    phone: '',
    onCall: undefined,
    onSendMessage: undefined,
    requestItems: [],
    goToProfileHref: undefined,
    isOwnProfile: false
};

export default CTASection;
