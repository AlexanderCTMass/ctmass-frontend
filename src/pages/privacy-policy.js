import {
    Box,
    Chip,
    Container,
    Divider,
    Stack,
    Switch,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {PricingFaqs} from 'src/sections/pricing/pricing-faqs';
import {PricingPlan} from 'src/sections/pricing/pricing-plan';
import {PricingPlanIcon} from 'src/sections/pricing/pricing-plan-icon';
import {HomeCta} from "../sections/home/home-cta";

const Page = () => {
    usePageView();

    let adminMail = process.env.REACT_APP_ADMIN_MAIL;
    return (
        <>
            <Seo title="Privacy Policy"/>
            <Box
                component="main"
                sx={{flexGrow: 1}}
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
                            sx={{fontSize: '14pt'}}

                        >
                            <p><strong>Effective Date:</strong> 20/11/2024</p>
                            <p>At CTMASS, your privacy is a top priority. This Privacy Policy outlines how we
                                collect, use, store, and protect your information when you use our platform to find
                                or offer performance-related services.</p>

                            <h2>1. Information We Collect</h2>
                            <p>We collect the following types of information to provide our services
                                effectively:</p>
                            <h3>a. Personal Information</h3>
                            <ul>
                                <li>Name</li>
                                <li>Contact Information (email, phone number)</li>
                                <li>Location (city, state, or country)</li>
                                <li>Profile details, such as bio and skillset</li>
                            </ul>
                            <h3>b. Usage Data</h3>
                            <ul>
                                <li>Login credentials (encrypted)</li>
                                <li>IP address</li>
                                <li>Device and browser information</li>
                                <li>Pages viewed and interactions on the platform</li>
                            </ul>
                            <h3>c. Communication Data</h3>
                            <ul>
                                <li>Messages exchanged between users</li>
                                <li>Feedback or reviews submitted</li>
                            </ul>

                            <h2>2. How We Use Your Information</h2>
                            <p>We use your information for the following purposes:</p>
                            <ul>
                                <li><strong>To Operate and Improve the Platform:</strong> Match performers with job
                                    opportunities and facilitate user interactions.
                                </li>
                                <li><strong>For Security and Legal Compliance:</strong> Detect and prevent
                                    fraudulent activities and enforce our Terms of Service.
                                </li>
                                <li><strong>To Communicate with You:</strong> Provide customer support and send
                                    updates about our platform or services.
                                </li>
                                <li><strong>Marketing:</strong> Share promotional offers or updates (you may opt out
                                    of marketing communications at any time).
                                </li>
                            </ul>

                            <h2>3. How We Share Your Information</h2>
                            <p>We only share your information in the following circumstances:</p>
                            <ul>
                                <li><strong>With Other Users:</strong> When you interact with or book services
                                    through the platform, your profile details (e.g., name and skills) may be
                                    visible to relevant users.
                                </li>
                                <li><strong>Service Providers:</strong> To enable payments, communication, and
                                    customer support.
                                </li>
                                <li><strong>Legal Authorities:</strong> To comply with legal obligations or protect
                                    the safety of users and others.
                                </li>
                                <li><strong>Business Transfers:</strong> In the event of a merger or sale of CTMASS,
                                    your information may be transferred to the new entity.
                                </li>
                            </ul>

                            <h2>4. Data Security</h2>
                            <p>We implement industry-standard security measures to protect your data. However, no
                                online platform can guarantee 100% security. Please use strong passwords and
                                exercise caution when sharing sensitive information.</p>

                            <h2>5. Your Rights</h2>
                            <p>Depending on your location, you may have the following rights:</p>
                            <ul>
                                <li>Access or request a copy of your data</li>
                                <li>Request correction or deletion of your data</li>
                                <li>Restrict or object to the processing of your data</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                            <p>To exercise your rights, contact us at <a
                                href={"mailto:" + adminMail}>{adminMail}</a>.
                            </p>

                            <h2>6. Cookies and Tracking Technologies</h2>
                            <p>We use cookies to enhance your experience, such as remembering preferences and
                                tracking site performance. You can control cookie settings through your browser.</p>

                            <h2>7. Third-Party Links</h2>
                            <p>Our platform may contain links to third-party websites. CTMASS is not responsible for
                                the privacy practices of these external sites.</p>

                            <h2>8. Updates to This Policy</h2>
                            <p>We may update this Privacy Policy to reflect changes in our practices or for legal
                                reasons. We will notify you of any significant changes via email or through the
                                platform.</p>

                            <h2>9. Contact Us</h2>
                            <p>If you have questions or concerns about this Privacy Policy, please contact us
                                at:</p>
                            <p><strong>Email:</strong> <a
                                href={"mailto:" + adminMail}>{adminMail}</a>
                            </p>
                            <p><strong>Phone:</strong> {process.env.REACT_APP_ADMIN_PHONE}</p>

                            <p>By using CTMASS, you agree to the practices outlined in this Privacy Policy. </p>

                            <p>Thank you for trusting us to connect performers and opportunities!</p>
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
