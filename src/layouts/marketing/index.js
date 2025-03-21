import PropTypes from 'prop-types';
import {Box, Card, CardContent, CardHeader, Container, IconButton, Typography, useMediaQuery} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Footer} from './footer';
import {SideNav} from './side-nav';
import {TopNav} from './top-nav';
import {useMobileNav} from './use-mobile-nav';
import {LoginSideNav} from "src/layouts/marketing/login-side-nav";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import {useEffect, useState} from "react";

const LayoutRoot = styled('div')(({theme}) => ({
    backgroundColor: theme.palette.background.default,
    height: '100%'
}));

export const Layout = (props) => {
    const {children} = props;
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const smDown = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const mobileNav = useMobileNav();
    const loginNav = useMobileNav();
    const [showTestMessage, setShowTestMessage] = useState(true);
    useEffect(() => {
        const savedMessageState = window.localStorage.getItem("testMessage");
        if (savedMessageState) {
            const { closedAt } = JSON.parse(savedMessageState);
            const now = new Date().getTime();
            const timeDiff = now - closedAt;
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (timeDiff > twentyFourHours) {
                setShowTestMessage(true);
                window.localStorage.removeItem("testMessage");
            } else {
                setShowTestMessage(false);
            }
        }
    }, []);


    const handleCloseTestMessage = () => {
        const closedAt = new Date().getTime();
        window.localStorage.setItem("testMessage", JSON.stringify({ closedAt }));
        setShowTestMessage(false);
    };
    return (
        <>
            <TopNav onMobileNavOpen={mobileNav.handleOpen} onLoginNavOpen={loginNav.handleOpen}/>
            {!lgUp && (
                <SideNav
                    onClose={mobileNav.handleClose}
                    open={mobileNav.open}
                />
            )}
            <LoginSideNav
                onClose={loginNav.handleClose}
                open={loginNav.open}
                params={loginNav.params}
            />

            <LayoutRoot sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                // pt: !showTestMessage ? 0 : (smDown ? 20 : 10)
            }}>
                {showTestMessage && (
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            flex: '1 1 auto',
                            zIndex: 10000000,
                            position: 'relative'
                        }}
                    >
                        <div>
                            <Card sx={{p: 0, m: 2, zIndex: 10000000}} maxWidth={"md"} elevation={16}>
                                <CardHeader
                                    title="This is a test version of our website."
                                    action={
                                        <IconButton onClick={handleCloseTestMessage}>
                                            <XIcon/>
                                        </IconButton>
                                    }
                                />
                                <CardContent sx={{p: 1}}>
                                    <Typography variant="body2">
                                        We are actively working on improvements and expect to
                                        launch the full version before the end of March. Stay tuned for updates!
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </Box>
                )}
                {children}
                <Footer/>
            </LayoutRoot>
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node
};
