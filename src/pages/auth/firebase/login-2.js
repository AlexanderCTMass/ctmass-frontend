import { useCallback, useEffect, useState, forwardRef } from 'react';
import { isValidUSPhone } from 'src/utils/validation/phone';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Link,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { IMaskInput } from 'react-imask';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSearchParams } from 'src/hooks/use-search-params';
import { paths } from 'src/paths';
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import {
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    fetchSignInMethodsForEmail,
    signInWithCredential,
    PhoneAuthProvider
} from 'firebase/auth';
import { profileApi } from "src/api/profile";

// Phone number mask component
const PhoneMaskInput = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{
                '0': /[0-9]/
            }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const LoginPage = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const { issuer, signInWithGoogle, signInWithFacebook, signInWithEmailLink } = useAuth();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [method, setMethod] = useState('email');
    const [step, setStep] = useState('input');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const isPhoneValid = () => {
        return isValidUSPhone(phone);
    };

    // Validate email address
    const isEmailValid = () => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        const auth = getAuth();

        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleEmailLink();
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
        }, auth);
    }, []);

    const [userNotFound, setUserNotFound] = useState(false);
    const [phoneRegistered, setPhoneRegistered] = useState(null);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUserNotFound(false);

        try {
            // Проверяем, есть ли такой email в системе
            const auth = getAuth();
            const isRegistered = await checkEmailRegistered(email);
            if (!isRegistered) {
                setUserNotFound(true);
                return;
            }
            const actionCodeSettings = {
                url: `${window.location.origin}${paths.login.index}?returnTo=${returnTo || ''}`,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setSuccessMessage('Login link has been sent to your email!');
        } catch (error) {
            console.error('Error sending email:', error);
            setError('Error: ' + error.message);
        }
    };

    const handleEmailLink = async () => {
        const auth = getAuth();
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
            email = prompt('Please provide your email for confirmation');
        }

        try {
            // Дополнительная проверка перед входом
            const isRegistered = await checkEmailRegistered(email);
            if (!isRegistered) {
                setUserNotFound(true);
                return;
            }
            const authResult = await signInWithEmailLink(email, window.location.href);
            if (!authResult) {
                return;
            }
            window.localStorage.removeItem('emailForSignIn');

            if (isMounted()) {
                setSuccessMessage('You have successfully logged in!');
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error('Error signing in:', error);
            setError('Login error: ' + error.message);
        }
    };

    // Проверяем в Firestore перед отправкой SMS
    const checkPhoneRegistered = async (phoneNumber) => {
        try {
            return await profileApi.checkExistPhone(phoneNumber);
        } catch (error) {
            console.error("Error checking phone:", error);
            return false;
        }
    };
    // Проверяем в Firestore перед отправкой SMS
    const checkEmailRegistered = async (email) => {
        try {
            return await profileApi.checkExistEmail(email);
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const cleanPhone = phone.replace(/\D/g, '');

        // Проверяем в Firestore
        const isRegistered = await checkPhoneRegistered(`+${cleanPhone}`);
        if (!isRegistered) {
            setPhoneRegistered(false);
            return;
        }

        try {
            const auth = getAuth();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, `+${cleanPhone}`, appVerifier);
            window.confirmationResult = confirmationResult;
            setStep('code');
            setSuccessMessage('SMS with verification code has been sent!');
        } catch (error) {
            console.error('Error sending SMS:', error);
            setError('Error sending SMS: ' + error.message);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await window.confirmationResult.confirm(code);

            if (isMounted()) {
                setSuccessMessage('You have successfully logged in!');
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            setError('Invalid verification code. Please try again.');
        }
    };

    const handleGoogleClick = useCallback(async () => {
        try {
            const authResult = await signInWithGoogle();
            if (!authResult) {
                return;
            }
            if (isMounted()) {
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (err) {
            console.error(err);
            setError('Google login error: ' + err.message);
        }
    }, [signInWithGoogle, isMounted, returnTo]);

    const handleFacebookClick = useCallback(async () => {
        try {
            const authResult = await signInWithFacebook();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (err) {
            console.error(err);
            setError('Facebook login error: ' + err.message);
        }
    }, [signInWithFacebook, isMounted, returnTo]);

    usePageView();

    return (
        <>
            <Seo title="Login" />
            <div>
                <Card elevation={4}>
                    <CardHeader
                        sx={{ pb: 0 }}
                        subheader={(
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                Don't have an account?
                                &nbsp;
                                <Link
                                    component={RouterLink}
                                    to={paths.register.index}
                                    underline="hover"
                                    variant="subtitle2"
                                >
                                    Register
                                </Link>
                            </Typography>
                        )}
                        title="Log in"
                    />
                    <CardContent>
                        {message && <Alert severity="info">{message}</Alert>}

                        {!HomePageFeatureToggles.loginEmail &&
                            <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit" />} severity="warning">
                                {`We apologize, but currently, authentication is only available via Google ${HomePageFeatureToggles.loginFacebook ? "or Facebook." : ""}`}
                            </Alert>}

                        <Stack spacing={2} sx={{ mt: 1 }}>
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
                                    Continue with Google
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
                                    Sign in with Facebook
                                </Button>}

                            {HomePageFeatureToggles.loginEmail &&
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        mt: 2
                                    }}
                                >
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Divider orientation="horizontal" />
                                    </Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ m: 2 }}
                                        variant="body1"
                                    >
                                        OR
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Divider orientation="horizontal" />
                                    </Box>
                                </Box>}
                        </Stack>

                        {HomePageFeatureToggles.loginEmail && (
                            <Box component="form"
                                onSubmit={method === 'email' ? handleEmailSubmit : (step === 'input' ? handlePhoneSubmit : handleCodeSubmit)}>
                                <Stack spacing={3} sx={{ mt: 3 }}>
                                    {userNotFound && (
                                        <Alert severity="error" action={
                                            <Button
                                                color="inherit"
                                                size="small"
                                                component={RouterLink}
                                                to={`${paths.register.index}?email=${encodeURIComponent(email)}`}
                                            >
                                                REGISTER
                                            </Button>
                                        }>
                                            User not found. Would you like to register?
                                        </Alert>
                                    )}
                                    {/* Сообщение для телефона */}
                                    {phoneRegistered === false && (
                                        <Alert severity="error" action={
                                            <Button
                                                color="inherit"
                                                size="small"
                                                component={RouterLink}
                                                to={`${paths.register.index}?phone=${encodeURIComponent(phone)}`}
                                            >
                                                REGISTER
                                            </Button>
                                        }>
                                            This phone number is not registered. Would you like to create an account?
                                        </Alert>
                                    )}
                                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                                    {error && <Alert severity="error">{error}</Alert>}
                                    {method === 'email' ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                error={!!email && !isEmailValid()}
                                                helperText={!!email && !isEmailValid() ? "Please enter a valid email address" : ""}
                                            />
                                            <Button
                                                fullWidth
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                disabled={!isEmailValid()}
                                            >
                                                Send Login Link
                                            </Button>
                                            <Typography textAlign="center">
                                                <Link component="button" type="button"
                                                    onClick={() => setMethod('phone')}>
                                                    Login with phone instead
                                                </Link>
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            {step === 'input' ? (
                                                <>
                                                    <TextField
                                                        fullWidth
                                                        label="Phone Number"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        required
                                                        InputProps={{
                                                            inputComponent: PhoneMaskInput,
                                                        }}
                                                        error={!!phone && !isPhoneValid()}
                                                        helperText={!!phone && !isPhoneValid() ? "Please enter a valid US phone number" : ""}
                                                    />
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={!isPhoneValid()}
                                                    >
                                                        Send Verification Code
                                                    </Button>
                                                    <Typography textAlign="center">
                                                        <Link component="button" type="button"
                                                            onClick={() => setMethod('email')}>
                                                            Login with email instead
                                                        </Link>
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <TextField
                                                        fullWidth
                                                        label="Verification Code"
                                                        value={code}
                                                        onChange={(e) => setCode(e.target.value)}
                                                        required
                                                    />
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Verify Code
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
                <div id="recaptcha-container" style={{ display: 'none' }}></div>
            </div>
        </>
    );
};

export default LoginPage;