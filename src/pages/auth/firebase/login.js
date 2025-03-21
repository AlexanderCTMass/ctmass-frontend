import {useCallback, useState} from 'react';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Checkbox,
    Divider, FormControlLabel,
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
import {AuthIssuer} from 'src/sections/auth/auth-issuer';
import {roles} from "src/roles";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const initialValues = {
    email: null,
    password: null,
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
        .required('Password is required')
});

const Page = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const message = searchParams.get('message');
    const {issuer, signInWithEmailAndPassword, signInWithGoogle, signInWithFacebook} = useAuth();
    const [isProvider, setIsProvider] = useState(false);


    const handleCheckboxChange = (event) => {
        setIsProvider(event.target.checked);
    };
    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            try {
                await signInWithEmailAndPassword(values.email, values.password);

                if (isMounted()) {
                    window.location.href = returnTo || paths.cabinet.projects.index;
                }
            } catch (error) {
                console.error(error);
                const errorCode = error.code;
                let errorMessage = 'An unknown error occurred: ' + error.message;
                // Обработка ошибок
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
                // returnTo could be an absolute path
                window.location.href = isProvider ? paths.cabinet.profiles.specialistCreateWizard : paths.cabinet.projects.index;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithGoogle, isMounted, isProvider]);

    const handleFacebookClick = useCallback(async () => {
        try {
            const authResult = await signInWithFacebook();
            if (!authResult) {
                return;
            }

            if (isMounted()) {
                // returnTo could be an absolute path
                window.location.href = isProvider ? paths.cabinet.profiles.specialistCreateWizard : paths.cabinet.projects.index;
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithFacebook, isMounted, isProvider]);

    usePageView();

    return (
        <>
            <Seo title="Login"/>
            <div>
                <Card elevation={16}>
                    <CardHeader
                        subheader={(
                            <Alert icon={<SentimentVeryDissatisfiedIcon fontSize="inherit"/>} severity="warning">
                                We apologize, but currently, authentication is only available via Google or Facebook.
                            </Alert>
                        )}
                        sx={{pb: 0}}
                        title="Log in"
                    />
                    <CardContent>
                        {message &&
                            (<div dangerouslySetInnerHTML={{__html: message}}/>)}
                        <form
                            noValidate
                            onSubmit={formik.handleSubmit}
                        >
                            <Stack
                                spacing={2}
                                sx={{
                                    mt: 3
                                }}
                            >
                                <FormControlLabel
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        ml: 0,
                                        mt: 1
                                    }}
                                    control={
                                        <Checkbox
                                            checked={isProvider}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label={<Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >I want to provide specialist services to help customers with their
                                        projects</Typography>}

                                />
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
                                    Google
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
                                        sx={{mr: 1, width: "20px", height: "20px"}}
                                    />
                                    Facebook
                                </Button>
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
                                            {formik.errors.submit}
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
                {/* <Stack
          spacing={3}
          sx={{ mt: 3 }}
        >
          <Alert severity="error">
            <div>
              You can use <b>demo@devias.io</b> and password <b>Password123!</b>
            </div>
          </Alert>
          <AuthIssuer issuer={issuer} />
        </Stack>*/}
            </div>
        </>
    );
};

export default Page;
