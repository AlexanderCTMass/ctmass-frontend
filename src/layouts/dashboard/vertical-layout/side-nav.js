import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import File04Icon from '@untitled-ui/icons-react/build/esm/File04';
import { Box, Button, Drawer, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { usePathname } from 'src/hooks/use-pathname';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { TenantSwitch } from '../tenant-switch';
import { SideNavSection } from './side-nav-section';

const SIDE_NAV_WIDTH = 280;

const useCssVars = (color) => {
    const theme = useTheme();

    return useMemo(() => {
        switch (color) {
            case 'blend-in':
                if (theme.palette.mode === 'dark') {
                    return {
                        '--nav-bg': theme.palette.background.default,
                        '--nav-color': theme.palette.neutral[100],
                        '--nav-border-color': theme.palette.neutral[700],
                        '--nav-logo-border': theme.palette.neutral[700],
                        '--nav-section-title-color': theme.palette.neutral[400],
                        '--nav-item-color': theme.palette.neutral[400],
                        '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-color': theme.palette.text.primary,
                        '--nav-item-disabled-color': theme.palette.neutral[600],
                        '--nav-item-icon-color': theme.palette.neutral[500],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[700],
                        '--nav-item-chevron-color': theme.palette.neutral[700],
                        '--nav-scrollbar-color': theme.palette.neutral[400]
                    };
                } else {
                    return {
                        '--nav-bg': theme.palette.background.default,
                        '--nav-color': theme.palette.text.primary,
                        '--nav-border-color': theme.palette.neutral[100],
                        '--nav-logo-border': theme.palette.neutral[100],
                        '--nav-section-title-color': theme.palette.neutral[400],
                        '--nav-item-color': theme.palette.text.secondary,
                        '--nav-item-hover-bg': theme.palette.action.hover,
                        '--nav-item-active-bg': theme.palette.action.selected,
                        '--nav-item-active-color': theme.palette.text.primary,
                        '--nav-item-disabled-color': theme.palette.neutral[400],
                        '--nav-item-icon-color': theme.palette.neutral[400],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[400],
                        '--nav-item-chevron-color': theme.palette.neutral[400],
                        '--nav-scrollbar-color': theme.palette.neutral[900]
                    };
                }

            case 'discreet':
                if (theme.palette.mode === 'dark') {
                    return {
                        '--nav-bg': theme.palette.neutral[900],
                        '--nav-color': theme.palette.neutral[100],
                        '--nav-border-color': theme.palette.neutral[700],
                        '--nav-logo-border': theme.palette.neutral[700],
                        '--nav-section-title-color': theme.palette.neutral[400],
                        '--nav-item-color': theme.palette.neutral[400],
                        '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-color': theme.palette.text.primary,
                        '--nav-item-disabled-color': theme.palette.neutral[600],
                        '--nav-item-icon-color': theme.palette.neutral[500],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[700],
                        '--nav-item-chevron-color': theme.palette.neutral[700],
                        '--nav-scrollbar-color': theme.palette.neutral[400]
                    };
                } else {
                    return {
                        '--nav-bg': theme.palette.neutral[50],
                        '--nav-color': theme.palette.text.primary,
                        '--nav-border-color': theme.palette.divider,
                        '--nav-logo-border': theme.palette.neutral[200],
                        '--nav-section-title-color': theme.palette.neutral[500],
                        '--nav-item-color': theme.palette.neutral[500],
                        '--nav-item-hover-bg': theme.palette.action.hover,
                        '--nav-item-active-bg': theme.palette.action.selected,
                        '--nav-item-active-color': theme.palette.text.primary,
                        '--nav-item-disabled-color': theme.palette.neutral[400],
                        '--nav-item-icon-color': theme.palette.neutral[400],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[400],
                        '--nav-item-chevron-color': theme.palette.neutral[400],
                        '--nav-scrollbar-color': theme.palette.neutral[900]
                    };
                }

            case 'evident':
                if (theme.palette.mode === 'dark') {
                    return {
                        '--nav-bg': theme.palette.neutral[800],
                        '--nav-color': theme.palette.common.white,
                        '--nav-border-color': 'transparent',
                        '--nav-logo-border': theme.palette.neutral[700],
                        '--nav-section-title-color': theme.palette.neutral[400],
                        '--nav-item-color': theme.palette.neutral[400],
                        '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-color': theme.palette.common.white,
                        '--nav-item-disabled-color': theme.palette.neutral[500],
                        '--nav-item-icon-color': theme.palette.neutral[400],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[500],
                        '--nav-item-chevron-color': theme.palette.neutral[600],
                        '--nav-scrollbar-color': theme.palette.neutral[400]
                    };
                } else {
                    return {
                        '--nav-bg': theme.palette.neutral[800],
                        '--nav-color': theme.palette.common.white,
                        '--nav-border-color': 'transparent',
                        '--nav-logo-border': theme.palette.neutral[700],
                        '--nav-section-title-color': theme.palette.neutral[400],
                        '--nav-item-color': theme.palette.neutral[400],
                        '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
                        '--nav-item-active-color': theme.palette.common.white,
                        '--nav-item-disabled-color': theme.palette.neutral[500],
                        '--nav-item-icon-color': theme.palette.neutral[400],
                        '--nav-item-icon-active-color': theme.palette.primary.main,
                        '--nav-item-icon-disabled-color': theme.palette.neutral[500],
                        '--nav-item-chevron-color': theme.palette.neutral[600],
                        '--nav-scrollbar-color': theme.palette.neutral[400]
                    };
                }

            default:
                return {};
        }
    }, [theme, color]);
};

const ROLE_ITEMS = [
    { key: roles.CUSTOMER, label: 'Homeowner', icon: HomeIcon },
    { key: roles.WORKER, label: 'Contractor', icon: BuildIcon },
    { key: roles.ADMIN, label: 'Admin', icon: AdminPanelSettingsIcon }
];

const RoleIndicator = () => {
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

    return (
        <Stack
            direction="row"
            justifyContent="center"
            spacing={3}
            sx={{ pb: 2 }}
        >
            {visibleRoles.map((item) => {
                const isActive = userRole === item.key;
                const Icon = item.icon;
                return (
                    <Tooltip key={item.key} title={isActive ? '' : `Switch to ${item.label}`} placement="top">
                        <Stack
                            alignItems="center"
                            spacing={0.5}
                            onClick={() => handleRoleClick(item.key)}
                            sx={{ cursor: isActive ? 'default' : 'pointer' }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                    border: isActive ? '2px solid rgba(255, 255, 255, 0.5)' : '2px solid transparent',
                                    transition: 'background-color 0.2s',
                                    '&:hover': !isActive ? { bgcolor: 'rgba(255, 255, 255, 0.08)' } : {}
                                }}
                            >
                                <Icon sx={{ fontSize: 20, color: isActive ? '#fff' : 'neutral.500' }} />
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    color: isActive ? '#fff' : 'neutral.500',
                                    fontWeight: isActive ? 700 : 400
                                }}
                            >
                                {item.label}
                            </Typography>
                        </Stack>
                    </Tooltip>
                );
            })}
        </Stack>
    );
};

