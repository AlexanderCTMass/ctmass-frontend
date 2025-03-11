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
import {HomeFind} from "../sections/home/home-find-chat";
import {HomeContractors} from "../sections/home/home-contractors";
import {HomeContractorsRating} from "../sections/home/home-contractors-rating";

const Page = () => {
    usePageView();

    return (
        <>
            <Seo/>
            <main>
                <HomeHero/>
                <HomeFind/>
                <HomeIncompleteRequest/>
                <HomeUsing/>
                <HomeDescription2/>
                <HomeContractors/>
                <HomeContractorsRating/>
                <HomeCta/>
                {/*<HomeFeatures />*/}
                <HomeReviews2/>
                {/*<HomeFaqs/>*/}
            </main>
        </>
    );
};

export default Page;
