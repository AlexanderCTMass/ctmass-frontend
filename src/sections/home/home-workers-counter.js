import {Box, Container, Stack, Step, StepLabel, Stepper, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import {PostAdd, NotificationsActive, PersonSearch, RateReview} from "@mui/icons-material";
import WorkersCounter from "src/components/workers-counter";


export const HomeWorkerCounter = () => {
    const theme = useTheme();
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    return (
        <Box sx={{pt: "40px", pb: '40px'}}>
            <Container maxWidth="lg" sx={{py: 2}}>
                <WorkersCounter/>
            </Container>
        </Box>
    );
};
