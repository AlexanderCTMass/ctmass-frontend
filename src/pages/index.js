import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {HomeCta} from 'src/sections/home/home-cta';
import {HomeFaqs} from 'src/sections/home/home-faqs';
import {HomeFeatures} from 'src/sections/home/home-features';
import {HomeHero} from 'src/sections/home/home-hero';
import {HomeReviews} from 'src/sections/home/home-reviews';
import {HomeFind} from "../sections/home/home-find";
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
                <HomeContractorsRating/>
                <HomeCta/>
                {/*<HomeFeatures />*/}
                <HomeReviews/>
                <HomeFaqs/>
            </main>
        </>
    );
};

export default Page;
