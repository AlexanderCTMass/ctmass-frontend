import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import {
    Box,
    Button,
    Container,
    IconButton,
    Stack,
    SvgIcon,
    useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import StartIcon from '@mui/icons-material/PlayArrow';
import UserIcon from '@mui/icons-material/PersonOutline';
import { NewLogo } from 'src/components/NewLogo';
import { Logo } from 'src/components/logo'
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
import { useWindowScroll } from 'src/hooks/use-window-scroll';
import { paths } from 'src/paths';
import { TopNavItem } from './top-nav-item';
import { useAuth } from "../../hooks/use-auth";
import DonateButton from 'src/components/stripe/donate-button'
import { NotificationsButton } from "../dashboard/notifications-button";
import { AccountButton } from "../dashboard/account-button";

const TOP_NAV_HEIGHT = 70;

export const TopNav = ({
    onMobileNavOpen,
    onSupportOpen = () => { }
}) => {
    const { user } = useAuth();
    const pathname = usePathname();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const Up1100 = useMediaQuery((theme) => theme.breakpoints.up(1100));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [elevate, setElevate] = useState(false);
    const [showTestMessage, setShowTestMessage] = useState(true);
    useEffect(() => {
        const savedMessageState = window.localStorage.getItem("testMessage");
        setShowTestMessage(savedMessageState !== "closed");
    }, []);

    const offset = 64;
    const delay = 100;

    const navItems = [
        { title: 'For Homeowners', path: paths.forHomeowners },
        { title: 'For Contractors', path: paths.forContractors },
        { title: 'How it works', path: paths.itSolutions },
        { title: 'Become a partner', path: paths.forPartners },
        { title: 'Support', path: '#support', onClick: onSupportOpen }
    ];

    const handleWindowScroll = useCallback(() => {
        if (window.scrollY > offset) {
            setElevate(true);
        } else {
            setElevate(false);
        }
    }, []);

    useWindowScroll({
        handler: handleWindowScroll,
        delay
    });

    return (
        <Box
            component="header"
            sx={{
                left: 0,
                position: 'fixed',
                right: 0,
                top: 0,
                pt: 2,
                pb: 2,
                backgroundColor: elevate ? 'transparent' : '#FFFFFF',
                zIndex: (theme) => theme.zIndex.appBar,
                // position: elevate ? 'fixed' : 'static',
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    backdropFilter: 'blur(6px)',
                    backgroundColor: elevate ? theme => alpha(theme.palette.background.paper, .9) : 'transparent',
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    px: { xs: 2, md: 3 },
                    boxShadow: elevate ? 8 : 'none',
                    transition: (theme) => theme.transitions.create('box-shadow, background-color', {
                        easing: theme.transitions.easing.easeInOut,
                        duration: 200
                    }),
                    ...(elevate && {
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.90),
                        boxShadow: 8
                    })
                }}
            >

                <Stack
                    direction="row"
                    gap={mdUp ? '1vw' : '5vw'}
                    spacing={2}
                    sx={{ height: TOP_NAV_HEIGHT }}
                >
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{ flexGrow: 1 }}
                    >
                        <Stack
                            alignItems="center"
                            component={RouterLink}
                            direction="row"
                            display="inline-flex"
                            href={paths.index}
                            spacing={1}
                            scrollUp={true}
                            sx={{ textDecoration: 'none' }}
                        >
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    height: 56,
                                    width: 160
                                }}
                            >
                                {downSm ? <Logo /> : <NewLogo />}
                            </Box>
                        </Stack>
                    </Stack>

                    {/* {mdUp && (
                        <Button
                            component={RouterLink}
                            href={paths.services.index}
                            variant="contained"
                            startIcon={<SvgIcon fontSize="small"><Menu01Icon /></SvgIcon>}
                            sx={{
                                ml: 3,
                                px: 3,
                                borderRadius: 1.5,
                                backgroundColor: '#D65E34',
                                '&:hover': { backgroundColor: '#c04f29' }
                            }}
                            style={{ maxHeight: 52, fontSize: '13px' }}
                        >
                            EXPLORE SERVICES
                        </Button>
                    )} */}

                    {mdUp && (
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                        >
                            <Box
                                component="nav"
                                sx={{ height: '100%' }}
                            >
                                <Stack
                                    component="ul"
                                    alignItems="center"
                                    justifyContent="center"
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        height: '100%',
                                        listStyle: 'none',
                                        m: 0,
                                        p: 0
                                    }}
                                >
                                    <>
                                        {navItems.filter((item) => (!item.hideForAuth || !user)).map((item) => {
                                            const checkPath = !!(item.path && pathname);
                                            const partialMatch = checkPath ? pathname.includes(item.path) : false;
                                            const exactMatch = checkPath ? pathname === item.path : false;
                                            const active = item.popover ? partialMatch : exactMatch;
                                            const color = item.color ? item.color : null;

                                            return (
                                                <TopNavItem
                                                    active={active}
                                                    external={item.external}
                                                    key={item.title}
                                                    path={item.path}
                                                    popover={item.popover}
                                                    title={item.title}
                                                    ml={item.ml}
                                                    scrollUp={true}
                                                    color={color}
                                                />
                                            );
                                        })}
                                    </>
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-end"
                        spacing={2}
                        sx={{ flexGrow: 1 }}
                    >
                        {user ? (
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={downSm ? 1 : 2}
                                position={!mdUp ? 'fixed' : 'static'}
                                right={!mdUp ? 80 : 0}
                            >
                                <NotificationsButton />
                                <AccountButton />
                            </Stack>
                        ) : (
                            <>
                                {mdUp && (
                                    <Button
                                        variant="soft"
                                        startIcon={<StartIcon fontSize="small" color='#828CA8' />}
                                        component={RouterLink}
                                        href={paths.register.serviceProvider}
                                        sx={{
                                            backgroundColor: '#EFF4F9',
                                            color: '#111927',
                                            borderRadius: 4,
                                            textTransform: 'none',
                                        }}
                                        style={{ height: '50px' }}
                                    >
                                        Start providing services
                                    </Button>
                                )}
                                {mdUp && (
                                    <IconButton component={RouterLink} href={paths.login.index} sx={{ bgcolor: '#16B364', color: '#fff', '&:hover': { backgroundColor: '#EFF4F9' } }} style={{ width: '50px', height: '50px' }}>
                                        <UserIcon />
                                    </IconButton>
                                )}
                            </>
                        )}
                        {!mdUp && (
                            <IconButton onClick={onMobileNavOpen} sx={{ position: 'fixed', right: 16, bgcolor: '#1F2D77', '&:hover': { backgroundColor: '#162fb5' }, color: '#fff', borderRadius: 1, p: 2 }} style={{ width: '53px', height: '44px' }}>
                                <SvgIcon fontSize="small">
                                    <Menu01Icon />
                                </SvgIcon>
                            </IconButton>
                        )}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

TopNav.propTypes = {
    onMobileNavOpen: PropTypes.func,
    onLoginNavOpen: PropTypes.func
};