import { useState, forwardRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Alert,
    Box,
    Button,
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
import { phoneYupSchema, normalizeUSPhone } from "src/utils/validation/phone";
import { AddressAutoComplete } from "src/components/address/AddressAutoComplete";
import { trackEvent } from 'src/libs/analytics/ga4';
import { REGISTRATION_REWARD_KEY } from 'src/components/registration-reward-modal';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { alpha } from '@mui/material/styles';
import { AuthHeading, authDividerSx, authGoogleButtonSx } from 'src/layouts/auth/modern-layout';
import { btn, IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

const ROLE_OPTIONS = [
    { value: false, label: 'Homeowner', hint: 'I need work done', icon: <HomeOutlinedIcon /> },
    { value: true, label: 'Contractor', hint: 'I offer services', icon: <ConstructionOutlinedIcon /> }
];

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
    const { signInWithGoogle } = useAuth();
    const [isProvider, setIsProvider] = useState(isServiceProvider);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (referralCode) {
        window.localStorage.setItem('referralCode', referralCode);
    }

    // Проверяем в Firestore перед отправкой SMS
    const checkPhoneRegistered = async (phoneNumber, email) => {
        try {
            return await profileApi.checkExistPhone(phoneNumber, null, email);
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
            addressLocation: null,
            policy: false
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must be less than 50 characters')
                .required('How should we address you?'),
            email: Yup.string().email('Must be a valid email').required('Required'),
            phone: phoneYupSchema,
            addressLocation: Yup.object().nullable().required('Please add your location'),
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

                const normalizedPhone = values.phone ? normalizeUSPhone(values.phone) : null;
                if (normalizedPhone) {
                    const isRegistered = await checkPhoneRegistered(normalizedPhone, values.email);
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
                    phone: normalizedPhone,
                    isProvider: isProvider,
                    emailVerified: false,
                    phoneVerified: false,
                    ...(values.addressLocation && { addressLocation: values.addressLocation }),
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

    const redirectAfterRegister = () => {
        if (returnTo) {
            window.location.href = returnTo;
            return;
        }

        if (isProvider) {
            window.localStorage.setItem(REGISTRATION_REWARD_KEY, '1');
            window.location.href = paths.dashboard.trades.index;
        } else {
            window.location.href = paths.cabinet.projects.create;
        }
    };

    const handleGoogleClick = async () => {
        try {
            trackEvent('register_start', { method: 'google', role: isProvider ? 'specialist' : 'homeowner' });
            const authResult = await signInWithGoogle();
            if (!authResult) return;
            trackEvent('register_success', { method: 'google', role: isProvider ? 'specialist' : 'homeowner' });
            if (isMounted()) {
                redirectAfterRegister();
            }
        } catch (err) {
            console.error(err);
            trackEvent('register_error', { method: 'google', error_message: err.message });
        }
    };

    usePageView();

    return (
        <>
            <Seo title="Create an account" />
            <div>
                <AuthHeading
                    title={formik.status?.success ? 'Check your email' : 'Create your account'}
                    subtitle={formik.status?.success ? null : (
                        <>
                            Already have an account?{' '}
                            <RouterLink href={paths.login.index}>Log in</RouterLink>
                        </>
                    )}
                />
                <Box>
                        {message && <Alert severity="info">{message}</Alert>}

                        {formik.status?.success ? (
                            <Box sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: '#FFFFFF', borderRadius: RADIUS.card, border: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                                <IconTile size={52}><MarkEmailReadOutlinedIcon /></IconTile>
                                <Typography sx={{ mt: 2, fontSize: 16, lineHeight: 1.6, color: BRAND.ink }}>
                                    We sent a sign-in link to <strong>{formik.values.email}</strong>. Open it on this device to finish creating your account.
                                </Typography>
                                <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.6, color: BRAND.muted }}>
                                    Don&apos;t see it? Check your Spam folder.
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2.5, p: 1.5, borderRadius: RADIUS.inner, bgcolor: alpha('#F5A524', 0.12) }}>
                                    <MonetizationOnIcon sx={{ color: '#F5A524', fontSize: 22 }} />
                                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: BRAND.ink }}>
                                        You received 20 CTMASS coins for signing up
                                    </Typography>
                                </Stack>
                            </Box>
                        ) : (
                            <form onSubmit={formik.handleSubmit}>
                                <Stack spacing={3}>
                                    <Box role="radiogroup" aria-label="I am a" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
                                        {ROLE_OPTIONS.map((option) => {
                                            const selected = !!isProvider === option.value;
                                            return (
                                                <Box
                                                    key={option.label}
                                                    component="button"
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={selected}
                                                    onClick={() => setIsProvider(option.value)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.25,
                                                        p: 1.5,
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        font: 'inherit',
                                                        bgcolor: selected ? alpha(BRAND.green, 0.08) : '#FFFFFF',
                                                        border: `1.5px solid ${selected ? BRAND.green : alpha(BRAND.navy, 0.14)}`,
                                                        borderRadius: RADIUS.inner,
                                                        transition: 'border-color .2s ease, background-color .2s ease',
                                                        '&:hover': { borderColor: selected ? BRAND.green : alpha(BRAND.navy, 0.3) },
                                                        '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                                                    }}
                                                >
                                                    <IconTile size={38} tone={selected ? 'green' : 'navy'}>{option.icon}</IconTile>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 15, color: BRAND.navy, lineHeight: 1.2 }}>
                                                            {option.label}
                                                        </Typography>
                                                        <Typography noWrap sx={{ fontSize: 12, color: BRAND.muted }}>
                                                            {option.hint}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Stack spacing={1}>
                                        <Button
                                            fullWidth
                                            onClick={handleGoogleClick}
                                            size="large"
                                            sx={authGoogleButtonSx}
                                            variant="text"
                                        >
                                            <Box
                                                alt=""
                                                component="img"
                                                src="/assets/logos/logo-google.svg"
                                                sx={{ mr: 1.25, width: 20, height: 20 }}
                                            />
                                            Continue with Google
                                        </Button>
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                            sx={{ textAlign: 'center' }}
                                        >
                                            By continuing with Google, you agree to our{' '}
                                            <Link component={RouterLink} to={paths.termsAndConditions}>
                                                Terms and Conditions
                                            </Link>
                                        </Typography>
                                    </Stack>

                                    <Divider sx={authDividerSx}>or with email</Divider>

                                    <TextField
                                        error={!!(formik.touched.name && formik.errors.name)}
                                        fullWidth
                                        helperText={formik.touched.name && formik.errors.name || "How should we address you?"}
                                        label="Your name"
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
                                        label="Email address"
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
                                                : "Optional. Lets you log in faster with a code."
                                        }
                                        label="Phone number"
                                        name="phone"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.phone}
                                        placeholder="+1 (123) 456-7890"
                                        InputProps={{
                                            inputComponent: PhoneMaskInput,
                                        }}
                                    />

                                    <Box sx={{ '& .MuiTextField-root': { width: '100% !important' } }}>
                                        <AddressAutoComplete
                                            location={formik.values.addressLocation}
                                            autoDetect={false}
                                            withMap={false}
                                            handleSuggestionClick={(place) => {
                                                formik.setFieldValue('addressLocation', place || null);
                                                formik.setFieldTouched('addressLocation', true, false);
                                                if (place) {
                                                    try {
                                                        window.localStorage.setItem('pendingRegistrationLocation', JSON.stringify(place));
                                                    } catch (e) {
                                                        console.warn('Failed to persist pending location', e);
                                                    }
                                                } else {
                                                    window.localStorage.removeItem('pendingRegistrationLocation');
                                                }
                                            }}
                                        />
                                        {formik.touched.addressLocation && formik.errors.addressLocation && (
                                            <Typography color="error" variant="caption">
                                                {formik.errors.addressLocation}
                                            </Typography>
                                        )}
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

                                    {formik.errors.submit && (
                                        <Alert severity="error">{formik.errors.submit}</Alert>
                                    )}

                                    <Button
                                        disabled={!formik.values.policy || isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        sx={{ ...btn.green, minHeight: 52, fontSize: 16 }}
                                    >
                                        {isSubmitting ? <CircularProgress size={22} color="inherit" /> :
                                            isProvider ? 'Create contractor account' : 'Create homeowner account'}
                                    </Button>


                                </Stack>
                            </form>
                        )}
                </Box>
            </div>
        </>
    );
};

export default RegisterPage;