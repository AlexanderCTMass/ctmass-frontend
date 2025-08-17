import {
    Box,
    Container,
    Stack,
    Typography,
    Paper,
    useTheme,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeCta } from '../sections/home/home-cta';

const Page = () => {
    usePageView();
    const theme = useTheme();

    return (
        <>
            <Seo title="Terms and Conditions" />
            <Box component="main" sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                        pb: 0,
                        pt: 14,
                        textAlign: 'center',
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={1} alignItems="center">
                            <Typography variant="h1">Terms and Conditions</Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                These Terms and Conditions govern your use of the CTMASS.com platform.<br /> Please read them carefully.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'neutral.900' : 'neutral.100',
                        py: 4,
                    }}
                >
                    <Container maxWidth="xl">
                        <Stack spacing={1}>
                            {/* Term 1 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    1. Introduction
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    These Terms and Conditions ("Terms") govern your access to and use of the CTMASS.com website and platform (collectively, the "Platform"), including all features, content, and services made available by CTMASS.com. By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Platform.
                                </Typography>
                            </Paper>

                            {/* Term 2 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    2. Eligibility
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    The Platform is intended for use by individuals who are at least 18 years old. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
                                </Typography>
                            </Paper>

                            {/* Term 3 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    3. Account Creation
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    You may be required to create an account to access certain features of the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify CTMASS.com of any unauthorized use of your account or any other breach of security.
                                </Typography>
                            </Paper>

                            {/* Term 4 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    4. Use of the Platform
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}>
                                    You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Use the Platform to collect any personally identifiable information about other users without their consent.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Use the Platform in any way that violates any applicable law or regulation.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Use the Platform to transmit any viruses, worms, or other harmful code.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Interfere with or disrupt the operation of the Platform.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Use the Platform to collect any personally identifiable information about other users without their consent.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        Use the Platform for any commercial purpose outside of its intended function of connecting service providers with consumers, including but not limited to:
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '20px' }}>
                                        (a) data scraping or extraction;
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '20px' }}>
                                        (b) reselling access to the Platform;
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '20px' }}>
                                        (c) using Platform content for external marketing without permission;
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '20px' }}>
                                        (d) promoting unrelated businesses on the Platform. Use of the Platform to offer or obtain services as a service provider or consumer is considered its intended commercial function and does not require separate written consent.
                                    </Box>
                                    <Box component="div" sx={{ paddingLeft: '10px' }}>
                                        CTMASS.com reserves the right to restrict or terminate your access to the Platform at any time, without notice, for any reason whatsoever.
                                    </Box>
                                </Typography>
                            </Paper>

                            {/* Term 5 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    5. Intellectual Property
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    The Platform and all content, materials, and other intellectual property rights related thereto are the exclusive property of CTMASS.com or its licensors and are protected by applicable copyright, trademark, and other intellectual property laws. You may not use, reproduce, distribute, modify, transmit, or create derivative works of any content on the Platform without our prior written consent.
                                </Typography>
                            </Paper>

                            {/* Term 6 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    6. Disclaimer of Warranties
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        lineHeight: 1.7,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    The platform is provided "as is" and "as available" without warranty of any kind, express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. CTMASS.com does not warrant that the platform will be uninterrupted or error-free, that defects will be corrected, or that the platform or the server that makes it available are free of viruses or other harmful components.
                                </Typography>
                            </Paper>

                            {/* Term 7 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    7. Limitation of Liability
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        lineHeight: 1.7,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    In no event shall CTMASS.com be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of or inability to use the platform, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses, even if CTMASS.com has been advised of the possibility of such damages.
                                </Typography>
                            </Paper>

                            {/* Term 8 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    8. Indemnification
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    You agree to indemnify and hold harmless CTMASS.com and its affiliates, officers, directors, employees, agents, and licensors from any and all claims, losses, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or relating to your use of the Platform, your violation of these Terms, or your infringement of any third party's rights.
                                </Typography>
                            </Paper>

                            {/* Term 9 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    9. Governing Law
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Massachusetts, without regard to its conflict of law principles.
                                </Typography>
                            </Paper>

                            {/* Term 10 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    10. Dispute Resolution
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    Any dispute arising out of or relating to these Terms shall be resolved exclusively by mediation in Amherst, Massachusetts. The mediation shall be conducted by a mutually agreed-upon mediator. If the parties cannot agree on a mediator within thirty (30) days of one party providing written notice of a dispute, the mediator shall be appointed by the Franklin/Hampshire Probate and Family Court.
                                </Typography>
                            </Paper>

                            {/* Term 11 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    11. Changes to These Terms
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    CTMASS.com may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on the Platform. You are advised to review these Terms periodically for any changes. Your continued use of the Platform after the posting of any changes to these Terms constitutes your acceptance of such changes.
                                </Typography>
                            </Paper>

                            {/* Term 12 */}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                }}
                            >
                                <Typography variant="h5" gutterBottom>
                                    12. Contact Information
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    If you have any questions about these Terms, please contact us at support@ctmass.com.
                                </Typography>
                            </Paper>
                        </Stack>
                    </Container>
                </Box>
            </Box>
            <HomeCta />
        </>
    );
};

export default Page;
