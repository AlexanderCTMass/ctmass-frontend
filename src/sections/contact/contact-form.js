import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Link,
    OutlinedInput,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {useFormik} from "formik";
import {useCallback} from 'react';
import toast from "react-hot-toast";
import {useRouter} from "src/hooks/use-router";
import {emailSender} from "src/libs/email-sender";
import {paths} from "src/paths";
import {PHONE_NUMBER_REGEXP} from "src/utils/regexp";
import {wait} from "src/utils/wait";
import * as Yup from "yup";

export const ContactForm = () => {
    const router = useRouter();
    const handleSubmit = useCallback((event) => {
        event.preventDefault();
    }, []);


    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            message: ''
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required("Name is required"),
            message: Yup.string().required("Message is required"),
            email: Yup.string().email("incorrect").required("Email is required"),
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
        }),
        onSubmit: async (values, helpers) => {
            emailSender.sendFeedback(values.name, values.email, values.phone, values.message).then(() => {
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success("Thank you for feedback!");
                wait(500);
                router.replace(paths.index);

            }).catch((error) => {
                helpers.setStatus({success: false});
                helpers.setErrors({submit: error.message});
                helpers.setSubmitting(false);
            });
        }
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            <Grid
                container
                spacing={3}
            >
                <Grid
                    xs={12}
                    sm={12}
                >
                    <FormControl fullWidth>
                        <FormLabel
                            sx={{
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            Full Name *
                        </FormLabel>
                        <OutlinedInput
                            name="name"
                            error={!!(formik.touched.name && formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.name}
                        />
                    </FormControl>
                </Grid>
                <Grid
                    xs={12}
                    sm={6}
                >
                    <FormControl fullWidth>
                        <FormLabel
                            sx={{
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            Email *
                        </FormLabel>
                        <OutlinedInput
                            name="email"
                            type="email"
                            error={!!(formik.touched.email && formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                    </FormControl>
                </Grid>
                <Grid
                    xs={12}
                    sm={6}
                >
                    <FormControl fullWidth>
                        <FormLabel
                            sx={{
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            Phone Number
                        </FormLabel>
                        <OutlinedInput
                            name="phone"
                            error={!!(formik.touched.phone && formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.phone}
                            type="tel"
                        />
                    </FormControl>
                </Grid>
                <Grid xs={12}>
                    <FormControl fullWidth>
                        <FormLabel
                            sx={{
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            Message *
                        </FormLabel>
                        <OutlinedInput
                            fullWidth
                            name="message"
                            multiline
                            rows={6}
                            error={!!(formik.touched.message && formik.errors.message)}
                            helperText={formik.touched.message && formik.errors.message}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.message}
                        />
                    </FormControl>
                </Grid>
            </Grid>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 3
                }}
            >
                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={formik.isSubmitting}
                    type="submit"
                >
                    Let&apos;s Talk
                </Button>
            </Box>
            <Typography
                color="text.secondary"
                sx={{mt: 3}}
                variant="body2"
            >
                By submitting this, you agree to the
                {' '}
                <Link
                    color="text.primary"
                    href={paths.privacyPolicy}
                    underline="always"
                    variant="subtitle2"
                >
                    Privacy Policy
                </Link>
                {' '}
                and
                {' '}
                <Link
                    color="text.primary"
                    href={paths.cookiePolicy}
                    underline="always"
                    variant="subtitle2"
                >
                    Cookie Policy
                </Link>
                .
            </Typography>
        </form>
    );
};