export const SideNav = (props) => {
    const { color = 'evident', sections = [] } = props;
    const pathname = usePathname();
    const cssVars = useCssVars(color);

    return (
        <Drawer
            anchor="left"
            open
            PaperProps={{
                sx: {
                    ...cssVars,
                    backgroundColor: 'var(--nav-bg)',
                    borderRightColor: 'var(--nav-border-color)',
                    borderRightStyle: 'solid',
                    borderRightWidth: 1,
                    color: 'var(--nav-color)',
                    width: SIDE_NAV_WIDTH
                }
            }}
            variant="permanent"
        >
            <Scrollbar
                sx={{
                    height: '100%',
                    '& .simplebar-content': {
                        height: '100%'
                    },
                    '& .simplebar-scrollbar:before': {
                        background: 'var(--nav-scrollbar-color)'
                    }
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                        sx={{ p: 3 }}
                    >
                        <Box
                            component={RouterLink}
                            href={paths.index}
                            sx={{
                                // borderColor: 'var(--nav-logo-border)',
                                // borderRadius: 1,
                                // borderStyle: 'solid',
                                // borderWidth: 1,
                                display: 'flex',
                                height: 56,
                                p: '0',
                                width: 56
                            }}
                        >
                            <Logo />
                        </Box>
                        <Box sx={{ flexGrow: 1, textDecoration: "none" }}
                            component={RouterLink}
                            href={paths.index}
                            underline="none">
                            <Typography
                                color="inherit"
                                variant="h6"
                                sx={{
                                    textDecoration: "none",
                                    color: "#fff"
                                }}
                                underline="none"
                            >
                                CTMASS
                            </Typography>
                        </Box>
                        {/*<TenantSwitch sx={{ flexGrow: 1 }} />*/}
                    </Stack>
                    <RoleIndicator />
                    <Stack
                        component="nav"
                        spacing={2}
                        sx={{
                            flexGrow: 1,
                            px: 2
                        }}
                    >
                        {sections.map((section, index) => (
                            <SideNavSection
                                items={section.items}
                                key={index}
                                pathname={pathname}
                                subheader={section.subheader}
                            />
                        ))}
                    </Stack>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1">
                            Need help?
                        </Typography>
                        <Typography
                            color="neutral.400"
                            sx={{ mb: 2 }}
                            variant="body2"
                        >
                            Please contact us.
                        </Typography>
                        <Button
                            component="a"
                            fullWidth
                            href={paths.contact}
                            startIcon={(
                                <SvgIcon>
                                    <File04Icon />
                                </SvgIcon>
                            )}
                            variant="contained"
                        >
                            Feedback
                        </Button>
                    </Box>
                </Stack>
            </Scrollbar>
        </Drawer>
    );
};

SideNav.propTypes = {
    color: PropTypes.oneOf(['blend-in', 'discreet', 'evident']),
    sections: PropTypes.array
};
