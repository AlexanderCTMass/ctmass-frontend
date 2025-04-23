import Check from '@mui/icons-material/Check';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    FormHelperText,
    Link,
    Stack,
    SvgIcon,
    TextField,
    Typography
} from '@mui/material';
import {useFormik} from "formik";
import PropTypes from 'prop-types';
import {useCallback} from "react";
import {RouterLink} from "src/components/router-link";
import {useAuth} from "src/hooks/use-auth";
import {useMounted} from "src/hooks/use-mounted";
import {paths} from "src/paths";
import * as Yup from "yup";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import toast from "react-hot-toast";
import {ERROR} from "src/libs/log";
import * as React from "react";

export const ProjectCustomerStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const {issuer, createUserWithEmailAndPassword, signInWithGoogle, signInWithFacebook, setRole} = useAuth();
    const isMounted = useMounted();

    const handleGoogleClick = useCallback(async () => {
        try {
            const authUser = await signInWithGoogle();
            if (!authUser) {
                toast.error("Google sign in failed");
                return;
            }

            if (isMounted()) {
                handleNext(authUser?.user.uid);
            }
        } catch (err) {
            ERROR(err);
        }
    }, [signInWithGoogle, isMounted]);

    const handleFacebookClick = useCallback(async () => {
        try {
            const authUser = await signInWithFacebook();
            if (!authUser) {
                toast.error("Facebook sign in failed");
                return;
            }

            if (isMounted()) {
                handleNext(authUser?.user.uid);
            }
        } catch (err) {
            ERROR(err);
        }
    }, [signInWithFacebook, isMounted]);

    const handleNext = (userId) => {
        project.userId = userId;
        onNext(project, true);
    };

    const handleNextModerate = (email, phone) => {
        project.customerEmail = email;
        project.customerPhone = phone;
        onNext(project, true, true);
    };

    const contactFormik = useFormik({
        initialValues: {
            contactEmail: project.contactEmail || '',
            contactPhone: project.contactPhone || '',
        },
        validationSchema: Yup.object({
            contactEmail: Yup
                .string()
                .email('Must be a valid email'),
            contactPhone: Yup.string()
                .matches(
                    /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                    'Phone number is not valid (e.g. (123) 456-7890)'
                )

        }).test(
            'at-least-one-contact',
            'Please provide at least one contact method (email or phone)',
            function (value) {
                const {contactEmail, contactPhone} = value;
                return !!(contactEmail || contactPhone);
            }
        ),
        onSubmit: (values) => {
            try {
                if (isMounted()) {
                    handleNextModerate(values.contactEmail, values.contactPhone);
                }
            } catch (err) {
                ERROR(err);
            }
        }
    });

    const formik = useFormik({
        initialValues: {
            email: project.email || '',
            password: '',
            policy: false,
        },
        validationSchema: Yup.object({
            email: Yup
                .string()
                .email('Must be a valid email')
                .max(255)
                .required('Email is required'),
            password: Yup
                .string()
                .min(7)
                .max(255)
                .required('Password is required'),
            policy: Yup
                .boolean()
                .oneOf([true], 'This field must be checked')
        }),
        onSubmit: async (values, helpers) => {
            try {
                const authUser = await createUserWithEmailAndPassword(values.email, values.password);
                if (isMounted()) {
                    handleNext(authUser?.user.uid);
                }
            } catch (err) {
                console.error(err);

                if (isMounted()) {
                    helpers.setStatus({success: false});
                    helpers.setErrors({submit: err.message});
                    helpers.setSubmitting(false);
                }
            }
        }
    });

    const isContactFormValid = contactFormik.values.contactEmail || contactFormik.values.contactPhone;
    const hasContactFormErrors = !!(contactFormik.errors.contactEmail || contactFormik.errors.contactPhone);

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Leave contacts for communication
                </Typography>
                <Typography variant="subtitle2">
                    We do not send ads. The specialists don't see the email. You decide who to show it to.
                </Typography>
            </div>
            <Button
                fullWidth
                onClick={handleGoogleClick}
                size="large"
                sx={{
                    backgroundColor: 'common.white',
                    color: 'common.black',
                    cursor: 'pointer',
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
                Sign up with Google
            </Button>
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
                Sign up with Facebook
            </Button>

            {/* New contact fields */}
            <Stack spacing={2}>
                <Alert severity="info">
                    On our platform, you can register and log in via Google or Facebook. Choose the most convenient way
                    for you. <br/>
                    If you don't have a Google or Facebook account, but you still want to use our service,
                    please leave your contacts below so that we can contact you. We will be happy to help!

                </Alert>
                <TextField
                    error={!!(contactFormik.touched.contactEmail && contactFormik.errors.contactEmail)}
                    fullWidth
                    helperText={contactFormik.touched.contactEmail && contactFormik.errors.contactEmail}
                    label="Contact Email"
                    name="contactEmail"
                    onBlur={contactFormik.handleBlur}
                    onChange={contactFormik.handleChange}
                    type="email"
                    value={contactFormik.values.contactEmail}
                />
                <TextField
                    error={!!(contactFormik.touched.contactPhone && contactFormik.errors.contactPhone)}
                    fullWidth
                    helperText={contactFormik.touched.contactPhone && contactFormik.errors.contactPhone}
                    label="Contact Phone"
                    name="contactPhone"
                    onBlur={contactFormik.handleBlur}
                    onChange={contactFormik.handleChange}
                    type="tel"
                    value={contactFormik.values.contactPhone}
                />
                {hasContactFormErrors && (
                    <FormHelperText error>
                        Please provide at least one contact method (email or phone)
                    </FormHelperText>
                )}
            </Stack>

            {HomePageFeatureToggles.loginEmail &&
                <>
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
                    </Box>
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
                                target="_blank" rel="noopener noreferrer"
                            >
                                Terms and Conditions
                            </Link>
                        </Typography>
                    </Box>
                    {!!(formik.touched.policy && formik.errors.policy) && (
                        <FormHelperText error>
                            {formik.errors.policy}
                        </FormHelperText>
                    )}
                    {formik.errors.submit && (
                        <FormHelperText
                            error
                            sx={{mt: 3}}
                        >
                            {formik.errors.submit}
                        </FormHelperText>
                    )}
                </>}

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                {HomePageFeatureToggles.loginEmail &&
                    <Button
                        endIcon={(
                            <SvgIcon>
                                <Check/>
                            </SvgIcon>
                        )}
                        onClick={formik.handleSubmit}
                        variant="contained"
                        disabled={formik.isSubmitting}
                    >
                        Create & publish project
                    </Button>}
                <Button
                    variant="contained"
                    disabled={contactFormik.isSubmitting || !isContactFormValid || hasContactFormErrors}
                    onClick={contactFormik.handleSubmit}
                >
                    Send to moderate
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                    disabled={formik.isSubmitting || contactFormik.isSubmitting}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

ProjectCustomerStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};