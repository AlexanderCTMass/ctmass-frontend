import { useState, forwardRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Divider,
    Link,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSearchParams } from 'src/hooks/use-search-params';
import { paths } from 'src/paths';
import { IMaskInput } from "react-imask";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { profileApi } from "src/api/profile";
import { phoneYupSchema } from "src/utils/validation/phone";
import { trackEvent } from 'src/libs/analytics/ga4';

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

const RegisterPage = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const isServiceProvider = searchParams.get('isServiceProvider');
    const referralCode = searchParams.get('ref');
    const inviteEmail = searchParams.get('email') || '';
    const inviterId = searchParams.get('invite') || '';
    const inviteCategory = searchParams.get('category') || '';
    const { signInWithGoogle, signInWithFacebook } = useAuth();
    const [isProvider, setIsProvider] = useState(isServiceProvider);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (referralCode) {
        window.localStorage.setItem('referralCode', referralCode);
    }

    // Проверяем в Firestore перед отправкой SMS
    const checkPhoneRegistered = async (phoneNumber) => {
        try {
            return await profileApi.checkExistPhone(phoneNumber);
        } catch (error) {
            console.error("Error checking phone:", error);
            return false;
        }
    };

    const checkEmailRegistered = async (email) => {
        try {
            return await profileApi.checkExistEmail(email);
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            email: inviteEmail,
            phone: '',
            policy: false
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must be less than 50 characters')
                .required('How should we address you?'),
            email: Yup.string().email('Must be a valid email').required('Required'),
            phone: phoneYupSchema,
            policy: Yup.boolean().oneOf([true], 'You must accept the Terms and Conditions')
        }),
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                trackEvent('register_start', { method: 'email', role: isProvider ? 'specialist' : 'homeowner' });
                // Проверяем, есть ли такой email в системе
                const isRegistered = await checkEmailRegistered(values.email);
                if (isRegistered) {
                    throw new Error("Email is already registered");
                }

                if (values.phone) {
                    const isRegistered = await checkPhoneRegistered(`+${values.phone.replace(/\D/g, '')}`);
                    if (isRegistered) {
                        throw new Error("Phone number is already registered");
                    }
                }

                const auth = getAuth();
                const actionCodeSettings = {
                    url: `${window.location.origin}${paths.login.index}?${new URLSearchParams({
                        ...(values.name && { name: encodeURIComponent(values.name) }),
                        ...(values.phone && { phone: encodeURIComponent(values.phone.replace(/\D/g, '')) }),
                        isServiceProvider: (isProvider || false).toString(),
                        ...(returnTo && { returnTo: encodeURIComponent(returnTo) })
                    }).toString()}`,
                    handleCodeInApp: true,
                };

                await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
                // Сохраняем временный профиль в Firestore
                const savedReferralCode = window.localStorage.getItem('referralCode');
                await profileApi.createTempProfile({
                    name: values.name,
                    email: values.email,
                    phone: values.phone ? `+${values.phone.replace(/\D/g, '')}` : null,
                    isProvider: isProvider,
                    emailVerified: false,
                    phoneVerified: false,
                    ...(savedReferralCode && { referredBy: savedReferralCode }),
                    ...(inviterId && { invitedBy: inviterId }),
                    ...(inviteCategory && { inviteCategory })
                });

                window.localStorage.setItem('emailForSignIn', values.email);
                if (values.phone) {
                    window.localStorage.setItem('phoneForVerification', values.phone);
                } else {
                    window.localStorage.removeItem('phoneForVerification');
                }
                trackEvent('register_success', { method: 'email', role: isProvider ? 'specialist' : 'homeowner' });
                // Show success message - email verification sent
                formik.setStatus({ success: true });
            } catch (error) {
                trackEvent('register_error', { method: 'email', error_message: error.message });
                formik.setErrors({ submit: error.message });
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    const handleGoogleClick = async () => {
        try {
            trackEvent('register_start', { method: 'google', role: isProvider ? 'specialist' : 'homeowner' });
            const authResult = await signInWithGoogle();
            if (!authResult) return;
            trackEvent('register_success', { method: 'google', role: isProvider ? 'specialist' : 'homeowner' });
            if (isMounted()) {
                window.location.href = returnTo ||
                    (isProvider
                        ? paths.dashboard.profile.information
                        : paths.cabinet.projects.customer);
            }
        } catch (err) {
            console.error(err);
            trackEvent('register_error', { method: 'google', error_message: err.message });
        }
    };

    const handleFacebookClick = async () => {
        try {
            trackEvent('register_start', { method: 'facebook', role: isProvider ? 'specialist' : 'homeowner' });
            const authResult = await signInWithFacebook();
            if (!authResult) return;
            trackEvent('register_success', { method: 'facebook', role: isProvider ? 'specialist' : 'homeowner' });
            if (isMounted()) {
                window.location.href = returnTo ||
                    (isProvider
                        ? paths.dashboard.profile.information
                        : paths.cabinet.projects.customer);
            }
        } catch (err) {
            console.error(err);
            trackEvent('register_error', { method: 'facebook', error_message: err.message });
        }
    };

    usePageView();

    return (
        <>
            <Seo title="Register" />
            <div>
                <Card elevation={4}>
                    <CardHeader
                        sx={{ pb: 0 }}
                        subheader={(
                            <Typography color="text.secondary" variant="body2">
                                Already have an account?{' '}
                                <Link component={RouterLink} to={paths.login.index} underline="hover">
                                    Log in
                                </Link>
                            </Typography>
                        )}
                        title="Register"
                    />
                    <CardContent>
                        {message && <Alert severity="info">{message}</Alert>}

                        {formik.status?.success ? (
                            <Alert severity="success">
                                Registration complete! Please check your email to verify your account.
                                {formik.values.phone && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        After email verification, you'll be able to verify your phone number
                                        for additional security.
                                    </Typography>
                                )}
                            </Alert>
                        ) : (
                            <form onSubmit={formik.handleSubmit}>
                                <Stack spacing={3}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            p: 0.5,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Button
                                            fullWidth
                                            variant={!isProvider ? 'contained' : 'text'}
                                            onClick={() => setIsProvider(false)}
                                            sx={{
                                                mr: 0.5,
                                                py: 1,
                                                borderRadius: 0.5,
                                                textTransform: 'none',
                                                fontWeight: !isProvider ? 'bold' : 'normal'
                                            }}
                                        >
                                            Homeowner
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant={isProvider ? 'contained' : 'text'}
                                            onClick={() => setIsProvider(true)}
                                            sx={{
                                                ml: 0.5,
                                                py: 1,
                                                borderRadius: 0.5,
                                                textTransform: 'none',
                                                fontWeight: isProvider ? 'bold' : 'normal'
                                            }}
                                        >
                                            Specialist
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: -1 }}>
                                        <Checkbox
                                            checked={formik.values.policy}
                                            name="policy"
                                            onChange={formik.handleChange}
                                            required
                                        />
                                        <Typography color="text.secondary" variant="body2">
                                            I have read the{' '}
                                            <Link component={RouterLink} to={paths.termsAndConditions}>
                                                Terms and Conditions
                                            </Link>
                                        </Typography>
                                    </Box>

                                    <Button
                                        fullWidth
                                        onClick={handleGoogleClick}
                                        size="large"
                                        disabled={!formik.values.policy}
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

                                    <Button
                                        fullWidth
                                        onClick={handleFacebookClick}
                                        size="large"
                                        disabled={!formik.values.policy}
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
                                    </Button>

                                    <Divider>OR</Divider>

                                    <TextField
                                        error={!!(formik.touched.name && formik.errors.name)}
                                        fullWidth
                                        helperText={formik.touched.name && formik.errors.name || "How should we address you?"}
                                        label="Your Name"
                                        name="name"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.name}
                                        required
                                    />

                                    <TextField
                                        error={!!(formik.touched.email && formik.errors.email)}
                                        fullWidth
                                        helperText={formik.touched.email && formik.errors.email}
                                        label="Email Address"
                                        name="email"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        type="email"
                                        value={formik.values.email}
                                        required
                                    />

                                    <TextField
                                        error={!!(formik.touched.phone && formik.errors.phone)}
                                        fullWidth
                                        helperText={
                                            formik.touched.phone && formik.errors.phone
                                                ? formik.errors.phone
                                                : "Optional - adding phone enables faster login and better security"
                                        }
                                        label="Phone Number"
                                        name="phone"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.phone}
                                        placeholder="+1 (123) 456-7890"
                                        InputProps={{
                                            inputComponent: PhoneMaskInput,
                                        }}
                                    />


                                    {formik.errors.submit && (
                                        <Alert severity="error">{formik.errors.submit}</Alert>
                                    )}

                                    <Button
                                        disabled={!formik.values.policy || isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                    >
                                        {isSubmitting ? <CircularProgress size={24} /> :
                                            isProvider ? "Create Specialist Account" : "Create Homeowner Account"}
                                    </Button>


                                </Stack>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default RegisterPage;