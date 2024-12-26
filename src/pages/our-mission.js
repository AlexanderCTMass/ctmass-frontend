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
                                CTMASS Mission:
                            </Typography>
                            <Typography variant="h2">
                                Empowering Connections, Building Trust
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
                            color="text.primary"
                            sx={{fontSize: '14pt'}}

                        >
                            <p>At CTMASS, our mission is to create a reliable, secure, and innovative platform where
                                service providers and customers seamlessly connect to achieve their goals. We envision a
                                world where finding trusted, high-quality services is effortless, and where
                                professionals can showcase their expertise to build meaningful, long-lasting
                                relationships with clients.</p>

                            <h4>A Platform for Every Need</h4>
                            <p>From home repairs and cleaning to personal care and tutoring, our platform offers a
                                comprehensive range of services tailored to meet the diverse needs of our customers. By
                                bringing together skilled professionals and individuals seeking their services, CTMASS
                                simplifies the process of finding and delivering solutions, creating opportunities for
                                collaboration and growth.</p>

                            <h4>Building Relationships on Trust and Respect</h4>
                            <p>We believe that trust, clear communication, and mutual respect are the cornerstones of
                                successful relationships between service providers and customers. CTMASS is dedicated to
                                fostering these values by ensuring transparency, reliability, and fairness in every
                                interaction. Our platform is not just a marketplace; it’s a community where partnerships
                                thrive.</p>

                            <h4>Commitment to Quality and Security</h4>
                            <p>To maintain the highest standards of service, we thoroughly vet all service providers
                                before welcoming them to our platform. This ensures that every professional has the
                                necessary qualifications, experience, and dedication to deliver exceptional results.
                                Additionally, we provide a safe and secure environment where both service providers and
                                customers can interact with confidence.</p>

                            <h4>Empowering Customers with Informed Choices</h4>
                            <p>Customer feedback is a vital part of our mission. Through our robust rating and review
                                system, customers can share their experiences, empowering others to make well-informed
                                decisions when selecting a service provider. This continuous feedback loop enhances the
                                quality of services and strengthens the trust within our community.</p>

                            <h4>Driving Progress, One Connection at a Time</h4>
                            <p>At CTMASS, we are passionate about creating meaningful connections that positively impact
                                lives. With every project completed, every service delivered, and every relationship
                                formed, we move closer to our goal of redefining how people connect and collaborate.</p>
                            <p></p>
                            <h3>Thank you for joining us on this journey. Together, we can build a brighter, more
                                connected future.<br/> Welcome to CTMASS!</h3>
                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
