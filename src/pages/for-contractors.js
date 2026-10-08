import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn, IconTile, StatusPill } from 'src/components/ctmass-ui';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { CheckList, FeatureRow, FounderStory, LandingCta, LandingHero } from 'src/sections/landing/landing-kit';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const VIDEOS = ['guitar', 'woman', 'phone', 'cleaning'];

const PERKS = [
    {
        icon: <WorkspacePremiumOutlinedIcon />,
        title: 'No paid leads',
        text: 'Respond to projects in MA and CT for free. No pay-per-lead and no hidden fees.'
    },
    {
        icon: <GroupsOutlinedIcon />,
        title: 'Connect and grow',
        text: 'Build your network with local colleagues and homeowners who need your trade.',
        tone: 'navy'
    },
    {
        icon: <StarBorderRoundedIcon />,
        title: 'Build your reputation',
        text: 'Show your work, collect reviews from clients and get found in local search.'
    }
];

const TOOLS = [
    { icon: <ForumOutlinedIcon />, title: 'Messaging', text: 'Talk to clients and colleagues without Facebook.', live: true },
    { icon: <PhoneIphoneOutlinedIcon />, title: 'Mobile apps', text: 'CTMASS for iOS and Android, with your projects in your pocket.', live: true },
    { icon: <VideocamOutlinedIcon />, title: 'Video profiles', text: 'Introduce yourself and your services with short videos.', live: true },
    { icon: <ArticleOutlinedIcon />, title: 'Posts and blogs', text: 'Share tips, finished projects and stories from the job site.', live: true },
    { icon: <StorefrontOutlinedIcon />, title: 'Marketplace', text: 'Rent or sell tools, equipment and leftover materials.', live: true },
    { icon: <LocalOfferOutlinedIcon />, title: 'Local deals', text: 'Competitive prices from nearby supply stores.', live: false }
];

const PLANS = [
    {
        name: 'Basic',
        price: 'Free forever',
        text: 'Everything you need to get started.',
        items: [
            'Post and find projects',
            'Share updates and posts',
            'Search and connect with other contractors',
            'Browse portfolios',
            'Homeowners can message you, with limits'
        ]
    },
    {
        name: 'Pro',
        price: '$15 to $20 / month',
        text: 'For active contractors who want to grow.',
        featured: true,
        items: [
            'Everything in Basic',
            'Advanced contractor search',
            'Direct messages from homeowners',
            'Google Calendar sync',
            'Your own building community networks'
        ]
    },
    {
        name: 'Premium',
        price: 'From $200 / month',
        text: 'For businesses serious about visibility and leads.',
        items: [
            'Everything in Pro',
            'A dedicated digital marketing specialist',
            'Half of the fee goes to Facebook, Instagram and Google ads',
            'Weekly performance reports',
            'A guaranteed boost in visibility'
        ]
    }
];

const ToolsList = () => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 5,
            bgcolor: '#FFFFFF',
            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
            border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
            boxShadow: SHADOW.sm,
            px: { xs: 2.5, md: 4 },
            py: { xs: 1, md: 2 }
        }}
    >
        {TOOLS.map((tool, index) => (
            <Stack
                key={tool.title}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                    py: { xs: 2.25, md: 2.75 },
                    borderTop: {
                        xs: index === 0 ? 0 : `1px solid ${alpha(BRAND.navy, 0.08)}`,
                        md: index < 2 ? 0 : `1px solid ${alpha(BRAND.navy, 0.08)}`
                    }
                }}
            >
                <IconTile size={44} tone={tool.live ? 'green' : 'navy'}>{tool.icon}</IconTile>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                        <Typography component="h3" sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: BRAND.navy }}>
                            {tool.title}
                        </Typography>
                        <StatusPill tone={tool.live ? 'green' : 'navy'}>{tool.live ? 'Available now' : 'Coming soon'}</StatusPill>
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontSize: 15, lineHeight: 1.55, color: BRAND.muted }}>{tool.text}</Typography>
                </Box>
            </Stack>
        ))}
    </Box>
);

