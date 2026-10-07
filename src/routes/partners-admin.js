import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { lazyWithRetry as lazy } from 'src/utils/lazy-with-retry';
import { Layout as PartnersAdminLayout } from 'src/layouts/partners-admin';

const BannersPage = lazy(() => import('src/pages/partners-admin/banners'));
const ArchivePage = lazy(() => import('src/pages/partners-admin/archive'));
const PlacementsPage = lazy(() => import('src/pages/partners-admin/placements'));

export const partnersAdminRoutes = [
    {
        path: 'partners/admin',
        element: (
            <PartnersAdminLayout>
                <Suspense>
                    <Outlet />
                </Suspense>
            </PartnersAdminLayout>
        ),
        children: [
            {
                index: true,
                element: <BannersPage />
            },
            {
                path: 'archive',
                element: <ArchivePage />
            },
            {
                path: 'placements',
                element: <PlacementsPage />
            }
        ]
    }
];
