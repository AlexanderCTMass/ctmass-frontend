import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {Button, Stack, Unstable_Grid2 as Grid} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const ServicesEditForm = (props) => {
    const {selectedServices, onSubmit, ...other} = props;
    const formik = useFormik({
        initialValues: {
            services: selectedServices,
            submit: null
        },
        validationSchema: Yup.object({}),
        onSubmit: async (values, helpers) => {
            try {
                onSubmit(values.services);
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
                        onBlur={formik.handleBlur}
                        onChange={(e, value) => {
                            formik.setFieldValue('services', value);
                        }}
                        value={formik.values.services}
                        options={services}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.title}
                        renderOption={(props, option, {selected}) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.title}
                            </li>
                        )}
                        style={{width: 500}}
                        renderInput={(params) => (
                            <TextField {...params} label="Services"/>
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

const services = [
    {title: 'Siding', id: 1},
    {title: 'Framing', id: 2},
    {title: 'Plumbing', id: 3},
    {title: 'Handyman', id: 4},
    {title: 'Dryall', id: 5},
    {title: 'Heating', id: 6},
    {title: 'A/C', id: 7},
    {title: 'Ventilation', id: 8},
    {title: 'Electrician', id: 9},
    {title: 'Hardwood floors', id: 10},
    {title: 'Roofing', id: 11},
    {title: 'Appliences repair', id: 12},
    {title: 'Tile', id: 13},
    {title: 'Bathroom specialist', id: 14},
    {title: 'Door installation', id: 15}
];