const Plans = () => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 2, md: 3 },
            alignItems: 'stretch'
        }}
    >
        {PLANS.map((plan) => {
            const dark = plan.featured;

            return (
                <Box
                    key={plan.name}
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 3, md: 3.5 },
                        borderRadius: RADIUS.card,
                        bgcolor: dark ? BRAND.navy : '#FFFFFF',
                        color: dark ? '#FFFFFF' : BRAND.ink,
                        border: dark ? 0 : `1px solid ${alpha(BRAND.navy, 0.1)}`,
                        boxShadow: dark ? SHADOW.lg : SHADOW.sm,
                        transform: { md: dark ? 'translateY(-12px)' : 'none' }
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: dark ? '#FFFFFF' : BRAND.navy }}>
                            {plan.name}
                        </Typography>
                        {dark && <StatusPill sx={{ bgcolor: alpha(BRAND.green, 0.24), color: '#7EE2AE' }}>Most useful</StatusPill>}
                    </Stack>
                    <Typography sx={{ mt: 1.5, fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 26, md: 28 }, letterSpacing: '-0.02em', color: dark ? '#FFFFFF' : BRAND.navy }}>
                        {plan.price}
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 15, color: dark ? alpha('#FFFFFF', 0.72) : BRAND.muted }}>
                        {plan.text}
                    </Typography>
                    <Box sx={{ my: 2.5, height: '1px', bgcolor: dark ? alpha('#FFFFFF', 0.14) : alpha(BRAND.navy, 0.08) }} />
                    <CheckList items={plan.items} dark={dark} />
                </Box>
            );
        })}
    </Box>
);

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="For Contractors" />
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <LandingHero
                    title="From one contractor to another"
                    subtitle="CTMASS is a free local platform for contractors in Massachusetts and Connecticut. Get found by homeowners, connect with colleagues and build your reputation."
                    primary={{ label: 'Join as a pro', href: paths.register.serviceProvider }}
                    secondary={{ label: 'See how it works', href: paths.howItWorks }}
                    videos={VIDEOS}
                    poster="/assets/home/audience-contractors.jpg"
                    fact={{ value: '$0', label: 'to respond to projects. We never charge contractors for leads.' }}
                />

                <HomeSection bg="mist">
                    <SectionHeading
                        title="What you get"
                        subtitle="Thank you for your time. We know your schedule is packed with projects, so here is the short version."
                    />
                    <FeatureRow items={PERKS} />
                </HomeSection>

                <HomeSection bg="white">
                    <FounderStory
                        quote="I'm a contractor just like you, building something better for our community."
                        title="Why I built CTMASS"
                        intro="Hi, I'm Yakov. I live and work in Western Massachusetts as a maintenance engineer at Hilton Hartford and Cooley Dickinson Center. I also flip houses across MA and CT and hold a Construction Supervisor License."
                        paragraphs={[
                            "I'm an HVAC installer and a computer science engineer, probably a lot like you: working hard every day to support my family and build a solid reputation.",
                            'One problem I kept facing was finding reliable, reputable contractors in the area. So I built CTMASS, a completely free local platform where contractors and homeowners connect, work together and grow their network.',
                            "I'm building this for the community, and your feedback shapes it. Join early and help decide what comes next."
                        ]}
                        footnote="Earn coins for every action: post, connect, invite. Use them for promotion and visibility. Early members earn the most, and rewards decrease as we grow."
                    />
                </HomeSection>

                <HomeSection bg="mist">
                    <SectionHeading
                        title="Tools for your business"
                        subtitle="Most of it is already built. The rest is on the way."
                    />
                    <ToolsList />
                </HomeSection>

                <HomeSection bg="white">
                    <SectionHeading
                        title="Future plans"
                        subtitle="Basic stays free forever. Paid plans are still in planning, and your feedback decides what goes in them."
                    />
                    <Plans />
                    <Typography sx={{ mt: { xs: 3, md: 4 }, textAlign: 'center', fontWeight: 600, color: BRAND.navy }}>
                        Try any plan free for 2 weeks. No obligation.
                    </Typography>
                </HomeSection>

                <HomeSection bg="mist">
                    <LandingCta
                        title="Built by contractors, for contractors"
                        text="Create your free profile in a few minutes and start getting found by homeowners in CT and MA."
                        action={(
                            <Button component={RouterLink} href={paths.register.serviceProvider} sx={{ ...btn.green, minHeight: 54, px: 4, fontSize: 16 }}>
                                Join as a pro
                            </Button>
                        )}
                        note="The Basic account is free forever. No credit card required."
                    />
                </HomeSection>
            </Box>
        </>
    );
};

export default Page;
