import PropTypes from 'prop-types';
import {Box, Chip, Stack, Typography} from '@mui/material';
import { Logo } from 'src/components/logo';
import { LogoSamsung } from 'src/components/logos/logo-samsung';
import { LogoVisma } from 'src/components/logos/logo-visma';
import { LogoBolt } from 'src/components/logos/logo-bolt';
import { LogoAws } from 'src/components/logos/logo-aws';
import { LogoAccenture } from 'src/components/logos/logo-accenture';
import { LogoAtt } from 'src/components/logos/logo-att';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

export const Layout = (props) => {
  const { children } = props;

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: {
          xs: 'column-reverse',
          md: 'row'
        }
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'neutral.800',
          backgroundImage: 'url("/assets/gradient-bg.svg")',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          color: 'common.white',
          display: 'flex',
          flex: {
            xs: '0 0 auto',
            md: '1 1 auto'
          },
          justifyContent: 'center',
          p: {
            xs: 4,
            md: 8
          }
        }}
      >
        <Box maxWidth="md">
          <Typography
            sx={{ mb: 1 }}
            variant="h4"
          >
            Welcome to CTMass.com
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 4 }}
          >
              Help people. Earn on what you know how to do best. Develop and create for the benefit of society.
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
              Join a mutual aid society in different specialties:
          </Typography>
          <Stack
            alignItems="start"
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{
              color: 'text.primary',
              '& > *': {
                color: 'neutral.400'
              }
            }}
          >
              <Chip label="Electrician" variant="outlined" color="primary"/>
              <Chip label="Framing" variant="outlined" color="primary"/>
              <Chip label="Plumbing" variant="outlined" color="primary"/>
              <Chip label="Handyman" variant="outlined" color="primary"/>
              <Chip label="Dryall" variant="outlined" color="primary"/>
              <Chip label="Heating" variant="outlined" color="primary"/>
              <Chip label="A/C" variant="outlined" color="primary"/>
              <Chip label="Ventilation" variant="outlined" color="primary"/>
              <Chip label="Electrician" variant="outlined" color="primary"/>
              <Chip label="Hardwood floors" variant="outlined" color="primary"/>
              <Chip label="Roofing" variant="outlined" color="primary"/>
              <Chip label="Appliences repair" variant="outlined" color="primary"/>
              <Chip label="Tile" variant="outlined" color="primary"/>
              <Chip label="Bathroom specialist" variant="outlined" color="primary"/>
              <Chip label="Door installation" variant="outlined" color="primary"/>
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          display: 'flex',
          flex: {
            xs: '1 1 auto',
            md: '0 0 auto'
          },
          flexDirection: 'column',
          justifyContent: {
            md: 'center'
          },
          maxWidth: '100%',
          p: {
            xs: 4,
            md: 8
          },
          width: {
            md: 600
          }
        }}
      >
        <div>
          <Box sx={{ mb: 4 }}>
            <Stack
              alignItems="center"
              component={RouterLink}
              direction="row"
              display="inline-flex"
              href={paths.index}
              spacing={1}
              sx={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  height: 24,
                  width: 24
                }}
              >
                <Logo />
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
                CT<span>Mass</span>.com
              </Box>
            </Stack>
          </Box>
          {children}
        </div>
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};
