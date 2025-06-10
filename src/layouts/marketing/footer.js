import {
    Box,
    Container,
    Divider,
    Link,
    Stack,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {Logo} from 'src/components/logo';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {useAuth} from "src/hooks/use-auth";
import {roles} from "src/roles";
import {useConfig} from "src/contexts/remote-config-context";

const sections = [
    {
        title: 'Menu',
        items: [
            {
                title: 'Our mission',
                path: paths.ourMission
            },
            {
                title: 'Contact us',
                path: paths.contact
            },
        ]
    },
    {
        title: 'Services',
        items: [
            {
                title: 'Become a site resident',
                path: paths.register.customer,
                role: [roles.GUEST]
            },
            {
                title: 'Become a service provider',
                path: paths.register.specialist,
                role: [roles.GUEST, roles.CUSTOMER]
            },
            {
                title: 'My projects',
                path: paths.cabinet.projects.index,
                role: [roles.CUSTOMER, roles.WORKER]
            },
            {
                title: 'Create a project',
                path: paths.cabinet.projects.create,
                role: [roles.CUSTOMER, roles.WORKER]
            },
            {
                title: 'Find a project',
                path: paths.cabinet.projects.find.index,
                role: [roles.WORKER]
            }
        ]
    }
];

export const Footer = (props) => {
    const {user} = useAuth();
    const {config} = useConfig();

    // Парсим контактную информацию из конфига
    const contactInfo = config?.contactInfo;

    // Создаем динамический раздел контактов на основе данных из конфига
    const contactSection = {
        title: 'Contacts',
        items: [
            ...(contactInfo?.email ? [{
                title: contactInfo.email,
                path: `mailto:${contactInfo.email}`,
                external: true
            }] : []),
            ...(contactInfo?.phones?.map((phone, index) => ({
                title: phone,
                path: `tel:${phone.replace(/\D/g, '')}`,
                external: true
            })) || []),
            ...(contactInfo?.address ? [{
                title: contactInfo.address,
                path: `https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`,
                external: true
            }] : [])
        ].filter(item => item.title) // дополнительная фильтрация пустых значений
    };

    // Добавляем раздел контактов к основным разделам
    const allSections = [...sections, contactSection];

    return (
        <Box
            sx={{
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'neutral.800'
                    : 'neutral.50',
                borderTopColor: 'divider',
                borderTopStyle: 'solid',
                borderTopWidth: 1,
                pb: 6,
                pt: {
                    md: 15,
                    xs: 6
                }
            }}
            {...props}>
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        xs={12}
                        sm={4}
                        md={3}
                        sx={{
                            order: {
                                xs: 4,
                                md: 1
                            }
                        }}
                    >
                        <Stack spacing={1}>
                            <Stack
                                alignItems="center"
                                component={RouterLink}
                                direction="row"
                                display="inline-flex"
                                href={paths.index}
                                spacing={1}
                                sx={{textDecoration: 'none'}}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        height: 56,
                                        width: 56
                                    }}
                                >
                                    <Logo/>
                                </Box>
                                <Box
                                    sx={{
                                        color: 'text.primary',
                                        fontFamily: '\'Plus Jakarta Sans\', sans-serif',
                                        fontSize: 14,
                                        fontWeight: 800,
                                        letterSpacing: '0.3px',
                                        lineHeight: 2.5,
                                        '& span': {
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    CT<span>MASS</span>
                                </Box>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                © {new Date().getFullYear()} Connecticut & Massachusetts <br/> Service Delivery platform
                            </Typography>
                        </Stack>
                    </Grid>
                    {allSections.map((section, index) => (
                        <Grid
                            key={section.title}
                            xs={12}
                            sm={4}
                            md={3}
                            sx={{
                                order: {
                                    md: index + 2,
                                    xs: index + 1
                                }
                            }}
                        >
                            <Typography
                                color="text.secondary"
                                variant="overline"
                            >
                                {section.title}
                            </Typography>
                            <Stack
                                component="ul"
                                spacing={1}
                                sx={{
                                    listStyle: 'none',
                                    m: 0,
                                    p: 0
                                }}
                            >
                                {section.items.filter(item => !item.role || item.role.includes(user?.role) || (!user && item.role.includes(roles.GUEST))).map((item) => {
                                    const linkProps = item.path
                                        ? item.external
                                            ? {
                                                component: 'a',
                                                href: item.path,
                                                target: '_blank'
                                            }
                                            : {
                                                component: RouterLink,
                                                scrollUp: true,
                                                href: item.path
                                            }
                                        : {};

                                    return (
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            key={item.title}
                                            spacing={2}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: 'primary.main',
                                                    height: 2,
                                                    width: 12
                                                }}
                                            />
                                            <Link
                                                color="text.primary"
                                                variant="subtitle2"
                                                {...linkProps}>
                                                {item.title}
                                            </Link>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
                <Divider sx={{my: 6}}/>

                <Stack>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        All Rights Reserved.
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        Used images from
                        {" "}
                        <a href="https://freepik.com/free-vector/working-plumbers-flat-color-icons-set_4331391.htm#query=%D1%81%D0%B0%D0%BD%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA&position=35&from_view=search&track=sph">macrovector</a>
                        {" "}on Freepik
                    </Typography>
                </Stack>
            </Container>
        </Box>
    )
};