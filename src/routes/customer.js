import HomePage from 'src/pages';
import {lazy, Suspense} from "react";
import {Outlet} from "react-router-dom";
import {LayoutGuard} from "src/layouts/marketing/index-guard";

//Projects
const ProjectSearchPage = lazy(() => import('src/pages/customer/project/search'));
const ProjectBrowsePage = lazy(() => import('src/pages/customer/project/browse'));
const ProjectCreatePage = lazy(() => import('src/pages/customer/project/create'));


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
                    }
                ]
            },
        ]
    }
];
