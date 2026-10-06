import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { SECTION_BG, SECTION_PY } from 'src/theme/ctmass-tokens';
import { startTrace } from 'src/libs/analytics/tracePerfomance'
import { enableClickTracking } from 'src/libs/analytics/clickTracking';
import { HomeDescription2 } from "src/sections/home/home-description2";
import { HomeHero, HomeHeroShell } from 'src/sections/home/home-hero';
import { HomeTrustBand } from 'src/sections/home/home-trust-band';
import { HomeApp } from 'src/sections/home/home-app';
import { HomeReviews2 } from "src/sections/home/home-reviews2";
import { HomeFind } from "../sections/home/home-find";
import { HomeContractors } from "../sections/home/home-contractors";
import { HomeContractorsRating } from "../sections/home/home-contractors-rating";
import { HomePageFeatureToggles } from "src/featureToggles/HomePageFeatureToggles";
import { HomeWhyFree } from "src/sections/home/home-why-free";
import { HomeSpecialistGallery } from "src/sections/home/home-specialist-gallery";
import { HomeHowWorks } from 'src/sections/home/home-how-works'
import { HomeBests } from 'src/sections/home/home-bests';
import { LatestPosts } from "src/components/blog/latest-posts";
import { LatestListings } from "src/components/listings/latest-listings";

const Page = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    usePageView();

    const handleAddListing = useCallback(() => {
        navigate(user ? paths.dashboard.listings.create : paths.login.index);
    }, [navigate, user]);

    const handleAddPost = useCallback(() => {
        navigate(user ? paths.dashboard.blog.postCreate : paths.login.index);
    }, [navigate, user]);

    useEffect(() => {
        const t = startTrace("load_home_page");

        const disposeClick = enableClickTracking();

        return () => {
            t.stop();
            disposeClick();
        };
    }, []);

    return (
        <>
            <Seo />
            <main style={{ backgroundColor: 'white', overflowX: 'clip' }}>
                <HomeHeroShell>
                    <HomeHero />
                    <HomeFind />
                </HomeHeroShell>
                <HomeTrustBand />
                <HomeHowWorks />
                {/* <HomeWorkerCounter/> */}
                <HomeWhyFree />
                <HomeSpecialistGallery />
                {/*<HomeIncompleteRequest/>*/}
                {/* <HomeTechSolutions /> */}
                {/* <HomeUsing /> */}
                <HomeBests />
                <HomeDescription2 />
                <HomeApp />
                {HomePageFeatureToggles.recentlyActiveSpecialists && <HomeContractors />}
                {HomePageFeatureToggles.contractorsRating && <HomeContractorsRating />}
                {/*<HomeCta/>*/}
                {/*<HomeFeatures />*/}
                {HomePageFeatureToggles.reviews && <HomeReviews2 />}
                <LatestListings
                    title="Fresh listings"
                    subtitle="Updated daily"
                    maxPosts={6}
                    onAddNew={handleAddListing}
                    addNewText="Add new listing"
                    containerProps={{ maxWidth: 'lg' }}
                    sx={{ py: SECTION_PY, background: SECTION_BG.mist }}
                />
                <LatestPosts
                    title="CTMASS blog"
                    subtitle="Discover expert construction tips"
                    maxPosts={6}
                    columns={{ xs: 1, sm: 2, md: 4 }}
                    showViewAll={true}
                    viewAllText="Browse all articles"
                    containerProps={{ maxWidth: 'lg' }}
                    onAddNew={handleAddPost}
                    addNewText="Add new post"
                    sx={{ py: SECTION_PY, bgcolor: SECTION_BG.white }}
                />
                {/*<HomeFaqs/>*/}
            </main>
        </>
    );
};

export default Page;
