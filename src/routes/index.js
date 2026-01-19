import { Outlet } from 'react-router-dom';
import { Layout as MarketingLayout } from 'src/layouts/marketing';
import HomePage from 'src/pages';
import Error401Page from 'src/pages/401';
import Error404Page from 'src/pages/404';
import Error500Page from 'src/pages/500';
import ContactPage from 'src/pages/contact';
import CheckoutPage from 'src/pages/checkout';
import AboutUsPage from 'src/pages/about-us';
import OurMissionPage from 'src/pages/our-mission';
import PricingPage from 'src/pages/pricing';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { componentsRoutes } from './components';
import { dashboardRoutes } from './dashboard';
import { cabinetRoutes } from './cabinet';
import { lazy } from "react";
import PrivacyPolicy from "../pages/privacy-policy";
import TermsAndConditionsPage from '../pages/terms-and-conditions';
import DataDeletionPage from '../pages/data-deletion';
import CookiePolicy from "../pages/cookie-policy";
import UserAgreement from "../pages/user-agreement";
import SpecialistProfilePage from "../pages/cabinet/profiles/my/specialistProfile";
// import ForHomeowners from "src/pages/for-homeowners";

const RequestPage = lazy(() => import('src/pages/request/index'));
const ContractorsPage = lazy(() => import('src/pages/services-old/index'));
const ServicesDetailPage = lazy(() => import('src/pages/services-old/specialty-details/'));
const WhyFreePage = lazy(() => import('src/pages/why-free'));
const RequestCompletePage = lazy(() => import('src/pages/request/complete-project'));
const ReviewFormPage = lazy(() => import('src/pages/review-form'));
// const ReviewSpecialistFormPage = lazy(() => import('src/pages/review-specialist-form'));
// const SpecialistPublicProfilePage = lazy(() => import('src/pages/public-profile'));
const ForHomeownersPage = lazy(() => import('src/pages/for-homeowners'));
const ForContractorsPage = lazy(() => import('src/pages/for-contractors'));
const ForPartnersPage = lazy(() => import('src/pages/for-partners'));
const ItSolutionsPage = lazy(() => import('src/pages/it-solutions'));
const PartnerApply = lazy(() => import('src/pages/partner-apply'))
const PublicProfilePage = lazy(() => import('src/pages/publicProfile'))

export const routes = [
    {
        element: (
            <MarketingLayout>
                <Outlet />
            </MarketingLayout>
        ),
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'terms-and-conditions',
                element: <TermsAndConditionsPage />
            }, {
                path: 'data-deletion',
                element: <DataDeletionPage />
            },
            {
                path: 'pricing',
                element: <PricingPage />
            },
            {
                path: 'why-free',
                element: <WhyFreePage />
            },
            {
                path: 'our-mission',
                element: <OurMissionPage />
            },
            {
                path: 'it-solutions',
                element: <ItSolutionsPage />
            },
            {
                path: 'for-homeowners',
                element: <ForHomeownersPage />
            },
            {
                path: 'for-contractors',
                element: <ForContractorsPage />
            },
            {
                path: 'for-partners',
                element: <ForPartnersPage />
            },
            {
                path: 'partner-apply',
                element: <PartnerApply />
            },
            {
                path: 'contact',
                element: <ContactPage />
            },
            {
                path: 'privacy-policy',
                element: <PrivacyPolicy />
            },
            {
                path: 'cookie-policy',
                element: <CookiePolicy />
            },
            {
                path: 'user-agreement',
                element: <UserAgreement />
            },
            {
                path: 'about-us',
                element: <AboutUsPage />
            },
            {
                path: 'request',
                children: [
                    {
                        index: true,
                        element: <RequestPage />
                    },
                    {
                        path: 'complete',
                        element: <RequestCompletePage />
                    },
                    {
                        path: ':serviceId',
                        children: [
                            {
                                path: '',
                                element: <RequestPage />
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
                        element: <ServicesDetailPage />
                    },
                    {
                        path: ':specialtyId',
                        children: [
                            {
                                path: '',
                                element: <ServicesDetailPage />
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
                        element: <ReviewFormPage />,
                        children: [{
                            path: ':projectId',
                            element: <ReviewFormPage />
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
                                element: <SpecialistProfilePage />
                            }
                        ]
                    }
                ]
            },
            {
                path: 'contractors',
                children: [
                    {
                        index: true,
                        element: <ContractorsPage />
                    },
                    {
                        path: 'first1000',
                        children: [
                            {
                                path: ':profileId',
                                children: [
                                    {
                                        path: '',
                                        element: <PublicProfilePage />
                                    }
                                ]
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
        element: <CheckoutPage />
    },
    {
        path: '401',
        element: <Error401Page />
    },
    {
        path: '404',
        element: <Error404Page />
    },
    {
        path: '500',
        element: <Error500Page />
    },
    {
        path: '*',
        element: <Error404Page />
    }
];
