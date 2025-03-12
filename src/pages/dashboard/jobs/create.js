import {Box, Stack, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {JobCreateForm} from 'src/sections/dashboard/jobs/job-create-form';
import {Scrollbar} from "src/components/scrollbar";
import {useEffect, useState} from "react";
import {dictionaryApi} from "../../components/dictionary/dictionaryApi";

const Page = () => {
    usePageView();
    const [dictionary, setDictionary] = useState({categories:[], lastId : null})

    useEffect(() => {
            dictionaryApi.get().then(value => {
                value && setDictionary(value);
            })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);
    return (
        <>
            <Seo title="Dashboard: Project Create"/>
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
                            backgroundImage: 'url(/assets/renovation-projects-min.jpg)',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
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
                        <Scrollbar sx={{ maxHeight: "100%" }}>
                            <Stack
                                maxWidth="sm"
                                spacing={3}
                            >
                                <Typography variant="h4">
                                    Create Project Ad
                                </Typography>
                                <JobCreateForm dict = {dictionary}/>
                            </Stack>
                        </Scrollbar>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default Page;
