import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import { Avatar, Box, Container, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { LogoAccenture } from 'src/components/logos/logo-accenture';
import { LogoAtt } from 'src/components/logos/logo-att';
import { LogoAws } from 'src/components/logos/logo-aws';
import { LogoBolt } from 'src/components/logos/logo-bolt';
import { LogoSamsung } from 'src/components/logos/logo-samsung';
import { LogoVisma } from 'src/components/logos/logo-visma';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { ContactForm } from 'src/sections/contact/contact-form';

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Contact" />
      <Box
        component="main"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(2, 1fr)',
            xs: 'repeat(1, 1fr)'
          },
          flexGrow: 1
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'neutral.800'
              : 'neutral.50',
            py: 8
          }}
        >
          <Container
            maxWidth="md"
            sx={{ pl: { lg: 15 } }}
          >
            <Stack spacing={3}>
              <div>
                <Link
                  color="text.primary"
                  component={RouterLink}
                  href={paths.index}
                  sx={{
                    alignItems: 'center',
                    display: 'inline-flex'
                  }}
                  underline="hover"
                >
                  <SvgIcon sx={{ mr: 1 }}>
                    <ArrowLeftIcon />
                  </SvgIcon>
                  <Typography variant="subtitle2">
                    Home
                  </Typography>
                </Link>
              </div>
              <Typography variant="h3">
                Contact
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{
                mb: 6,
                mt: 8
              }}
            >
              <Avatar
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText'
                }}
                variant="rounded"
              >
                <SvgIcon>
                  <Mail01Icon />
                </SvgIcon>
              </Avatar>
              <Typography variant="overline">
                Contact sales
              </Typography>
            </Stack>
            <Typography
              sx={{ mb: 3 }}
              variant="h1"
            >
              Talk to our account expert
            </Typography>
            <Typography
              sx={{ mb: 3 }}
              variant="body1"
            >
              Have questions about integrating our APIs? Fill out the form
              and a senior web expert will be in touch shortly.
            </Typography>
            <Typography
              color="primary"
              sx={{ mb: 3 }}
              variant="h6"
            >
              Join 6,000+ forward-thinking companies:
            </Typography>
            <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              gap={4}
              sx={{
                color: 'text.primary',
                '& > *': {
                  flex: '0 0 auto'
                }
              }}
            >
              <LogoSamsung />
              <LogoVisma />
              <LogoBolt />
              <LogoAws />
              <LogoAccenture />
              <LogoAtt />
            </Stack>
          </Container>
        </Box>
        <Box
          sx={{
            backgroundColor: 'background.paper',
            px: 6,
            py: 15
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              pr: {
                lg: 15
              }
            }}
          >
            <Typography
              sx={{ pb: 3 }}
              variant="h6"
            >
              Fill the form below
            </Typography>
            <ContactForm />
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Page;
