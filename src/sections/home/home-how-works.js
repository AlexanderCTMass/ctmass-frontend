import {
    Box,
    Container,
    Grid,
    MobileStepper,
    Paper,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';

import SubmitRequestIcon from 'src/icons/untitled-ui/duocolor/submit-request'
import ReceiveResponsesIcon from 'src/icons/untitled-ui/duocolor/receive-responses'
import SelectSpecialistIcon from 'src/icons/untitled-ui/duocolor/select-specialist'
import LeaveAReviewIcon from 'src/icons/untitled-ui/duocolor/leave-a-review'

const steps = [
    {
        id: 1,
        title: 'Submit Request',
        desc: 'Post your projects request with details to attract the right specialists.',
        icon: <SubmitRequestIcon />
    },
    {
        id: 2,
        title: 'Receive Responses',
        desc: 'Specialists will review your projects and submit their proposals.',
        icon: <ReceiveResponsesIcon />
    },
    {
        id: 3,
        title: 'Select Specialist',
        desc: 'Evaluate proposals, check reviews, and choose the best specialist for your projects.',
        icon: <SelectSpecialistIcon />
    },
    {
        id: 4,
        title: 'Leave a Review',
        desc: 'After the projects is completed, share your experience by leaving a review for the specialist.',
        icon: <LeaveAReviewIcon />
    }
];

export const HomeHowWorks = () => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [activeStep, setActiveStep] = useState(0);

    const StepCard = ({ step }) => (
        <Paper
            elevation={0}
            sx={{
                py: '70px',
                px: '38px',
                borderRadius: 2,
                height: '100%',
                textAlign: 'center',
                background: 'radial-gradient(161.13% 161.13% at -75.77% 211.29%, #D5ECF7 0%, #F5F8FB 100%)',
                position: 'relative',
            }}
        >
            <Box position='absolute' left='27px' top='18px'>
                <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: 18 }}>
                    {String(step.id).padStart(2, '0')}
                </Typography>
            </Box>

            <Box mt={3} mb={4} display="flex" justifyContent="center">
                {step.icon}
            </Box>

            <Box display='flex' gap='20px' flexDirection='column' maxWidth='xl'>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    {step.title}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 240, mx: 'auto' }}>
                    {step.desc}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box component="section" sx={{ py: { xs: 6, sm: 8 } }}>
            <Container maxWidth='xl'>
                <Typography
                    variant="h4"
                    align="center"
                    fontSize={downSm ? 32 : 40}
                    fontWeight={500}
                    sx={{ mb: { xs: 4, sm: 6 } }}
                >
                    How it works!
                </Typography>

                {!downSm && (
                    <Grid container spacing={3}>
                        {steps.map(step => (
                            <Grid key={step.id} item xs={12} sm={6} md={3}>
                                <StepCard step={step} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {downSm && (
                    <Box>
                        <SwipeableViews
                            index={activeStep}
                            onChangeIndex={setActiveStep}
                            enableMouseEvents
                            resistance
                        >
                            {steps.map(step => (
                                <Box key={step.id} px={1.5}>
                                    <StepCard step={step} />
                                </Box>
                            ))}
                        </SwipeableViews>

                        <MobileStepper
                            steps={steps.length}
                            position="static"
                            activeStep={activeStep}
                            nextButton={null}
                            backButton={null}
                            sx={{
                                justifyContent: 'center',
                                mt: 2,
                                background: 'transparent'
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default HomeHowWorks;