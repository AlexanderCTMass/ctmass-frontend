import HomePage from 'src/pages';
import {lazy, Suspense} from "react";
import {Outlet} from "react-router-dom";
import {LayoutGuard} from "src/layouts/marketing/index-guard";

//Projects
const ProjectSearchPage = lazy(() => import('src/pages/dashboard/project/search'));
const ProjectDetailPage = lazy(() => import('src/pages/customer/project/detail'));
const ProjectBrowsePage = lazy(() => import('src/pages/customer/project/browse'));
const ProjectCreatePage = lazy(() => import('src/pages/customer/project/create'));
const SpecialistProfilePage = lazy(() => import('src/pages/dashboard/specialist/agreedProfile/specialistProfile'));


export const customerRoutes = [
    {
        path: 'customer',
        element: (
            <LayoutGuard>
                <Suspense>
                    <Outlet/>
                </Suspense>
            </LayoutGuard>
        ),
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'projects',
                children: [
                    {
                        index: true,
                        element: <ProjectBrowsePage/>
                    },
                    {
                        path: 'create',
                        element: <ProjectCreatePage/>
                    },
                    {
                        path: 'search',
                        element: <ProjectSearchPage/>
                    },
                    {
                        path: ':projectId',
                        element: <ProjectDetailPage/>
                    }
                ]
            },

            {
                path: 'contractors',
                children: [
                    {
                        path: ':profileId',
                        element: <SpecialistProfilePage/>
                    }
                ]
            },
        ]
    }
];
