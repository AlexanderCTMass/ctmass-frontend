import PropTypes from 'prop-types';
import { Alert, Box, Button, Checkbox, Drawer, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
import { paths } from 'src/paths';
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import { useCallback, useEffect, useState } from "react";
import { useMounted } from "src/hooks/use-mounted";
import { useAuth } from "src/hooks/use-auth";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import { INFO } from "src/libs/log";
import CheckIcon from "@mui/icons-material/Check";
import ConstructionIcon from '@mui/icons-material/Construction';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import { roles } from "src/roles";

export const LoginSideNav = (props) => {
    const { onClose, open = false, params = { isProvider: false } } = props;
    const pathname = usePathname();
    const isMounted = useMounted();
    const { issuer, signInWithEmailAndPassword, signInWithGoogle, signInWithFacebook } = useAuth();

    const handleGoogleClick = useCallback(async () => {
        try {
            const authResult = await signInWithGoogle();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                window.location.href = paths.cabinet.projects.contractor;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithGoogle, isMounted]);
    const handleFacebookClick = useCallback(async () => {
        try {
            const authResult = await signInWithFacebook();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                // returnTo could be an absolute path
                window.location.href = paths.cabinet.projects.contractor;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithFacebook, isMounted]);

    return (
        <Drawer
            anchor="right"
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: 300
                }
            }}
            variant="temporary"
        >

            <Stack
                alignItems="center"
                justifyContent="center"
                direction="row"
                display="inline-flex"
                spacing={1}
                px={2}
                py={1}
                onClick={onClose}
            >
                <Box
                    sx={{
                        display: 'inline-flex',
                        height: 56,
                        width: 56
                    }}
                >
                    <Logo />
                </Box>
                <Box
                    sx={{
                        color: 'text.primary',
                        fontFamily: '\'Plus Jakarta Sans\', sans-serif',
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        lineHeight: 2.5,
                        '& span': {
                            color: 'primary.main'
                        }
                    }}
                >
                    CT<span>MASS</span>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <XIcon />
            </Stack>
            <Box
                component="nav"
                sx={{ p: 2 }}
            >
                <Stack spacing={2} sx={{ mb: 2 }}>
                    <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit" />} severity="warning">
                        {`We apologize, but currently, authentication is only available via Google ${HomePageFeatureToggles.loginFacebook ? "or Facebook." : ""}`}
                    </Alert>


                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Don&apos;t have an account?
                        &nbsp;
                        <Link
                            underline="hover"
                            variant="subtitle2"
                            component={RouterLink}
                            href={paths.register.index}
                        >
                            Register
                        </Link>
                    </Typography>


                    {HomePageFeatureToggles.loginGoogle &&

                        <Button
                            fullWidth
                            onClick={handleGoogleClick}
                            size="large"
                            sx={{
                                backgroundColor: 'common.white',
                                color: 'common.black',
                                '&:hover': {
                                    backgroundColor: 'common.white',
                                    color: 'common.black'
                                }
                            }}
                            variant="contained"
                        >
                            <Box
                                alt="Google"
                                component="img"
                                src="/assets/logos/logo-google.svg"
                                sx={{ mr: 1 }}
                            />
                            Sign up with Google
                        </Button>}
                    {HomePageFeatureToggles.loginFacebook &&
                        <Button
                            fullWidth
                            onClick={handleFacebookClick}
                            size="large"
                            sx={{
                                backgroundColor: 'common.white',
                                color: 'common.black',
                                '&:hover': {
                                    backgroundColor: 'common.white',
                                    color: 'common.black'
                                }
                            }}
                            variant="contained"
                        >
                            <Box
                                alt="Facebook"
                                component="img"
                                src="/assets/logos/logo-facebook.svg"
                                sx={{ mr: 1, width: "20px", height: "20px" }}
                            />
                            Sign up with Facebook
                        </Button>}
                </Stack>
            </Box>
        </Drawer>
    );
};

LoginSideNav.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
};