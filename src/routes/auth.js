import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { IssuerGuard } from 'src/guards/issuer-guard';
import { GuestGuard } from 'src/guards/guest-guard';
import { Layout as AuthLayout } from 'src/layouts/auth/modern-layout';
import { Issuer } from 'src/utils/auth';

// Firebase
const FirebaseLoginPage = lazy(() => import('src/pages/auth/firebase/login'));
const FirebaseRegisterPage = lazy(() => import('src/pages/auth/firebase/register'));
const FirebaseCompleteRegisterPage = lazy(() => import('src/pages/auth/firebase/complete-register'));

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
