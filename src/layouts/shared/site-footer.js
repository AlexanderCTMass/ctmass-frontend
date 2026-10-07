import { Box, ButtonBase, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { useAuth } from 'src/hooks/use-auth';
import { usePathname } from 'src/hooks/use-pathname';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from 'src/constants/mobile-apps';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

const FREEPIK_URL = 'https://freepik.com/free-vector/working-plumbers-flat-color-icons-set_4331391.htm#query=%D1%81%D0%B0%D0%BD%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA&position=35&from_view=search&track=sph';

const STORES = [
    { label: 'App Store', href: APP_STORE_URL, Icon: AppleIcon },
    { label: 'Google Play', href: GOOGLE_PLAY_URL, Icon: ShopIcon }
];

const LEGAL = [
    { title: 'Terms & Conditions', path: paths.termsAndConditions },
    { title: 'Privacy Policy', path: paths.privacyPolicy },
    { title: 'Cookie Policy', path: paths.cookiePolicy }
];

const resolveAccountLinks = (user) => {
    if (!user) {
        return [
            { title: 'Log in', path: paths.login.index },
            { title: 'Post a project', path: paths.login.createProject },
            { title: 'Become a service provider', path: paths.register.serviceProvider }
        ];
    }

    if (user.role === roles.WORKER) {
        return [
            { title: 'Dashboard', path: paths.dashboard.overview },
            { title: 'My trades', path: paths.dashboard.trades.index },
            { title: 'Find a project', path: paths.cabinet.projects.find.index },
            { title: 'My works', path: paths.cabinet.projects.contractor }
        ];
    }

    return [
        { title: 'Dashboard', path: paths.dashboard.overview },
        { title: 'My projects', path: paths.cabinet.projects.index },
        { title: 'Create a project', path: paths.cabinet.projects.create },
        { title: 'Become a service provider', path: paths.cabinet.profiles.specialistCreateWizard }
    ];
};

const linkSx = {
    display: 'inline-block',
    py: 0.75,
    color: alpha('#FFFFFF', 0.72),
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
    backgroundImage: `linear-gradient(${BRAND.green}, ${BRAND.green})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 calc(100% - 4px)',
    backgroundSize: '0 2px',
    transition: 'color .2s ease, background-size .25s ease',
    '&:hover': { color: '#FFFFFF', backgroundSize: '100% 2px' },
    '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2, borderRadius: 4 }
};

const FooterLink = ({ item, active }) => {
    const external = item.path.startsWith('http');
    const props = external
        ? { component: 'a', href: item.path, target: '_blank', rel: 'noopener' }
        : { component: RouterLink, href: item.path };

    return (
        <Box component="li">
            <Box {...props} sx={{ ...linkSx, ...(active && { color: '#FFFFFF', backgroundSize: '100% 2px' }) }}>
                {item.title}
            </Box>
        </Box>
    );
};

const Column = ({ title, items, pathname }) => (
    <Box>
        <Typography component="h3" sx={{ mb: 1.25, fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: '#FFFFFF' }}>
            {title}
        </Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map((item) => (
                <FooterLink key={item.title} item={item} active={pathname === item.path} />
            ))}
        </Box>
    </Box>
);

export const SiteFooter = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    const columns = [
        {
            title: 'Explore',
            items: [
                { title: 'Find a specialist', path: paths.services.index },
                { title: 'For Homeowners', path: paths.forHomeowners },
                { title: 'For Contractors', path: paths.forContractors },
                { title: 'For Partners', path: paths.forPartners },
                { title: 'How it works', path: paths.howItWorks }
            ]
        },
        { title: 'Your account', items: resolveAccountLinks(user) },
        {
            title: 'Company',
            items: [
                { title: 'Our mission', path: paths.ourMission },
                { title: 'Why CTMASS is free', path: paths.whyFree },
                { title: 'Blog', path: paths.blog.index },
                { title: 'IT services for your business', path: paths.itSolutions },
                { title: 'Support the project', path: paths.donationGofund }
            ]
        }
    ];

    return (
        <Box
            component="footer"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                color: '#FFFFFF',
                pt: { xs: 7, md: 10 },
                pb: { xs: 4, md: 5 },
                background: `radial-gradient(50% 80% at 0% 100%, ${alpha(BRAND.green, 0.18)} 0%, ${alpha(BRAND.green, 0)} 70%), linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 60%)`,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.05)} 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                    WebkitMaskImage: 'linear-gradient(250deg, #000 0%, transparent 55%)',
                    maskImage: 'linear-gradient(250deg, #000 0%, transparent 55%)'
                }
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'minmax(0, 1.5fr) repeat(3, minmax(0, 1fr))' },
                        columnGap: { xs: 3, md: 6 },
                        rowGap: { xs: 5, md: 6 }
                    }}
                >
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                        <Stack
                            component={RouterLink}
                            href={paths.index}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ display: 'inline-flex', textDecoration: 'none', color: '#FFFFFF' }}
                        >
                            <Box sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', bgcolor: '#FFFFFF', '& > *': { width: '52px !important', height: '52px !important' }, '& img': { width: 52, height: 52 } }}>
                                <Logo />
                            </Box>
                            <Box sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>
                                CT<Box component="span" sx={{ color: BRAND.green }}>MASS</Box>
                            </Box>
                        </Stack>
                        <Typography sx={{ mt: 2, maxWidth: 340, color: alpha('#FFFFFF', 0.72), fontSize: 15, lineHeight: 1.6 }}>
                            A free way for homeowners in Connecticut and Massachusetts to find local pros, and for pros to find work.
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" sx={{ mt: 3, gap: 1.25 }}>
                            {STORES.map(({ label, href, Icon }) => (
                                <ButtonBase
                                    key={label}
                                    component="a"
                                    href={href}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{
                                        gap: 1,
                                        px: 2,
                                        height: 44,
                                        borderRadius: RADIUS.tile,
                                        border: `1px solid ${alpha('#FFFFFF', 0.18)}`,
                                        bgcolor: alpha('#FFFFFF', 0.08),
                                        color: '#FFFFFF',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        transition: 'background-color .2s ease, border-color .2s ease',
                                        '&:hover': { bgcolor: alpha('#FFFFFF', 0.16), borderColor: BRAND.green },
                                        '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                                    }}
                                >
                                    <Icon sx={{ fontSize: 20 }} />
                                    {label}
                                </ButtonBase>
                            ))}
                        </Stack>
                    </Box>

                    {columns.map((column, index) => (
                        <Box key={column.title} sx={{ gridColumn: { xs: index === 2 ? '1 / -1' : 'auto', md: 'auto' } }}>
                            <Column title={column.title} items={column.items} pathname={pathname} />
                        </Box>
                    ))}
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{
                        mt: { xs: 5, md: 7 },
                        p: { xs: 2.5, md: 3 },
                        borderRadius: RADIUS.card,
                        border: `1px solid ${alpha('#FFFFFF', 0.12)}`,
                        bgcolor: alpha('#FFFFFF', 0.06)
                    }}
                >
                    <Box>
                        <Typography sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: '#FFFFFF' }}>
                            Something not working, or a question?
                        </Typography>
                        <Typography sx={{ mt: 0.5, color: alpha('#FFFFFF', 0.72), fontSize: 14 }}>
                            Write to us and a real person will answer.
                        </Typography>
                    </Box>
                    <ButtonBase
                        component={RouterLink}
                        href={paths.contact}
                        sx={{
                            gap: 1,
                            px: 3,
                            height: 48,
                            flexShrink: 0,
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: RADIUS.tile,
                            bgcolor: '#FFFFFF',
                            color: BRAND.navy,
                            fontSize: 15,
                            fontWeight: 700,
                            transition: 'background-color .2s ease, color .2s ease',
                            '&:hover': { bgcolor: BRAND.green, color: '#FFFFFF' },
                            '&:active': { transform: 'scale(0.98)' },
                            '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                        }}
                    >
                        <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
                        Contact support
                    </ButtonBase>
                </Stack>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mt: { xs: 4, md: 5 }, color: alpha('#FFFFFF', 0.56), fontSize: 13, lineHeight: 1.6 }}
                >
                    <Box>
                        © {new Date().getFullYear()} CTMASS LLC, a Connecticut limited liability company. All Rights Reserved.
                        <br />
                        Used images from{' '}
                        <Box component="a" href={FREEPIK_URL} target="_blank" rel="noopener" sx={{ color: 'inherit', textDecoration: 'underline' }}>
                            macrovector
                        </Box>{' '}
                        on Freepik.
                    </Box>
                    <Stack component="ul" direction="row" flexWrap="wrap" sx={{ listStyle: 'none', m: 0, p: 0, columnGap: 3, rowGap: 0.5 }}>
                        {LEGAL.map((item) => (
                            <Box component="li" key={item.title}>
                                <Box component={RouterLink} href={item.path} sx={{ color: alpha('#FFFFFF', 0.72), textDecoration: 'none', '&:hover': { color: '#FFFFFF', textDecoration: 'underline' } }}>
                                    {item.title}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};
