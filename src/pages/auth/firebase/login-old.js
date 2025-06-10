import {useCallback, useEffect, useState} from 'react';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
    Alert,
    Box,
    Button, ButtonBase,
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

const initialValues = {
    email: '',
    password: '',
    submit: null
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
        .required('Password is required')
});

const LoginPage = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const {issuer, signInWithEmailAndPassword, signInWithGoogle, signInWithFacebook} = useAuth();

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            try {
                await signInWithEmailAndPassword(values.email, values.password);

                if (isMounted()) {
                    if (returnTo) {
                        window.location.href = returnTo;
                    } else {
                        window.location.href = paths.cabinet.projects.customer;
                    }
                }
            } catch (error) {
                console.error(error);
                const errorCode = error.code;
                let errorMessage = 'An unknown error occurred: ' + error.message;

                switch (errorCode) {
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid credential. User not found.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No user found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many login attempts. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                }

                if (isMounted()) {
                    helpers.setStatus({success: false});
                    helpers.setErrors({submit: errorMessage});
                    helpers.setSubmitting(false);
                }
            }
        }
    });

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
                                            {formik.errors.submit}{" "}
                                            {formik.errors.submit === "Invalid credential. User not found." && (
                                                <Link
                                                    component={RouterLink}
                                                    to={paths.register.index}
                                                    underline="hover"
                                                >
                                                    Create an account?
                                                </Link>
                                            )}
                                        </FormHelperText>
                                    )}
                                    <Box sx={{mt: 2}}>
                                        <Button
                                            disabled={formik.isSubmitting}
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                        >
                                            Log In
                                        </Button>
                                    </Box>
                                </>}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default LoginPage;