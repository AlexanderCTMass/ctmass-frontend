import {Box, Button, Container, Stack, Typography, useMediaQuery} from '@mui/material';
import {paths} from 'src/paths';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FeedbackIcon from '@mui/icons-material/Feedback';

export const HomeCta = () => {
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const downXSm = useMediaQuery((theme) => theme.breakpoints.down('425'));

    return (
        <Box
            sx={{
                backgroundColor: 'neutral.800',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                color: 'neutral.100',
                py: '120px'
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={2}>
                    <Typography
                        align="center"
                        color="inherit"
                        variant="h3"
                    >
                        Help us Improve!
                    </Typography>
                    <Typography
                        align="center"
                        color="inherit"
                        variant="subtitle2"
                    >
                        Our team would appreciate any suggestions you have.
                        If you have any problems please contact us.
                    </Typography>
                </Stack>
                <Stack
                    alignItems="center"
                    direction={downSm ? "column" : "row"}
                    justifyContent="center"
                    spacing={2}
                    sx={{mt: 3}}
                >
                    <Button
                        component="a"
                        href={paths.contact}
                        variant="contained"
                        startIcon={<FeedbackIcon/>}
                    >
                        Feedback
                    </Button>
                    {downSm &&
                        <Typography
                            align="center"
                            color="inherit"
                            variant="subtitle2"
                        >
                            We'd really appreciate it if you would share or donate to this GoFundMe.
                        </Typography>}
                    <Button
                        component="a"
                        href={paths.donationGofund}
                        variant="contained"
                        size="large"
                        color={"warning"}
                        endIcon={<VolunteerActivismIcon/>}
                    >
                        {downSm ? "Donate" : "Donation to CTMASS.com will be appreciate!"}
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}
