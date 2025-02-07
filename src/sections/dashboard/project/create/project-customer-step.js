import Check from '@mui/icons-material/Check';
import {
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

export const ProjectCustomerStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const {issuer, createUserWithEmailAndPassword, signInWithGoogle, setRole} = useAuth();
    const isMounted = useMounted();

    const handleGoogleClick = useCallback(async () => {
        try {
            const authUser = await signInWithGoogle();

            if (isMounted()) {
                handleNext(authUser?.user.uid);
            }
        } catch (err) {
            console.error(err);
        }
    }, [signInWithGoogle, isMounted]);

    const handleNext = (userId) => {
        project.userId = userId;
        onNext(project, true);
    };

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
                <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{mt: 2}}
                >
                    Already have an account?
                    &nbsp;
                    <Link
                        component={RouterLink}
                        href={paths.auth.firebase.login}
                        underline="hover"
                        variant="subtitle2"
                    >
                        Log in
                    </Link>
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
                Google
            </Button>
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


            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
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
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
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
