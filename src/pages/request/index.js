import { Box, CircularProgress, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { Seo } from "src/components/seo";
import { ProjectStatus } from "src/enums/project-state";
import { useAuth } from "src/hooks/use-auth";
import { ProjectCreateForm } from "src/sections/dashboard/project/create/project-create-form";

const useProjectData = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [draft, setDraft] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                let localProject = projectsLocalApi.restoreProject();

                if (!localProject) {
                    localProject = {
                        state: ProjectStatus.DRAFT
                    };
                    projectsLocalApi.storeProject(localProject);
                    toast.custom("Draft projects created");
                } else {
                    toast.custom("Draft projects loaded");
                }
                setDraft(localProject);

            } catch (err) {
                console.error("Error loading data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return { draft, loading, error };
};



const Page = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { draft, loading, error } = useProjectData();

    return (
        <>
            <Seo title="Services" />
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
                        {/*<FullLoadServicesAutocomplete
                            externalSearchText={customService}
                            onChange={handleServiceChange}
                        />*/}
                    </Stack>
                </Container>
            </Box>
            <Box component="main" sx={{ py: { xs: 0, md: 2 } }}>
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


                        {/* Right side */}
                        <Grid item xs={12} md={9} lg={8}>
                            <Box sx={{
                                pl: {
                                    sm: 0,
                                    md: 4
                                }
                            }}>
                                {loading ? <CircularProgress /> :
                                    <ProjectCreateForm key={draft?.title || "default"} project={draft} />}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;

