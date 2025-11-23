import { paths } from "src/paths";
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, SvgIcon } from '@mui/material';
import AlignLeft02Icon from 'src/icons/untitled-ui/duocolor/align-left-02';
import BarChartSquare02Icon from 'src/icons/untitled-ui/duocolor/bar-chart-square-02';
import Building04Icon from 'src/icons/untitled-ui/duocolor/building-04';
import CalendarIcon from 'src/icons/untitled-ui/duocolor/calendar';
import CheckDone01Icon from 'src/icons/untitled-ui/duocolor/check-done-01';
import CreditCard01Icon from 'src/icons/untitled-ui/duocolor/credit-card-01';
import CurrencyBitcoinCircleIcon from 'src/icons/untitled-ui/duocolor/currency-bitcoin-circle';
import File01Icon from 'src/icons/untitled-ui/duocolor/file-01';
import GraduationHat01Icon from 'src/icons/untitled-ui/duocolor/graduation-hat-01';
import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import LayoutAlt02Icon from 'src/icons/untitled-ui/duocolor/layout-alt-02';
import LineChartUp04Icon from 'src/icons/untitled-ui/duocolor/line-chart-up-04';
import Lock01Icon from 'src/icons/untitled-ui/duocolor/lock-01';
import LogOut01Icon from 'src/icons/untitled-ui/duocolor/log-out-01';
import Mail03Icon from 'src/icons/untitled-ui/duocolor/mail-03';
import Mail04Icon from 'src/icons/untitled-ui/duocolor/mail-04';
import MessageChatSquareIcon from 'src/icons/untitled-ui/duocolor/message-chat-square';
import ReceiptCheckIcon from 'src/icons/untitled-ui/duocolor/receipt-check';
import Share07Icon from 'src/icons/untitled-ui/duocolor/share-07';
import ShoppingBag03Icon from 'src/icons/untitled-ui/duocolor/shopping-bag-03';
import ShoppingCart01Icon from 'src/icons/untitled-ui/duocolor/shopping-cart-01';
import Truck01Icon from 'src/icons/untitled-ui/duocolor/truck-01';
import Upload04Icon from 'src/icons/untitled-ui/duocolor/upload-04';
import Users03Icon from 'src/icons/untitled-ui/duocolor/users-03';
import XSquareIcon from 'src/icons/untitled-ui/duocolor/x-square';
import { tokens } from 'src/locales/tokens';
import { roles } from 'src/roles';
import { useAuth } from "../../hooks/use-auth";
import EngineeringIcon from '@mui/icons-material/Engineering';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const useSections = () => {
    const { t } = useTranslation();
    const auth = useAuth();
    const user = auth.user;

    return useMemo(() => {
        let sections = [
            {
                subheader: "Site Pages",
                items: [
                    {
                        title: "Home Page",
                        path: paths.index,
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: "Services",
                        path: paths.services.index,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Building04Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: "Mission CTMASS",
                        path: paths.ourMission,
                        icon: (
                            <SvgIcon fontSize="small">
                                <TrendingUpIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: "Contacts",
                        path: paths.contact,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Mail04Icon />
                            </SvgIcon>
                        )
                    },
                ]
            },
            {
                subheader: "Dashboard",
                items: [
                    {
                        title: t(tokens.nav.overview),
                        path: paths.dashboard.index,
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        ),
                        role: [roles.ADMIN]
                    },
                    {
                        title: t(tokens.nav.analytics),
                        path: paths.dashboard.analytics,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <BarChartSquare02Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.ecommerce),
                        path: paths.dashboard.ecommerce,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <LineChartUp04Icon />
                            </SvgIcon>
                        ),
                    },
                    {
                        title: t(tokens.nav.crypto),
                        path: paths.dashboard.crypto,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <CurrencyBitcoinCircleIcon />
                            </SvgIcon>
                        ),
                        label: (
                            <Chip
                                color="primary"
                                label="New"
                                size="small"
                            />
                        )
                    },
                    /* {
                         title: "Customer profile",
                         path: paths.dashboard.customerProfile.index,
                         role: [roles.CUSTOMER, roles.CONTENT],
                         icon: (
                             <SvgIcon fontSize="small">
                                 <HomeSmileIcon/>
                             </SvgIcon>
                         )
                     },*/
                    {
                        title: "Profile",
                        path: paths.dashboard.specialistProfile.index,
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.specialistProfileCreate),
                        path: paths.dashboard.specialistProfile.create,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.servicesFeed),
                        path: paths.dashboard.servicesFeed,
                        role: [roles.TEST],
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: "Projects",
                        path: paths.dashboard.project.index,
                        role: [roles.WORKER, roles.CUSTOMER],
                        icon: (
                            <SvgIcon fontSize="small">
                                <Building04Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: "My projects",
                                path: paths.dashboard.project.index
                            },
                            {
                                title: "Search",
                                path: paths.dashboard.project.search
                            },
                            {
                                title: "Create",
                                path: paths.dashboard.project.create
                            }
                        ]
                    }
                ]
            },
            {
                subheader: "GENERAL",
                items: [
                    {
                        title: t(tokens.nav.userSettings),
                        path: paths.dashboard.userSettings,
                        role: [roles.CUSTOMER, roles.WORKER, roles.CONTENT],
                        icon: (
                            <SvgIcon fontSize="small">
                                <EngineeringIcon />
                            </SvgIcon>
                        )
                    },
                ]
            },
            {
                subheader: "CONTENT",
                items: [
                    {
                        title: "Specialties",
                        path: paths.dashboard.specialties,
                        icon: (
                            <SvgIcon fontSize="small">
                                <HomeSmileIcon />
                            </SvgIcon>
                        ),
                        role: [roles.ADMIN, roles.CONTENT]
                    },
                    {
                        title: t(tokens.nav.customers),
                        path: paths.dashboard.customers.index,
                        role: [roles.ADMIN, roles.CONTENT],
                        icon: (
                            <SvgIcon fontSize="small">
                                <Users03Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.orderList),
                        role: [roles.ADMIN, roles.CUSTOMER, roles.CONTENT],
                        icon: (
                            <SvgIcon fontSize="small">
                                <ShoppingCart01Icon />
                            </SvgIcon>
                        ),
                        path: paths.dashboard.orders.index
                    },
                    {
                        title: 'Email Templates',
                        path: paths.dashboard.emailTemplates.index,
                        role: [roles.ADMIN, roles.CONTENT],
                        icon: (
                            <SvgIcon fontSize="small">
                                <Mail03Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: 'Partners',
                        path: paths.dashboard.partners.index,
                        role: [roles.ADMIN, roles.CONTENT],
                        icon: (
                            <SvgIcon fontSize="small">
                                <Users03Icon />
                            </SvgIcon>
                        )
                    }
                ]
            },
            {
                subheader: t(tokens.nav.concepts),
                items: [
                    {
                        title: t(tokens.nav.productList),
                        path: paths.dashboard.products.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <ShoppingBag03Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.list),
                                path: paths.dashboard.products.index
                            },
                            {
                                title: t(tokens.nav.create),
                                path: paths.dashboard.products.create
                            }
                        ]
                    },

                    {
                        title: t(tokens.nav.invoiceList),
                        path: paths.dashboard.invoices.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <ReceiptCheckIcon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.list),
                                path: paths.dashboard.invoices.index
                            },
                            {
                                title: t(tokens.nav.details),
                                path: paths.dashboard.invoices.details
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.logistics),
                        path: paths.dashboard.logistics.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Truck01Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.dashboard),
                                path: paths.dashboard.logistics.index
                            },
                            {
                                title: t(tokens.nav.fleet),
                                path: paths.dashboard.logistics.fleet
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.academy),
                        path: paths.dashboard.academy.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <GraduationHat01Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.dashboard),
                                path: paths.dashboard.academy.index
                            },
                            {
                                title: t(tokens.nav.course),
                                path: paths.dashboard.academy.courseDetails
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.socialMedia),
                        path: paths.dashboard.social.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Share07Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.publicprofile),
                                path: paths.dashboard.social.profile
                            },
                            {
                                title: t(tokens.nav.feed),
                                path: paths.dashboard.social.feed
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.blog),
                        path: paths.dashboard.blog.index,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <LayoutAlt02Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.postList),
                                path: paths.dashboard.blog.index
                            },
                            {
                                title: t(tokens.nav.postDetails),
                                path: paths.dashboard.blog.postDetails
                            },
                            {
                                title: t(tokens.nav.postCreate),
                                path: paths.dashboard.blog.postCreate
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.fileManager),
                        path: paths.dashboard.fileManager,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Upload04Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.kanban),
                        path: paths.dashboard.kanban,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <CheckDone01Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.mail),
                        path: paths.dashboard.mail,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Mail03Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.chat),
                        path: paths.dashboard.chat,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <MessageChatSquareIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.serviceMessages),
                        path: paths.dashboard.serviceMessages,
                        role: [roles.ADMIN],
                        icon: (
                            <SvgIcon fontSize="small">
                                <Mail04Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.calendar),
                        path: paths.dashboard.calendar,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <CalendarIcon />
                            </SvgIcon>
                        )
                    }
                ]
            },
            {
                subheader: t(tokens.nav.pages),
                items: [
                    {
                        title: t(tokens.nav.auth),
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Lock01Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: t(tokens.nav.login),
                                items: [
                                    {
                                        title: 'Classic',
                                        path: paths.authDemo.login.classic
                                    },
                                    {
                                        title: 'Modern',
                                        path: paths.authDemo.login.modern
                                    }
                                ]
                            },
                            {
                                title: t(tokens.nav.register),
                                items: [
                                    {
                                        title: 'Classic',
                                        path: paths.authDemo.register.classic
                                    },
                                    {
                                        title: 'Modern',
                                        path: paths.authDemo.register.modern
                                    }
                                ]
                            },
                            {
                                title: t(tokens.nav.forgotPassword),
                                items: [
                                    {
                                        title: 'Classic',
                                        path: paths.authDemo.forgotPassword.classic
                                    },
                                    {
                                        title: 'Modern',
                                        path: paths.authDemo.forgotPassword.modern
                                    }
                                ]
                            },
                            {
                                title: t(tokens.nav.resetPassword),
                                items: [
                                    {
                                        title: 'Classic',
                                        path: paths.authDemo.resetPassword.classic
                                    },
                                    {
                                        title: 'Modern',
                                        path: paths.authDemo.resetPassword.modern
                                    }
                                ]
                            },
                            {
                                title: t(tokens.nav.verifyCode),
                                items: [
                                    {
                                        title: 'Classic',
                                        path: paths.authDemo.verifyCode.classic
                                    },
                                    {
                                        title: 'Modern',
                                        path: paths.authDemo.verifyCode.modern
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: t(tokens.nav.pricing),
                        path: paths.pricing,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <CreditCard01Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.checkout),
                        path: paths.checkout,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <LogOut01Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.contact),
                        path: paths.contact,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <Mail04Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: t(tokens.nav.error),
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <XSquareIcon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: '401',
                                path: paths['401']
                            },
                            {
                                title: '404',
                                path: paths['404']
                            },
                            {
                                title: '500',
                                path: paths['500']
                            }
                        ]
                    }
                ]
            },
            {
                subheader: 'Misc',
                items: [
                    {
                        title: 'Level 0',
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <AlignLeft02Icon />
                            </SvgIcon>
                        ),
                        items: [
                            {
                                title: 'Level 1a',
                                items: [
                                    {
                                        title: 'Level 2a',
                                        items: [
                                            {
                                                title: 'Level 3a'
                                            },
                                            {
                                                title: 'Level 3b',
                                                disabled: true
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Level 2b'
                                    }
                                ]
                            },
                            {
                                title: 'Level 1b'
                            }
                        ]
                    },
                    {
                        title: 'Disabled',
                        disabled: true,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <XSquareIcon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: 'Label',
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <File01Icon />
                            </SvgIcon>
                        ),
                        label: (
                            <Chip
                                color="primary"
                                label="New"
                                size="small"
                            />
                        )
                    },
                    {
                        title: 'Blank',
                        path: paths.dashboard.blank,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <File01Icon />
                            </SvgIcon>
                        )
                    },
                    {
                        title: 'External Link',
                        path: 'https://devias.io',
                        external: true,
                        role: roles.ADMIN,
                        icon: (
                            <SvgIcon fontSize="small">
                                <File01Icon />
                            </SvgIcon>
                        )
                    }
                ]
            }
        ];

        return sections.map(section => {
            let predicate = item => user.role === roles.ADMIN || !item.role || ((item.role.includes(user.role)) || item.role === user.role);
            return {
                ...section,
                items: section.items.filter(predicate)
            };
        }).filter(section => section.items.length > 0);
    }, [t]);
};
