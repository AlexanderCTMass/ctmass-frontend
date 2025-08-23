import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider, InputAdornment, Link,
    Stack,
    Switch,
    TextField,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { wait } from 'src/utils/wait';
import { CHPU_REGEXP, EMAIL_REGEXP, generateUrlFromStr, PHONE_NUMBER_REGEXP } from "src/utils/regexp";
import { mapboxConfig } from 'src/config';
import { AddressAutofill } from '@mapbox/search-js-react';
import { useState } from "react";

export const BasicCustomerEditForm = (props) => {
    const { customer, onSubmit, ...other } = props;

    const formik = useFormik({
        initialValues: {
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address1: customer.address1 || '',
            address2: customer.address2 || '',
            country: customer.country || '',
            state: customer.state || '',
            publicProfile: customer.publicProfile || false

        },
        validationSchema: Yup.object({
            name: Yup.string().max(255).min(1),
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
            email: Yup
                .string()
                .email('Must be a valid email')
                .max(255)
                .matches(EMAIL_REGEXP, "Incorrect email")
                .required('Email is required'),
            // address1: Yup.string().max(255),
            // address2: Yup.string().max(255),
            // country: Yup.string().max(255),
            // state: Yup.string().max(255)
        }),
        onSubmit: async (values, helpers) => {
            try {
                values.businessName = values.name;
                onSubmit(values);
                helpers.setStatus({ success: true });
                helpers.setSubmitting(false);
                toast.success('Basic info updated');
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        }
    });

    return (
        <form
            onSubmit={formik.handleSubmit}
            {...other}>
            <Grid container>
                <Grid
                    xs={12}
                    md={12}
                >
                    <TextField
                        error={!!(formik.touched.name && formik.errors.name)}
                        fullWidth
                        helperText={formik.touched.name && formik.errors.name}
                        label="Full name"
                        name="name"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.name}
                    />
                </Grid>


                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.email && formik.errors.email)}
                        fullWidth
                        helperText={formik.touched.email && formik.errors.email}
                        label="Email"
                        name="email"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                    />
                </Grid>

                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.phone && formik.errors.phone)}
                        fullWidth
                        helperText={formik.touched.phone && formik.errors.phone}
                        label="Phone number"
                        name="phone"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.phone}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle2"
                    >
                        Public Profile
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Means that anyone viewing your profile will
                        be able to see your contacts details
                    </Typography>
                    <Switch
                        checked={formik.values.publicProfile}
                        color="primary"
                        edge="start"
                        name="publicProfile"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.publicProfile}
                    />
                </Grid>
            </Grid>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                flexWrap="wrap"
                justifyContent={"flex-end"}
                spacing={3}
                sx={{ pt: 3 }}
            >
                <Button
                    disabled={formik.isSubmitting}
                    type="submit"
                    variant="contained"
                >
                    Update
                </Button>
            </Stack>
        </form>
    );
};

BasicCustomerEditForm.propTypes = {
    name: PropTypes.object.isRequired,
    phone: PropTypes.object.isRequired,
    email: PropTypes.object.isRequired
};
