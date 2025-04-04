import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Rating,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import {projectFlow} from "src/flows/project/project-flow";
import {useAuth} from "src/hooks/use-auth";

// Validation schema
const FeedbackSchema = Yup.object().shape({
    rating: Yup.number()
        .min(1, 'Please rate from 1 to 5')
        .max(5, 'Please rate from 1 to 5')
        .required('Required field'),
    comment: Yup.string()
        .min(10, 'Review is too short (minimum 10 characters)')
        .required('Please write a review'),
    name: Yup.string()
        .min(2, 'Name is too short')
        .required('Please enter your name'),
    isPublic: Yup.boolean(),
});

const FeedbackForm = ({contractor, project, onSubmit}) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {user} = useAuth();

    const formik = useFormik({
        initialValues: {
            rating: 5,
            comment: '',
            name: user?.name || '',
            isPublic: true,
        },
        validationSchema: FeedbackSchema,
        onSubmit: async (values, {resetForm}) => {
            try {
                await projectFlow.submitReviewFromPastClient(contractor, project.customerEmail, values.name, project, {
                    rating: values.rating,
                    message: values.comment
                })

                console.log('Submitted:', {...values, projectId: project.id});
                setIsSubmitted(true);
                resetForm();
                onSubmit();
            } catch (error) {
                console.error('Error:', error);
            }
        },
    });

    if (isSubmitted) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h5">Thank you for your feedback!</Typography>
                <Typography>We appreciate your opinion.</Typography>
            </Box>
        );
    }

    return (
        <Box maxWidth={600} mx="auto" p={3}>
            <Typography variant="h4" gutterBottom>Leave Specialist Feedback</Typography>
            <Typography variant="h6" color="textSecondary" mb={3}>
                {project?.name}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                {/* Rating field */}
                <Box mb={3}>
                    <Typography>Rate the specialist:</Typography>
                    <Rating
                        name="rating"
                        value={Number(formik.values.rating)}
                        onChange={(_, value) => formik.setFieldValue('rating', value)}
                        precision={1}
                        size="large"
                    />
                    {formik.touched.rating && formik.errors.rating && (
                        <Typography color="error">{formik.errors.rating}</Typography>
                    )}
                </Box>

                {/* Review text */}
                <Box mb={3}>
                    <TextField
                        name="comment"
                        label="Your review"
                        multiline
                        minRows={4}
                        maxRows={10}
                        fullWidth
                        value={formik.values.comment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.comment && Boolean(formik.errors.comment)}
                        helperText={formik.touched.comment && formik.errors.comment}
                    />
                </Box>

                {/* Name field */}
                <Box mb={3}>
                    <TextField
                        name="name"
                        label="Your name"
                        fullWidth
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                </Box>

                {/* Submit button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={formik.isSubmitting}
                    startIcon={formik.isSubmitting && <CircularProgress size={20}/>}
                >
                    {formik.isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </form>
        </Box>
    );
};

export default FeedbackForm;