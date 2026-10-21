import { useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Avatar, Box, Button, Popover, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { RouterLink } from 'src/components/router-link';
import { useAuth } from 'src/hooks/use-auth';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { Issuer } from 'src/utils/auth';
import { roles } from 'src/roles';
import { focusRingSx, navyPanelSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const MenuLink = ({ href, icon, label, onClick }) => (
    <Box
        component={RouterLink}
        href={href}
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minHeight: 44,
            px: 1.25,
            borderRadius: '12px',
            color: BRAND.ink,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background-color .2s ease, color .2s ease',
            '& svg': { fontSize: 20, color: BRAND.muted, transition: 'color .2s ease' },
            '&:hover': { bgcolor: alpha(BRAND.navy, 0.06), color: BRAND.navy, '& svg': { color: BRAND.navy } },
            ...focusRingSx
        }}
    >
        {icon}
        {label}
    </Box>
);

const GroupLabel = ({ children }) => (
    <Typography sx={{ px: 1.25, pt: 1.5, pb: 0.5, fontSize: 12, fontWeight: 700, color: BRAND.muted }}>
        {children}
    </Typography>
);

export const AccountPopover = (props) => {
    const { anchorEl, onClose, open, ...other } = props;
    const router = useRouter();
    const auth = useAuth();
    const user = auth.user;
    const isWorker = user?.role === roles.WORKER;
    const displayName = user?.name || user?.businessName || user?.email || 'Your account';

    const handleLogout = useCallback(async () => {
        try {
            onClose?.();

            switch (auth.issuer) {
                case Issuer.Amplify:
                case Issuer.Firebase:
                case Issuer.JWT: {
                    await auth.signOut();
                    break;
                }

                case Issuer.Auth0: {
                    await auth.logout();
                    break;
                }

                default: {
                    console.warn('Using an unknown Auth Issuer, did not log out');
                }
            }

            router.push(paths.index);
        } catch (err) {
            console.error(err);
            toast.error("We couldn't log you out. Please try again.");
        }
    }, [auth, router, onClose]);

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            marginThreshold={12}
            disableScrollLock
            onClose={onClose}
            open={!!open}
            PaperProps={{
                sx: {
                    mt: 1.25,
                    width: 304,
                    maxWidth: 'calc(100vw - 24px)',
                    p: 1,
                    borderRadius: RADIUS.card,
                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                    boxShadow: SHADOW.lg
                }
            }}
            {...other}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.25, pb: 1.5 }}>
                <Avatar
                    src={user?.avatar || undefined}
                    variant="rounded"
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: RADIUS.tile,
                        color: BRAND.navy,
                        bgcolor: alpha(BRAND.green, 0.14),
                        border: `1px solid ${alpha(BRAND.green, 0.28)}`,
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 20
                    }}
                >
                    {displayName.trim().charAt(0).toUpperCase() || <PersonOutlineRoundedIcon />}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.navy }}>
                        {displayName}
                    </Typography>
                    <StatusPill tone={isWorker ? 'green' : 'navy'} sx={{ mt: 0.5, height: 22 }}>
                        {isWorker ? 'Contractor' : 'Homeowner'}
                    </StatusPill>
                </Box>
            </Stack>

            <Box sx={{ height: '1px', mx: 1.25, bgcolor: alpha(BRAND.navy, 0.08) }} />

            <Box component="nav" sx={{ pt: 0.5 }}>
                <MenuLink href={paths.dashboard.overview} icon={<PersonOutlineRoundedIcon />} label="Profile page" onClick={onClose} />
                <MenuLink href={paths.dashboard.profile.information} icon={<ManageAccountsOutlinedIcon />} label="Account settings" onClick={onClose} />

                {isWorker && (
                    <>
                        <GroupLabel>Work</GroupLabel>
                        <MenuLink href={paths.cabinet.projects.find.index} icon={<ManageSearchRoundedIcon />} label="Find projects" onClick={onClose} />
                        <MenuLink href={paths.cabinet.projects.contractor} icon={<ViewListOutlinedIcon />} label="My works" onClick={onClose} />
                        <MenuLink href={paths.cabinet.calendar} icon={<EventAvailableOutlinedIcon />} label="Calendar" onClick={onClose} />
                        <GroupLabel>Hire</GroupLabel>
                    </>
                )}
                <MenuLink href={paths.cabinet.projects.create} icon={<AddRoundedIcon />} label="Publish a project" onClick={onClose} />
                <MenuLink href={paths.cabinet.projects.index} icon={<ViewListOutlinedIcon />} label="My projects" onClick={onClose} />
                <MenuLink href={paths.contact} icon={<SupportAgentOutlinedIcon />} label="Support" onClick={onClose} />
            </Box>

            <Box sx={{ ...navyPanelSx, mt: 1, p: 1.75, borderRadius: RADIUS.inner }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <MonetizationOnRoundedIcon sx={{ color: '#FFC83D', fontSize: 22 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: alpha('#FFFFFF', 0.85) }}>CTMASS coins</Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                        {(user?.loyaltyBalance ?? 0).toLocaleString('en-US')}
                    </Typography>
                </Stack>
                <Button
                    component={RouterLink}
                    href={paths.loyaltyShop}
                    onClick={onClose}
                    fullWidth
                    sx={{
                        position: 'relative',
                        mt: 1.5,
                        minHeight: 40,
                        borderRadius: '12px',
                        bgcolor: '#FFFFFF',
                        color: BRAND.navy,
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: BRAND.mist },
                        ...focusRingSx
                    }}
                >
                    Open the shop
                </Button>
            </Box>

            <Box
                component="button"
                type="button"
                onClick={handleLogout}
                sx={{
                    mt: 0.5,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    minHeight: 44,
                    px: 1.25,
                    border: 0,
                    borderRadius: '12px',
                    bgcolor: 'transparent',
                    color: BRAND.muted,
                    font: 'inherit',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color .2s ease, color .2s ease',
                    '& svg': { fontSize: 20 },
                    '&:hover': { bgcolor: alpha(BRAND.danger, 0.08), color: BRAND.danger },
                    ...focusRingSx
                }}
            >
                <LogoutRoundedIcon />
                Log out
            </Box>
        </Popover>
    );
};

AccountPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool
};
