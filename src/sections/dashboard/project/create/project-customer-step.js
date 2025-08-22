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
import { useFormik } from "formik";
import PropTypes from 'prop-types';
import { forwardRef, useCallback, useState } from "react";
import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { paths } from "src/paths";
import * as Yup from "yup";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import toast from "react-hot-toast";
import { ERROR } from "src/libs/log";
import * as React from "react";
import { IMaskInput } from "react-imask";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { profileApi } from "src/api/profile";


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

export const ProjectCustomerStep = (props) => {
    const { onBack, onNext, project, ...other } = props;
    const { issuer, signInWithGoogle, signInWithFacebook, setRole } = useAuth();
    const isMounted = useMounted();
    const [isRegistered, setIsRegistered] = useState(false);

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
        project.contactEmail = formik.values.contactEmail;
        project.contactPhone = formik.values.contactPhone;
        onNext(project, true);
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
            name: project.customerName || '',
            contactEmail: project.contactEmail || '',
            contactPhone: project.contactPhone || '',
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must be less than 50 characters')
                .required('How should we address you?'),
            contactEmail: Yup
                .string()
                .required('Email is required')
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
                const { contactEmail, contactPhone } = value;
                return !!(contactEmail || contactPhone);
            }
        ),
        onSubmit: async (values) => {
            try {
                // Проверяем, есть ли такой email в системе
                const isRegistered = await checkEmailRegistered(values.contactEmail);
                if (isRegistered) {
                    throw new Error("Email is already registered");
                }

                if (values.contactPhone) {
                    const isRegistered = await checkPhoneRegistered(`+${values.contactPhone.replace(/\D/g, '')}`);
                    if (isRegistered) {
                        throw new Error("Phone number is already registered");
                    }
                }

                const auth = getAuth();
                const actionCodeSettings = {
                    url: `${window.location.origin}${paths.login.index}?${new URLSearchParams({
                        ...(values.name && { name: encodeURIComponent(values.name) }),
                        ...(values.contactPhone && { phone: encodeURIComponent(values.contactPhone.replace(/\D/g, '')) }),
                        // returnTo: paths.cabinet.projects.find.index,
                        isServiceProvider: false.toString()
                    })
                        }).toString()}`,
                    handleCodeInApp: true,
                };

                await sendSignInLinkToEmail(auth, values.contactEmail, actionCodeSettings);
                // Сохраняем временный профиль в Firestore
                await profileApi.createTempProfile({
                    name: values.name,
                    email: values.contactEmail,
                    phone: values.contactPhone ? `+${values.contactPhone.replace(/\D/g, '')}` : null,
                    isProvider: false,
                    emailVerified: false,
                    phoneVerified: false,
                    project: project
                });

                window.localStorage.setItem('emailForSignIn', values.contactEmail);
                if (values.contactPhone) {
                    window.localStorage.setItem('phoneForVerification', values.contactPhone);
                } else {
                    window.localStorage.removeItem('phoneForVerification');
                }
                // Show success message - email verification sent
                formik.setStatus({ success: true });
            } catch (error) {
                formik.setErrors({ submit: error.message });
            } finally {
                setIsRegistered(true);
            }
        }
    });

    const isSubmitDisabled = !formik.isValid || formik.isSubmitting;

    return (
        <Stack
            spacing={3}
            {...other}>
            {isRegistered && (
                <Alert severity="success">
                    Verification email sent to {formik.values.contactEmail}. Please click the link in the email to
                    complete your registration.
                </Alert>
            )}
            {!isRegistered && (
                <>
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
                            sx={{ mr: 1 }}
                        />
                        Sign up with Google & publish project
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
                            sx={{ mr: 1, width: "20px", height: "20px" }}
                        />
                        Sign up with Facebook & publish project
                    </Button>

                    {/* New contact fields */}
                    <Stack spacing={2}>
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
                            error={!!(formik.touched.contactEmail && formik.errors.contactEmail)}
                            fullWidth
                            helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                            label="Contact Email"
                            name="contactEmail"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="email"
                            value={formik.values.contactEmail}
                        />

                        <TextField
                            error={!!(formik.touched.contactPhone && formik.errors.contactPhone)}
                            fullWidth
                            helperText={
                                formik.touched.contactPhone && formik.errors.contactPhone
                                    ? formik.errors.contactPhone
                                    : "Optional - adding phone enables faster login and better security"
                            }
                            label="Contact Phone"
                            name="contactPhone"
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
                    </Stack>


                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        <Button
                            endIcon={(
                                <SvgIcon>
                                    <Check />
                                </SvgIcon>
                            )}
                            onClick={formik.handleSubmit}
                            variant="contained"
                            disabled={isSubmitDisabled}
                        >
                            Create an account & publish project
                        </Button>
                        <Button
                            color="inherit"
                            onClick={onBack}
                            disabled={formik.isSubmitting}
                        >
                            Back
                        </Button>
                    </Stack>
                </>)}
        </Stack>
    );
};

ProjectCustomerStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    project: PropTypes.object
};