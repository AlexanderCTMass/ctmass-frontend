import { useState } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Link,
    Stack,
    Typography,
    Button,
    styled
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { InviteDialog } from 'src/pages/cabinet/profiles/my/Connections/InviteDialog';

export const WORKER_UPSELL_KEY = 'ctmass_worker_upsell';
export const CUSTOMER_UPSELL_KEY = 'ctmass_customer_upsell';

const OptionCard = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'highlighted'
})(({ theme, highlighted }) => ({
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    padding: theme.spacing(3),
    cursor: 'pointer',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    border: `1px solid ${highlighted ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider}`,
    background: highlighted
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        : theme.palette.background.paper,
    ...(highlighted && {
        animation: 'ctmassGlowPulse 2.6s ease-in-out infinite'
    }),
    '&:hover': {
        transform: 'translateY(-4px) scale(1.025)',
        boxShadow: `0 20px 44px ${alpha(theme.palette.primary.main, 0.28)}`,
        borderColor: alpha(theme.palette.primary.main, 0.55),
        animation: 'none'
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-130%',
        width: '60%',
        height: '100%',
        background: `linear-gradient(120deg, transparent 0%, ${alpha(theme.palette.common.white, 0.35)} 50%, transparent 100%)`,
        transform: 'skewX(-20deg)',
        transition: 'left .7s ease',
        pointerEvents: 'none'
    },
    '&:hover::after': {
        left: '150%'
    },
    '@keyframes ctmassGlowPulse': {
        '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
        '50%': { boxShadow: `0 0 26px 2px ${alpha(theme.palette.primary.main, 0.28)}` }
    }
}));

const CoinReward = ({ label }) => (
    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {label}
        </Typography>
    </Stack>
);

const OrSeparator = () => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            px: { xs: 0, md: 0.5 },
            py: { xs: 0.5, md: 0 }
        }}
    >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            OR
        </Typography>
    </Box>
);

const InviteOptionCard = ({ onClick }) => (
    <OptionCard highlighted onClick={onClick}>
        <Stack spacing={1} alignItems="center" textAlign="center">
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16)
                }}
            >
                <PersonAddAltIcon />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Invite a friend
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Earn up to <Box component="strong" sx={{ color: 'text.primary' }}>+30 CTMASS Coins</Box> for
                inviting a contractor or homeowner who becomes active.
            </Typography>
            <CoinReward label="+30 CTMASS Coins" />
        </Stack>
    </OptionCard>
);

export const OnboardingUpsellModal = ({ open, onClose, variant = 'worker', profileId }) => {
    const [inviteOpen, setInviteOpen] = useState(false);
    const isWorker = variant === 'worker';

    const handleOpenInvite = () => setInviteOpen(true);
    const handleCloseInvite = () => setInviteOpen(false);

    const title = isWorker
        ? 'Your trade is live! 🎉'
        : 'Your project is published! 🎉';

    const subtitle = isWorker
        ? 'You can now respond to work projects from homeowners.'
        : 'Specialists nearby will be notified and can respond to your project.';

    const upsellLead = isWorker
        ? 'While you’re here, here are two great ways to get more out of CTMASS and earn extra Coins:'
        : 'Want to earn extra Coins while you wait for responses?';

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth={isWorker ? 'md' : 'sm'} fullWidth>
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: { xs: 3, sm: 4.5 } }}>
                    <Stack spacing={{ xs: 2.5, sm: 3 }}>
                        <Stack spacing={1} alignItems="center" textAlign="center">
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {title}
                            </Typography>
                            <Typography color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ fontWeight: 600 }}
                        >
                            {upsellLead}
                        </Typography>

                        {isWorker ? (
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                alignItems="stretch"
                            >
                                <OptionCard>
                                    <Stack spacing={1} alignItems="center" textAlign="center">
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'primary.main',
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12)
                                            }}
                                        >
                                            <HomeRepairServiceOutlinedIcon />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Have work around your home?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            We know you’re a specialist — but if there’s a job at your own
                                            place, publish it and let other pros help you out.
                                        </Typography>
                                        <Button
                                            component={RouterLink}
                                            href={paths.cabinet.projects.create}
                                            variant="contained"
                                            sx={{ mt: 1.5 }}
                                        >
                                            Publish Project
                                        </Button>
                                        <CoinReward label="+15 CTMASS Coins" />
                                    </Stack>
                                </OptionCard>

                                <OrSeparator />

                                <InviteOptionCard onClick={handleOpenInvite} />
                            </Stack>
                        ) : (
                            <InviteOptionCard onClick={handleOpenInvite} />
                        )}

                        <Box textAlign="center">
                            {isWorker ? (
                                <Link
                                    component={RouterLink}
                                    href={paths.cabinet.projects.find.index}
                                    variant="caption"
                                    color="text.secondary"
                                    underline="hover"
                                >
                                    No, thanks — I’ll do this later. For now, I just want to browse projects.
                                </Link>
                            ) : (
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={onClose}
                                    variant="caption"
                                    color="text.secondary"
                                    underline="hover"
                                >
                                    No, thanks — maybe later.
                                </Link>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
            </Dialog>

            <InviteDialog
                open={inviteOpen}
                onClose={handleCloseInvite}
                profileId={profileId}
            />
        </>
    );
};

export default OnboardingUpsellModal;
