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
            <Seo title="Cookie Policy"/>
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
                                Cookie Policy
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
                            <p>At CTMASS, we use cookies and similar tracking technologies to enhance your experience on
                                our platform. This Cookie Policy explains what cookies are, how we use them, and how you
                                can manage your preferences.</p>

                            <h2>1. What Are Cookies?</h2>
                            <p>Cookies are small text files stored on your device (computer, smartphone, or tablet) by a
                                website. They help us recognize your device, store preferences, and improve
                                functionality.</p>
                            <p>Cookies are categorized as:</p>
                            <ul>
                                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your
                                    browser.
                                </li>
                                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set
                                    period or until you delete them.
                                </li>
                            </ul>

                            <h2>2. Types of Cookies We Use</h2>
                            <h3>a. Essential Cookies</h3>
                            <p>These cookies are necessary for the platform to function properly, such as enabling
                                secure login and account access.</p>

                            <h3>b. Functional Cookies</h3>
                            <p>These cookies help us remember your preferences, such as language settings or account
                                details, to enhance your experience.</p>

                            <h3>c. Performance and Analytics Cookies</h3>
                            <p>These cookies help us understand how you use our platform, including which pages you
                                visit and for how long. This information helps us improve our services.</p>

                            <h3>d. Advertising Cookies</h3>
                            <p>We may use these cookies to deliver personalized ads and track their performance. They
                                ensure ads are relevant to you.</p>

                            <h2>3. Third-Party Cookies</h2>
                            <p>We may allow trusted third-party service providers to place cookies on our platform
                                for:</p>
                            <ul>
                                <li>Analytics (e.g., Google Analytics)</li>
                                <li>Advertising (e.g., Google Ads, Facebook Pixel)</li>
                                <li>Payment processing</li>
                            </ul>
                            <p>These third parties may collect information about your online activities over time and
                                across different websites.</p>

                            <h2>4. How We Use Cookies</h2>
                            <p>We use cookies to:</p>
                            <ul>
                                <li>Keep you logged into your account securely.</li>
                                <li>Remember your preferences and personalize your experience.</li>
                                <li>Monitor site performance and gather usage statistics.</li>
                                <li>Deliver tailored advertisements and measure their effectiveness.</li>
                            </ul>

                            <h2>5. Managing Cookies</h2>
                            <p>You can control or disable cookies through your browser settings. Please note that
                                disabling cookies may affect the functionality of our platform.</p>

                            <h3>Steps to Manage Cookies:</h3>
                            <ol>
                                <li>Open your browser settings.</li>
                                <li>Navigate to the privacy or cookie settings section.</li>
                                <li>Adjust cookie preferences to block or delete cookies.</li>
                            </ol>
                            <p>For more details, refer to your browser’s support pages:</p>
                            <ul>
                                <li><a href="https://support.google.com/chrome/answer/95647?hl=en" target="_blank">Google
                                    Chrome</a></li>
                                <li><a
                                    href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                                    target="_blank">Mozilla Firefox</a></li>
                                <li><a
                                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                                    target="_blank">Microsoft Edge</a></li>
                                <li><a
                                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                                    target="_blank">Safari</a></li>
                            </ul>

                            <h2>6. Updates to This Policy</h2>
                            <p>We may update this Cookie Policy to reflect changes in our practices or for legal
                                reasons. Any changes will be posted on this page with an updated "Effective Date."</p>

                            <h2>7. Contact Us</h2>
                            <p>If you have questions about this Cookie Policy or how we use cookies, please contact
                                us:</p>
                            <p><strong>Email:</strong> <a href={"mailto:" + adminMail}>{adminMail}</a></p>
                            <p><strong>Phone:</strong> {process.env.REACT_APP_ADMIN_PHONE}</p>

                            <p>By using our platform, you agree to the use of cookies as described in this policy. Thank
                                you for trusting CTMASS to connect you with performers and opportunities!</p>

                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
