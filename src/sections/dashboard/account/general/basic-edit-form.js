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

export const BasicEditForm = (props) => {
    const {name, phone, email, onSubmit, ...other} = props;
    const formik = useFormik({
        initialValues: {
            name: name || '',
            phone: phone || '',
            email: email || '',
        },
        validationSchema: Yup.object({
            name: Yup.string().max(255).min(1),
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
            email: Yup.string().max(255)
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

BasicEditForm.propTypes = {
    name: PropTypes.object.isRequired,
    phone: PropTypes.object.isRequired,
    email: PropTypes.object.isRequired
};
