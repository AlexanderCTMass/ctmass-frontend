import {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    FormHelperText,
    Link,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useAuth} from 'src/hooks/use-auth';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {useSearchParams} from 'src/hooks/use-search-params';
import {paths} from 'src/paths';
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import {getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPhoneNumber, RecaptchaVerifier} from 'firebase/auth';

const LoginPage = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const {issuer, signInWithGoogle, signInWithFacebook} = useAuth();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [method, setMethod] = useState('email'); // 'email' или 'phone'
    const [step, setStep] = useState('input'); // 'input', 'code' для телефона
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const auth = getAuth();

        // Проверяем, перешли ли мы по ссылке для входа
        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleEmailLink();
        }

        // Инициализация reCAPTCHA
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
        }, auth);
    }, []);

    const handleEmailLink = async () => {
        const auth = getAuth();
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
            email = prompt('Пожалуйста, введите ваш email для подтверждения');
        }

        try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');

            if (isMounted()) {
                setSuccessMessage('Вы успешно вошли!');
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error('Error signing in:', error);
            setError('Ошибка при входе: ' + error.message);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const actionCodeSettings = {
            url: `${window.location.origin}${paths.login.index}`,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setSuccessMessage('Ссылка для входа отправлена на ваш email!');
            setError(null);
        } catch (error) {
            console.error('Error sending email:', error);
            setError('Ошибка: ' + error.message);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
            window.confirmationResult = confirmationResult;
            setStep('code');
            setSuccessMessage('SMS с кодом подтверждения отправлено!');
            setError(null);
        } catch (error) {
            console.error('Error sending SMS:', error);
            setError('Ошибка при отправке SMS: ' + error.message);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await window.confirmationResult.confirm(code);

            if (isMounted()) {
                setSuccessMessage('Вы успешно вошли!');
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            setError('Неверный код подтверждения. Пожалуйста, попробуйте снова.');
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
            setError('Ошибка при входе через Google: ' + err.message);
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
            setError('Ошибка при входе через Facebook: ' + err.message);
        }
    }, [signInWithFacebook, isMounted, returnTo]);

    usePageView();

    return (
        <>
            <Seo title="Login"/>
            <div>
                <Card elevation={4}>
                    <CardHeader
                        sx={{pb: 0}}
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
                        {successMessage && <Alert severity="success">{successMessage}</Alert>}
                        {error && <Alert severity="error">{error}</Alert>}

                        {!HomePageFeatureToggles.loginEmail &&
                            <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit"/>} severity="warning">
                                {`We apologize, but currently, authentication is only available via Google ${HomePageFeatureToggles.loginFacebook ? "or Facebook." : ""}`}
                            </Alert>}

                        <Stack spacing={2} sx={{mt: 1}}>
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
                                        sx={{mr: 1}}
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
                                        sx={{mr: 1, width: "20px", height: "20px"}}
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
                                    <Box sx={{flexGrow: 1}}>
                                        <Divider orientation="horizontal"/>
                                    </Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{m: 2}}
                                        variant="body1"
                                    >
                                        OR
                                    </Typography>
                                    <Box sx={{flexGrow: 1}}>
                                        <Divider orientation="horizontal"/>
                                    </Box>
                                </Box>}
                        </Stack>

                        {HomePageFeatureToggles.loginEmail && (
                            <Box component="form" onSubmit={method === 'email' ? handleEmailSubmit : (step === 'input' ? handlePhoneSubmit : handleCodeSubmit)}>
                                <Stack spacing={3} sx={{mt: 3}}>
                                    {method === 'email' ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <Button
                                                fullWidth
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                            >
                                                Send Login Link
                                            </Button>
                                            <Typography textAlign="center">
                                                <Link component="button" type="button" onClick={() => setMethod('phone')}>
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
                                                        type="tel"
                                                        placeholder="+1234567890"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        required
                                                    />
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Send Verification Code
                                                    </Button>
                                                    <Typography textAlign="center">
                                                        <Link component="button" type="button" onClick={() => setMethod('email')}>
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
                <div id="recaptcha-container" style={{display: 'none'}}></div>
            </div>
        </>
    );
};

export default LoginPage;