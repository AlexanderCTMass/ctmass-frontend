import { Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useRouter } from 'src/hooks/use-router';
import { emailSender } from 'src/libs/email-sender';
import { paths } from 'src/paths';
import { RouterLink } from 'src/components/router-link';
import { btn, fieldSx } from 'src/components/ctmass-ui';
import { BRAND } from 'src/theme/ctmass-tokens';

export const ContactForm = () => {
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            message: ''
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().trim().required('Enter your name.'),
            email: Yup.string().trim().email('Enter a valid email address.').required('Enter your email.'),
            message: Yup.string().trim().required('Write a short message.')
        }),
        onSubmit: async (values, helpers) => {
            try {
                await emailSender.sendFeedback(values.name, values.email, values.message);
                helpers.setStatus({ success: true });
                toast.success('Message sent. We will reply by email.');
                router.replace(paths.index);
            } catch (error) {
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: error.message });
                toast.error("We couldn't send your message. Please try again or email support@ctmass.com.");
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });

    const fieldProps = (name) => ({
        name,
        value: formik.values[name],
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        error: !!(formik.touched[name] && formik.errors[name]),
        helperText: formik.touched[name] && formik.errors[name],
        fullWidth: true,
        variant: 'outlined',
        sx: fieldSx
    });

    return (
        <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={2.5}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2.5
                    }}
                >
                    <TextField label="Full name" autoComplete="name" required {...fieldProps('name')} />
                    <TextField label="Email" type="email" autoComplete="email" required {...fieldProps('email')} />
                </Box>
                <TextField
                    label="Message"
                    placeholder="Tell us what you need help with, or what we could do better."
                    multiline
                    minRows={6}
                    required
                    {...fieldProps('message')}
                />
            </Stack>
            <Button
                fullWidth
                type="submit"
                disabled={formik.isSubmitting}
                endIcon={<SendRoundedIcon />}
                sx={{ ...btn.green, mt: 3, minHeight: 54, fontSize: 16 }}
            >
                {formik.isSubmitting ? 'Sending...' : 'Send message'}
            </Button>
            <Typography sx={{ mt: 2, fontSize: 13, lineHeight: 1.6, color: BRAND.muted }}>
                By sending this form, you agree to the{' '}
                <Link component={RouterLink} href={paths.privacyPolicy} sx={{ color: BRAND.navy, fontWeight: 600 }}>
                    Privacy Policy
                </Link>
                {' '}and{' '}
                <Link component={RouterLink} href={paths.cookiePolicy} sx={{ color: BRAND.navy, fontWeight: 600 }}>
                    Cookie Policy
                </Link>
                .
            </Typography>
        </form>
    );
};
