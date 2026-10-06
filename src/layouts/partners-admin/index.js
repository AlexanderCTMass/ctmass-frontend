import { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { useAuth } from 'src/hooks/use-auth';
import { roles } from 'src/roles';
import { paths } from 'src/paths';
import { pa, primaryButtonSx } from 'src/sections/partners-admin/tokens';

const SIDEBAR_WIDTH = 248;

const NAV = [
    { label: 'Banners', href: paths.partners.admin.index, icon: FlagOutlinedIcon },
    { label: 'Archive', href: paths.partners.admin.archive, icon: Inventory2OutlinedIcon },
    { label: 'Placements', href: paths.partners.admin.placements, icon: TuneOutlinedIcon },
    { label: 'Partners', icon: GroupOutlinedIcon, soon: true },
    { label: 'Finances', icon: AccountBalanceOutlinedIcon, soon: true }
];

const NavItem = ({ item, active, onNavigate }) => {
    const Icon = item.icon;
    const content = (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
            <Icon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: 14.5, fontWeight: active ? 700 : 600, flex: 1 }}>{item.label}</Typography>
            {item.soon ? (
                <Chip
                    label="Soon"
                    size="small"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: pa.surface, color: pa.textMuted }}
                />
            ) : null}
        </Stack>
    );
    const sx = {
        px: 1.75,
        py: 1.25,
        borderRadius: '12px',
        color: active ? '#fff' : pa.textSecondary,
        bgcolor: active ? pa.primary : 'transparent',
        textDecoration: 'none',
        display: 'flex',
        transition: 'background-color 120ms ease',
        outline: 'none',
        '&:focus-visible': { boxShadow: `0 0 0 2px ${pa.primaryHover}` },
        ...(item.soon
            ? { opacity: 0.55, cursor: 'default' }
            : { '&:hover': { bgcolor: active ? pa.primaryHover : 'rgba(18,161,80,0.08)' } })
    };
    if (item.soon) return <Box sx={sx}>{content}</Box>;
    return (
        <Box component={RouterLink} href={item.href} scrollUp={false} onClick={onNavigate} sx={sx}>
            {content}
        </Box>
    );
};

NavItem.propTypes = {
    item: PropTypes.object.isRequired,
    active: PropTypes.bool,
    onNavigate: PropTypes.func
};

const Sidebar = ({ pathname, onNavigate }) => (
    <Stack sx={{ height: '100%', p: 2.5, bgcolor: pa.sidebar }} spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 0.5 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    bgcolor: pa.primary,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <GridViewRoundedIcon />
            </Box>
            <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: pa.text, lineHeight: 1.1 }}>CTMASS</Typography>
                <Typography sx={{ fontSize: 12, color: pa.textMuted, fontWeight: 600 }}>Partners admin</Typography>
            </Box>
        </Stack>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
            {NAV.map((item) => (
                <NavItem key={item.label} item={item} active={item.href === pathname} onNavigate={onNavigate} />
            ))}
        </Stack>
        <Box sx={{ borderTop: `1px solid ${pa.sidebarBorder}`, pt: 2 }}>
            <Button
                component={RouterLink}
                href={paths.index}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ textTransform: 'none', color: pa.textSecondary, fontWeight: 600 }}
            >
                Back to ctmass.com
            </Button>
            <Typography sx={{ fontSize: 12, color: pa.textMuted, mt: 1, px: 1 }}>
                © {new Date().getFullYear()} CTMASS Admin
            </Typography>
        </Box>
    </Stack>
);

Sidebar.propTypes = {
    pathname: PropTypes.string,
    onNavigate: PropTypes.func
};

const AccessDenied = () => (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: pa.page, p: 3 }}>
        <Seo title="Partners admin" />
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, textAlign: 'center' }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    bgcolor: pa.primarySoft,
                    color: pa.primaryHover,
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <LockOutlinedIcon />
            </Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: pa.text }}>Access restricted</Typography>
            <Typography sx={{ color: pa.textSecondary }}>
                The partners admin is available to CTMASS administrators only. Sign in with an admin account to continue.
            </Typography>
            <Button component={RouterLink} href={paths.index} variant="contained" sx={primaryButtonSx}>
                Go to homepage
            </Button>
        </Stack>
    </Box>
);

export const Layout = withAuthGuard(({ children }) => {
    const { user } = useAuth();
    const { pathname } = useLocation();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [open, setOpen] = useState(false);
    const isAdmin = Boolean(user?.isAdmin) || user?.role === roles.ADMIN;

    if (!isAdmin) return <AccessDenied />;

    const normalizedPath = pathname.replace(/\/+$/, '');

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: pa.page, color: pa.text }}>
            {mdUp ? (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: '0 auto 0 0',
                        width: SIDEBAR_WIDTH,
                        borderRight: `1px solid ${pa.sidebarBorder}`
                    }}
                >
                    <Sidebar pathname={normalizedPath} />
                </Box>
            ) : (
                <Drawer
                    open={open}
                    onClose={() => setOpen(false)}
                    PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: pa.sidebar } }}
                >
                    <Sidebar pathname={normalizedPath} onNavigate={() => setOpen(false)} />
                </Drawer>
            )}
            <Box sx={{ pl: mdUp ? `${SIDEBAR_WIDTH}px` : 0 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        px: { xs: 2, md: 4 },
                        height: 68,
                        bgcolor: 'rgba(243,250,246,0.9)',
                        backdropFilter: 'blur(8px)',
                        borderBottom: `1px solid ${pa.border}`
                    }}
                >
                    {!mdUp ? (
                        <IconButton onClick={() => setOpen(true)} aria-label="Open navigation">
                            <MenuIcon />
                        </IconButton>
                    ) : null}
                    <Box sx={{ flex: 1 }} />
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.25}
                        sx={{
                            pl: 0.75,
                            pr: 1.75,
                            py: 0.5,
                            borderRadius: 999,
                            border: `1px solid ${pa.border}`,
                            bgcolor: pa.surface
                        }}
                    >
                        <Avatar src={user?.avatar || undefined} sx={{ width: 32, height: 32, bgcolor: pa.primary }}>
                            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                            {user?.name || user?.email}
                        </Typography>
                    </Stack>
                </Stack>
                <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1440 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
});

Layout.propTypes = {
    children: PropTypes.node
};
