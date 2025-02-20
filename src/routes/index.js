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
import ServicesPage from 'src/pages/services';

const ServicePage = lazy(() => import('src/pages/services/specialty-details'));
const RequestPage = lazy(() => import('src/pages/request/index'));
const SpecialistPublicProfilePage = lazy(() => import('src/pages/public-profile'));

import {authRoutes} from './auth';
import {authDemoRoutes} from './auth-demo';
import {componentsRoutes} from './components';
import {dashboardRoutes} from './dashboard';
import {lazy} from "react";
import PrivacyPolicy from "../pages/privacy-policy";
import TermsAndConditionsPage from '../pages/terms-and-conditions';

import CookiePolicy from "../pages/cookie-policy";
import UserAgreement from "../pages/user-agreement";
import ProfilePage from "../pages/dashboard/specialist/agreedProfile/profile";
import SpecialistProfilePage from "../pages/dashboard/specialist/agreedProfile/specialistProfile";

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
                path: 'services',
                children: [
                    {
                        index: true,
                        element: <ServicesPage/>
                    },
                    {
                        path: ':specialtyId',
                        children: [
                            {
                                path: '',
                                element: <ServicePage/>
                            }
                        ]
                    }
                ]
            },

            {
                path: 'specialist',
                children: [
                    {
                        index: true,
                        element: <ServicesPage/>
                    },
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
