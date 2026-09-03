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

    let adminMail = process.env.REACT_APP_ADMIN_MAIL;
    let adminPhone = process.env.REACT_APP_ADMIN_PHONE;
    return (
        <>
            <Seo title="Privacy Policy" />
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
                        <Stack spacing={1}>
                            <Typography variant="h1">
                                Privacy Policy
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
                            <p><strong>Last updated:</strong> September 3, 2026</p>
                            <p>CTMASS (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the CTMASS
                                website and mobile app &mdash; a free platform that connects local contractors
                                with homeowners in Connecticut and Massachusetts. This Privacy Policy explains
                                what information we collect, how we use and share it, and the choices you have.
                                It applies to both our website and our iOS and Android apps.</p>

                            <h2>1. Information We Collect</h2>
                            <h3>a. Account and profile</h3>
                            <ul>
                                <li>Name</li>
                                <li>Email address and phone number</li>
                                <li>Address / location you provide (used to match projects and specialists nearby)</li>
                                <li>Profile photo (avatar)</li>
                                <li>For contractors: business name, professional title, and bio</li>
                            </ul>
                            <h3>b. Content you provide</h3>
                            <ul>
                                <li>Project and trade details you post</li>
                                <li>Messages you send in chats</li>
                                <li>Reviews you leave</li>
                                <li>Photos you upload or take in the app</li>
                            </ul>
                            <h3>c. Usage, device and diagnostic data</h3>
                            <ul>
                                <li>App and website interactions</li>
                                <li>IP address, device and browser information</li>
                                <li>Identifiers such as a device identifier and, where applicable, an advertising
                                    identifier</li>
                                <li>Crash logs and performance data</li>
                            </ul>
                            <p>This data is collected through analytics and diagnostic tools to keep the service
                                working and to improve it.</p>
                            <h3>d. Mobile permissions (only if you grant them)</h3>
                            <ul>
                                <li><strong>Camera and photo library</strong> &mdash; to take or attach photos to
                                    your requests, messages, and profile.</li>
                                <li><strong>Microphone</strong> &mdash; for optional voice-to-text dictation; the
                                    audio is converted to text on the fly and is not stored by us.</li>
                                <li><strong>Push notifications</strong> &mdash; we store a device push token to
                                    deliver notifications.</li>
                            </ul>

                            <h2>2. How We Use Your Information</h2>
                            <ul>
                                <li><strong>Operate and improve the platform:</strong> match homeowners with
                                    contractors, enable chat, and provide core features.</li>
                                <li><strong>Communicate with you:</strong> provide customer support and send
                                    service updates.</li>
                                <li><strong>Security and legal compliance:</strong> detect and prevent fraud and
                                    abuse, and enforce our Terms.</li>
                                <li><strong>Updates and offers:</strong> with your consent, send updates &mdash;
                                    you can opt out at any time.</li>
                            </ul>

                            <h2>3. How We Share Your Information</h2>
                            <ul>
                                <li><strong>With other users:</strong> your profile details and the projects or
                                    trades you post are visible to relevant users so you can connect.</li>
                                <li><strong>Service providers:</strong> we use trusted providers to run the
                                    service, including Google Firebase (authentication, database, storage, and push
                                    notifications) and analytics and diagnostics providers. They process data on our
                                    behalf under their own safeguards.</li>
                                <li><strong>Legal and safety:</strong> to comply with the law or protect the safety
                                    of users and others.</li>
                                <li><strong>Business transfers:</strong> in a merger or sale of CTMASS, your
                                    information may be transferred to the new entity.</li>
                            </ul>
                            <p><strong>We do not sell your personal information.</strong></p>

                            <h2>4. Data Security</h2>
                            <p>We implement industry-standard security measures to protect your data, and data is
                                encrypted in transit. However, no online platform can guarantee 100% security.</p>

                            <h2>5. App Tracking (mobile)</h2>
                            <p>On iOS, we ask for your permission before any tracking that uses your device&apos;s
                                advertising identifier (App Tracking Transparency). You can decline, and the app
                                still works fully.</p>

                            <h2>6. Your Rights and Choices</h2>
                            <p>Depending on your location, you may have the right to access, correct, or delete
                                your data, to restrict or object to processing, and to opt out of marketing. To
                                exercise your rights, contact us at{' '}
                                <a href={"mailto:" + adminMail}>{adminMail}</a>.</p>

                            <h2>7. Deleting Your Account and Data</h2>
                            <p>You can delete your account and associated data at any time:</p>
                            <ul>
                                <li>In the app: <strong>Profile &rarr; Delete account</strong>.</li>
                                <li>On the web:{' '}
                                    <a href="/data-deletion" target="_blank" rel="noreferrer">ctmass.com/data-deletion</a>.</li>
                            </ul>
                            <p>Deletion is immediate in the app; residual copies in backups are purged within
                                <strong> 30 days</strong>. Some records (for example, messages you sent in other
                                users&apos; chats, and reviews you left) are kept but anonymized so they can no
                                longer be linked to you.</p>

                            <h2>8. Cookies and Similar Technologies</h2>
                            <p>On our website we use cookies to remember preferences and measure performance. You
                                can control cookies through your browser settings.</p>

                            <h2>9. Children&apos;s Privacy</h2>
                            <p>CTMASS is intended for adults and is not directed to children under 13. We do not
                                knowingly collect personal information from children under 13. If you believe a
                                child has provided us information, contact us and we will delete it.</p>

                            <h2>10. Third-Party Links</h2>
                            <p>Our platform may contain links to third-party websites. CTMASS is not responsible
                                for the privacy practices of these external sites.</p>

                            <h2>11. Changes to This Policy</h2>
                            <p>We may update this Privacy Policy to reflect changes in our practices or for legal
                                reasons. We will notify you of significant changes via email or through the
                                platform.</p>

                            <h2>12. Contact Us</h2>
                            <p><strong>Email:</strong>{' '}
                                <a href={"mailto:" + adminMail}>{adminMail}</a></p>
                            <p><strong>Phone:</strong>{' '}
                                <a href={"tel:" + (adminPhone || '').replace(/\s+/g, '')}>{adminPhone}</a></p>

                            <p>By using CTMASS, you agree to the practices described in this Privacy Policy.</p>
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta />
        </>
    );
};

export default Page;
