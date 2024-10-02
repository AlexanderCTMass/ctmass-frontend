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

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="About service"/>
            <Box
                component="main"
                sx={{flexGrow: 1}}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.800'
                            : 'neutral.50',
                        pb: '120px',
                        pt: '184px'
                    }}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                mb: 4
                            }}
                        >
                            <Typography variant="h3">
                                About service
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{my: 2}}
                                variant="body1"
                            >
                                Welcome to our mission page for our service provided platform! Our goal is to provide a reliable and efficient platform for service providers to connect with customers in need of their services.

                                We understand the importance of finding the right service provider for your needs, and we strive to make that process as easy as possible. Our platform offers a wide range of services, from home repairs and cleaning to personal care and tutoring.

                                Our mission is to create a community where service providers can showcase their skills and expertise, while customers can find the perfect match for their needs. We believe in fostering strong relationships between service providers and customers, built on trust, communication, and mutual respect.

                                We are committed to providing a safe and secure platform for both service providers and customers. We thoroughly vet all service providers before they are allowed to join our platform, ensuring that they have the necessary qualifications and experience. We also provide a rating system for customers to leave feedback on their experiences with service providers, allowing others to make informed decisions when choosing a provider.

                                At our core, we believe in the power of service to bring people together and improve lives. We are dedicated to making that happen through our platform, one connection at a time. Thank you for joining us on this mission!
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default Page;
