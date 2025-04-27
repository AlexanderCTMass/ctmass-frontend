import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {HomeCta} from 'src/sections/home/home-cta';
import {HomeDescription} from "src/sections/home/home-description";
import {HomeDescription2} from "src/sections/home/home-description2";
import {HomeFaqs} from 'src/sections/home/home-faqs';
import {HomeFeatures} from 'src/sections/home/home-features';
import {HomeHero} from 'src/sections/home/home-hero';
import {HomeIncompleteRequest} from "src/sections/home/home-incomplete-request";
import {HomeReviews} from 'src/sections/home/home-reviews';
import {HomeReviews2} from "src/sections/home/home-reviews2";
import {HomeSpec} from "src/sections/home/home-specialties";
import {HomeSpecSlider} from "src/sections/home/home-specialties-slider";
import {HomeUsing} from "src/sections/home/home-using";
import {HomeFind} from "../sections/home/home-find";
import {HomeContractors} from "../sections/home/home-contractors";
import {HomeContractorsRating} from "../sections/home/home-contractors-rating";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";
import OrderAssistant from "src/sections/home/home-order-assistant";
import WorkersCounter, {HomeWorkerCounter} from "src/sections/home/home-workers-counter";
import {HomeWhyFree} from "src/sections/home/home-why-free";

const Page = () => {
    usePageView();

    return (
        <>
            <Seo/>
            <main>
                <HomeHero/>
                <HomeFind/>
                <HomeWorkerCounter/>
                {/*<HomeIncompleteRequest/>*/}
                <HomeWhyFree/>
                <HomeUsing/>
                <HomeDescription2/>
                {HomePageFeatureToggles.recentlyActiveSpecialists && <HomeContractors/>}
                {HomePageFeatureToggles.contractorsRating && <HomeContractorsRating/>}
                {/*<HomeCta/>*/}
                {/*<HomeFeatures />*/}
                {HomePageFeatureToggles.reviews && <HomeReviews2/>}
                {/*<HomeFaqs/>*/}
            </main>
        </>
    );
};

export default Page;
