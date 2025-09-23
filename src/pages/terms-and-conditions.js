import { useState, useEffect, useCallback } from 'react'
import {
    Box,
    Checkbox,
    Container,
    FormControlLabel,
    FormGroup,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeCta } from '../sections/home/home-cta';
import { useAuth } from 'src/hooks/use-auth';
import { profileApi } from 'src/api/profile';

const notifOptions = [
    'Immediately',
    'Once a day',
    'Once every three days',
    'Once a week',
    'Once a month',
    'I do not want to receive any notifications',
];

const Page = () => {
    usePageView();
    const theme = useTheme();

    const { user } = useAuth();
    const [agreeTos, setAgreeTos] = useState(false);
    const [notifChoice, setNotifChoice] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            const snap = await profileApi.get(user.id);
            if (!snap) return;
            setAgreeTos(!!snap.agreedToTerms);
            setNotifChoice(snap.notificationOption ?? null);
        })();
    }, [user?.id]);

    const handleAgreeChange = useCallback((event) => {
        const checked = event.target.checked;
        setAgreeTos(checked);
        if (user?.id) profileApi.setTermsAgreement(user.id, checked);
    }, []);

    const handleNotifChange = (value) => () => {
        setNotifChoice(prev => {
            const next = prev === value ? null : value;
            if (user?.id) profileApi.setNotificationOption(user.id, next);
            return next;
        });
    };

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
                                sx={{ color: theme.palette.text.secondary }}
                            >
                                These Terms and Conditions (“Terms”) govern your use of the
                                CTMASS.com platform, operated by CTMASS LLC (“CTMASS,” “we,”
                                “our,” or “us”). Please read them carefully before using the
                                platform.
                                <br />
                                By accessing or using CTMASS.com (the “Platform”), you agree to
                                these Terms. If you do not agree, you must not use the Platform.
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
                                    CTMASS.com is a community-based platform designed to connect homeowners and contractors in Connecticut and Massachusetts. Our mission is to help homeowners find reputable contractors and to help contractors discover new job opportunities. CTMASS provides only the connection and is not a party to any agreement between contractors and homeowners.
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
                                    You must be at least 18 years old to use the Platform. By using the Platform, you represent that you are legally able to enter into binding contracts.
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
                                    3. Account Creation and Security
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    To access certain features, you may need to create an account. You are responsible for safeguarding your login information and for all activity under your account. Notify us immediately of any unauthorized use.
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
                                    sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}
                                >
                                    You agree to use the Platform only for lawful purposes and in
                                    line with its intended purpose: connecting contractors and
                                    homeowners. You agree not to:
                                </Typography>
                                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                                            Violate laws or regulations while using the Platform.
                                        </Typography>
                                    </li>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                                            Post false, misleading, or harmful content.
                                        </Typography>
                                    </li>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                                            Transmit viruses, malware, or harmful code.
                                        </Typography>
                                    </li>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                                            Collect personal information without consent.
                                        </Typography>
                                    </li>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                                            Resell, scrape, or misuse Platform data.
                                        </Typography>
                                    </li>
                                </Box>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary, mt: 2 }}
                                >
                                    We reserve the right to suspend or terminate accounts that
                                    violate these Terms.
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
                                    All content, trademarks, and materials on the Platform are owned by CTMASS or its licensors. You may not reproduce, distribute, or modify them without our prior written consent.
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
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    The Platform is provided “as is” and “as available.” CTMASS makes no warranties, express or implied, regarding accuracy, reliability, availability, or suitability for a particular purpose.


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
                                    7. Neutral Marketplace & Limitation of Liability
                                </Typography>
                                {/* 7.1 */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>
                                    7.1 Neutral Role
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary, mb: 2 }}
                                >
                                    CTMASS is a neutral platform that connects homeowners and
                                    contractors. We do not supervise, manage, or control the work
                                    performed by contractors or the payment practices of
                                    homeowners.
                                </Typography>

                                {/* 7.2 */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>
                                    7.2 Contractor Responsibility
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    Contractors are independent businesses. They are solely
                                    responsible for the quality, legality, safety, and timeliness
                                    of their work, including compliance with applicable laws,
                                    codes, and licensing requirements.
                                </Typography>
                                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{
                                            lineHeight: 1.7,
                                            color: theme.palette.text.secondary,
                                        }}>
                                            Example: If a contractor provides poor or unprofessional
                                            work, CTMASS is not responsible for correcting or paying
                                            for that work.
                                        </Typography>
                                    </li>
                                </Box>

                                {/* 7.3 */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>
                                    7.3 Homeowner Responsibility
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    Homeowners are solely responsible for negotiating, accepting,
                                    and paying for services. CTMASS is not a party to service
                                    agreements.
                                </Typography>
                                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{
                                            lineHeight: 1.7,
                                            color: theme.palette.text.secondary,
                                        }}>
                                            Example: If a homeowner refuses to pay after services are
                                            completed, CTMASS is not responsible for collecting or
                                            covering that payment.
                                        </Typography>
                                    </li>
                                </Box>

                                {/* 7.4 */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>
                                    7.4 No Guarantee
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    CTMASS does not guarantee that:
                                </Typography>
                                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{
                                            lineHeight: 1.7,
                                            color: theme.palette.text.secondary,
                                        }}>
                                            A contractor will complete work to the homeowner’s
                                            satisfaction, or
                                        </Typography>
                                    </li>
                                    <li style={{ color: theme.palette.text.secondary }}>
                                        <Typography variant="body1" sx={{
                                            lineHeight: 1.7,
                                            color: theme.palette.text.secondary,
                                        }}>
                                            A homeowner will pay in full or on time.
                                        </Typography>
                                    </li>
                                </Box>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary, mt: 1 }}
                                >
                                    All risks arising from user interactions remain solely with
                                    contractors and homeowners.
                                </Typography>

                                {/* 7.5 */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>
                                    7.5 Limitation of Liability
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    To the fullest extent permitted by law, CTMASS LLC shall not
                                    be liable for any damages, losses, or disputes arising out of
                                    or related to interactions between contractors and homeowners.
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
                                    You agree to indemnify and hold harmless CTMASS LLC, its officers, employees, and agents from any claims, damages, or expenses resulting from your use of the Platform or your violation of these Terms.
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
                                    9. Changes to These Terms
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    We may update these Terms from time to time. Updates will be posted on CTMASS.com, and continued use of the Platform means you accept the revised Terms.
                                </Typography>
                            </Paper>

                            {/* <Paper
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
                            </Paper> */}

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
                                    10. Contact Information
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}
                                >
                                    For questions, contact us at:&nbsp;
                                    <strong>support@ctmass.com</strong>
                                </Typography>

                                <FormGroup sx={{ mt: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={agreeTos}
                                                onChange={handleAgreeChange}
                                            />
                                        }
                                        label="By checking a box, you consent with terms and conditions"
                                    />
                                </FormGroup>

                                {/* Notifications */}
                                <Typography
                                    variant="h6"
                                    sx={{ mt: 4, mb: 1, fontWeight: 600 }}
                                >
                                    Notifications and Communications
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    By creating an account, you may choose whether to receive
                                    notifications, updates, and new leads from CTMASS. You can
                                    change your preference at any time in your account settings.
                                </Typography>

                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2, fontWeight: 600 }}
                                >
                                    Notification Options (choose one):
                                </Typography>

                                <FormGroup sx={{ pl: 2 }}>
                                    {notifOptions.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            control={
                                                <Checkbox
                                                    checked={notifChoice === option}
                                                    onChange={handleNotifChange(option)}
                                                />
                                            }
                                            label={option}
                                        />
                                    ))}
                                </FormGroup>

                                <Typography
                                    variant="body1"
                                    sx={{ color: theme.palette.text.secondary, mt: 2 }}
                                >
                                    By checking a box, you consent to receive communications
                                    according to your selected preference.
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
