import {
    Box,
    Button,
    Container,
    Link,
    Stack,
    SvgIcon,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { NewLogo } from 'src/components/NewLogo';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { usePathname } from 'src/hooks/use-pathname';
import ForHomeownersIcon from 'src/icons/untitled-ui/duocolor/for-homeowners';
import ForContractorsIcon from 'src/icons/untitled-ui/duocolor/for-contractors';
import HowItWorksIcon from 'src/icons/untitled-ui/duocolor/how-it-works';
import BecomeAPartnerIcon from 'src/icons/untitled-ui/duocolor/become-a-partner';
import UmbrellaIcon from '@untitled-ui/icons-react/build/esm/Umbrella01'; // «Support»

const navItems = [
    { title: 'For Homeowners', icon: ForHomeownersIcon, path: paths.forHomeowners },
    { title: 'For Contractors', icon: ForContractorsIcon, path: paths.forContractors },
    { title: 'How it works', icon: HowItWorksIcon, path: paths.itSolutions },
    { title: 'Become a partner', icon: BecomeAPartnerIcon, path: paths.forPartners }
];

export const Footer = () => {
    const theme = useTheme();
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const pathname = usePathname();

    return (
        <Box
            component="footer"
            sx={{
                background: `linear-gradient(135deg, #F4F8FB 0%, #E9EEFF 100%)`,
                overflow: 'hidden',
                pt: { xs: 6, md: 8 },
                pb: { xs: 8, md: 10 },
            }}
        >
            <Container maxWidth="xl">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    spacing={{ xs: 4, md: 0 }}
                >
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            component={RouterLink}
                            href={paths.index}
                            sx={{ textDecoration: 'none' }}
                        >
                            <NewLogo sx={{ width: 56, height: 56 }} />
                        </Stack>
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={{ xs: 3, md: 6 }}
                        flexWrap="wrap"
                        alignItems={downMd ? 'flex-start' : 'center'}
                    >
                        {navItems.map(({ title, icon, path }) => (
                            <Button
                                key={title}
                                component={RouterLink}
                                href={path}
                                color={pathname === path ? 'primary' : 'inherit'}
                                startIcon={
                                    <SvgIcon
                                        component={icon}
                                        inheritViewBox
                                        sx={{
                                            fontSize: 36,
                                            fill: 'none'
                                        }}
                                    />
                                }
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    justifyContent: { xs: 'flex-start', md: 'center' },
                                    minWidth: 0,
                                    px: 1,
                                }}
                            >
                                {title}
                            </Button>
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={
                            <SvgIcon sx={{ fontSize: 28 }}>
                                <UmbrellaIcon />
                            </SvgIcon>
                        }
                        component={RouterLink}
                        href={paths.index}
                        sx={{
                            backgroundColor: '#0B1E64',
                            color: '#fff',
                            borderRadius: 2,
                            width: { xs: '100%', md: 200 },
                            '&:hover': {
                                backgroundColor: '#15278A'
                            },
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3
                        }}
                    >
                        Support
                    </Button>
                </Stack>

                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        my: { xs: 6, md: 8 }
                    }}
                />

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={{ xs: 4, md: 0 }}
                >
                    <Typography variant="caption" color="text.secondary">
                        © {new Date().getFullYear()} Connecticut &amp; Massachusetts. Service Delivery platform.
                        <br />
                        All Rights Reserved. Used images from&nbsp;
                        <Link
                            href="https://freepik.com/free-vector/working-plumbers-flat-color-icons-set_4331391.htm#query=%D1%81%D0%B0%D0%BD%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA&position=35&from_view=search&track=sph"
                            target="_blank"
                        >
                            macrovector
                        </Link>{' '}
                        on Freepik.
                    </Typography>

                    <Stack
                        direction="column"
                        spacing={1}
                        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                        <Link component={RouterLink} href={paths.termsAndConditions} color='#111927'>
                            Terms &amp; Conditions
                        </Link>
                        <Link component={RouterLink} href={paths.privacyPolicy} color='#111927'>
                            Privacy Policy
                        </Link>
                        <Link component={RouterLink} href={paths.cookiePolicy} color='#111927'>
                            Cookie Policy
                        </Link>
                    </Stack>
                </Stack>
            </Container>
        </Box >
    );
};