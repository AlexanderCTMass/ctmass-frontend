import { useCallback, useMemo } from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

export const navSkinVars = {
    '--nav-bg': BRAND.navyDeep,
    '--nav-color': '#FFFFFF',
    '--nav-border-color': 'transparent',
    '--nav-logo-border': 'transparent',
    '--nav-section-title-color': alpha('#FFFFFF', 0.5),
    '--nav-item-color': alpha('#FFFFFF', 0.72),
    '--nav-item-hover-bg': alpha('#FFFFFF', 0.07),
    '--nav-item-active-bg': alpha('#FFFFFF', 0.12),
    '--nav-item-active-color': '#FFFFFF',
    '--nav-item-disabled-color': alpha('#FFFFFF', 0.35),
    '--nav-item-icon-color': alpha('#FFFFFF', 0.55),
    '--nav-item-icon-active-color': BRAND.green,
    '--nav-item-icon-disabled-color': alpha('#FFFFFF', 0.3),
    '--nav-item-chevron-color': alpha('#FFFFFF', 0.4),
    '--nav-scrollbar-color': alpha('#FFFFFF', 0.4)
};

export const navPaperSx = {
    backgroundColor: 'var(--nav-bg)',
    backgroundImage: `
        radial-gradient(90% 40% at 0% 100%, ${alpha(BRAND.green, 0.2)} 0%, ${alpha(BRAND.green, 0)} 70%),
        linear-gradient(${alpha('#FFFFFF', 0.04)} 1px, transparent 1px),
        linear-gradient(90deg, ${alpha('#FFFFFF', 0.04)} 1px, transparent 1px),
        linear-gradient(170deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 55%)
    `,
    backgroundSize: 'auto, 40px 40px, 40px 40px, auto',
    borderRight: 0,
    color: 'var(--nav-color)'
};

export const NavBrand = ({ action }) => (
    <Stack alignItems="center" direction="row" spacing={1.5} sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack
            component={RouterLink}
            href={paths.index}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flexGrow: 1, minWidth: 0, textDecoration: 'none', color: '#FFFFFF' }}
        >
            <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', bgcolor: '#FFFFFF', '& > *': { width: '48px !important', height: '48px !important' }, '& img': { width: 48, height: 48 } }}>
                <Logo />
            </Box>
            <Box sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>
                CT<Box component="span" sx={{ color: BRAND.green }}>MASS</Box>
            </Box>
        </Stack>
        {action}
    </Stack>
);

const ROLE_ITEMS = [
    { key: roles.CUSTOMER, label: 'Homeowner', icon: HomeIcon },
    { key: roles.WORKER, label: 'Contractor', icon: BuildIcon },
    { key: roles.ADMIN, label: 'Admin', icon: AdminPanelSettingsIcon }
];

export const NavRoleSwitch = () => {
    const { user, setRole } = useAuth();
    const userRole = user?.role;
    const isAdmin = Boolean(user?.isAdmin);

    const visibleRoles = useMemo(
        () => isAdmin ? ROLE_ITEMS : ROLE_ITEMS.filter((item) => item.key !== roles.ADMIN),
        [isAdmin]
    );

    const handleRoleClick = useCallback(async (roleKey) => {
        if (roleKey === userRole) return;
        await setRole(roleKey);
    }, [userRole, setRole]);

    const activeIndex = Math.max(0, visibleRoles.findIndex((item) => item.key === userRole));
    const hasActive = visibleRoles.some((item) => item.key === userRole);

    return (
        <Box sx={{ px: 2, pb: 2.5 }}>
            <Box
                role="radiogroup"
                aria-label="Account mode"
                sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${visibleRoles.length}, minmax(0, 1fr))`,
                    p: '4px',
                    borderRadius: RADIUS.tile,
                    bgcolor: alpha('#FFFFFF', 0.08)
                }}
            >
                {hasActive && (
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            top: 4,
                            bottom: 4,
                            left: 4,
                            width: `calc((100% - 8px) / ${visibleRoles.length})`,
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            transform: `translateX(${activeIndex * 100}%)`,
                            transition: 'transform .4s cubic-bezier(.2,.8,.2,1)'
                        }}
                    />
                )}
                {visibleRoles.map((item) => {
                    const isActive = userRole === item.key;
                    const Icon = item.icon;

                    return (
                        <ButtonBase
                            key={item.key}
                            role="radio"
                            aria-checked={isActive}
                            title={isActive ? undefined : `Switch to ${item.label}`}
                            onClick={() => handleRoleClick(item.key)}
                            sx={{
                                position: 'relative',
                                zIndex: 1,
                                gap: 0.5,
                                minHeight: 38,
                                px: 0.5,
                                borderRadius: '10px',
                                fontSize: 12,
                                fontWeight: 700,
                                color: isActive ? BRAND.navy : alpha('#FFFFFF', 0.72),
                                transition: 'color .3s ease',
                                '&:hover': { color: isActive ? BRAND.navy : '#FFFFFF' },
                                '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                            }}
                        >
                            <Icon sx={{ fontSize: 16 }} />
                            {item.label}
                        </ButtonBase>
                    );
                })}
            </Box>
        </Box>
    );
};

export const NavBugReport = ({ onClick }) => (
    <Box sx={{ p: 2 }}>
        <Box sx={{ p: 2, borderRadius: RADIUS.inner, bgcolor: alpha('#FFFFFF', 0.07), border: `1px solid ${alpha('#FFFFFF', 0.1)}` }}>
            <Typography sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>
                Found a bug?
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 1.5, fontSize: 13, lineHeight: 1.5, color: alpha('#FFFFFF', 0.66) }}>
                Tell us what went wrong and we will fix it.
            </Typography>
            <ButtonBase
                onClick={onClick}
                sx={{
                    width: '100%',
                    gap: 0.75,
                    minHeight: 42,
                    borderRadius: '12px',
                    bgcolor: alpha('#FFFFFF', 0.12),
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    transition: 'background-color .2s ease, color .2s ease',
                    '&:hover': { bgcolor: '#FFFFFF', color: BRAND.navy },
                    '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                }}
            >
                <BugReportOutlinedIcon sx={{ fontSize: 18 }} />
                Report a bug
            </ButtonBase>
        </Box>
    </Box>
);
