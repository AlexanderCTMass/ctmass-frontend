import {Backdrop, Box, CircularProgress, Container, Grid, Stack, Typography, useTheme} from '@mui/material';
import {collectionGroup, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import React, {useCallback, useEffect, useState} from 'react';
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {projectsApi} from "src/api/projects";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import {Seo} from "src/components/seo";
import {ProjectStatus} from "src/enums/project-state";
import {useAuth} from "src/hooks/use-auth";
import {useSearchParams} from "src/hooks/use-search-params";
import {firestore} from "src/libs/firebase";
import {SpecialistList} from "src/pages/request/specialist-list";
import {paths} from "src/paths";
import {ProjectCreateForm} from "src/sections/dashboard/project/create/project-create-form";
import {wait} from "src/utils/wait";


const Page = () => {


    return (
        <>
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={true}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Seo title="Services"/>
            <Box
                sx={{
                    // backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                    pb: {
                        xs: '10px',
                        md: '40px'
                    },
                    pt: '100px'
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={3}>
                        <Typography variant="h2">
                            Find a specialist
                            <Typography component="span" color="primary.main" variant="inherit"> for your
                                project</Typography>
                        </Typography>
                    </Stack>
                </Container>
            </Box>
            <Box component="main" sx={{py: {xs: 0, md: 2}}}>
                <Container maxWidth="lg">
                    <Grid container>

                        <Grid
                            xs={0}
                            md={3}
                            lg={4}
                            sx={{
                                height: 780,
                                backgroundImage: 'url(/assets/renovation-project-min.jpg)',
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


                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;

