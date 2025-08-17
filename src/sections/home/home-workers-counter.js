// home-counters.js
import { Box, Container, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WorkersCounter from "src/components/workers-counter";
import ProjectsCounter from "src/components/projects-counter";

export const HomeWorkerCounter = () => {
    const theme = useTheme();
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    return (
        <Box sx={{ pt: "40px", pb: '40px' }}>
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Stack
                    direction={downSm ? 'column' : 'row'}
                    spacing={2}
                    justifyContent="center"
                    alignItems="stretch"
                >
                    <Box flex={1}>
                        <WorkersCounter />
                    </Box>
                    <Box flex={1}>
                        <ProjectsCounter />
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};