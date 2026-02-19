import { useEffect } from 'react'
import {
    Box,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { startTrace } from 'src/libs/analytics/tracePerfomance'
import { enableMouseTracking } from 'src/libs/analytics/mouseTracking';
import { trackMouseMove } from 'src/libs/analytics/behavior';
import { enableClickTracking } from 'src/libs/analytics/clickTracking';
import { HomeDescription2 } from "src/sections/home/home-description2";
import { HomeHero } from 'src/sections/home/home-hero';
import { HomeReviews2 } from "src/sections/home/home-reviews2";
import { HomeFind } from "../sections/home/home-find";
import { HomeContractors } from "../sections/home/home-contractors";
import { HomeContractorsRating } from "../sections/home/home-contractors-rating";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import { HomeWhyFree } from "src/sections/home/home-why-free";
import { HomeSpecialistGallery } from "src/sections/home/home-specialist-gallery";
import { HomeHowWorks } from 'src/sections/home/home-how-works'
import { HomeBests } from 'src/sections/home/home-bests';
import {LatestPosts} from "src/components/blog/latest-posts";

const Page = () => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    usePageView();

    useEffect(() => {
        const t = startTrace("load_home_page");

        const disposeMouse = enableMouseTracking(({ x, y, t }) =>
            trackMouseMove(x, y, t)
        );

        const disposeClick = enableClickTracking();

        return () => {
            t.stop();
            disposeMouse();
            disposeClick();
        };
    }, []);

    return (
        <>
            <Seo />
            <main style={{ backgroundColor: 'white' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: downSm ? 580 : 675,
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: `
                            radial-gradient(100% 70% at 0%   0%,  rgba(9,133,221,0.14) 0%, rgba(9,133,221,0) 60%),
                            radial-gradient(100% 70% at 100% 100%, rgba(0,174,128,0.14) 0%, rgba(0,174,128,0) 60%)
                          `,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'top center'
                    }}
                />
                <HomeHero />
                <HomeFind />
                <HomeHowWorks />
                {/* <HomeWorkerCounter/> */}
                <HomeWhyFree />
                <HomeSpecialistGallery />
                {/*<HomeIncompleteRequest/>*/}
                {/* <HomeTechSolutions /> */}
                {/* <HomeUsing /> */}
                <HomeBests />
                <HomeDescription2 />
                {HomePageFeatureToggles.recentlyActiveSpecialists && <HomeContractors />}
                {HomePageFeatureToggles.contractorsRating && <HomeContractorsRating />}
                {/*<HomeCta/>*/}
                {/*<HomeFeatures />*/}
                {HomePageFeatureToggles.reviews && <HomeReviews2 />}
                <LatestPosts
                    title="Latest Articles in CTMASS Tech blog"
                    subtitle="Discover our newest content"
                    maxPosts={6}
                    columns={{ xs: 1, sm: 2, md: 4 }}
                    showViewAll={true}
                    viewAllText="Browse all articles"
                    containerProps={{ maxWidth: 'lg' }}
                />
                {/*<HomeFaqs/>*/}
            </main>
        </>
    );
};

export default Page;
