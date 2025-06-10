import {useCallback, useEffect, useState, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import IMask from 'imask';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormHelperText,
    Link,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useAuth} from 'src/hooks/use-auth';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {useSearchParams} from 'src/hooks/use-search-params';
import {paths} from 'src/paths';
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import ConstructionIcon from "@mui/icons-material/Construction";
import HomeIcon from '@mui/icons-material/Home';
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import {IMaskInput} from "react-imask";

// Phone mask input component
const PhoneMaskInput = forwardRef((props, ref) => {
    const {onChange, ...other} = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{
                '0': /[0-9]/
            }}
            inputRef={ref}
            onAccept={(value) => onChange({target: {name: props.name, value}})}
            overwrite
        />
    );
});

PhoneMaskInput.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const initialValues = {
    email: '',
    password: '',
    phone: '',
    submit: null,
    policy: false
};

const validationSchema = Yup.object({
    email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    password: Yup
        .string()
        .max(255)
        .required('Password is required'),
    phone: Yup
        .string()
        .required('Phone number is required')
        .test('phone', 'Phone number must be valid', (value) => {
            if (!value) return false;
            // Basic validation for phone mask
            return value.replace(/\D/g, '').length === 11;
        }),
    policy: Yup
        .boolean()
        .oneOf([true], 'You must accept the Terms and Conditions')
});

const RegisterPage = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const isServiceProvider = searchParams.get('isServiceProvider');
    const {issuer, createUserWithEmailAndPassword, signInWithGoogle, signInWithFacebook, verifyPhoneNumber} = useAuth();
    const [isProvider, setIsProvider] = useState(isServiceProvider);

    // State for phone verification
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationId, setVerificationId] = useState(null);

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            try {
                // First verify phone number
                const verification = await verifyPhoneNumber(values.phone);
                setVerificationId(verification.verificationId);
                setVerificationDialogOpen(true);

                // Store form values for later use
                helpers.setSubmitting(false);
            } catch (error) {
                console.error(error);
                let errorMessage = 'An unknown error occurred: ' + error.message;

                if (isMounted()) {
                    helpers.setStatus({success: false});
                    helpers.setErrors({submit: errorMessage});
                    helpers.setSubmitting(false);
                }
            }
        }
    });

    const handleVerifyAndContinue = async () => {
        setIsVerifying(true);
        try {
            // Verify the code with Firebase
            const credential = firebase.auth.PhoneAuthProvider.credential(
                verificationId,
                verificationCode
            );

            // Create user with email/password
            await createUserWithEmailAndPassword(
                formik.values.email,
                formik.values.password,
                formik.values.phone,
                credential
            );

            if (isMounted()) {
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = isProvider
                        ? paths.cabinet.profiles.specialistCreateWizard
                        : paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error(error);
            let errorMessage = 'Verification failed: ' + error.message;

            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid verification code. Please try again.';
            }

            formik.setErrors({submit: errorMessage});
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSkipVerification = async () => {
        try {
            // Create user without phone verification
            await createUserWithEmailAndPassword(
                formik.values.email,
                formik.values.password,
                formik.values.phone
            );

            if (isMounted()) {
                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    window.location.href = isProvider
                        ? paths.cabinet.profiles.specialistCreateWizard
                        : paths.cabinet.projects.customer;
                }
            }
        } catch (error) {
            console.error(error);
            formik.setErrors({submit: error.message});
        } finally {
            setVerificationDialogOpen(false);
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
                    window.location.href = isProvider
                        ? paths.cabinet.profiles.specialistCreateWizard
                        : paths.cabinet.projects.customer;
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithGoogle, isMounted, isProvider, returnTo]);

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
                    window.location.href = isProvider
                        ? paths.cabinet.profiles.specialistCreateWizard
                        : paths.cabinet.projects.customer;
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithFacebook, isMounted, isProvider, returnTo]);

    usePageView();

    return (
        <>
            <Seo title="Register"/>
            <div>
                <Card elevation={4}>
                    <CardHeader
                        sx={{pb: 0}}
                        subheader={(
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                Already have an account?
                                &nbsp;
                                <Link
                                    component={RouterLink}
                                    to={paths.login.index}
                                    underline="hover"
                                    variant="subtitle2"
                                >
                                    Log in
                                </Link>
                            </Typography>
                        )}
                        title="Register"
                    />
                    <CardContent>
                        {message &&
                            <Alert severity="info">
                                {message}
                            </Alert>
                        }
                        {!HomePageFeatureToggles.loginEmail &&
                            <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit"/>} severity="warning">
                                {`We apologize, but currently, authentication is only available via Google ${HomePageFeatureToggles.loginFacebook ? "or Facebook." : ""}`}
                            </Alert>}
                        <form
                            noValidate
                            onSubmit={formik.handleSubmit}
                        >
                            <Stack spacing={2} sx={{mt: 1}}>
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
                                {!isProvider ? (
                                    <Alert icon={<HomeIcon fontSize="inherit"/>} severity="info" sx={{mt: 2}}>
                                        As a homeowner, you can post your projects and find specialists to help
                                        with your needs.
                                    </Alert>
                                ) : (
                                    <Alert icon={<ConstructionIcon fontSize="inherit"/>} severity="info"
                                           sx={{mt: 2}}>
                                        As a specialist, you can search for published projects and help
                                        customers with their needs.
                                    </Alert>
                                )}
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        ml: -1,
                                        mt: 1
                                    }}
                                >
                                    <Checkbox
                                        checked={formik.values.policy}
                                        name="policy"
                                        onChange={formik.handleChange}
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
                                </Box>
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
                                        disabled={!formik.values.policy}
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
                                            sx={{mr: 1, width: "20px", height: "20px"}}
                                        />
                                        Sign up with Facebook
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
                            {HomePageFeatureToggles.loginEmail &&
                                <>
                                    <Stack spacing={3}>
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
                                        />
                                        <TextField
                                            error={!!(formik.touched.phone && formik.errors.phone)}
                                            fullWidth
                                            helperText={formik.touched.phone && formik.errors.phone}
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
                                        <TextField
                                            error={!!(formik.touched.password && formik.errors.password)}
                                            fullWidth
                                            helperText={formik.touched.password && formik.errors.password}
                                            label="Password"
                                            name="password"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            type="password"
                                            value={formik.values.password}
                                        />
                                    </Stack>
                                    {formik.errors.submit && (
                                        <FormHelperText
                                            error
                                            sx={{mt: 3}}
                                        >
                                            {formik.errors.submit}
                                        </FormHelperText>
                                    )}
                                    <Box sx={{mt: 2}}>
                                        <Button
                                            disabled={formik.isSubmitting || !formik.values.policy}
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                        >
                                            {isProvider ? "Create Specialist Account" : "Create Homeowner Account"}
                                        </Button>
                                    </Box>
                                </>}
                        </form>
                    </CardContent>
                </Card>

                {/* Phone verification dialog */}
                <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)}>
                    <DialogTitle>Verify Phone Number</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{mb: 2}}>
                            We've sent a verification code to {formik.values.phone}. Please enter it below:
                        </Typography>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            disabled={isVerifying}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSkipVerification} disabled={isVerifying}>
                            Skip Verification
                        </Button>
                        <Button
                            onClick={handleVerifyAndContinue}
                            disabled={isVerifying || !verificationCode}
                            variant="contained"
                        >
                            {isVerifying ? <CircularProgress size={24}/> : "Verify & Continue"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default RegisterPage;