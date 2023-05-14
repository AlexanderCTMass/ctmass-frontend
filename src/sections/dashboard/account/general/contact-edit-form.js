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
import Slider from "@mui/material/Slider";
import * as React from "react";

export const ContactEditForm = (props) => {
    const {address, distance, onSubmit, ...other} = props;

    const valuetext = (value) => {
        return `${value} m`;
    }

    const marks = [
        {
            value: 10,
            label: '10',
        },
        {
            value: 100,
            label: '100',
        },
    ];

    const formik = useFormik({
        initialValues: {
            address: address || '',
            distance: distance || ''
        },
        validationSchema: Yup.object({
            address: Yup.string().max(255),
            distance: Yup.number().max(100).min(10),
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
                    md={12}
                >
                    {/*<AddressAutofill accessToken={mapboxConfig.apiKey} fullWidth>*/}
                        <TextField
                            error={!!(formik.touched.address && formik.errors.address)}
                            fullWidth
                            helperText={formik.touched.address && formik.errors.address}
                            label="Address"
                            name="address"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                                formik.setFieldValue("address", e.target.value)
                            }}
                            value={formik.values.address}
                            // autoComplete="shipping address-line1"
                        />
                    {/*</AddressAutofill>*/}
                </Grid>

                <Grid
                    xs={12}
                    md={12}
                >
                    <Typography id="track-inverted-slider" gutterBottom>
                        Distance you ready to go
                    </Typography>
                    <Slider
                        label="Distance you ready to go"
                        defaultValue={formik.values.distance}
                        getAriaValueText={valuetext}
                        valueLabelDisplay="on"
                        step={10}
                        marks={marks}
                        min={10}
                        max={100}
                        onBlur={formik.handleBlur}
                        onChange={(e, value) => {
                            formik.setFieldValue('distance', value);
                        }}
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

ContactEditForm.propTypes = {
    contacts: PropTypes.object.isRequired
};
