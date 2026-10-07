import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, ButtonBase, Container, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EngineeringIcon from '@mui/icons-material/Engineering';
import UserIcon from '@mui/icons-material/PersonOutline';
import { NewLogo } from 'src/components/NewLogo';
import { Logo } from 'src/components/logo'
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
import { useWindowScroll } from 'src/hooks/use-window-scroll';
import { paths } from 'src/paths';
import { BRAND, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';
import { useAuth } from "../../hooks/use-auth";
import { NotificationsButton } from "../dashboard/notifications-button";
import { AccountButton } from "../dashboard/account-button";

export const TOP_NAV_HEIGHT = 70;

export const NAV_ITEMS = [
    { title: 'For Homeowners', path: paths.forHomeowners },
    { title: 'For Contractors', path: paths.forContractors },
    { title: 'How it works', path: paths.howItWorks },
    { title: 'For Partners', path: paths.forPartners },
    { title: 'Support', path: paths.contact }
];

export const isNavItemActive = (item, pathname) => {
    const [itemPath, itemQuery] = item.path.split('?');

    if (pathname !== itemPath) {
        return false;
    }

    return itemQuery ? window.location.search.includes(itemQuery) : !item.exactSearch || !window.location.search;
};

const NavLink = ({ item, active }) => (
    <Box component="li" sx={{ display: 'flex' }}>
        <ButtonBase
            component={RouterLink}
            href={item.path}
            scrollUp
            disableRipple
            aria-current={active ? 'page' : undefined}
            sx={{
                position: 'relative',
                px: 1.5,
                py: 1.25,
                borderRadius: '10px',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: active ? BRAND.navy : BRAND.ink,
                transition: 'color .2s ease, background-color .2s ease',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 4,
                    height: 2,
                    borderRadius: 2,
                    bgcolor: BRAND.green,
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform .25s ease'
                },
                '&:hover': { color: BRAND.navy, bgcolor: alpha(BRAND.navy, 0.05) },
                '&:hover::after': { transform: 'scaleX(1)' },
                '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
            }}
        >
            {item.title}
        </ButtonBase>
    </Box>
);

const Burger = ({ onClick }) => (
    <ButtonBase
        onClick={onClick}
        aria-label="Open menu"
        sx={{
            width: 48,
            height: 44,
            flexShrink: 0,
            borderRadius: RADIUS.tile,
            bgcolor: BRAND.navy,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '5px',
            pl: '14px',
            transition: 'background-color .2s ease',
            '& .burger-bar': {
                display: 'block',
                height: 2,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                transition: 'width .2s ease'
            },
            '&:hover': { bgcolor: BRAND.navyHover },
            '&:hover .burger-bar': { width: '20px !important' },
            '&:active': { transform: 'scale(0.96)' },
            '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
        }}
    >
        <Box component="span" className="burger-bar" sx={{ width: 20 }} />
        <Box component="span" className="burger-bar" sx={{ width: 14 }} />
        <Box component="span" className="burger-bar" sx={{ width: 20 }} />
    </ButtonBase>
);

export const TopNav = ({ onMobileNavOpen, items = NAV_ITEMS }) => {
    const { user } = useAuth();
    const pathname = usePathname();
    const [elevate, setElevate] = useState(false);

    const handleWindowScroll = useCallback(() => {
        setElevate(window.scrollY > 24);
    }, []);

    useWindowScroll({
        handler: handleWindowScroll,
        delay: 60
    });

    return (
        <Box
            component="header"
            className="mui-fixed"
            sx={{
                left: 0,
                position: 'fixed',
                right: 0,
                top: 0,
                py: 2,
                px: { xs: 1.5, sm: 2 },
                pointerEvents: 'none',
                zIndex: (theme) => theme.zIndex.appBar,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    bgcolor: '#FFFFFF',
                    opacity: elevate ? 0 : 1,
                    transition: 'opacity .25s ease'
                }
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative',
                    pointerEvents: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, md: 2 },
                    height: TOP_NAV_HEIGHT,
                    px: { xs: 1.5, md: 2.5 },
                    borderRadius: RADIUS.card,
                    border: '1px solid',
                    borderColor: elevate ? alpha(BRAND.navy, 0.08) : 'transparent',
                    bgcolor: elevate ? alpha('#FFFFFF', 0.86) : 'transparent',
                    backdropFilter: elevate ? 'saturate(160%) blur(14px)' : 'none',
                    boxShadow: elevate ? SHADOW.md : 'none',
                    transition: 'box-shadow .25s ease, background-color .25s ease, border-color .25s ease'
                }}
            >
                <Box
                    component={RouterLink}
                    href={paths.index}
                    scrollUp
                    aria-label="CTMASS home"
                    sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, height: 56, textDecoration: 'none' }}
                >
                    <Box sx={{ display: { xs: 'inline-flex', lg: 'none' }, width: 56, height: 56 }}>
                        <Logo />
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
                        <NewLogo />
                    </Box>
                </Box>

                <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center', minWidth: 0 }}>
                    <Stack component="ul" direction="row" spacing={{ md: 0, lg: 0.5 }} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {items.map((item) => (
                            <NavLink key={item.title} item={item} active={isNavItemActive(item, pathname)} />
                        ))}
                    </Stack>
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={{ xs: 0.5, sm: 1.25 }} sx={{ flexGrow: { xs: 1, md: 0 }, flexShrink: 0 }}>
                    {user ? (
                        <>
                            <NotificationsButton />
                            <AccountButton />
                        </>
                    ) : (
                        <>
                            <Button
                                component={RouterLink}
                                href={paths.register.serviceProvider}
                                startIcon={<EngineeringIcon fontSize="small" />}
                                sx={{
                                    display: { xs: 'none', lg: 'inline-flex' },
                                    height: 46,
                                    px: 2,
                                    borderRadius: RADIUS.tile,
                                    color: BRAND.navy,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    bgcolor: alpha(BRAND.navy, 0.06),
                                    '&:hover': { bgcolor: alpha(BRAND.navy, 0.12) }
                                }}
                            >
                                Start providing services
                            </Button>
                            <Button
                                component={RouterLink}
                                href={paths.login.index}
                                startIcon={<UserIcon />}
                                aria-label="Log in"
                                sx={{
                                    height: { xs: 44, md: 46 },
                                    minWidth: 0,
                                    px: { xs: 1.5, sm: 2.25 },
                                    borderRadius: RADIUS.tile,
                                    bgcolor: BRAND.green,
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    boxShadow: `0 8px 18px ${alpha(BRAND.greenDeep, 0.28)}`,
                                    '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 }, ml: 0 },
                                    '&:hover': { bgcolor: '#119A55' },
                                    '&:active': { transform: 'scale(0.98)' }
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Log in</Box>
                            </Button>
                        </>
                    )}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, pl: 0.5 }}>
                        <Burger onClick={onMobileNavOpen} />
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

TopNav.propTypes = {
    onMobileNavOpen: PropTypes.func,
    items: PropTypes.array
};
