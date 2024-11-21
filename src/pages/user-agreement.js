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
            <Seo title="User Agreement"/>
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
                                User Agreement
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
                            <p>Welcome to CTMASS! This User Agreement governs your use of our platform and services. By
                                accessing or using CTMASS, you agree to comply with these terms. If you do not agree,
                                you may not use our services.</p>

                            <h2>1. Definitions</h2>
                            <ul>
                                <li><strong>"CTMASS"</strong> refers to our platform, including the website, mobile
                                    applications, and related services.
                                </li>
                                <li><strong>"User"</strong> refers to anyone who accesses or uses CTMASS, including
                                    individuals and businesses seeking or offering performance-related services.
                                </li>
                                <li><strong>"Performer"</strong> refers to users offering their skills or services
                                    through CTMASS.
                                </li>
                                <li><strong>"Client"</strong> refers to users seeking to hire performers through CTMASS.
                                </li>
                            </ul>

                            <h2>2. Eligibility</h2>
                            <p>To use CTMASS, you must:</p>
                            <ul>
                                <li>Be at least 18 years old or the age of majority in your jurisdiction.</li>
                                <li>Have the legal capacity to enter into this agreement.</li>
                                <li>Provide accurate and truthful information during registration and use.</li>
                            </ul>

                            <h2>3. Account Creation and Security</h2>
                            <ul>
                                <li>You must create an account to access certain features of CTMASS.</li>
                                <li>You are responsible for maintaining the confidentiality of your account
                                    credentials.
                                </li>
                                <li>Notify us immediately if you suspect unauthorized use of your account.</li>
                                <li>You may not share or transfer your account without prior written consent from
                                    CTMASS.
                                </li>
                            </ul>

                            <h2>4. Acceptable Use</h2>
                            <p>You agree to use CTMASS responsibly and not to:</p>
                            <ul>
                                <li>Post false, misleading, or inappropriate content.</li>
                                <li>Use the platform for illegal, harmful, or fraudulent activities.</li>
                                <li>Interfere with or disrupt the operation of the platform.</li>
                                <li>Collect or misuse other users’ personal information.</li>
                                <li>Attempt to bypass security measures or gain unauthorized access to the platform.
                                </li>
                            </ul>

                            <h2>5. User Conduct and Content</h2>
                            <h3>a. Content Ownership</h3>
                            <ul>
                                <li>You retain ownership of any content you post on CTMASS (e.g., profiles, job
                                    postings, messages).
                                </li>
                                <li>By posting content, you grant CTMASS a non-exclusive, royalty-free license to use,
                                    display, and distribute your content for the purpose of providing our services.
                                </li>
                            </ul>
                            <h3>b. Prohibited Content</h3>
                            <p>You may not post content that is:</p>
                            <ul>
                                <li>Unlawful, defamatory, or obscene.</li>
                                <li>Harassing, abusive, or discriminatory.</li>
                                <li>Infringing on the intellectual property rights of others.</li>
                            </ul>

                            <h2>6. Services and Transactions</h2>
                            <ul>
                                <li>CTMASS provides a platform to connect clients and performers but does not guarantee
                                    the performance or quality of services provided by users.
                                </li>
                                <li>Clients and performers are responsible for negotiating and fulfilling the terms of
                                    their agreements.
                                </li>
                                <li>Payments facilitated through CTMASS are subject to the terms of our payment
                                    processor.
                                </li>
                            </ul>

                            <h2>7. Fees and Payments</h2>
                            <ul>
                                <li>CTMASS may charge service fees for certain features or transactions.</li>
                                <li>Fees are disclosed before you use the relevant feature or service.</li>
                                <li>You are responsible for any taxes or additional charges associated with your
                                    transactions.
                                </li>
                            </ul>

                            <h2>8. Dispute Resolution</h2>
                            <p>Users are encouraged to resolve disputes amicably. If a resolution cannot be reached,
                                CTMASS may, at its discretion, offer mediation but is not obligated to intervene. CTMASS
                                is not liable for any disputes between users.</p>

                            <h2>9. Intellectual Property</h2>
                            <p>CTMASS retains ownership of all intellectual property related to the platform, including
                                trademarks, logos, and software. You may not use CTMASS’s intellectual property without
                                prior written permission.</p>

                            <h2>10. Termination</h2>
                            <ul>
                                <li>You may terminate your account at any time by contacting CTMASS.</li>
                                <li>CTMASS reserves the right to suspend or terminate your account for violations of
                                    this agreement or misuse of the platform.
                                </li>
                            </ul>

                            <h2>11. Disclaimer of Warranties</h2>
                            <p>CTMASS is provided "as is" without warranties of any kind, including but not limited
                                to:</p>
                            <ul>
                                <li>The availability or reliability of the platform.</li>
                                <li>The accuracy or quality of content or services provided by users.</li>
                                <li>The security of user data, though we implement industry-standard safeguards.</li>
                            </ul>

                            <h2>12. Limitation of Liability</h2>
                            <p>To the fullest extent permitted by law:</p>
                            <ul>
                                <li>CTMASS is not liable for any direct, indirect, incidental, or consequential damages
                                    arising from your use of the platform.
                                </li>
                                <li>Our liability is limited to the fees you paid for using our services within the six
                                    months prior to the claim.
                                </li>
                            </ul>

                            <h2>13. Indemnification</h2>
                            <p>You agree to indemnify and hold CTMASS harmless from any claims, losses, or damages
                                arising out of:</p>
                            <ul>
                                <li>Your breach of this agreement.</li>
                                <li>Your use of the platform.</li>
                                <li>Your interactions or transactions with other users.</li>
                            </ul>

                            <h2>14. Governing Law</h2>
                            <p>This agreement is governed by the laws of [Insert Jurisdiction]. Any disputes shall be
                                resolved exclusively in the courts of [Insert Jurisdiction].</p>

                            <h2>15. Changes to This Agreement</h2>
                            <p>CTMASS may update this User Agreement from time to time. Significant changes will be
                                communicated through the platform or via email. Your continued use of the platform
                                constitutes acceptance of the revised terms.</p>

                            <h2>16. Contact Us</h2>
                            <p>If you have questions about this agreement, please contact us:</p>
                            <p><strong>Email:</strong> <a href={"mailto:" + adminMail}>{adminMail}</a></p>
                            <p><strong>Phone:</strong>  {process.env.REACT_APP_ADMIN_PHONE}</p>

                            <p>By using CTMASS, you acknowledge that you have read, understood, and agree to this User
                                Agreement. Thank you for being part of the CTMASS community!</p>


                        </Typography>
                    </Container>
                </Box>
            </Box>
            <HomeCta/>
        </>
    );
};

export default Page;
