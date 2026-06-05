import { Outlet } from 'react-router-dom';
import { IssuerGuard } from 'src/guards/issuer-guard';
import { GuestGuard } from 'src/guards/guest-guard';
import { Layout as AuthLayout } from 'src/layouts/auth/modern-layout';
import { Issuer } from 'src/utils/auth';
import { lazyWithRetry } from 'src/utils/lazy-with-retry';

// Firebase
const FirebaseLoginPage = lazyWithRetry(() => import('src/pages/auth/firebase/login'));
const FirebaseRegisterPage = lazyWithRetry(() => import('src/pages/auth/firebase/register'));
const FirebaseCompleteRegisterPage = lazyWithRetry(() => import('src/pages/auth/firebase/complete-register'));

export const authRoutes = [
    {
        path: 'login',
        element: (
            <IssuerGuard issuer={Issuer.Firebase}>
                <GuestGuard>
                    <AuthLayout>
                        <Outlet />
                    </AuthLayout>
                </GuestGuard>
            </IssuerGuard>
        ),
        children: [
            {
                index: true,
                element: <FirebaseLoginPage />
            },
            {
                path: 'register',
                element: <FirebaseRegisterPage />
            }
        ]
    },
    {
        path: 'register',
        element: (
            <IssuerGuard issuer={Issuer.Firebase}>
                <GuestGuard>
                    <AuthLayout>
                        <Outlet />
                    </AuthLayout>
                </GuestGuard>
            </IssuerGuard>
        ),
        children: [
            {
                index: true,
                element: <FirebaseRegisterPage />
            },
            {
                path: 'complete',
                element: <FirebaseCompleteRegisterPage />
            }
        ]
    }
];
