import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Stack,
    Switch,
    TextField,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {wait} from 'src/utils/wait';
import {PHONE_NUMBER_REGEXP} from "src/utils/regexp";
import {mapboxConfig} from 'src/config';
import {AddressAutofill} from '@mapbox/search-js-react';

export const ContactEditForm = (props) => {
    const {contacts, onSubmit, ...other} = props;
    const formik = useFormik({
        initialValues: {
            address1: contacts.address1 || '',
            address2: contacts.address2 || '',
            country: contacts.country || '',
            phone: contacts.phone || '',
            state: contacts.state || '',
            submit: null
        },
        validationSchema: Yup.object({
            address1: Yup.string().max(255),
            address2: Yup.string().max(255),
            country: Yup.string().max(255),
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
            state: Yup.string().max(255)
        }),
        onSubmit: async (values, helpers) => {
            try {
                // NOTE: Make API request
                onSubmit(values);
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Contacts info updated');
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
            <Grid
                container
            >
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
                    <AddressAutofill accessToken={mapboxConfig.apiKey}>
                        <TextField
                            error={!!(formik.touched.address1 && formik.errors.address1)}
                            fullWidth
                            helperText={formik.touched.address1 && formik.errors.address1}
                            label="Address 1"
                            name="address1"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {formik.setFieldValue("address1", e.target.value)}}
                            value={formik.values.address1}
                            autoComplete="full_address"
                        />
                    </AddressAutofill>
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
            </Grid>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                flexWrap="wrap"
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

ContactEditForm.propTypes = {
    contacts: PropTypes.object.isRequired
};
