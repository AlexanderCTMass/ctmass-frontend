import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn, IconTile } from 'src/components/ctmass-ui';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { FeatureRow, FounderStory, LandingCta, LandingHero } from 'src/sections/landing/landing-kit';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const VIDEOS = ['guitar', 'woman', 'phone', 'cleaning'];

const REASONS = [
    {
        icon: <HandshakeOutlinedIcon />,
        title: 'A local partner',
        text: 'We are a startup from Western Massachusetts building a free platform for contractors and homeowners.'
    },
    {
        icon: <CampaignOutlinedIcon />,
        title: 'High-impact marketing',
        text: 'Reach your audience through our digital marketing with 1,000+ daily views.',
        tone: 'navy'
    },
    {
        icon: <InsightsOutlinedIcon />,
        title: 'Pay for results',
        text: 'Pay only for real leads, 2 to 3 times cheaper than alternatives, with no upfront payment.'
    }
];

const SERVICES = [
    { icon: <TrendingUpRoundedIcon />, title: 'Digital marketing campaigns', text: 'Google, Instagram and Facebook ads tailored to your audience.' },
    { icon: <WebOutlinedIcon />, title: 'Web solutions', text: 'Custom landing pages, website design and ongoing support.' },
    { icon: <StorefrontOutlinedIcon />, title: 'Marketplace integration', text: 'Put your products and services in front of our network.' },
    { icon: <TravelExploreOutlinedIcon />, title: 'SEO optimization', text: 'Improve your online visibility and search rankings.' },
    { icon: <ContactsOutlinedIcon />, title: 'CRM solutions', text: 'Setup and support for customer relationship management.' },
    { icon: <HubOutlinedIcon />, title: 'Network access', text: 'Direct access to our contractor network with detailed analytics.' }
];

const ServicesGrid = () => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2 }
        }}
    >
        {SERVICES.map((service) => (
            <Stack
                key={service.title}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                    p: { xs: 2.25, md: 2.75 },
                    bgcolor: '#FFFFFF',
                    borderRadius: RADIUS.card,
                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                    boxShadow: SHADOW.sm,
                    transition: 'border-color .25s ease, box-shadow .25s ease',
                    '&:hover': { borderColor: alpha(BRAND.green, 0.5), boxShadow: SHADOW.md }
                }}
            >
                <IconTile size={44} tone="navy">{service.icon}</IconTile>
                <Box sx={{ minWidth: 0 }}>
                    <Typography component="h3" sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, lineHeight: 1.3, color: BRAND.navy }}>
                        {service.title}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: 1.55, color: BRAND.muted }}>{service.text}</Typography>
                </Box>
            </Stack>
        ))}
    </Box>
);

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="For Partners" />
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <LandingHero
                    title="Grow with local contractors and homeowners"
                    subtitle="If your customers are contractors or homeowners in Connecticut and Massachusetts, CTMASS puts you in front of them."
                    primary={{ label: 'Apply to partner', href: paths.partners.apply }}
                    secondary={{ label: 'Email us', href: 'mailto:support@ctmass.com', icon: <MailOutlineRoundedIcon /> }}
                    videos={VIDEOS}
                    poster="/assets/home/audience-partners.jpg"
                    fact={{ value: '0', label: 'upfront payment. You pay only for real leads.' }}
                />

                <HomeSection bg="mist">
                    <SectionHeading
                        title="Why partner with CTMASS"
                        subtitle="A focused local audience, honest pricing and a team that knows both construction and software."
                    />
                    <FeatureRow items={REASONS} />
                </HomeSection>

                <HomeSection bg="white">
                    <SectionHeading
                        title="What we can do for you"
                        subtitle="Our marketing and software team handles the work, so you can focus on your business."
                    />
                    <ServicesGrid />
                </HomeSection>

                <HomeSection bg="mist">
                    <FounderStory
                        quote="I'm building CTMASS as an open, community-first platform for local growth."
                        title="Why a partnership makes sense"
                        intro="Hi, I'm Yakov. I live and work in Western Massachusetts as a maintenance engineer at Hilton Hartford and Cooley Dickinson Center. I also flip houses across MA and CT and hold a Construction Supervisor License."
                        paragraphs={[
                            "At this early stage, I'm looking for local partners who see value in growing a strong local network together.",
                            "We are not looking for funding. The platform is already built and free. We are looking for partnerships, connections and smart ways to reach the right audience. It is a good fit if you are:"
                        ]}
                        bullets={[
                            'A local supply store that wants to reach more contractors and homeowners',
                            'A construction company looking for projects or reputable contractors to hire',
                            'A college or trade school whose graduates need real job opportunities',
                            'Any organization that serves homeowners or contractors'
                        ]}
                        footnote="We are open to ideas and flexible in how we work together. If you see a fit, let's talk."
                    />
                </HomeSection>

                <HomeSection bg="white">
                    <LandingCta
                        title="Let's grow together"
                        text="Tell us about your business and who you want to reach. We will reply with ideas, not a sales script."
                        action={(
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button component={RouterLink} href={paths.partners.apply} sx={{ ...btn.green, minHeight: 54, px: 4, fontSize: 16 }}>
                                    Apply to partner
                                </Button>
                                <Button
                                    href="mailto:support@ctmass.com"
                                    sx={{ ...btn.text, minHeight: 54, color: '#FFFFFF', '&:hover': { bgcolor: alpha('#FFFFFF', 0.1) } }}
                                >
                                    support@ctmass.com
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
