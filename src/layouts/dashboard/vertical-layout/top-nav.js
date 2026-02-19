import { useState } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { AccountButton } from '../account-button';
import { NotificationsButton } from '../notifications-button';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

const TOP_NAV_HEIGHT = 64;
const SIDE_NAV_WIDTH = 280;

const NAV_LINKS = [
  { label: 'Home page', path: paths.index },
  {
    label: 'Dashboard',
    path: paths.dashboard.index,
    isActive: (pathname) => pathname.startsWith('/dashboard')
  },
  { label: 'Mission CTMASS', path: paths.ourMission },
  {
    label: 'Support',
    path: `${paths.contact}?tab=support`,
    activePath: paths.contact
  },
  { label: 'Contacts', path: paths.contact }
];

export const TopNav = (props) => {
  const { onMobileNavOpen, ...other } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const location = useLocation();
  const [navMenuAnchor, setNavMenuAnchor] = useState(null);

  const resolveIsActive = (link) => {
    if (link.isActive) {
      return link.isActive(location.pathname, location.search);
    }

    const activePath = link.activePath || link.path;
    const activeUrl = new URL(activePath, window.location.origin);

    return location.pathname === activeUrl.pathname;
  };

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchor(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchor(null);
  };

  const isNavMenuOpen = Boolean(navMenuAnchor);

  return (
    <Box
      component="header"
      sx={{
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
        position: 'sticky',
        left: {
          lg: `${SIDE_NAV_WIDTH}px`
        },
        top: 0,
        width: {
          lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`
        },
        zIndex: (theme) => theme.zIndex.appBar
      }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 2
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          {!lgUp && (
            <IconButton onClick={onMobileNavOpen}>
              <SvgIcon>
                <Menu01Icon />
              </SvgIcon>
            </IconButton>
          )}

          {mdUp ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 1, sm: 1.5, md: 2 }}
              sx={{
                flexGrow: 1,
                flexWrap: 'wrap'
              }}
            >
              {NAV_LINKS.map((link) => {
                const active = resolveIsActive(link);

                return (
                  <Button
                    key={link.label}
                    component={RouterLink}
                    href={link.path}
                    size="small"
                    disableElevation
                    disableRipple
                    variant="text"
                    sx={{
                      position: 'relative',
                      textTransform: 'none',
                      fontWeight: active ? 700 : 500,
                      color: active ? 'primary.main' : 'text.secondary',
                      px: 1,
                      minWidth: 'auto',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'transparent'
                      },
                      '&::after': active
                        ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: -8,
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: 'primary.main'
                        }
                        : {}
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Stack>
          ) : (
            <>
              <IconButton
                aria-controls={isNavMenuOpen ? 'top-nav-links-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isNavMenuOpen ? 'true' : undefined}
                onClick={handleNavMenuOpen}
                size="small"
              >
                <MoreHorizIcon />
              </IconButton>

              <Menu
                id="top-nav-links-menu"
                anchorEl={navMenuAnchor}
                open={isNavMenuOpen}
                onClose={handleNavMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                {NAV_LINKS.map((link) => {
                  const active = resolveIsActive(link);

                  return (
                    <MenuItem
                      key={link.label}
                      component={RouterLink}
                      href={link.path}
                      onClick={handleNavMenuClose}
                      selected={active}
                      sx={{ fontWeight: active ? 600 : 500 }}
                    >
                      {link.label}
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Stack>

        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <NotificationsButton />
          <AccountButton />
        </Stack>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onMobileNavOpen: PropTypes.func
};