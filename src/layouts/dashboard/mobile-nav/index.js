import { useMemo } from 'react';
import PropTypes from 'prop-types';
import File04Icon from '@untitled-ui/icons-react/build/esm/File04';
import { Box, Button, Drawer, Stack, SvgIcon, Typography } from '@mui/material';
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
import { MobileNavSection } from './mobile-nav-section';

const MOBILE_NAV_WIDTH = 280;

const useCssVars = (color) => {
  const theme = useTheme();

  return useMemo(() => {
    switch (color) {
      // Blend-in and discreet have no difference on mobile because
      // there's a backdrop and differences are not visible
      case 'blend-in':
      case 'discreet':
        if (theme.palette.mode === 'dark') {
          return {
            '--nav-bg': theme.palette.background.default,
            '--nav-color': theme.palette.neutral[100],
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

      case 'evident':
        if (theme.palette.mode === 'dark') {
          return {
            '--nav-bg': theme.palette.neutral[800],
            '--nav-color': theme.palette.common.white,
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
    const { user } = useAuth();
    const userRole = user?.role;

    return (
        <Stack
            direction="row"
            justifyContent="center"
            spacing={3}
            sx={{ pb: 2 }}
        >
            {ROLE_ITEMS.map((item) => {
                const isActive = userRole === item.key || (userRole === roles.ADMIN && item.key === roles.ADMIN);
                const Icon = item.icon;
                return (
                    <Stack key={item.key} alignItems="center" spacing={0.5}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                border: isActive ? '2px solid rgba(255, 255, 255, 0.5)' : '2px solid transparent'
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
                );
            })}
        </Stack>
    );
};

export const MobileNav = (props) => {
  const { color = 'evident', open, onClose, sections = [] } = props;
  const pathname = usePathname();
  const cssVars = useCssVars(color);

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          ...cssVars,
          backgroundColor: 'var(--nav-bg)',
          color: 'var(--nav-color)',
          width: MOBILE_NAV_WIDTH
        }
      }}
      variant="temporary"
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
                borderColor: 'var(--nav-logo-border)',
                borderRadius: 1,
                borderStyle: 'solid',
                borderWidth: 1,
                display: 'flex',
                height: 56,
                p: '0',
                width: 56
              }}
            >
              <Logo />
            </Box>
            <TenantSwitch sx={{ flexGrow: 1 }} />
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
              <MobileNavSection
                items={section.items}
                key={index}
                pathname={pathname}
                subheader={section.subheader}
              />
            ))}
          </Stack>
          <Box sx={{ p: 3 }}>
            <Typography
              color="neutral.400"
              variant="subtitle1"
            >
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

MobileNav.propTypes = {
  color: PropTypes.oneOf(['blend-in', 'discreet', 'evident']),
  onClose: PropTypes.func,
  open: PropTypes.bool,
  sections: PropTypes.array
};
