import {Outlet} from 'react-router-dom';
import {Layout as MarketingLayout} from 'src/layouts/marketing';
import HomePage from 'src/pages';
import Error401Page from 'src/pages/401';
import Error404Page from 'src/pages/404';
import Error500Page from 'src/pages/500';
import ContactPage from 'src/pages/contact';
import CheckoutPage from 'src/pages/checkout';
import AboutUsPage from 'src/pages/about-us';
import OurMissionPage from 'src/pages/our-mission';
import PricingPage from 'src/pages/pricing';
import {authRoutes} from './auth';
import {authDemoRoutes} from './auth-demo';
import {componentsRoutes} from './components';
import {dashboardRoutes} from './dashboard';
import {cabinetRoutes} from './cabinet';
import {lazy} from "react";
import PrivacyPolicy from "../pages/privacy-policy";
import TermsAndConditionsPage from '../pages/terms-and-conditions';
import DataDeletionPage from '../pages/data-deletion';
import CookiePolicy from "../pages/cookie-policy";
import UserAgreement from "../pages/user-agreement";
import SpecialistProfilePage from "../pages/cabinet/profiles/my/specialistProfile";

const RequestPage = lazy(() => import('src/pages/request/index'));
const RequestCompletePage = lazy(() => import('src/pages/request/complete-project'));
const ReviewFormPage = lazy(() => import('src/pages/review-form'));
const SpecialistPublicProfilePage = lazy(() => import('src/pages/public-profile'));

export const routes = [
    {
        element: (
            <MarketingLayout>
                <Outlet/>
            </MarketingLayout>
        ),
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'terms-and-conditions',
                element: <TermsAndConditionsPage/>
            }, {
                path: 'data-deletion',
                element: <DataDeletionPage/>
            },
            {
                path: 'pricing',
                element: <PricingPage/>
            },
            {
                path: 'our-mission',
                element: <OurMissionPage/>
            },
            {
                path: 'contact',
                element: <ContactPage/>
            },
            {
                path: 'privacy-policy',
                element: <PrivacyPolicy/>
            },
            {
                path: 'cookie-policy',
                element: <CookiePolicy/>
            },
            {
                path: 'user-agreement',
                element: <UserAgreement/>
            },
            {
                path: 'about-us',
                element: <AboutUsPage/>
            },

            {
                path: 'request',
                children: [
                    {
                        index: true,
                        element: <RequestPage/>
                    },
                    {
                        path: 'complete',
                        element: <RequestCompletePage/>
                    },
                    {
                        path: ':serviceId',
                        children: [
                            {
                                path: '',
                                element: <RequestPage/>
                            }
                        ]
                    }
                ]
            },
            {
                path: 'review-form',
                children: [
                    {
                        path: ':specialistId',
                        children: [{
                            path: ':projectId',
                            element: <ReviewFormPage/>
                        }]
                    }
                ]
            },

            {
                path: 'specialist',
                children: [
                    {
                        path: ':profileId',
                        children: [
                            {
                                path: '',
                                element: <SpecialistProfilePage/>
                            }
                        ]
                    }
                ]
            },
            ...componentsRoutes
        ]
    },
    ...authRoutes,
    ...authDemoRoutes,
    ...dashboardRoutes,
    ...cabinetRoutes,
    {
        path: 'checkout',
        element: <CheckoutPage/>
    },
    {
        path: '401',
        element: <Error401Page/>
    },
    {
        path: '404',
        element: <Error404Page/>
    },
    {
        path: '500',
        element: <Error500Page/>
    },
    {
        path: '*',
        element: <Error404Page/>
    }
];
