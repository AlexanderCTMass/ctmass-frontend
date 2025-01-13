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

    const terms = [
        {
            title: '1. Introduction',
            text: `These Terms and Conditions ("Terms") govern your access to and use of the CTMASS.com website and platform (collectively, the "Platform"), including all features, content, and services made available by CTMASS.com. By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Platform.`,
        },
        {
            title: '2. Eligibility',
            text: `The Platform is intended for use by individuals who are at least 18 years old. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.`,
        },
        {
            title: '3. Account Creation',
            text: `You may be required to create an account to access certain features of the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify CTMASS.com of any unauthorized use of your account or any other breach of security.`,
        },
        {
            title: '4. Use of the Platform',
            text: `You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:<br/><br/>
            
Use the Platform to collect any personally identifiable information about other users without their consent.<br/>
Use the Platform in any way that violates any applicable law or regulation.<br/>
Use the Platform to transmit any viruses, worms, or other harmful code.<br/>
Interfere with or disrupt the operation of the Platform.<br/>
Use the Platform to collect any personally identifiable information about other users without their consent.<br/>
CTMASS.com reserves the right to restrict or terminate your access to the Platform at any time, without notice, for any reason whatsoever.<br/>
Use the Platform for any commercial purpose outside of its intended function of connecting service providers with consumers, including but not limited to:<br/> (a) data scraping or extraction;<br/> (b) reselling access to the Platform;<br/> (c) using Platform content for external marketing without permission;<br/> (d) promoting unrelated businesses on the Platform. Use of the Platform to offer or obtain services as a service provider or consumer is considered its intended commercial function and does not require separate written consent.<br/>`
        },
        {
            title: '5. Intellectual Property',
            text: `The Platform and all content, materials, and other intellectual property rights related thereto are the exclusive property of CTMASS.com or its licensors and are protected by applicable copyright, trademark, and other intellectual property laws. You may not use, reproduce, distribute, modify, transmit, or create derivative works of any content on the Platform without our prior written consent.`,
        },
        {
            title: '6. Disclaimer of Warranties',
            text: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. CTMASS.COM DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE PLATFORM OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.`,
        },
        {
            title: '7. Limitation of Liability',
            text: `IN NO EVENT SHALL CTMASS.COM BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE PLATFORM, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, EVEN IF CTMASS.COM HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
        },
        {
            title: '8. Indemnification',
            text: `You agree to indemnify and hold harmless CTMASS.com and its affiliates, officers, directors, employees, agents, and licensors from any and all claims, losses, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or relating to your use of the Platform, your violation of these Terms, or your infringement of any third party's rights.`,
        },
        {
            title: '9. Governing Law',
            text: `These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Massachusetts, without regard to its conflict of law principles.`,
        },
        {
            title: '10. Dispute Resolution',
            text: `Any dispute arising out of or relating to these Terms shall be resolved exclusively by mediation in Amherst, Massachusetts. The mediation shall be conducted by a mutually agreed-upon mediator. If the parties cannot agree on a mediator within thirty (30) days of one party providing written notice of a dispute, the mediator shall be appointed by the Franklin/Hampshire Probate and Family Court.`,
        },
        {
            title: '11. Changes to These Terms',
            text: `CTMASS.com may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on the Platform. You are advised to review these Terms periodically for any changes. Your continued use of the Platform after the posting of any changes to these Terms constitutes your acceptance of such changes.`,
        },
        {
            title: '12. Contact Information',
            text: `If you have any questions about these Terms, please contact us at support@ctmass.com.`,
        },
    ];

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
                                    maxWidth: '700px',
                                }}
                            >
                                These Terms and Conditions govern your use of the CTMASS.com platform.<br/> Please read them carefully.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>
1
                {/* Content */}
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'neutral.900' : 'neutral.100',
                        py: 4,
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={1}>
                            {terms.map((section, index) => (
                                <Paper
                                    key={index}
                                    elevation={2}
                                    sx={{
                                        p: 4,
                                        borderRadius: 2,
                                        backgroundColor:
                                            theme.palette.mode === 'dark' ? 'neutral.800' : 'common.white',
                                    }}
                                >
                                    <Typography variant="h5" gutterBottom>
                                        {section.title}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            lineHeight: 1.7,
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: section.text.replace(
                                                /( \([a-d]\))/g, // Находим пункты (a), (b), (c), (d)
                                                (match) => `<span style="margin-left: 20px">${match}</span>`
                                            ),
                                        }}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                    </Container>
                </Box>
            </Box>
            <HomeCta />
        </>
    );
};

export default Page;