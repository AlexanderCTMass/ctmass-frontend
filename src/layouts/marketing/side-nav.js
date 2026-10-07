import PropTypes from 'prop-types';
import { Box, Button, ButtonBase, Drawer, Stack } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from 'src/constants/mobile-apps';
import { BRAND, FONT, RADIUS, reducedMotion } from 'src/theme/ctmass-tokens';
import { NAV_ITEMS, isNavItemActive } from './top-nav';

const slideIn = keyframes`
    from { opacity: 0; transform: translateX(28px); }
    to { opacity: 1; transform: translateX(0); }
`;

const enter = (index) => ({
    animation: `${slideIn} .45s cubic-bezier(.2,.7,.2,1) both`,
    animationDelay: `${0.08 + index * 0.05}s`,
    [reducedMotion]: { animation: 'none' }
});

const resolveActions = (user) => {
    if (!user) {
        return {
            primary: { label: 'Describe a project', href: paths.login.createProject },
            secondary: { label: 'Start providing services', href: paths.register.serviceProvider }
        };
    }

    if (user.role === roles.WORKER) {
        return {
            primary: { label: 'Find projects', href: paths.cabinet.projects.find.index },
            secondary: { label: 'My trades', href: paths.dashboard.trades.index }
        };
    }

    return {
        primary: { label: 'Describe a project', href: paths.cabinet.projects.create },
        secondary: { label: 'Start providing services', href: paths.cabinet.profiles.specialistCreateWizard }
    };
};

const STORES = [
    { label: 'App Store', href: APP_STORE_URL, Icon: AppleIcon },
    { label: 'Google Play', href: GOOGLE_PLAY_URL, Icon: ShopIcon }
];

export const SideNav = (props) => {
    const { onClose, open = false, items = NAV_ITEMS } = props;
    const pathname = usePathname();
    const { user } = useAuth();
    const actions = resolveActions(user);

    return (
        <Drawer
            anchor="right"
            onClose={onClose}
            open={open}
            variant="temporary"
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: 480,
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    background: `radial-gradient(80% 50% at 100% 100%, ${alpha(BRAND.green, 0.26)} 0%, ${alpha(BRAND.green, 0)} 70%), linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 70%)`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.05)} 1px, transparent 1px)`,
                        backgroundSize: '44px 44px',
                        WebkitMaskImage: 'linear-gradient(200deg, #000 0%, transparent 65%)',
                        maskImage: 'linear-gradient(200deg, #000 0%, transparent 65%)'
                    }
                }
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', px: 2.5, pt: 2.5 }}>
                <Stack
                    component={RouterLink}
                    href={paths.index}
                    onClick={onClose}
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{ textDecoration: 'none', color: '#FFFFFF' }}
                >
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', bgcolor: '#FFFFFF', '& > *': { width: '48px !important', height: '48px !important' }, '& img': { width: 48, height: 48 } }}>
                        <Logo />
                    </Box>
                    <Box sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
                        CT<Box component="span" sx={{ color: BRAND.green }}>MASS</Box>
                    </Box>
                </Stack>
                <ButtonBase
                    onClick={onClose}
                    aria-label="Close menu"
                    sx={{
                        width: 48,
                        height: 44,
                        borderRadius: RADIUS.tile,
                        bgcolor: alpha('#FFFFFF', 0.12),
                        color: '#FFFFFF',
                        transition: 'background-color .2s ease',
                        '&:hover': { bgcolor: alpha('#FFFFFF', 0.22) },
                        '&:active': { transform: 'scale(0.96)' },
                        '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                    }}
                >
                    <CloseRoundedIcon />
                </ButtonBase>
            </Stack>

            <Box component="nav" aria-label="Main" sx={{ position: 'relative', flexGrow: 1, px: 2.5, pt: 4, overflowY: 'auto' }}>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                    {items.map((item, index) => {
                        const active = isNavItemActive(item, pathname);

                        return (
                            <Box component="li" key={item.title} sx={{ borderBottom: `1px solid ${alpha('#FFFFFF', 0.1)}`, ...(open && enter(index)) }}>
                                <ButtonBase
                                    component={RouterLink}
                                    href={item.path}
                                    onClick={onClose}
                                    aria-current={active ? 'page' : undefined}
                                    sx={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        py: 2,
                                        fontFamily: FONT.display,
                                        fontWeight: 700,
                                        fontSize: 26,
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1.2,
                                        color: active ? BRAND.green : '#FFFFFF',
                                        '& svg': { fontSize: 22, color: active ? BRAND.green : alpha('#FFFFFF', 0.45), transition: 'transform .2s ease, color .2s ease' },
                                        '&:hover svg, &:active svg': { color: BRAND.green, transform: 'translate(2px, -2px)' },
                                        '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                                    }}
                                >
                                    {item.title}
                                    <ArrowOutwardRoundedIcon />
                                </ButtonBase>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Stack spacing={1.25} sx={{ position: 'relative', px: 2.5, pt: 3, pb: 3, ...(open && enter(items.length)) }}>
                <Button
                    component={RouterLink}
                    href={actions.primary.href}
                    onClick={onClose}
                    fullWidth
                    sx={{
                        height: 54,
                        borderRadius: RADIUS.tile,
                        bgcolor: BRAND.green,
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#119A55' },
                        '&:active': { transform: 'scale(0.98)' }
                    }}
                >
                    {actions.primary.label}
                </Button>
                <Button
                    component={RouterLink}
                    href={actions.secondary.href}
                    onClick={onClose}
                    fullWidth
                    startIcon={<EngineeringIcon fontSize="small" />}
                    sx={{
                        height: 54,
                        borderRadius: RADIUS.tile,
                        bgcolor: alpha('#FFFFFF', 0.1),
                        border: `1px solid ${alpha('#FFFFFF', 0.18)}`,
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 700,
                        '&:hover': { bgcolor: alpha('#FFFFFF', 0.18) },
                        '&:active': { transform: 'scale(0.98)' }
                    }}
                >
                    {actions.secondary.label}
                </Button>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1.5, color: alpha('#FFFFFF', 0.7), fontSize: 13, fontWeight: 500 }}>
                    <span>Get the app</span>
                    <Stack direction="row" spacing={1}>
                        {STORES.map(({ label, href, Icon }) => (
                            <ButtonBase
                                key={label}
                                component="a"
                                href={href}
                                target="_blank"
                                rel="noopener"
                                sx={{
                                    gap: 0.75,
                                    px: 1.5,
                                    height: 36,
                                    borderRadius: '10px',
                                    bgcolor: alpha('#FFFFFF', 0.1),
                                    color: '#FFFFFF',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: alpha('#FFFFFF', 0.2) }
                                }}
                            >
                                <Icon sx={{ fontSize: 18 }} />
                                {label}
                            </ButtonBase>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Drawer>
    );
};

SideNav.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    items: PropTypes.array
};
