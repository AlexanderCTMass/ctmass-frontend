import HomePage from 'src/pages';
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LayoutGuard } from "src/layouts/cabinet/index-guard";

//Projects
const ProjectFindPage = lazy(() => import('src/pages/cabinet/projects/find'));
const ProjectDetailPage = lazy(() => import('src/pages/cabinet/projects/detail'));
const ProjectDetailForSpecialistPage = lazy(() => import('src/pages/cabinet/projects/detail-for-specialist'));
const ProjectBrowsePage = lazy(() => import('src/pages/cabinet/projects/browse'));
const ProjectCreatePage = lazy(() => import('src/pages/cabinet/projects/create'));
const SpecialistProfilePage = lazy(() => import('src/pages/cabinet/profiles/my/specialistProfile'));
const PartnerProfile = lazy(() => import('src/pages/cabinet/profiles/partner/partnerProfile'))
const PartnerCampaigns = lazy(() => import('src/pages/cabinet/profiles/partner/campaings'))
const PartnerBanners = lazy(() => import('src/pages/cabinet/profiles/partner/banners'))
const UserSettingsPage = lazy(() => import('src/pages/cabinet/profiles/settings'));
const SpecialistProfileCreatePage = lazy(() => import('src/pages/cabinet/profiles/create-specialist-wizard'));

export const cabinetRoutes = [
    {
        path: 'cabinet',
        element: (
            <LayoutGuard>
                <Suspense>
                    <Outlet />
                </Suspense>
            </LayoutGuard>
        ),
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'projects',
                children: [
                    {
                        index: true,
                        element: <ProjectBrowsePage />
                    },
                    {
                        path: 'create',
                        element: <ProjectCreatePage />
                    },
                    {
                        path: 'find',
                        children: [
                            {
                                index: true,
                                element: <ProjectFindPage />
                            },
                            {
                                path: ':projectId',
                                element: <ProjectDetailForSpecialistPage />
                            }
                        ]
                    },
                    {
                        path: ':projectId',
                        element: <ProjectDetailPage />
                    }
                ]
            },

            {
                path: 'profiles',
                children: [
                    {
                        index: true,
                        element: <ProjectFindPage /> //todo profile list
                    },
                    {
                        path: 'my',
                        children: [
                            {
                                index: true,
                                element: <SpecialistProfilePage />
                            },
                            {
                                path: 'settings',
                                element: <UserSettingsPage />
                            }
                        ]
                    },
                    {
                        path: 'partner',
                        children: [
                            {
                                index: true,
                                element: <PartnerProfile />
                            },
                            {
                                path: 'campaigns',
                                element: <PartnerCampaigns />
                            },
                            {
                                path: 'banners',
                                element: <PartnerBanners />
                            }
                        ]

                    },
                    {
                        path: ':profileId',
                        element: <SpecialistProfilePage />
                    },
                    {
                        path: 'specialist-wizard',
                        element: <SpecialistProfileCreatePage />
                    }
                ]
            },
        ]
    }
];
