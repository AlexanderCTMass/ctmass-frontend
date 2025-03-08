import {lazy, Suspense} from 'react';
import {Outlet} from 'react-router-dom';
import {Layout as DashboardLayout} from 'src/layouts/dashboard';

const IndexPage = lazy(() => import('src/pages/dashboard/specialist/profile'));
// const IndexPage = lazy(() => import('src/pages/dashboard/index'));

// Academy
const AcademyDashboardPage = lazy(() => import('src/pages/dashboard/academy/dashboard'));
const AcademyCoursePage = lazy(() => import('src/pages/dashboard/academy/course'));

// Blog
const BlogPostListPage = lazy(() => import('src/pages/dashboard/blog/list'));
const BlogPostDetailPage = lazy(() => import('src/pages/dashboard/blog/detail'));
const BlogPostCreatePage = lazy(() => import('src/pages/dashboard/blog/create'));

// Customers
const CustomerListPage = lazy(() => import('src/pages/dashboard/customers/list'));
const CustomerDetailPage = lazy(() => import('src/pages/dashboard/customers/detail'));
const CustomerEditPage = lazy(() => import('src/pages/dashboard/customers/edit'));


const MailTemplateListPage = lazy(() => import('src/pages/dashboard/mail-templates/list'));

// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoices/list'));
const InvoiceDetailPage = lazy(() => import('src/pages/dashboard/invoices/detail'));


// Jobs
const JobBrowsePage = lazy(() => import('src/pages/dashboard/jobs/browse'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/jobs/create'));
const CompanyDetailPage = lazy(() => import('src/pages/dashboard/jobs/companies/detail'));

// Specialist profile
const CustomerProfilePage = lazy(() => import('src/pages/dashboard/customer/public-profile'));
const SpecialistProfilePage = lazy(() => import('src/pages/dashboard/specialist/agreedProfile/specialistProfile'));
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

export const dashboardRoutes = [
    {
        path: 'dashboard',
        element: (
            <DashboardLayout>
                <Suspense>
                    <Outlet/>
                </Suspense>
            </DashboardLayout>
        ),
        children: [
            {
                index: true,
                element: <IndexPage/>
            },
            {
                path: 'academy',
                children: [
                    {
                        index: true,
                        element: <AcademyDashboardPage/>
                    },
                    {
                        path: 'courses',
                        children: [
                            {
                                path: ':courseId',
                                element: <AcademyCoursePage/>
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
                        element: <BlogPostListPage/>
                    },
                    {
                        path: 'create',
                        element: <BlogPostCreatePage/>
                    },
                    {
                        path: ':postId',
                        element: <BlogPostDetailPage/>
                    }
                ]
            },
            {
                path: 'customers',
                children: [
                    {
                        index: true,
                        element: <CustomerListPage/>
                    },
                    {
                        path: ':customerId',
                        element: <CustomerDetailPage/>
                    },
                    {
                        path: ':customerId/edit',
                        element: <CustomerEditPage/>
                    }
                ]
            }, {
                path: 'mail-templates',
                children: [
                    {
                        index: true,
                        element: <MailTemplateListPage/>
                    }
                ]
            },
            {
                path: 'invoices',
                children: [
                    {
                        index: true,
                        element: <InvoiceListPage/>
                    },
                    {
                        path: ':invoiceId',
                        element: <InvoiceDetailPage/>
                    }
                ]
            },

            {
                path: 'jobs',
                children: [
                    {
                        index: true,
                        element: <JobBrowsePage/>
                    },
                    {
                        path: 'create',
                        element: <JobCreatePage/>
                    },
                    {
                        path: 'companies',
                        children: [
                            {
                                path: ':companyId',
                                element: <CompanyDetailPage/>
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
                        element: <LogisticsDashboardPage/>
                    },
                    {
                        path: 'fleet',
                        element: <LogisticsFleetPage/>
                    }
                ]
            },
            {
                path: 'orders',
                children: [
                    {
                        index: true,
                        element: <OrderListPage/>
                    },
                    {
                        path: ':orderId',
                        element: <OrderDetailPage/>
                    }
                ]
            },

            {
                path: 'projects',
                children: [
                    {
                        path: 'search',
                        element: <ProjectSearchPage/>
                    },
                ]
            },

            {
                path: 'products',
                children: [
                    {
                        index: true,
                        element: <ProductListPage/>
                    },
                    {
                        path: 'create',
                        element: <ProductCreatePage/>
                    }
                ]
            },
            {
                path: 'social',
                children: [
                    {
                        path: 'feed',
                        element: <SocialFeedPage/>
                    },
                    {
                        path: 'profile',
                        element: <SocialProfilePage/>
                    }
                ]
            },
            {
                path: 'user-settings',
                element: <UserSettingsPage/>
            },
            {
                path: 'customerProfile',
                children: [
                    {
                        index: true,
                        element: <CustomerProfilePage/>
                    }
                ]
            }, {
                path: 'specialistProfile',
                children: [
                    {
                        index: true,
                        element: <SpecialistProfilePage/>
                    },
                    {
                        path: 'create',
                        element: <SpecialistProfileCreatePage/>
                    }
                ]
            },
            {
                path: 'specialties',
                element: <SpecialtiesEditorPage/>
            },
            {
                path: 'analytics',
                element: <AnalyticsPage/>
            },
            {
                path: 'blank',
                element: <BlankPage/>
            },
            {
                path: 'calendar',
                element: <CalendarPage/>
            },
            {
                path: 'chat',
                children: [
                    {
                        path: ':userId',
                        element: <ChatPage/>
                    }]
            },
            {
                path: 'crypto',
                element: <CryptoPage/>
            },
            {
                path: 'ecommerce',
                element: <EcommercePage/>
            },
            {
                path: 'file-manager',
                element: <FileManagerPage/>
            },
            {
                path: 'kanban',
                element: <KanbanPage/>
            },
            {
                path: 'mail',
                element: <MailPage/>
            },
            {
                path: 'servicesFeed',
                element: <ServicesFeedPage/>
            }
        ]
    }
];
