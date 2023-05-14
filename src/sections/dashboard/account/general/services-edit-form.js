import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {Button, Stack, Typography, Unstable_Grid2 as Grid} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Slider from '@mui/material/Slider';
import {useServices} from "src/hooks/use-services";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const ServicesEditForm = (props) => {
    const {selectedServices, onSubmit, ...other} = props;
    const services = useServices();
    const formik = useFormik({
        initialValues: {
            services: selectedServices ? services.filter(service => selectedServices.includes(service.id)) : []
        },
        validationSchema: Yup.object({}),
        onSubmit: async (values, helpers) => {
            try {
                const servicesId = values.services ? values.services.map(service => {
                    return service.id;
                }) : [];
                onSubmit({
                    services: servicesId
                });
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Services info updated');
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
                    <Autocomplete
                        multiple
                        name="services"
                        onChange={(e, value) => {
                            formik.setFieldValue('services', value);
                        }}
                        defaultValue={formik.values.services}
                        value={formik.values.services}
                        options={services}
                        disableCloseOnSelect
                        filterOptions={(options) => formik.values.services ? options.filter(service => !formik.values.services.includes(service)) : []}
                        renderOption={(props, option, {selected}) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        style={{width: 500}}
                        renderInput={(params) => (
                            <TextField {...params} label="What kind of construction do you provide"/>
                        )}
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
}

