import {
    Box,
    Container,
    Stack,
    Typography,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeCta } from "../sections/home/home-cta";

const Page = () => {
    usePageView();

    const supportMail = process.env.REACT_APP_ADMIN_MAIL || 'support@ctmass.com';

    return (
        <>
            <Seo title="Account & Data Deletion" />
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
                        pt: '100px'
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack spacing={1}>
                            <Typography variant="h1">
                                Account &amp; Data Deletion
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: "40px"
                    }}
                >
                    <Container maxWidth="lg">
                        <Typography
                            color="text.secondary"
                            sx={{ fontSize: '14pt' }}
                        >
                            <p>
                                This page explains how to delete your <strong>CTMASS</strong> account
                                (developer: CTMASS) and the personal data associated with it. You can
                                delete your account directly inside the CTMASS mobile app, or request
                                deletion by email.
                            </p>

                            <h2>Option 1 — Delete your account in the app (recommended)</h2>
                            <ol>
                                <li>Open the <strong>CTMASS</strong> app and sign in.</li>
                                <li>Open the <strong>Profile</strong> tab (bottom-right).</li>
                                <li>Scroll to the bottom and tap <strong>Delete account</strong>.</li>
                                <li>
                                    Confirm in the dialog. Your account and associated data are
                                    permanently deleted right away, and you are signed out.
                                </li>
                            </ol>

                            <h2>Option 2 — Request deletion by email</h2>
                            <p>
                                If you can&apos;t access the app, email{' '}
                                <a href={`mailto:${supportMail}`}>{supportMail}</a> from the email
                                address linked to your account, with the subject{' '}
                                <strong>&quot;Delete my account&quot;</strong>. Please include:
                            </p>
                            <ul>
                                <li>Your full name</li>
                                <li>The email address associated with your account</li>
                            </ul>
                            <p>Requests sent by email are processed within 30 days.</p>

                            <h2>What data is deleted</h2>
                            <p>When your account is deleted, we permanently remove:</p>
                            <ul>
                                <li>Your profile (name, email, phone number, address, and avatar photo)</li>
                                <li>Your projects and requests</li>
                                <li>Your chat messages</li>
                                <li>Your loyalty coins and shop orders</li>
                                <li>Photos you uploaded</li>
                                <li>Your notification tokens and sign-in credentials</li>
                            </ul>

                            <h2>What data is kept (anonymized)</h2>
                            <p>
                                To preserve the integrity of other users&apos; conversations and
                                reviews, any messages you sent in other people&apos;s chats and any
                                reviews you left are <strong>kept but anonymized</strong> — your name
                                and identifiers are removed so the records can no longer be linked to
                                you.
                            </p>

                            <h2>Retention period</h2>
                            <p>
                                Account and personal data are removed immediately when you delete your
                                account in the app. Residual copies in backups are purged within{' '}
                                <strong>30 days</strong>. A limited set of records may be retained
                                longer only where required by law.
                            </p>

                            <p>
                                For more information, please see our{' '}
                                <a href="/privacy-policy" target="_blank" rel="noreferrer">
                                    Privacy Policy
                                </a>. Questions? Contact us at{' '}
                                <a href={`mailto:${supportMail}`}>{supportMail}</a>.
                            </p>
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta />
        </>
    );
};

export default Page;
