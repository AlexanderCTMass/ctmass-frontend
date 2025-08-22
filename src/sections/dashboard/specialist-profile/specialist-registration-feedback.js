import PropTypes from 'prop-types';
import { Button, Stack, Typography, useMediaQuery, Rating, Box, TextField, CircularProgress } from '@mui/material';
import * as React from "react";
import { useState } from "react";
import { emailSender } from "src/libs/email-sender";

export const RegistrationFeedbackStep = (props) => {
    const { onNext, onBack, profile, ...other } = props;
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitting2, setSubmitting2] = useState(false);

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await emailSender.sendAdmin_feedback_registration(profile, rating, feedback?.trim(), false);
        onNext();
    };

    const handleNext = async () => {
        setSubmitting2(true);
        onNext();
    };

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    How was your registration experience?
                </Typography>
                <Typography variant="body2">
                    Please let us know if you encountered any issues during registration.
                </Typography>
            </div>

            <Box>
                <Typography component="legend" gutterBottom>
                    Rate your registration experience (1-5 stars)
                </Typography>
                <Rating
                    name="registration-rating"
                    value={rating}
                    onChange={handleRatingChange}
                    size="large"
                />
            </Box>


            <Box>
                <Typography component="legend" gutterBottom>
                    What issues did you encounter?
                </Typography>
                <TextField
                    label="Feedback"
                    multiline
                    fullWidth
                    minRows={3}
                    maxRows={10}
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder={"Please describe any problems you faced..."}
                />
            </Box>


            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting || submitting2}
                    startIcon={submitting && <CircularProgress color="inherit" size={20} />}
                >
                    Submit Feedback & Complete
                </Button>
                <Button
                    color="success"
                    onClick={handleNext}
                    disabled={submitting || submitting2}
                    startIcon={submitting2 && <CircularProgress color="inherit" size={20} />}
                >
                    Complete without feedback
                </Button>
            </Stack>
        </Stack>
    );
};

RegistrationFeedbackStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};