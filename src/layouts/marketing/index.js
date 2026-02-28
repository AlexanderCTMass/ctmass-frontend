import PropTypes from 'prop-types'
import {
  Box,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles'
import { Footer } from './footer'
import { SideNav } from './side-nav'
import { TopNav } from './top-nav'
import { useMobileNav } from './use-mobile-nav'

const LayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: '100%',
}))

export const Layout = (props) => {
  const { children } = props
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'))
  const mobileNav = useMobileNav()
  const loginNav = useMobileNav()

  return (
    <>
      <TopNav
        onMobileNavOpen={mobileNav.handleOpen}
        onLoginNavOpen={loginNav.handleOpen}
      />
      {!lgUp && (
        <SideNav onClose={mobileNav.handleClose} open={mobileNav.open} />
      )}

      <LayoutRoot
        sx={{
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundImage: 'url("/assets/gradient-bg.svg")',
        }}
      >
        <Box>
          {children}
          <Footer />
        </Box>
      </LayoutRoot>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node,
}
