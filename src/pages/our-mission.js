import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn, PageHero } from 'src/components/ctmass-ui';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { FeatureRow, LandingCta } from 'src/sections/landing/landing-kit';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const VALUES = [
    {
        icon: <HandymanOutlinedIcon />,
        title: 'Solutions for every need',
        text: 'Find the right local pro for any home project, from a small repair to a full renovation, in one place.'
    },
    {
        icon: <HandshakeOutlinedIcon />,
        title: 'Direct relationships',
        text: 'Homeowners talk to skilled local contractors directly. No middlemen and no paid leads in between.',
        tone: 'navy'
    },
    {
        icon: <StarOutlineRoundedIcon />,
        title: 'Hire with confidence',
        text: 'Profiles, portfolios and reviews from real projects help you choose who to trust with your home.'
    },
    {
        icon: <StorefrontOutlinedIcon />,
        title: 'Room to grow',
        text: 'Contractors list their services on CTMASS at no cost and build a reputation that brings the next job.',
        tone: 'navy'
    }
];

const PROMISES = [
    { value: '$0', label: 'for homeowners to post a project and hire' },
    { value: '0', label: 'paid leads. Contractors respond for free' },
    { value: 'CT & MA', label: 'local pros only, close to your home' }
];

const Page = () => {
    usePageView();
    const { user } = useAuth();

    return (
        <>
            <Seo title="Our mission" />
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <PageHero
                    title="Empowering connections, building trust"
                    subtitle="Our mission is a reliable, secure platform where homeowners in Connecticut and Massachusetts find trusted local pros without effort, and pros find the work they do best."
                />

                <HomeSection bg="white">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
                            bgcolor: '#FFFFFF',
                            borderRadius: RADIUS.card,
                            border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                            boxShadow: SHADOW.sm,
                            overflow: 'hidden'
                        }}
                    >
                        {PROMISES.map((item, index) => (
                            <Box
                                key={item.value}
                                sx={{
                                    px: { xs: 3, md: 4 },
                                    py: { xs: 3, md: 4 },
                                    borderTop: { xs: index ? `1px solid ${alpha(BRAND.navy, 0.08)}` : 0, md: 0 },
                                    borderLeft: { md: index ? `1px solid ${alpha(BRAND.navy, 0.08)}` : 0 }
                                }}
                            >
                                <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 34, md: 42 }, letterSpacing: '-0.03em', lineHeight: 1, color: index === 0 ? BRAND.green : BRAND.navy }}>
                                    {item.value}
                                </Typography>
                                <Typography sx={{ mt: 1, fontSize: 15, lineHeight: 1.5, color: BRAND.muted }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </HomeSection>

                <HomeSection bg="mist">
                    <SectionHeading
                        title="What we stand for"
                        subtitle="Four things we check every new feature against."
                    />
                    <FeatureRow items={VALUES} columns={4} />
                </HomeSection>

                <HomeSection bg="white">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' },
                            alignItems: 'center',
                            gap: { xs: 2.5, md: 5 },
                            p: { xs: 3, md: 5 },
                            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                            bgcolor: alpha(BRAND.green, 0.07),
                            border: `1px solid ${alpha(BRAND.green, 0.22)}`
                        }}
                    >
                        <Box>
                            <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 24, md: 32 }, letterSpacing: '-0.02em', lineHeight: 1.15, color: BRAND.navy }}>
                                How can CTMASS be free?
                            </Typography>
                            <Typography sx={{ mt: 1, maxWidth: 620, fontSize: { xs: 15, md: 16 }, lineHeight: 1.6, color: BRAND.muted }}>
                                We build and maintain the platform ourselves, so we don&apos;t need to charge contractors for leads. Read the story from our founder.
                            </Typography>
                        </Box>
                        <Button
                            component={RouterLink}
                            href={paths.whyFree}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{ ...btn.navy, minHeight: 52, px: 3.5, justifySelf: { xs: 'stretch', md: 'auto' } }}
                        >
                            Why CTMASS is free
                        </Button>
                    </Box>
                </HomeSection>

                <HomeSection bg="mist">
                    <LandingCta
                        title="Start with your next project"
                        text="Describe what you need and local pros will respond. It takes a couple of minutes."
                        action={(
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button
                                    component={RouterLink}
                                    href={user ? paths.cabinet.projects.create : paths.login.createProject}
                                    sx={{ ...btn.green, minHeight: 54, px: 4, fontSize: 16 }}
                                >
                                    Describe a project
                                </Button>
                                <Button
                                    component={RouterLink}
                                    href={paths.forContractors}
                                    sx={{ ...btn.text, minHeight: 54, color: '#FFFFFF', '&:hover': { bgcolor: alpha('#FFFFFF', 0.1) } }}
                                >
                                    I&apos;m a contractor
                                </Button>
                            </Stack>
                        )}
                    />
                </HomeSection>
            </Box>
        </>
    );
};

export default Page;
