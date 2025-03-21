import PropTypes from 'prop-types';
import {Alert, Box, Button, Checkbox, Drawer, FormControlLabel, Link, Stack, Typography} from '@mui/material';
import {Logo} from 'src/components/logo';
import {RouterLink} from 'src/components/router-link';
import {usePathname} from 'src/hooks/use-pathname';
import {paths} from 'src/paths';
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import {useCallback, useEffect, useState} from "react";
import {useMounted} from "src/hooks/use-mounted";
import {useAuth} from "src/hooks/use-auth";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import {INFO} from "src/libs/log";
import CheckIcon from "@mui/icons-material/Check";
import ConstructionIcon from '@mui/icons-material/Construction';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";

export const LoginSideNav = (props) => {
    const {onClose, open = false, params = {isProvider: false}} = props;
    const pathname = usePathname();
    const isMounted = useMounted();
    const {issuer, signInWithEmailAndPassword, signInWithGoogle, signInWithFacebook} = useAuth();
    const [isProvider, setIsProvider] = useState(false);
    const [policy, setPolicy] = useState(false);
    const [haveAccount, setHaveAccount] = useState(true);

    const handleCheckboxChange = (event) => {
        setIsProvider(event.target.checked);
    };

    useEffect(() => {
        setIsProvider(params?.isProvider);
    }, [params]);


    const handleGoogleClick = useCallback(async () => {
        try {
            const authResult = await signInWithGoogle();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                window.location.href = !haveAccount && isProvider ? paths.cabinet.profiles.specialistCreateWizard : paths.cabinet.projects.index;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithGoogle, isMounted, isProvider, haveAccount]);
    const handleFacebookClick = useCallback(async () => {
        try {
            const authResult = await signInWithFacebook();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                // returnTo could be an absolute path
                window.location.href = !haveAccount && isProvider ? paths.cabinet.profiles.specialistCreateWizard : paths.cabinet.projects.index;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithFacebook, isMounted, isProvider, haveAccount]);

    const handlePolicyChange = (event) => {
        setPolicy(event.target.checked)
    };
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
                    <Logo/>
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
                <Box sx={{flexGrow: 1}}/>
                <XIcon/>
            </Stack>
            <Box
                component="nav"
                sx={{p: 2}}
            >
                <Stack spacing={2} sx={{mb: 2}}>
                    <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit"/>} severity="warning">
                        {`We apologize, but currently, authentication is only available via Google ${HomePageFeatureToggles.loginFacebook ? "or Facebook." : ""}`}
                    </Alert>

                    {!haveAccount ?
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            Already have an account?
                            &nbsp;
                            <Link
                                underline="hover"
                                variant="subtitle2"
                                onClick={() => {
                                    setHaveAccount(true)
                                }}
                            >
                                Log in
                            </Link>
                        </Typography>
                        :
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            Don&apos;t have an account?
                            &nbsp;
                            <Link
                                underline="hover"
                                variant="subtitle2"
                                onClick={() => {
                                    setHaveAccount(false)
                                }}
                            >
                                Register
                            </Link>
                        </Typography>}

                    {!haveAccount &&
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isProvider}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label={<Typography
                                color="text.secondary"
                                variant="body2"
                            >Register as a specialist</Typography>}
                            sx={{color: 'text.primary'}}
                        />}
                    {isProvider &&
                        <Alert icon={<ConstructionIcon fontSize="inherit"/>} severity="info">
                            You will be able to
                            search for published
                            projects and help customers.
                        </Alert>
                    }


                    {!haveAccount &&
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                ml: -1,
                                mt: 1
                            }}
                        >
                            <Checkbox
                                checked={policy}
                                name="policy"
                                onChange={handlePolicyChange}
                            />
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                I have read the
                                {' '}
                                <Link
                                    component={RouterLink}
                                    to={paths.termsAndConditions}
                                >
                                    Terms and Conditions
                                </Link>
                            </Typography>
                        </Box>}
                    {HomePageFeatureToggles.loginGoogle &&

                        <Button
                            fullWidth
                            onClick={handleGoogleClick}
                            size="large"
                            disabled={!haveAccount && !policy}
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
                                sx={{mr: 1}}
                            />
                            Google
                        </Button>}
                    {HomePageFeatureToggles.loginFacebook &&
                        <Button
                            fullWidth
                            onClick={handleFacebookClick}
                            size="large"
                            disabled={!haveAccount && !policy}
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
                                sx={{mr: 1, width: "20px", height: "20px"}}
                            />
                            Facebook
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