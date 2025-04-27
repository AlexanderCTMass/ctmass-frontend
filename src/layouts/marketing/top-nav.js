import {useCallback, useState, useEffect} from 'react'; // Добавляем useEffect
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import {
    Box,
    Button,
    Card,
    CardContent, CardHeader,
    Container,
    IconButton,
    Stack,
    SvgIcon,
    Typography,
    useMediaQuery
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {Logo} from 'src/components/logo';
import {RouterLink} from 'src/components/router-link';
import {usePathname} from 'src/hooks/use-pathname';
import {useWindowScroll} from 'src/hooks/use-window-scroll';
import {paths} from 'src/paths';
import {TopNavItem} from './top-nav-item';
import {useAuth} from "../../hooks/use-auth";
import {NotificationsButton} from "../dashboard/notifications-button";
import {AccountButton} from "../dashboard/account-button";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import XIcon from "@untitled-ui/icons-react/build/esm/X";

const items = [
    {
        title: 'Our mission',
        path: paths.ourMission
    },
    {
        title: 'Support & Feedback',
        path: paths.contact
    },
    /*{
        title: 'Help us to become better',
        path: paths.donationGofund,
        color: 'warning.main',
        external: true
    },*/
];

const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
    const {onMobileNavOpen, onLoginNavOpen} = props;
    const {user} = useAuth();
    const pathname = usePathname();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const Up1100 = useMediaQuery((theme) => theme.breakpoints.up(1100));
    const [elevate, setElevate] = useState(false);
    const [showTestMessage, setShowTestMessage] = useState(true);
    useEffect(() => {
        const savedMessageState = window.localStorage.getItem("testMessage");
        setShowTestMessage(savedMessageState !== "closed");
    }, []);

    const offset = 64;
    const delay = 100;

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
                zIndex: (theme) => theme.zIndex.appBar
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    backdropFilter: 'blur(6px)',
                    backgroundColor: 'transparent',
                    borderRadius: 2.5,
                    boxShadow: 'none',
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
                    spacing={2}
                    sx={{height: TOP_NAV_HEIGHT}}
                >
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{flexGrow: 1}}
                    >
                        <Stack
                            alignItems="center"
                            component={RouterLink}
                            direction="row"
                            display="inline-flex"
                            href={paths.index}
                            spacing={1}
                            scrollUp={true}
                            sx={{textDecoration: 'none'}}
                        >
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    height: 56,
                                    width: 56
                                }}
                            >
                                <Logo/>
                            </Box>
                            {mdUp && (
                                <Box
                                    sx={{
                                        color: 'text.primary',
                                        fontFamily: '\'Plus Jakarta Sans\', sans-serif',
                                        fontSize: 14,
                                        fontWeight: 800,
                                        letterSpacing: '0.3px',
                                        lineHeight: 1.5,
                                        '& span': {
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    CT<span>MASS</span>
                                </Box>
                            )}
                        </Stack>
                    </Stack>
                    {mdUp && (
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                        >
                            <Box
                                component="nav"
                                sx={{height: '100%'}}
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
                                        {items.filter((item) => (!item.hideForAuth || !user)).map((item) => {
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
                        sx={{flexGrow: 1}}
                    >
                        {user ? (
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                            >
                                <NotificationsButton/>
                                <AccountButton/>
                            </Stack>
                        ) : (
                            <>
                                {mdUp && (
                                    <Button
                                        size={Up1100 ? 'medium' : 'small'}
                                        variant="outlined"
                                        component={RouterLink}
                                        href={paths.register.serviceProvider}
                                    >
                                        Start providing services
                                    </Button>
                                )}
                                <Button
                                    size={mdUp ? 'medium' : 'small'}
                                    variant="contained"
                                    onClick={() => {
                                        onLoginNavOpen({isProvider: false});
                                    }}
                                >
                                    Login
                                </Button>
                            </>
                        )}
                        {!mdUp && (
                            <IconButton onClick={onMobileNavOpen}>
                                <SvgIcon fontSize="small">
                                    <Menu01Icon/>
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