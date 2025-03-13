import {Box, CircularProgress, Link, Stack, SvgIcon, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import debug from "debug";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {projectsApi} from "src/api/projects";
import {Scrollbar} from "src/components/scrollbar";
import {Seo} from 'src/components/seo';
import {ProjectStatus} from "src/enums/project-state";
import {usePageView} from 'src/hooks/use-page-view';
import {useAuth} from "src/hooks/use-auth";
import {ProjectCreateForm} from "src/sections/dashboard/project/create/project-create-form";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {useParams} from "react-router";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";

const logger = debug("ProjectsCreate")

const useDraft = () => {
    const {user} = useAuth();
    const [draft, setDraft] = useState();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
            setLoading(true);

            let localProject = projectsLocalApi.restoreProject();

            if (!localProject) {
                localProject = {
                    state: ProjectStatus.DRAFT,
                    createdAt: new Date()
                };
                // projectsLocalApi.storeProject(localProject);
                // toast.custom("Draft projects created");
            } else {
                toast.success("Draft projects loaded", {position: "top-center"});
            }
            setDraft(localProject);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user]);

    return {draft, loading, error};
};

const Page = () => {
    usePageView();
    const {draft, loading, error} = useDraft();


    return (
        !draft ?
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 3
                }}
            >
                <CircularProgress/>
            </Box>
            :
            <>
                <Seo title="Cabinet: Project Create"/>
                <Link
                    color="text.primary"
                    component={RouterLink}
                    href={paths.cabinet.projects.index}
                    sx={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        mb: 4
                    }}
                    underline="hover"
                >
                    <SvgIcon sx={{mr: 1}}>
                        <ArrowLeftIcon/>
                    </SvgIcon>
                    <Typography variant="subtitle2">
                        All projects
                    </Typography>
                </Link>
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
                            xs={0}
                            sm={4}
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
                        <Grid
                            xs={12}
                            md={8}
                            sx={{
                                px: {
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
                                        Create Project Ad
                                    </Typography>
                                    <ProjectCreateForm project={draft}/>
                                </Stack>
                            </Scrollbar>
                        </Grid>
                    </Grid>
                </Box>
            </>
    );
};

export default Page;
