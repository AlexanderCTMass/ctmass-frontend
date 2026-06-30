import { useCallback, useEffect, useState, forwardRef } from 'react';
import { isValidUSPhone, normalizeUSPhone } from 'src/utils/validation/phone';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, CircularProgress,
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
import { useLoginLinkThrottle } from 'src/hooks/use-login-link-throttle';
import { paths } from 'src/paths';
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import {
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithPhoneNumber,
    linkWithPhoneNumber,
    RecaptchaVerifier,
    PhoneAuthProvider,
    linkWithCredential
} from 'firebase/auth';
import { profileApi } from "src/api/profile";
import { tradesApi } from "src/api/trades";
import { projectsApi } from "src/api/projects";
import { roles } from "src/roles";
import { trackEvent } from 'src/libs/analytics/ga4';
import { REGISTRATION_REWARD_KEY, LOGIN_TRADE_PROMPT_KEY } from 'src/components/registration-reward-modal';
import { WORKER_UPSELL_KEY } from 'src/components/onboarding-upsell-modal';

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
    const referralCode = searchParams.get('ref');
    const { signInWithGoogle, signInWithEmailLink } = useAuth();

    if (referralCode) {
        window.localStorage.setItem('referralCode', referralCode);
    }
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [method, setMethod] = useState('email');
    const [step, setStep] = useState('input');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isEmailLinkFlow, setIsEmailLinkFlow] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Добавляем состояние для индикатора загрузки
    const isPhoneValid = useCallback(() => isValidUSPhone(phone), [phone]);

    // Validate email address
    const isEmailValid = useCallback(() => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }, [email]);

    useEffect(() => {
        const auth = getAuth();

        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleEmailLink();
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [userNotFound, setUserNotFound] = useState(false);
    const [phoneRegistered, setPhoneRegistered] = useState(null);
    const [isSendingLink, setIsSendingLink] = useState(false);

    const loginLinkThrottle = useLoginLinkThrottle(email);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (isSendingLink) return;
        setError(null);
        setUserNotFound(false);

        if (!loginLinkThrottle.canSend) return;

        setIsSendingLink(true);
        try {
            trackEvent('login_start', { method: 'email' });
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
            loginLinkThrottle.registerSend();
            setSuccessMessage('Login link has been sent to your email!');
        } catch (error) {
            console.error('Error sending email:', error);
            trackEvent('login_error', { method: 'email', error_message: error.message });
            setError('Error: ' + error.message);
        } finally {
            setIsSendingLink(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };


    const handleEmailLink = async () => {
        setIsEmailLinkFlow(true);
        setIsProcessing(true); // Включаем индикатор загрузки
        const auth = getAuth();
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
            email = prompt('Please provide your email for confirmation');
            if (!email) {
                setIsEmailLinkFlow(false);
                setIsProcessing(false);
                return;
            }
        }

        try {
            // 1. Сначала выполняем вход по email-ссылке
            const authResult = await signInWithEmailLink(email, window.location.href);

            if (!authResult?.user) {
                throw new Error('Email sign-in failed');
            }

            window.localStorage.removeItem('emailForSignIn');

            // 2. Проверяем, нужно ли привязывать телефон
            const phoneNumber = searchParams.get('phone');
            if (phoneNumber) {
                setMethod('phone');

                try {
                    const cleanPhone = phoneNumber.replace(/\D/g, '');
                    const fullPhoneNumber = cleanPhone.length === 10
                        ? `+1${cleanPhone}`
                        : `+${cleanPhone}`;

                    const currentUser = auth.currentUser;
                    if (!currentUser) {
                        throw new Error('No authenticated user found');
                    }

                    // 4. Отправляем SMS для верификации телефона
                    const appVerifier = window.recaptchaVerifier;
                    const confirmationResult = await linkWithPhoneNumber(
                        currentUser,
                        fullPhoneNumber,
                        appVerifier
                    );
                    window.confirmationResult = confirmationResult;

                    // 5. Переключаем UI на ввод кода подтверждения
                    setStep('code');
                    setSuccessMessage('Enter the verification code sent to your phone.');
                    setIsProcessing(false); // Выключаем индикатор загрузки
                    return;

                } catch (error) {
                    console.error('Phone verification error:', error);
                    setIsProcessing(false); // Выключаем индикатор при ошибке
                    setStep('code');
                    if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/credential-already-in-use') {
                        setError('This phone number is already registered with another account.');
                    } else {
                        setError('Could not send SMS. You can skip phone verification for now.');
                    }
                    return;
                }
            }

            // 6. Если телефон не требуется, завершаем вход
            if (isMounted()) {
                trackEvent('login_success', { method: 'email' });
                setSuccessMessage('You have successfully logged in!');
                setIsProcessing(false); // Выключаем перед навигацией
                await navigateAfterLogin();
            }

        } catch (error) {
            console.error('Email link sign-in error:', error);
            setIsProcessing(false); // Выключаем при ошибке
            trackEvent('login_error', { method: 'email_link', error_message: error.message });
            setError('Login error: ' + error.message);
        }
    };

    const navigateAfterLogin = async () => {
        if (returnTo) {
            window.location.href = returnTo;
            return;
        }

        if (searchParams.get('isServiceProvider') === 'true') {
            window.localStorage.setItem(REGISTRATION_REWARD_KEY, '1');
            window.location.href = paths.dashboard.trades.index;
            return;
        }

        const uid = getAuth().currentUser?.uid;

        if (!uid) {
            window.location.href = paths.dashboard.profile.information;
            return;
        }

        let isServiceProvider = false;
        try {
            const profile = await profileApi.getProfileById(uid);
            isServiceProvider = profile?.role === roles.WORKER;
        } catch (err) {
            console.error('Error loading profile after login:', err);
        }

        if (isServiceProvider) {
            let hasTrade = false;
            try {
                const trades = await tradesApi.getTradesByUser(uid);
                hasTrade = trades.length > 0;
            } catch (err) {
                console.error('Error loading trades after login:', err);
            }

            window.localStorage.setItem(
                hasTrade ? WORKER_UPSELL_KEY : LOGIN_TRADE_PROMPT_KEY,
                '1'
            );
            window.location.href = paths.dashboard.trades.index;
            return;
        }

        // Customer flow: send to project creation only if they have no projects yet.
        let hasProject = false;
        try {
            const projects = await projectsApi.getUserProjects(uid, 1);
            hasProject = projects.length > 0;
        } catch (err) {
            console.error('Error loading projects after login:', err);
        }

        window.location.href = hasProject
            ? paths.cabinet.projects.index
            : paths.cabinet.projects.create;
    };

    // Проверяем в Firestore перед отправкой SMS
    const checkPhoneRegistered = useCallback(async (phoneNumber) => {
        try {
            return await profileApi.checkExistPhone(phoneNumber);
        } catch (error) {
            console.error("Error checking phone:", error);
            return false;
        }
    }, []);
    // Проверяем в Firestore перед отправкой SMS
    const checkEmailRegistered = useCallback(async (email) => {
        try {
            return await profileApi.checkExistEmail(email);
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    }, []);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const fullPhone = normalizeUSPhone(phone);
        if (!fullPhone) {
            setError('Please enter a valid US phone number');
            return;
        }

        // Проверяем в Firestore
        const isRegistered = await checkPhoneRegistered(fullPhone);
        if (!isRegistered) {
            setPhoneRegistered(false);
            return;
        }

        try {
            trackEvent('login_start', { method: 'phone' });
            const auth = getAuth();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            window.confirmationResult = confirmationResult;
            setStep('code');
            setSuccessMessage('SMS with verification code has been sent!');
        } catch (error) {
            console.error('Error sending SMS:', error);
            trackEvent('login_error', { method: 'phone', error_message: error.message });
            setError('Error sending SMS: ' + error.message);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Получаем credential из кода подтверждения
            const credential = PhoneAuthProvider.credential(
                window.confirmationResult.verificationId,
                code
            );

            // Привязываем телефон к существующему пользователю
            await linkWithCredential(user, credential);

            if (isMounted()) {
                trackEvent('login_success', { method: 'phone' });
                setSuccessMessage('Phone number successfully linked! You have successfully logged in!');
                await navigateAfterLogin();
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            trackEvent('login_error', { method: 'phone', error_message: error.message });
            if (error.code === 'auth/provider-already-linked') {
                setError('This phone number is already linked to another account.');
            } else {
                setError('Invalid verification code. Please try again.');
            }
        }
    };

    const handleGoogleClick = async () => {
        try {
            trackEvent('login_start', { method: 'google' });
            const authResult = await signInWithGoogle();
            if (!authResult) {
                return;
            }
            trackEvent('login_success', { method: 'google' });
            if (isMounted()) {
                await navigateAfterLogin();
            }
        } catch (err) {
            console.error(err);
            trackEvent('login_error', { method: 'google', error_message: err.message });
            setError('Google login error: ' + err.message);
        }
    };

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

                        {!isEmailLinkFlow && !HomePageFeatureToggles.loginEmail && (
                            <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit" />} severity="warning">
                                We apologize, but currently, authentication is only available via Google.
                            </Alert>
                        )}

                        {!isEmailLinkFlow && (
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                {HomePageFeatureToggles.loginGoogle && (
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
                                    </Button>
                                )}

                                {HomePageFeatureToggles.loginEmail && (
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
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {(HomePageFeatureToggles.loginEmail || isEmailLinkFlow) && (
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
                                    {isProcessing ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <>
                                            {method === 'email' && !isEmailLinkFlow ? (
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
                                                    {loginLinkThrottle.message && (
                                                        <Alert severity={loginLinkThrottle.isExhausted ? 'error' : 'info'}>
                                                            {loginLinkThrottle.message}
                                                        </Alert>
                                                    )}
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={!isEmailValid() || !loginLinkThrottle.canSend || isSendingLink}
                                                        startIcon={isSendingLink ? <CircularProgress size={18} color="inherit" /> : null}
                                                    >
                                                        {isSendingLink
                                                            ? 'Sending...'
                                                            : loginLinkThrottle.attemptsUsed > 0
                                                                ? 'Resend Login Link'
                                                                : 'Send Login Link'}
                                                    </Button>
                                                    <Typography textAlign="center">
                                                        <Link component="button" type="button"
                                                            onClick={() => {
                                                                setMethod('phone');
                                                                setPhone('');
                                                                setPhoneRegistered(null);
                                                                setEmail(null);
                                                                setUserNotFound(false);
                                                            }}>
                                                            Login with phone instead
                                                        </Link>
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    {step === 'input' && !isEmailLinkFlow ? (
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
                                                            {!isEmailLinkFlow && (
                                                                <Typography textAlign="center">
                                                                    <Link component="button" type="button"
                                                                        onClick={() => {
                                                                            setMethod('email');
                                                                            setPhone('');
                                                                            setPhoneRegistered(null);
                                                                            setEmail(null);
                                                                            setUserNotFound(false);
                                                                        }}>
                                                                        Login with email instead
                                                                    </Link>
                                                                </Typography>
                                                            )}
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
                                                            {isEmailLinkFlow && (
                                                                <Typography textAlign="center">
                                                                    <Link
                                                                        component={RouterLink}
                                                                        to={paths.index}
                                                                        underline="hover"
                                                                        variant="body2"
                                                                    >
                                                                        Skip for now
                                                                    </Link>
                                                                </Typography>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}</>
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