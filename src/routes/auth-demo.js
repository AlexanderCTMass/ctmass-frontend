import { lazy } from 'react';
import { Layout as AuthClassicLayout } from 'src/layouts/auth/classic-layout';
import { Layout as AuthModernLayout } from 'src/layouts/auth/modern-layout';

const ForgotPasswordClassicPage = lazy(() => import('src/pages/auth-demo/forgot-password/classic'));
const ForgotPasswordModernPage = lazy(() => import('src/pages/auth-demo/forgot-password/modern'));
const LoginClassicPage = lazy(() => import('src/pages/auth-demo/login/classic'));
const LoginModernPage = lazy(() => import('src/pages/auth-demo/login/modern'));
const RegisterClassicPage = lazy(() => import('src/pages/auth-demo/register/classic'));
const RegisterModernPage = lazy(() => import('src/pages/auth-demo/register/modern'));
const ResetPasswordClassicPage = lazy(() => import('src/pages/auth-demo/reset-password/classic'));
const ResetPasswordModernPage = lazy(() => import('src/pages/auth-demo/reset-password/modern'));
const VerifyCodeClassicPage = lazy(() => import('src/pages/auth-demo/verify-code/classic'));
const VerifyCodeModernPage = lazy(() => import('src/pages/auth-demo/verify-code/modern'));

export const authDemoRoutes = [
  {
    path: 'auth-demo',
    children: [
      {
        path: 'forgot-password',
        children: [
          {
            path: 'classic',
            element: (
              <AuthClassicLayout>
                <ForgotPasswordClassicPage />
              </AuthClassicLayout>
            )
          },
          {
            path: 'modern',
            element: (
              <AuthModernLayout>
                <ForgotPasswordModernPage />
              </AuthModernLayout>
            )
          }
        ]
      },
      {
        path: 'login',
        children: [
          {
            path: 'classic',
            element: (
              <AuthClassicLayout>
                <LoginClassicPage />
              </AuthClassicLayout>
            )
          },
          {
            path: 'modern',
            element: (
              <AuthModernLayout>
                <LoginModernPage />
              </AuthModernLayout>
            )
          }
        ]
      },
      {
        path: 'register',
        children: [
          {
            path: 'classic',
            element: (
              <AuthClassicLayout>
                <RegisterClassicPage />
              </AuthClassicLayout>
            )
          },
          {
            path: 'modern',
            element: (
              <AuthModernLayout>
                <RegisterModernPage />
              </AuthModernLayout>
            )
          }
        ]
      },
      {
        path: 'reset-password',
        children: [
          {
            path: 'classic',
            element: (
              <AuthClassicLayout>
                <ResetPasswordClassicPage />
              </AuthClassicLayout>
            )
          },
          {
            path: 'modern',
            element: (
              <AuthModernLayout>
                <ResetPasswordModernPage />
              </AuthModernLayout>
            )
          }
        ]
      },
      {
        path: 'verify-code',
        children: [
          {
            path: 'classic',
            element: (
              <AuthClassicLayout>
                <VerifyCodeClassicPage />
              </AuthClassicLayout>
            )
          },
          {
            path: 'modern',
            element: (
              <AuthModernLayout>
                <VerifyCodeModernPage />
              </AuthModernLayout>
            )
          }
        ]
      }
    ]
  }
];
