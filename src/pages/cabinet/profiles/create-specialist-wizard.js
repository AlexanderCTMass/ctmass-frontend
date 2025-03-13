import {Box, Stack, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {Scrollbar} from "src/components/scrollbar";
import {SpecialistCreateForm} from "src/sections/dashboard/specialist-profile/specialist-create-form";


const Page = () => {
    usePageView();

    return (
        <>
            <Seo title="Cabinet: Specialist profile create wizard"/>
            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexGrow: 1
                }}
            >
                <Grid
                    container
                    sx={{flexGrow: 1}}
                >
                    <Grid
                        xs={12}
                        sm={4}
                        sx={{
                            backgroundImage: 'url(/assets/create-profile-bg.jpg)',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            borderRadius: "12px",
                            display: {
                                xs: 'none',
                                md: 'block'
                            }
                        }}
                    />
                    <Grid
                        xs={12}
                        md={8}
                        sx={{
                            p: {
                                xs: 4,
                                sm: 6,
                                md: 8
                            }
                        }}
                    >
                        <Scrollbar sx={{maxHeight: "100%"}}>
                            <Stack
                                maxWidth="sm"
                                spacing={3}
                            >
                                <Typography variant="h4">
                                    Create Specialist profile
                                </Typography>
                                <SpecialistCreateForm/>

                            </Stack>
                        </Scrollbar>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default Page;
