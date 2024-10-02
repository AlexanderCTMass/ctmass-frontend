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

    return (
        <>
            <Seo title="Our mission"/>
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
                                Our mission
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
                            Our goal is to provide a reliable and efficient platform for service providers to
                            connect with customers in need of their services.
                            <br/><br/>
                            Our platform offers a wide range of services, from home repairs and cleaning to personal
                            care and tutoring. We believe in fostering strong relationships between service
                            providers and customers, built on trust, communication, and mutual respect. We are
                            committed to providing a safe and secure platform for both service providers and
                            customers.
                            <br/><br/>
                            We thoroughly vet all service providers before they are allowed to join our
                            platform, ensuring that they have the necessary qualifications and experience.
                            <br/><br/>
                            We also provide a rating system for customers to leave feedback on their experiences
                            with
                            service providers, allowing others to make informed decisions when choosing a provider.
                            We are dedicated to making that happen through our platform, one connection at a time.
                            <br/><br/>
                            Thank you for joining us on this mission!
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
