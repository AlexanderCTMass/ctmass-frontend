import { Box } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeHowWorks } from 'src/sections/home/home-how-works';
import HowItWorksHero from './components/HowItWorksHero';

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="How It Works" />
            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    pb: 12
                }}
            >
                <HowItWorksHero />
                <HomeHowWorks />
            </Box>
        </>
    );
};

export default Page;
