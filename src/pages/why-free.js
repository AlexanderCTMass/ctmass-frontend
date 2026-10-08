import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { btn, PageHero } from 'src/components/ctmass-ui';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { CheckList, FeatureRow, FounderStory, LandingCta } from 'src/sections/landing/landing-kit';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

const FREE_TODAY = [
    {
        icon: <HomeOutlinedIcon />,
        title: 'Post projects for free',
        text: 'Homeowners describe a project, get responses from local pros and choose who to work with. No fees, ever.'
    },
    {
        icon: <ForumOutlinedIcon />,
        title: 'No paid leads',
        text: 'Contractors see projects and talk to homeowners directly. We never sell the same request to five companies.',
        tone: 'navy'
    },
    {
        icon: <StarOutlineRoundedIcon />,
        title: 'Reviews that mean something',
        text: 'Reviews come from real projects on CTMASS, so a good reputation is earned, not bought.'
    },
    {
        icon: <PhoneIphoneOutlinedIcon />,
        title: 'Web and mobile apps',
        text: 'Messaging, profiles and projects work the same on the website and in the iOS and Android apps.',
        tone: 'navy'
    }
];

const COMING_NEXT = [
    'A professional network for the construction community',
    'A hiring platform for construction companies to find skilled specialists',
    'More tools that help contractors build trust and grow their presence'
];

const Page = () => {
    usePageView();
    const { user } = useAuth();

    const homeownerAction = user
        ? { label: 'Describe a project', href: paths.cabinet.projects.create }
        : { label: "I'm a homeowner", href: paths.login.createProject };

    const contractorAction = user
        ? (user.role === roles.WORKER
            ? { label: 'Find projects', href: paths.cabinet.projects.find.index }
            : { label: 'Start providing services', href: paths.cabinet.profiles.specialistCreateWizard })
        : { label: "I'm a contractor", href: paths.register.serviceProvider };

    return (
        <>
            <Seo title="Why CTMASS Is Free" />
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <PageHero
                    title="Why is CTMASS.com FREE?"
                    subtitle="Free for homeowners, no paid leads for contractors. Here is who builds CTMASS and why we can afford to keep it that way."
                    action={(
                        <Button component={RouterLink} href={homeownerAction.href} sx={{ ...btn.green, minHeight: 54, px: 3.5, fontSize: 16, width: { xs: '100%', md: 'auto' } }}>
                            {homeownerAction.label}
                        </Button>
                    )}
                />

                <HomeSection bg="white">
                    <FounderStory
                        quote="We build and maintain CTMASS ourselves, so we don't need to charge contractors for leads."
                        title="Built by someone who works on both sides"
                        intro="I'm a Massachusetts Licensed Construction Supervisor (CSL) with 15+ years of experience in construction and software engineering. I've worked in facilities and maintenance at Hilton Hartford in CT and Mass General Brigham in MASS, so I understand the real challenges contractors and property owners face."
                        paragraphs={[
                            "I also have the technical skills and an IT team to build and maintain CTMASS ourselves. That's why we don't need to charge contractors for leads."
                        ]}
                        footnote="Our goal is simple: connect homeowners and contractors with FREE access, quality connections, and meaningful reviews."
                    />
                </HomeSection>

                <HomeSection bg="mist">
                    <SectionHeading
                        title="What you get for free"
                        subtitle="Everything below works today, for homeowners and contractors alike."
                    />
                    <FeatureRow items={FREE_TODAY} columns={4} />
                    <Box
                        sx={{
                            mt: { xs: 5, md: 7 },
                            p: { xs: 2.75, md: 4 },
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.8fr) minmax(0, 1.2fr)' },
                            gap: { xs: 2.5, md: 5 },
                            alignItems: 'center',
                            bgcolor: '#FFFFFF',
                            borderRadius: RADIUS.card,
                            border: `1px solid ${alpha(BRAND.navy, 0.08)}`
                        }}
                    >
                        <Box>
                            <Typography component="h3" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 22, md: 26 }, letterSpacing: '-0.02em', color: BRAND.navy }}>
                                What we are building next
                            </Typography>
                            <Typography sx={{ mt: 1, color: BRAND.muted, fontSize: 15, lineHeight: 1.6 }}>
                                Free too. Tell us what you would use and we will build it sooner.
                            </Typography>
                        </Box>
                        <CheckList items={COMING_NEXT} />
                    </Box>
                </HomeSection>

                <HomeSection bg="white">
                    <LandingCta
                        title="There is a place for you here"
                        text="Homeowner, contractor, local supply store or service provider: add your favorite contractors, share your feedback and help us grow this community."
                        action={(
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button
                                    component={RouterLink}
                                    href={homeownerAction.href}
                                    startIcon={<HomeOutlinedIcon />}
                                    sx={{ ...btn.green, minHeight: 54, px: 3.5, fontSize: 16 }}
                                >
                                    {homeownerAction.label}
                                </Button>
                                <Button
                                    component={RouterLink}
                                    href={contractorAction.href}
                                    startIcon={<ConstructionOutlinedIcon />}
                                    sx={{ ...btn.soft, minHeight: 54, px: 3.5, fontSize: 16, bgcolor: '#FFFFFF', color: BRAND.navy, '&:hover': { bgcolor: alpha('#FFFFFF', 0.88) } }}
                                >
                                    {contractorAction.label}
                                </Button>
                            </Stack>
                        )}
                        note="No credit card required. Sign up takes less than 2 minutes."
                    />
                </HomeSection>
            </Box>
        </>
    );
};

export default Page;
