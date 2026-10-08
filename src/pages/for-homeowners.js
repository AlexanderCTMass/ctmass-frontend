import { Box, Button } from '@mui/material';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn } from 'src/components/ctmass-ui';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { FeatureRow, FounderStory, LandingCta, LandingHero } from 'src/sections/landing/landing-kit';

const VIDEOS = ['guitar', 'woman', 'phone', 'cleaning'];

const STEPS = [
    {
        icon: <HowToRegOutlinedIcon />,
        title: 'Create a free account',
        text: 'Sign up as a homeowner to post projects and reach local professionals in CT and MA.'
    },
    {
        icon: <GroupAddOutlinedIcon />,
        title: 'Invite pros you trust',
        text: 'Know a contractor who did great work? Invite them so your neighbors can find them too.',
        tone: 'navy'
    },
    {
        icon: <FavoriteBorderRoundedIcon />,
        title: 'Save your favorites',
        text: 'Keep a list of the professionals you like. It helps other homeowners find quality work.'
    }
];

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="For Homeowners" />
            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <LandingHero
                    title="Find a local pro your neighbors already trust"
                    subtitle="CTMASS is a free community for homeowners in Connecticut and Massachusetts. Post a project, compare local contractors and share the ones you trust."
                    primary={{ label: 'Create a free account', href: paths.register.customer }}
                    secondary={{ label: 'Describe a project', href: paths.request.index }}
                    videos={VIDEOS}
                    poster="/assets/home/audience-homeowners.jpg"
                    fact={{ value: '$0', label: 'for homeowners. No fees and no subscriptions.' }}
                />

                <HomeSection bg="mist">
                    <SectionHeading
                        title="Help us build the community"
                        subtitle="Right now we are growing the CTMASS contractor network. Here is how you can help."
                    />
                    <FeatureRow items={STEPS} />
                </HomeSection>

                <HomeSection bg="white">
                    <FounderStory
                        quote="I created CTMASS to make finding reliable local contractors simple and trusted."
                        title="Why I built CTMASS for homeowners"
                        intro="Hi, I'm Yakov. I live and work in Western Massachusetts as a maintenance engineer at Hilton Hartford and Cooley Dickinson Center. I also flip houses across MA and CT and hold a Construction Supervisor License."
                        paragraphs={[
                            "I'm an HVAC installer and a computer science engineer, probably a lot like your contractor: working hard every day to build a solid reputation.",
                            'CTMASS is a completely free platform where you can:'
                        ]}
                        bullets={[
                            'Find and review contractors',
                            'Post your projects',
                            'Connect with neighbors and share recommendations',
                            'Buy, sell or share materials'
                        ]}
                        footnote="Earn coins for being active, posting and inviting others. Use them later for promotion or rewards in the CTMASS shop."
                    />
                </HomeSection>

                <HomeSection bg="mist">
                    <LandingCta
                        title="Together, we can build better"
                        text="A local community where quality, trust and real experience come first. Join early and invite the people you trust."
                        action={(
                            <Button component={RouterLink} href={paths.register.customer} sx={{ ...btn.green, minHeight: 54, px: 4, fontSize: 16 }}>
                                Create a free account
                            </Button>
                        )}
                        note="Thank you for supporting local businesses."
                    />
                </HomeSection>
            </Box>
        </>
    );
};

export default Page;
