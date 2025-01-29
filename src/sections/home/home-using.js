import {Box, Container, Stack, Step, StepLabel, Stepper, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import { PostAdd, NotificationsActive, PersonSearch, RateReview } from "@mui/icons-material";

const steps = [
    {
        label: "Submit Request",
        description: "Post your project request with details to attract the right specialists.",
        icon: <PostAdd />
    },
    {
        label: "Receive Responses",
        description: "Specialists will review your project and submit their proposals.",
        icon: <NotificationsActive />
    },
    {
        label: "Select Specialist",
        description: "Evaluate proposals, check reviews, and choose the best specialist for your project.",
        icon: <PersonSearch />
    },
    {
        label: "Leave a Review",
        description: "After the project is completed, share your experience by leaving a review for the specialist.",
        icon: <RateReview />
    }
];


export const HomeUsing = () => {
    const theme = useTheme();
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    return (
        <Box sx={{py: '40px'}}>
            <Container maxWidth="lg" sx={{py: 2}}>
                <Stack spacing={2} sx={{pb: "30px"}}>
                    <Typography align="center" color="inherit" variant="h3">
                        Using <Typography component="span" color="primary.main" variant="inherit">
                        CTMASS
                    </Typography>
                    </Typography>
                </Stack>
                <Stepper alternativeLabel activeStep={3} orientation={downSm ? "vertical" : "horizontal"}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (<Box
                                    sx={{
                                        zIndex: 1,
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "primary.main",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        marginTop: "-19px",
                                        border: "10px solid #fff"
                                    }}
                                >
                                    {step.icon}
                                </Box>)} // Используем кастомную иконку
                            >
                                <Stack spacing={2} alignItems="center">
                                    <Typography variant="h6">{step.label}</Typography>
                                    <Typography>{step.description}</Typography>
                                </Stack>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Container>
        </Box>
    );
};
