import PropTypes from 'prop-types';
import {Box, Card, CardContent, CardHeader, Container, IconButton, Typography, useMediaQuery} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Footer} from './footer';
import {SideNav} from './side-nav';
import {TopNav} from './top-nav';
import {useMobileNav} from './use-mobile-nav';
import {LoginSideNav} from "src/layouts/marketing/login-side-nav";
import {useEffect, useState} from "react";
import CelebrationIcon from '@mui/icons-material/Celebration';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShareIcon from '@mui/icons-material/Share';
import EventNoteIcon from '@mui/icons-material/EventNote';
import XIcon from '@mui/icons-material/Close';
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
                            <Card sx={{ p: 0, m: 2, zIndex: 10000000, borderLeft: '4px solid #1976d2' }} maxWidth={"md"} elevation={16}>
                                <CardHeader
                                    avatar={<CelebrationIcon color="primary" fontSize="large" />}
                                    title="Join Our Contractor Community!"
                                    titleTypographyProps={{ variant: 'h6', color: 'primary' }}
                                    action={
                                        <IconButton onClick={handleCloseTestMessage}>
                                            <XIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent sx={{ p: 3, pt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <GroupAddIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                                        <Typography variant="body1" paragraph>
                                            We're excited to invite contractors to register on our brand-new startup web hub – CTMASS.com! Whether you're an experienced pro or just starting out, you're more than welcome to join our growing community of trusted contractors.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <MonetizationOnIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                                        <Typography variant="body1" paragraph>
                                            Best of all – our service is 100% free for everyone. No hidden fees, no pay-per-lead nonsense. Just real connections and real opportunities.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <ShareIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                                        <Typography variant="body1" paragraph>
                                            Please feel free to share our platform with your friends and colleagues – let's support local entrepreneurs across Massachusetts and Connecticut!
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                        <EventNoteIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                                        <div>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                Our Timeline:
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>This May</strong> – We're focusing on welcoming and verifying contractors.
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Starting in June</strong> – We'll launch our marketing campaign aimed at homeowners, helping connect them directly with trusted professionals like you.
                                            </Typography>
                                        </div>
                                    </Box>
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
