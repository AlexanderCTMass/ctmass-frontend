import * as Yup from 'yup';
import { useFormik } from 'formik';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
    Box, Button, Checkbox, Container, FormControlLabel, Grid, MenuItem, TextField, Typography
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { firestore } from 'src/libs/firebase';
import { emailService } from 'src/service/email-service';
import { useState } from 'react';

const industries = ['Retail', 'Education', 'Manufacturing', 'Other'];

const validationSchema = Yup.object({
    companyName: Yup.string().required('Required'),
    industry: Yup.string().required('Required'),
    contactPerson: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    phone: Yup.string()
        .matches(/^\+?[0-9\- ]{7,20}$/, 'Invalid phone')
        .required('Required'),
    website: Yup.string().nullable(),
    agreed: Yup.bool().oneOf([true], 'Required')
});

export default function PartnerApplyPage() {
    const [submitted, setSubmitted] = useState(false);
    const formik = useFormik({
        initialValues: {
            companyName: '', industry: '', contactPerson: '',
            email: '', phone: '', website: '', comments: '', agreed: false,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
            try {
                await addDoc(collection(firestore, 'partnerApplications'), {
                    companyName: values.companyName,
                    industry: values.industry,
                    contactPerson: values.contactPerson,
                    email: values.email,
                    phone: values.phone,
                    website: values.website || '',
                    comments: values.comments,
                    status: 'pending',
                    appliedAt: serverTimestamp(),
                    agreed: true,
                });

                await emailService.sendPartnerApplication(values)

                resetForm();
                setSubmitted(true);
            } catch (err) {
                console.error(err);
                setStatus({ error: 'Unexpected error. Try again later.' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    if (submitted) {
        return (
            <Container sx={{ py: 12 }}>
                <Typography variant="h4">Thank you! We’ll contact you soon.</Typography>
            </Container>
        );
    }

    return (
        <>
            <Seo title="Become a Partner" />
            <Container maxWidth="sm" sx={{ py: 12 }}>
                <Typography variant="h3" mb={4}>Partnership application</Typography>

                <Box component="form" noValidate onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="companyName" label="Company name*" fullWidth
                                value={formik.values.companyName}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                                helperText={formik.touched.companyName && formik.errors.companyName}
                            />
                        </Grid>

                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="industry" label="Industry*" select fullWidth
                                value={formik.values.industry}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.industry && Boolean(formik.errors.industry)}
                                helperText={formik.touched.industry && formik.errors.industry}
                            >
                                {industries.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="contactPerson" label="Contact person*" fullWidth
                                value={formik.values.contactPerson}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                                helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                            />
                        </Grid>

                        <Grid xs={12} sm={6} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="email" label="Email*" type="email" fullWidth
                                value={formik.values.email}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>

                        <Grid xs={12} sm={6} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="phone" label="Phone*" fullWidth
                                value={formik.values.phone}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                helperText={formik.touched.phone && formik.errors.phone}
                            />
                        </Grid>

                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="website" label="Website" fullWidth
                                value={formik.values.website}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.website && Boolean(formik.errors.website)}
                                helperText={formik.touched.website && formik.errors.website}
                            />
                        </Grid>

                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <TextField
                                name="comments" label="Why do you want to become partner?"
                                fullWidth multiline minRows={4}
                                value={formik.values.comments}
                                onChange={formik.handleChange}
                            />
                        </Grid>

                        <Grid xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="agreed"
                                        color="primary"
                                        checked={formik.values.agreed}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                }
                                label="By checking a box, you consent with terms and conditions"
                            />
                            {formik.touched.agreed && formik.errors.agreed && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.agreed}
                                </Typography>
                            )}
                        </Grid>

                        <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                                {formik.isSubmitting ? 'Sending…' : 'Submit application'}
                            </Button>
                            {formik.status?.error && (
                                <Typography color="error" mt={2}>{formik.status.error}</Typography>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </>
    );
}