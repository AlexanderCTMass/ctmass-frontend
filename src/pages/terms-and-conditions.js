import {
    Box,
    Container,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeCta } from '../sections/home/home-cta';

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="Terms and Conditions" />
            <Box
                component="main"
                sx={{ flexGrow: 1 }}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.800'
                            : 'neutral.50',
                        pb: '40px',
                        pt: '120px'
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={3} alignItems="center">
                            <Typography variant="h1" align="center">
                                Terms and Conditions
                            </Typography>
                            <Typography
                                variant="body1"
                                align="center"
                                sx={{ color: 'gray', maxWidth: '700px' }}
                            >
                                These Terms and Conditions govern your use of the CTMASS.com platform. Please read them carefully.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.900'
                            : 'neutral.100',
                        py: 5
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    1. Introduction
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    These Terms and Conditions ("Terms") govern your access to and use of the CTMASS.com website and platform, including all features, content, and services. By accessing or using the Platform, you agree to be bound by these Terms.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    2. Eligibility
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    The Platform is intended for individuals who are at least 18 years old. By using the Platform, you confirm you meet this age requirement.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    3. Account Creation
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    You are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    4. Use of the Platform
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    You agree to use the Platform for lawful purposes and comply with all applicable laws. Prohibited uses include, but are not limited to, transmitting harmful code, interfering with operations, and unauthorized data collection.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    5. Intellectual Property
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    All content on the Platform is owned by CTMASS.com or its licensors. Unauthorized use of this content is prohibited.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    6. Disclaimer of Warranties
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    The Platform is provided "as is" and "as available" without warranties of any kind. CTMASS.com does not guarantee uninterrupted or error-free service.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    7. Limitation of Liability
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    CTMASS.com is not liable for any damages arising from your use of the Platform.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    8. Indemnification
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    You agree to indemnify CTMASS.com against all claims, losses, or damages arising from your use of the Platform or violation of these Terms.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    9. Governing Law
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    These Terms are governed by the laws of the Commonwealth of Massachusetts.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    10. Dispute Resolution
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    Any disputes will be resolved through mediation in Amherst, Massachusetts.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    11. Changes to These Terms
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    CTMASS.com may update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    12. Contact Information
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray' }}>
                                    If you have questions, contact us at support@ctmass.com.
                                </Typography>
                            </Box>
                        </Stack>
                    </Container>
                </Box>
            </Box>
            <HomeCta />
        </>
    );
};

export default Page;
