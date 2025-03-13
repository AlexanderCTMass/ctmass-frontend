export const paths = {
    index: '/',
    checkout: '/checkout',
    contact: '/contact',
    donationGofund: 'https://gofund.me/e14fa119',
    pricing: '/pricing',
    login: {
        index: "/login",
        createProject: "/login?returnTo=/cabinet/projects/create"
    },
    register: {
        index: "/register",
        customer: "/register",
        specialist: "/register?returnTo=/cabinet/profiles/specialist-wizard"
    },
    /*
    auth: {

        auth0: {
            callback: '/auth/auth0/callback',
            login: '/auth/auth0/login'
        },
        jwt: {
            login: '/auth/jwt/login',
            register: '/auth/jwt/register'
        },
        firebase: {
            login: '/auth/firebase/login',
            loginAndCreateProject: '/auth/firebase/login?returnTo=/dashboard/jobs/create',
            register: '/auth/firebase/register',
            // registerCustomer: '/auth/firebase/register?returnTo=/dashboard/jobs/create',
            registerCustomer: '/auth/firebase/register',
            registerSpecialist: '/auth/firebase/register?returnTo=/dashboard/specialistProfile/create'
        },
        amplify: {
            confirmRegister: '/auth/amplify/confirm-register',
            forgotPassword: '/auth/amplify/forgot-password',
            login: '/auth/amplify/login',
            register: '/auth/amplify/register',
            resetPassword: '/auth/amplify/reset-password'
        }
    },*/
    authDemo: {
        forgotPassword: {
            classic: '/auth-demo/forgot-password/classic',
            modern: '/auth-demo/forgot-password/modern'
        },
        login: {
            classic: '/auth-demo/login/classic',
            modern: '/auth-demo/login/modern'
        },
        register: {
            classic: '/auth-demo/register/classic',
            modern: '/auth-demo/register/modern'
        },
        resetPassword: {
            classic: '/auth-demo/reset-password/classic',
            modern: '/auth-demo/reset-password/modern'
        },
        verifyCode: {
            classic: '/auth-demo/verify-code/classic',
            modern: '/auth-demo/verify-code/modern'
        }
    },
    services: {
        index: '/services',
        service: '/services/:specialtyId'
    },
    request: {
        index: '/request',
        create: '/request/create?servicePath=:servicePath&customService=:customService'
    },
    specialist: {
        index: '/specialist',
        service: '/specialist/:profileId'
    },
    cabinet: {
        index: '/cabinet',
        profiles: {
            index: '/cabinet/profiles',
            my: {
                index: '/cabinet/profiles/my',
                settings: '/cabinet/profiles/my/settings'
            },
            profile: '/cabinet/profiles/:profileId',
            specialistCreateWizard: '/cabinet/profiles/specialist-wizard'
        },
        projects: {
            index: '/cabinet/projects',
            find: {
                index: '/cabinet/projects/find',
                detail: '/cabinet/projects/find/:projectId'
            },
            create: '/cabinet/projects/create',
            detail: '/cabinet/projects/:projectId'
        }
    },
    dashboard: {
        index: '/dashboard',
        specialties: '/dashboard/specialties',
        academy: {
            index: '/dashboard/academy',
            courseDetails: '/dashboard/academy/courses/:courseId'
        },
        userSettings: '/dashboard/user-settings',
        specialistProfile: {
            index: '/dashboard/specialistProfile',
            create: '/dashboard/specialistProfile/create',
        },
        customerProfile: {
            index: '/dashboard/customerProfile',
            create: '/dashboard/customerProfile/create',
        },
        analytics: '/dashboard/analytics',
        blank: '/dashboard/blank',
        blog: {
            index: '/dashboard/blog',
            postDetails: '/dashboard/blog/:postId',
            postCreate: '/dashboard/blog/create'
        },
        calendar: '/dashboard/calendar',
        chat: '/dashboard/chat/',
        crypto: '/dashboard/crypto',
        mailTemplates: {
            index: '/dashboard/mail-templates',
            details: '/dashboard/mail-templates/:templateId',
            edit: '/dashboard/mail-templates/:templateId/edit'
        },
        customers: {
            index: '/dashboard/customers',
            details: '/dashboard/customers/:customerId',
            edit: '/dashboard/customers/:customerId/edit'
        },
        ecommerce: '/dashboard/ecommerce',
        fileManager: '/dashboard/file-manager',
        invoices: {
            index: '/dashboard/invoices',
            details: '/dashboard/invoices/:orderId'
        },
        jobs: {
            index: '/dashboard/jobs',
            create: '/dashboard/jobs/create',
            companies: {
                details: '/dashboard/jobs/companies/all'
            }
        },
        project: {
            index: '/dashboard/projects',
            search: '/dashboard/projects/search',
            create: '/dashboard/projects/create'
        },
        kanban: '/dashboard/kanban',
        logistics: {
            index: '/dashboard/logistics',
            fleet: '/dashboard/logistics/fleet'
        },
        mail: '/dashboard/mail',
        orders: {
            index: '/dashboard/orders',
            details: '/dashboard/orders/:orderId'
        },
        products: {
            index: '/dashboard/products',
            create: '/dashboard/products/create'
        },
        social: {
            index: '/dashboard/social',
            profile: '/dashboard/social/profile',
            feed: '/dashboard/social/feed'
        },
        servicesFeed: '/dashboard/servicesFeed'

    },
    components: {
        index: '/components',
        dataDisplay: {
            detailLists: '/components/data-display/detail-lists',
            tables: '/components/data-display/tables',
            quickStats: '/components/data-display/quick-stats'
        },
        lists: {
            groupedLists: '/components/lists/grouped-lists',
            gridLists: '/components/lists/grid-lists'
        },
        forms: '/components/forms',
        modals: '/components/modals',
        charts: '/components/charts',
        buttons: '/components/buttons',
        typography: '/components/typography',
        colors: '/components/colors',
        inputs: '/components/inputs'
    },
    ourMission: '/our-mission',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy',
    cookiePolicy: '/cookie-policy',
    userAgreement: '/user-agreement',
    aboutUs: '/about-us',
    401: '/401',
    404: '/404',
    500: '/500'
};
