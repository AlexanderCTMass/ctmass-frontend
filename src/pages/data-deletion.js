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
            <Seo title="Data Deletion Instructions"/>
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
                               Data Deletion Instructions
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
                            <h1>Data Deletion Instructions</h1>
                            <p>
                                If you would like to request the deletion of your data associated with our application,
                                please follow the steps below.
                                This process ensures that your personal information is permanently removed from our
                                systems.
                            </p>

                            <h2>Step 1: Log in to Your Account</h2>
                            <ol>
                                <li>Open the application and log in using your credentials (email, Facebook, or other
                                    login methods).
                                </li>
                                <li>Navigate to the <strong>Account
                                    Settings</strong> or <strong>Profile</strong> section.
                                </li>
                            </ol>

                            <h2>Step 2: Request Data Deletion</h2>
                            <ol>
                                <li>In the <strong>Account Settings</strong>, look for
                                    the <strong>Privacy</strong> or <strong>Data Management</strong> section.
                                </li>
                                <li>Click on the <strong>Delete My Data</strong> or <strong>Request Data
                                    Deletion</strong> option.
                                </li>
                                <li>Follow the on-screen instructions to confirm your request.</li>
                            </ol>

                            <h2>Step 3: Contact Us (Optional)</h2>
                            <p>
                                If you encounter any issues or cannot find the data deletion option, you can contact us
                                directly at
                                <a href="mailto:support@yourapp.com">support@yourapp.com</a>. Please include the
                                following details in your email:
                            </p>
                            <ul>
                                <li>Your full name</li>
                                <li>Your email address associated with the account</li>
                                <li>A brief description of your request</li>
                            </ul>

                            <h2>Step 4: Confirmation</h2>
                            <p>
                                Once your request is processed, you will receive a confirmation email. Please note that
                                it may take up to
                                <strong>30 days</strong> for your data to be completely deleted from our systems.
                            </p>

                            <h2>Additional Information</h2>
                            <p>
                                If you logged in using Facebook, you can also request data deletion directly through
                                Facebook:
                            </p>
                            <ol>
                                <li>Go to your <a href="https://www.facebook.com/settings" target="_blank">Facebook
                                    Settings</a>.
                                </li>
                                <li>Navigate to <strong>Apps and Websites</strong>.</li>
                                <li>Find our app in the list and click <strong>Remove</strong>.</li>
                                <li>Follow the instructions to confirm the deletion of your data.</li>
                            </ol>

                            <p>
                                For more information, please refer to our
                                <a href="/privacy-policy" target="_blank">Privacy Policy</a>.
                            </p>
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
