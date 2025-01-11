import {Avatar, Box, Container, Stack, SvgIcon, Typography} from '@mui/material';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {ContactForm} from 'src/sections/contact/contact-form';

const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="Contact"/>
            <Container maxWidth="lg">
                <Box
                    component="main"
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            lg: '2fr 3fr',
                            xs: 'repeat(1, 1fr)'
                        },
                        flexGrow: 1 ,
                        pb: '40px',
                        pt: '120px',
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                ? 'neutral.800'
                                : 'neutral.50',

                        }}
                    >
                        <Container
                            maxWidth="md"
                        >
                            <Stack spacing={3}>
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
                                        <Mail01Icon/>
                                    </SvgIcon>
                                </Avatar>
                                <Typography variant="overline">
                                    Contact sales
                                </Typography>
                            </Stack>
                            <Typography
                                sx={{mb: 3}}
                                variant="h3"
                            >
                                Talk to our account expert
                            </Typography>
                            <Typography
                                sx={{mb: 3}}
                                variant="body1"
                            >
                            </Typography>
                                If you have any questions about our service, fill out the form below and a senior web expert will contact you shortly.
                            <Typography
                                sx={{mb: 3}}
                                variant="body1"
                            >
                                We appreciate any suggestions you have.<br/>
                            </Typography>
                            {/* <Typography
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
            </Stack>*/}
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
                        >
                            <Typography
                                sx={{pb: 3}}
                                variant="h6"
                            >
                                Fill the form below
                            </Typography>
                            <ContactForm/>
                        </Container>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Page;
