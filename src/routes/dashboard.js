import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { CreateListing, EditListing } from "src/pages/dashboard/listings/create";

const ProfileInformationPage = lazy(() => import('src/pages/dashboard/profile/information'));
const ProfileNotificationsPage = lazy(() => import('src/pages/dashboard/profile/notifications'));
const ProfileSecurityAccessPage = lazy(() => import('src/pages/dashboard/profile/security-access'));
// const IndexPage = lazy(() => import('src/pages/dashboard/index'));

// Overview
const OverviewPage = lazy(() => import('src/pages/dashboard/overview'));

// Trades
const TradesListPage = lazy(() => import('src/pages/dashboard/trades/list/TradesListPage'));
const CreateTradePage = lazy(() => import('src/pages/dashboard/trades/create/CreateTradePage'));
const ViewTradePage = lazy(() => import('src/pages/dashboard/trades/view/ViewTradePage'));

// Certificates
const CertificatesPage = lazy(() => import('src/pages/dashboard/certificates'));
const CertificateCreatePage = lazy(() => import('src/pages/dashboard/certificates/create'));
const CertificatePublicPage = lazy(() => import('src/pages/dashboard/certificates/publicPage'));

// Academy
const AcademyDashboardPage = lazy(() => import('src/pages/dashboard/academy/dashboard'));
const AcademyCoursePage = lazy(() => import('src/pages/dashboard/academy/course'));

// Blog
const BlogPostListPage = lazy(() => import('src/pages/dashboard/blog/list'));
const BlogPostDetailPage = lazy(() => import('src/pages/dashboard/blog/detail'));
const BlogPostCreatePage = lazy(() => import('src/pages/dashboard/blog/create'));
const BlogMyPostsPage = lazy(() => import('src/pages/dashboard/blog/my-posts'));
const BlogPostEditPage = lazy(() => import('src/pages/dashboard/blog/edit'));

// Listings
const ListingsOverviewPage = lazy(() => import('src/pages/dashboard/listings/index'));
const ListingsHistoryPage = lazy(() => import('src/pages/dashboard/listings/history'));
const ListingsDetailPage = lazy(() => import('src/pages/dashboard/listings/detail'));


// Customers
const CustomerListPage = lazy(() => import('src/pages/dashboard/customers/list'));
const CustomerDetailPage = lazy(() => import('src/pages/dashboard/customers/detail'));
const CustomerEditPage = lazy(() => import('src/pages/dashboard/customers/edit'));

// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoices/list'));
const InvoiceDetailPage = lazy(() => import('src/pages/dashboard/invoices/detail'));


