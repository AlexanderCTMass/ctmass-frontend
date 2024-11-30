import {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import {QuillEditor} from 'src/components/quill-editor';
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {PHONE_NUMBER_REGEXP} from "../../../../utils/regexp";
import {jobApi} from "../../jobs/jobApi";

export const ProjectCustomerStep = (props) => {
    const {onBack, onNext, job, ...other} = props;
    const [content, setContent] = useState(job.description);

    const formik = useFormik({
        initialValues: {
            phone: job.phone || ''
        },
        validationSchema: Yup.object({
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
        }),
        onSubmit: async (values, helpers) => {
            try {
                job.phone = values.phone;
                job.status = "new";
                console.log(job)
                let id = await jobApi.addJob(job);
                onNext(job);
                helpers.setStatus({success: true});
            } catch (err) {
                console.error(err);
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
            }
        }
    });

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Leave contacts for communication
                </Typography>
            </div>
            <Stack spacing={3}>
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
            </Stack>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={formik.handleSubmit}
                    variant="contained"
                >
                    Continue
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

ProjectCustomerStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
