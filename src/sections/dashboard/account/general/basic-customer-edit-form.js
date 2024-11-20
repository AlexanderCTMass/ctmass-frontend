import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
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
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {wait} from 'src/utils/wait';
import {CHPU_REGEXP, EMAIL_REGEXP, generateUrlFromStr, PHONE_NUMBER_REGEXP} from "src/utils/regexp";
import {mapboxConfig} from 'src/config';
import {AddressAutofill} from '@mapbox/search-js-react';
import {useState} from "react";

export const BasicCustomerEditForm = (props) => {
    const {customer, onSubmit, ...other} = props;

    const formik = useFormik({
        initialValues: {
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address1: customer.address1 || '',
            address2: customer.address2 || '',
            country: customer.country || '',
            state: customer.state || ''
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
            address1: Yup.string().max(255),
            address2: Yup.string().max(255),
            country: Yup.string().max(255),
            state: Yup.string().max(255)
        }),
        onSubmit: async (values, helpers) => {
            try {
                // NOTE: Make API request
                onSubmit(values);
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Basic info updated');
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
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
                    <TextField
                        error={!!(formik.touched.country && formik.errors.country)}
                        fullWidth
                        helperText={formik.touched.country && formik.errors.country}
                        label="Country"
                        name="country"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.country}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.state && formik.errors.state)}
                        fullWidth
                        helperText={formik.touched.state && formik.errors.state}
                        label="State/Region"
                        name="state"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.state}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.address1 && formik.errors.address1)}
                        fullWidth
                        helperText={formik.touched.address1 && formik.errors.address1}
                        label="Address 1"
                        name="address1"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.address1}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.address2 && formik.errors.address2)}
                        fullWidth
                        helperText={formik.touched.address2 && formik.errors.address2}
                        label="Address 2"
                        name="address2"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.address2}
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
                sx={{pt: 3}}
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
