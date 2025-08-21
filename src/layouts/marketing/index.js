import PropTypes from 'prop-types'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Footer } from './footer'
import { SideNav } from './side-nav'
import { TopNav } from './top-nav'
import { useMobileNav } from './use-mobile-nav'
import { LoginSideNav } from 'src/layouts/marketing/login-side-nav'
import { useEffect, useState } from 'react'
import CelebrationIcon from '@mui/icons-material/Celebration'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import ShareIcon from '@mui/icons-material/Share'
import EventNoteIcon from '@mui/icons-material/EventNote'
import XIcon from '@mui/icons-material/Close'
import WorkersCounter from 'src/sections/home/home-workers-counter'

const LayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: '100%',
}))

export const Layout = (props) => {
  const { children } = props
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'))
  const smDown = useMediaQuery((theme) => theme.breakpoints.down('sm'))
  const mobileNav = useMobileNav()
  const loginNav = useMobileNav()
  const [showTestMessage, setShowTestMessage] = useState(true)

  useEffect(() => {
    const savedMessageState = window.localStorage.getItem('testMessage')
    if (savedMessageState) {
      const { closedAt } = JSON.parse(savedMessageState)
      const now = new Date().getTime()
      const timeDiff = now - closedAt
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (timeDiff > twentyFourHours) {
        setShowTestMessage(true)
        window.localStorage.removeItem('testMessage')
      } else {
        setShowTestMessage(false)
      }
    }
  }, [])

  const handleCloseTestMessage = () => {
    const closedAt = new Date().getTime()
    window.localStorage.setItem('testMessage', JSON.stringify({ closedAt }))
    setShowTestMessage(false)
  }

  return (
    <>
      <TopNav
        onMobileNavOpen={mobileNav.handleOpen}
        onLoginNavOpen={loginNav.handleOpen}
      />
      {!lgUp && (
        <SideNav onClose={mobileNav.handleClose} open={mobileNav.open} />
      )}
      {/*<LoginSideNav
                onClose={loginNav.handleClose}
                open={loginNav.open}
                params={loginNav.params}
            />
*/}
      <LayoutRoot
        sx={{
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundImage: 'url("/assets/gradient-bg.svg")',
        }}
      >
        {showTestMessage && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 13000000, // Выше чем у большинства элементов
              width: '100%',
              maxWidth: { xs: '90%', sm: '80%', md: '600px' },
              maxHeight: '90vh',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '0.4em',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.2)',
                borderRadius: '4px',
              },
            }}
          >
            <Card
              sx={{
                border: '8px solid',
                borderColor: 'primary.main',
                position: 'relative',
                padding: lgUp ? 3 : 1,
                boxShadow: 24, // Более выраженная тень для попапа
              }}
            >
              <CardHeader
                avatar={<CelebrationIcon color="primary" fontSize="large" />}
                title="Join Our Contractor Community!"
                titleTypographyProps={{
                  variant: 'h4',
                  color: 'primary',
                  fontWeight: 'bold',
                }}
                action={
                  <IconButton
                    size="small"
                    onClick={handleCloseTestMessage}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <XIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ pb: 0 }}
              />

              <CardContent sx={{ p: 2 }}>
                {[
                  {
                    icon: <GroupAddIcon color="action" fontSize="small" />,
                    text: "We're excited to welcome local contractors from Happy Valley and Western Massachusetts to join our new startup platform – CTMASS.com! Based in Amherst and powered by local builders and bright minds from UMASS, we're creating a free, community-focused hub that connects trusted local contractors with homeowners across Connecticut and Massachusetts.",
                  },
                  {
                    icon: (
                      <MonetizationOnIcon color="action" fontSize="small" />
                    ),
                    text: 'Our promise: CTMASS will always be 100% free for local contractors and homeowners – no fees, no commissions, no pay-per-lead tricks.',
                  },
                  {
                    icon: <ShareIcon color="action" fontSize="small" />,
                    text: 'Help us grow by sharing CTMASS.com with friends, neighbors, and fellow pros. Let’s build something great together – for our community, by our community.',
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', mb: 1.5, alignItems: 'flex-start' }}
                  >
                    <Box sx={{ mr: 1.5, mt: 0.25 }}>{item.icon}</Box>
                    <Typography variant="body2" paragraph sx={{ mb: 1.5 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}

                <Box
                  sx={{
                    display: 'flex',
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    mt: 1,
                  }}
                >
                  <EventNoteIcon
                    color="primary"
                    fontSize="small"
                    sx={{ mr: 1.5, mt: 0.25 }}
                  />
                  <div>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                      sx={{ mb: 1 }}
                    >
                      Our Timeline:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>This September</strong> – Welcoming and
                      verifying contractors.
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      <strong>Starting November</strong> – Marketing to
                      homeowners begins.
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Затемнение фона когда попап открыт */}
        {showTestMessage && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 12000000, // Ниже чем попап, но выше основного контента
            }}
          />
        )}

        {/* Основной контент с возможностью блокировки прокрутки */}
        <Box
          sx={{
            filter: showTestMessage ? 'blur(2px)' : 'none',
            transition: 'filter 0.3s ease',
            pointerEvents: showTestMessage ? 'none' : 'auto',
          }}
        >
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
