import PropTypes from 'prop-types';
import * as React from "react";
import toast from 'react-hot-toast';
import {QuillEditor} from "src/components/quill-editor";
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
    Unstable_Grid2 as Grid, useMediaQuery
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {wait} from 'src/utils/wait';
import {CHPU_REGEXP, EMAIL_REGEXP, generateUrlFromStr, PHONE_NUMBER_REGEXP} from "src/utils/regexp";
import {mapboxConfig} from 'src/config';
import {AddressAutofill} from '@mapbox/search-js-react';
import {useState} from "react";
function removeHTMLTags(htmlString) {
    // Create a new DOMParser instance
    const parser = new DOMParser();
    // Parse the HTML string
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract text content
    const textContent = doc.body.textContent || "";
    // Trim whitespace
    return textContent.trim();
}
export const SpecialistDescriptionEditForm = (props) => {
    const {description, onSubmit, ...other} = props;
    const [quillBlur, setQuillBlur] = useState(false);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    const formik = useFormik({
        initialValues: {
            description: description || '',
        },
        validationSchema: Yup.object({
            description: Yup.string().required('Description is required'),
        }),
        onSubmit: async (values, helpers) => {
            try {
                // NOTE: Make API request
                onSubmit(values);
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Description updated');
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });
    const modules = smUp ? {
            toolbar: [
                [{'header': [1, 2, false]}],
                ['bold', 'italic', 'underline', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                // ['link', 'image'],
                ['clean']
            ],
        } : {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'},]
            ],
        },

        formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ];
    return (
        <form
            onSubmit={formik.handleSubmit}
            {...other}>
            <Grid container>
                <Grid
                    xs={12}
                    md={12}
                >
                    <QuillEditor
                        onChange={(value) => {
                            formik.setFieldValue('description', value);
                            setQuillBlur(true);
                        }}
                        modules={modules}
                        formats={formats}
                        readOnly={formik.isSubmitting}
                        placeholder="Describe the repair work in detail. For example, what needs fixing or renovating, and any specifics about the problem."
                        sx={{height: 300}}
                        value={formik.values.description}
                    />
                    {removeHTMLTags(formik.values.description) === '' && quillBlur && (
                        <div
                            style={{
                                color: 'red',
                                fontSize: '0.8rem'
                            }}>{formik.errors.description}</div>
                    )}
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

SpecialistDescriptionEditForm.propTypes = {
    description: PropTypes.object.isRequired
};
