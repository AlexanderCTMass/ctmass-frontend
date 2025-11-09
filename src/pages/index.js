import { useState, useCallback } from 'react'
import {
    Box,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Seo } from 'src/components/seo';
import { useWindowScroll } from 'src/hooks/use-window-scroll';
import { usePageView } from 'src/hooks/use-page-view';
import { HomeCta } from 'src/sections/home/home-cta';
import { HomeDescription } from "src/sections/home/home-description";
import { HomeDescription2 } from "src/sections/home/home-description2";
import { HomeFaqs } from 'src/sections/home/home-faqs';
import { HomeFeatures } from 'src/sections/home/home-features';
import { HomeHero } from 'src/sections/home/home-hero';
import { HomeIncompleteRequest } from "src/sections/home/home-incomplete-request";
import { HomeReviews } from 'src/sections/home/home-reviews';
import { HomeReviews2 } from "src/sections/home/home-reviews2";
import { HomeSpec } from "src/sections/home/home-specialties";
import { HomeSpecSlider } from "src/sections/home/home-specialties-slider";
import { HomeUsing } from "src/sections/home/home-using";
import { HomeFind } from "../sections/home/home-find";
import { HomeContractors } from "../sections/home/home-contractors";
import { HomeContractorsRating } from "../sections/home/home-contractors-rating";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import OrderAssistant from "src/sections/home/home-order-assistant";
import WorkersCounter, { HomeWorkerCounter } from "src/sections/home/home-workers-counter";
import { HomeWhyFree } from "src/sections/home/home-why-free";
import { HomeSpecialistGallery } from "src/sections/home/home-specialist-gallery";
import { HomeTechSolutions } from "src/sections/home/home-it-solutions";
import { HomeHowWorks } from 'src/sections/home/home-how-works'

const offset = 64;
const delay = 100;

const Page = () => {
    const theme = useTheme();
    const [elevate, setElevate] = useState(false);
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    usePageView();

    const handleWindowScroll = useCallback(() => {
        if (window.scrollY > offset) {
            setElevate(true);
        } else {
            setElevate(false);
        }
    }, []);

    useWindowScroll({
        handler: handleWindowScroll,
        delay
    });


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
                        height: (downSm && 500) || elevate ? 675 : 777,
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
                <HomeTechSolutions />
                <HomeUsing />
                <HomeDescription2 />
                {HomePageFeatureToggles.recentlyActiveSpecialists && <HomeContractors />}
                {HomePageFeatureToggles.contractorsRating && <HomeContractorsRating />}
                {/*<HomeCta/>*/}
                {/*<HomeFeatures />*/}
                {HomePageFeatureToggles.reviews && <HomeReviews2 />}
                {/*<HomeFaqs/>*/}
            </main>
        </>
    );
};

export default Page;