// Jobs
const JobBrowsePage = lazy(() => import('src/pages/dashboard/jobs/browse'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/jobs/create'));
const CompanyDetailPage = lazy(() => import('src/pages/dashboard/jobs/companies/detail'));

// Specialist profile
const CustomerProfilePage = lazy(() => import('src/pages/dashboard/customer/public-profile'));
const SpecialistProfilePage = lazy(() => import('src/pages/cabinet/profiles/my/specialistProfile'));
const SpecialistProfileCreatePage = lazy(() => import('src/pages/dashboard/specialist/create'));

// Logistics
const LogisticsDashboardPage = lazy(() => import('src/pages/dashboard/logistics/dashboard'));
const LogisticsFleetPage = lazy(() => import('src/pages/dashboard/logistics/fleet'));

// Orders
const OrderListPage = lazy(() => import('src/pages/dashboard/adds/list'));
const OrderDetailPage = lazy(() => import('src/pages/dashboard/orders/detail'));

const ProjectSearchPage = lazy(() => import('src/pages/dashboard/project/search'));
// Products
const ProductListPage = lazy(() => import('src/pages/dashboard/products/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/products/create'));

// Social
const SocialFeedPage = lazy(() => import('src/pages/dashboard/social/feed'));
const SocialProfilePage = lazy(() => import('src/pages/dashboard/social/public-profile'));

// Other
const UserSettingsPage = lazy(() => import('src/pages/dashboard/user-settings'));
const AnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const CryptoPage = lazy(() => import('src/pages/dashboard/crypto'));
const EcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const ServicesFeedPage = lazy(() => import('src/pages/dashboard/servicesFeed'));
const SpecialtiesEditorPage = lazy(() => import('src/pages/components/dictionary/specialtiesView'));
const ServiceMessagesPage = lazy(() => import('src/pages/dashboard/ServiceMessagesPage'))
const RequestsPage = lazy(() => import('src/pages/dashboard/requests'))
const LoyaltyAdminPage = lazy(() => import('src/pages/dashboard/admin/loyalty'))
// const ShopAdminPage = lazy(() => import('src/pages/dashboard/admin/shop'))
const LoyaltyUsersPage = lazy(() => import('src/pages/dashboard/admin/loyalty-users'))
const EmailTemplates = lazy(() => import('src/pages/dashboard/email-templates'))
const Partners = lazy(() => import('src/pages/dashboard/partners'))
const PartnerDetail = lazy(() => import('src/pages/dashboard/partners/detail'));

export const dashboardRoutes = [
    {
        path: 'dashboard',
        element: (
            <DashboardLayout>
                <Suspense>
                    <Outlet />
                </Suspense>
            </DashboardLayout>
        ),
        children: [
            {
                index: true,
                element: <ProfileInformationPage />
            },
            {
                path: 'overview',
                element: <OverviewPage />
            },
            {
                path: 'profile',
                children: [
                    {
                        index: true,
                        element: <ProfileInformationPage />
                    },
                    {
                        path: 'information',
                        element: <ProfileInformationPage />
                    },
                    {
                        path: 'security-access',
                        element: <ProfileSecurityAccessPage />
                    },
                    {
                        path: 'notifications',
                        element: <ProfileNotificationsPage />
                    },
                ]
            },
            {
                path: 'trades',
                children: [
                    {
                        index: true,
                        element: <TradesListPage />
                    },
                    {
                        path: 'create',
                        element: <CreateTradePage />
                    },
                    {
                        path: ':tradeId/edit',
                        element: <CreateTradePage />
                    },
                    {
                        path: ':tradeId/view',
                        element: <ViewTradePage />
                    }
                ]
            },
            {
                path: 'certificates',
                children: [
                    {
                        index: true,
                        element: <CertificatesPage />
                    },
                    {
                        path: 'create',
                        element: <CertificateCreatePage />
                    },
                    {
                        path: ':certId/edit',
                        element: <CertificateCreatePage />
                    },
                    {
                        path: 'public/:userId/:certId',
                        element: <CertificatePublicPage />
                    }
                ]
            },
            {
                path: 'academy',
                children: [
                    {
                        index: true,
                        element: <AcademyDashboardPage />
                    },
                    {
                        path: 'courses',
                        children: [
                            {
                                path: ':courseId',
                                element: <AcademyCoursePage />
                            }
                        ]
                    }
                ]
            },
            {
                path: 'blog',
                children: [
                    {
                        index: true,
                        element: <BlogPostListPage />
                    },
                    {
                        path: 'create',
                        element: <BlogPostCreatePage />
                    },
                    {
                        path: 'my-posts',
                        element: <BlogMyPostsPage />
                    },
                    {
                        path: ':postId',
                        element: <BlogPostDetailPage />
                    },
                    {
                        path: 'edit/:postId',
                        element: <BlogPostEditPage />
                    }
                ]
            },
            {
                path: 'listings',
                children: [
                    {
                        index: true,
                        element: <ListingsOverviewPage />
                    },
                    {
                        path: 'create',
                        element: <CreateListing />
                    },
                    {
                        path: 'history',
                        element: <ListingsHistoryPage />
                    },
                    {
                        path: ':listingId',
                        element: <ListingsDetailPage />
                    },
                    {
                        path: ':listingId/edit',
                        element: <EditListing />
                    }
                ]
            },
            {
                path: 'customers',
                children: [
                    {
                        index: true,
                        element: <CustomerListPage />
                    },
                    {
                        path: ':customerId',
                        element: <CustomerDetailPage />
                    },
                    {
                        path: ':customerId/edit',
                        element: <CustomerEditPage />
                    }
                ]
            }, {
                path: 'email-templates',
                children: [
                    {
                        index: true,
                        element: <EmailTemplates />
                    }
                ]
            },
            {
                path: 'partners',
                children: [
                    {
                        index: true,
                        element: <Partners />
                    },
                    {
                        path: ':partnerId',
                        element: <PartnerDetail />
                    }
                ]
            },
            {
                path: 'invoices',
                children: [
                    {
                        index: true,
                        element: <InvoiceListPage />
                    },
                    {
                        path: ':invoiceId',
                        element: <InvoiceDetailPage />
                    }
                ]
            },

            {
                path: 'jobs',
                children: [
                    {
                        index: true,
                        element: <JobBrowsePage />
                    },
                    {
                        path: 'create',
                        element: <JobCreatePage />
                    },
                    {
                        path: 'companies',
                        children: [
                            {
                                path: ':companyId',
                                element: <CompanyDetailPage />
                            }
                        ]
                    }
                ]
            },
            {
                path: 'logistics',
                children: [
                    {
                        index: true,
                        element: <LogisticsDashboardPage />
                    },
                    {
                        path: 'fleet',
                        element: <LogisticsFleetPage />
                    }
                ]
            },
            {
                path: 'orders',
                children: [
                    {
                        index: true,
                        element: <OrderListPage />
                    },
                    {
                        path: ':orderId',
                        element: <OrderDetailPage />
                    }
                ]
            },

            {
                path: 'projects',
                children: [
                    {
                        path: 'search',
                        element: <ProjectSearchPage />
                    },
                ]
            },

            {
                path: 'products',
                children: [
                    {
                        index: true,
                        element: <ProductListPage />
                    },
                    {
                        path: 'create',
                        element: <ProductCreatePage />
                    }
                ]
            },
            {
                path: 'social',
                children: [
                    {
                        path: 'feed',
                        element: <SocialFeedPage />
                    },
                    {
                        path: 'profile',
                        element: <SocialProfilePage />
                    }
                ]
            },
            {
                path: 'user-settings',
                element: <UserSettingsPage />
            },
            {
                path: 'customerProfile',
                children: [
                    {
                        index: true,
                        element: <CustomerProfilePage />
                    }
                ]
            }, {
                path: 'specialistProfile',
                children: [
                    {
                        index: true,
                        element: <SpecialistProfilePage />
                    },
                    {
                        path: 'create',
                        element: <SpecialistProfileCreatePage />
                    }
                ]
            },
            {
                path: 'specialties',
                element: <SpecialtiesEditorPage />
            },
            {
                path: 'analytics',
                element: <AnalyticsPage />
            },
            {
                path: 'blank',
                element: <BlankPage />
            },
            {
                path: 'calendar',
                element: <CalendarPage />
            },
            {
                path: 'chat',
                element: <ChatPage />
            },
            {
                path: 'crypto',
                element: <CryptoPage />
            },
            {
                path: 'ecommerce',
                element: <EcommercePage />
            },
            {
                path: 'file-manager',
                element: <FileManagerPage />
            },
            {
                path: 'kanban',
                element: <KanbanPage />
            },
            {
                path: 'mail',
                element: <MailPage />
            },
            {
                path: 'servicesFeed',
                element: <ServicesFeedPage />
            },
            {
                path: 'serviceMessages',
                element: <ServiceMessagesPage />
            },
            {
                path: 'requests',
                element: <RequestsPage />
            },
            {
                path: 'admin',
                children: [
                    {
                        path: 'loyalty',
                        element: <LoyaltyAdminPage />
                    },
                    // {
                    //     path: 'shop',
                    //     element: <ShopAdminPage />
                    // },
                    {
                        path: 'loyalty-users',
                        element: <LoyaltyUsersPage />
                    }
                ]
            }
        ]
    }
];
