import {Box, CircularProgress, Container, Grid, Stack, Typography, useTheme} from '@mui/material';
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
import {ProjectCreateForm} from "src/sections/dashboard/project/project-create-form";
import {wait} from "src/utils/wait";

const SHOW_SPECIALIST_COLUMN = false;

const useSpecialists = (specialty, service) => {
    const [specialists, setSpecialists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpecialists = async () => {
            setLoading(true);
            try {
                await wait(1200);
                if (!specialty && !service) {
                    setSpecialists([]);
                    return;
                }

                setSpecialists(SPECIALISTS_MOCK);
                const project = projectsLocalApi.restoreProject();
                projectsLocalApi.storeProject({
                    ...project,
                    specialistsCount: SPECIALISTS_MOCK.length,
                    showedSpecialists: SPECIALISTS_MOCK.sort(() => Math.random() - 0.5)
                        .slice(0, 3).map(spec => spec.avatar)
                })
            } catch (err) {
                console.error("Error fetching specialists:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialists();
    }, [specialty, service]);

    return {specialists, loading, error};
};


const useProjectData = (projectTitle, servicePath) => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [draft, setDraft] = useState({});
    const [category, setCategory] = useState();
    const [specialty, setSpecialty] = useState();
    const [service, setService] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                let categoryId = null, specialtyId = null, serviceId = null;
                let categoryData = null, specialtyData = null, serviceData = null;

                if (servicePath) {
                    const pathParts = servicePath.split("/");
                    if (pathParts.includes("services")) {
                        categoryId = pathParts[1];
                        specialtyId = pathParts[3];
                        serviceId = pathParts[5];
                    } else if (pathParts.includes("specialties")) {
                        categoryId = pathParts[1];
                        specialtyId = pathParts[3];
                    }

                    const categorySnap = await getDoc(doc(firestore, `specialtiesCategories/${categoryId}`));
                    if (!categorySnap.exists()) throw new Error("Category not found");
                    categoryData = {id: categorySnap.id, ...categorySnap.data()};

                    const specialtySnap = await getDoc(doc(firestore, `specialtiesCategories/${categoryId}/specialties/${specialtyId}`));
                    if (!specialtySnap.exists()) throw new Error("Specialty not found");
                    specialtyData = {id: specialtySnap.id, ...specialtySnap.data()};

                    if (serviceId) {
                        const serviceSnap = await getDoc(doc(firestore, `specialtiesCategories/${categoryId}/specialties/${specialtyId}/services/${serviceId}`));
                        if (!serviceSnap.exists()) throw new Error("Service not found");
                        serviceData = {id: serviceSnap.id, ...serviceSnap.data()};
                    }

                    setCategory(categoryData);
                    setSpecialty(specialtyData);
                    setService(serviceData);
                }

                let localProject = projectsLocalApi.restoreProject();
                if (!localProject || localProject.servicePath !== servicePath) {
                    localProject = {
                        title: projectTitle,
                        servicePath: servicePath,
                        specialty: specialtyData,
                        service: serviceData,
                        state: ProjectStatus.DRAFT
                    };
                    projectsLocalApi.storeProject(localProject);
                    toast.custom("Draft project created");
                } else {
                    toast.custom("Draft project loaded");
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
    }, [user, projectTitle, servicePath]);

    return {draft, category, specialty, service, loading, error};
};


const SPECIALISTS_MOCK = [
    {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://robohash.org/user1.png?set=set2"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://robohash.org/user2.png?set=set2"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://robohash.org/user3.png?set=set2"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://robohash.org/user4.png?set=set2"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://robohash.org/user5.png?set=set2"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://robohash.org/user6.png?set=set2"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://robohash.org/user7.png?set=set2"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://robohash.org/user8.png?set=set2"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://robohash.org/user9.png?set=set2"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://robohash.org/user10.png?set=set2"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://robohash.org/user11.png?set=set2"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://robohash.org/user12.png?set=set2"
    }];

const Page = () => {
    const theme = useTheme();
    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const servicePath = searchParams.get("servicePath") || "";
    const projectTitle = searchParams.get("projectTitle") || "";

    const {draft, category, specialty, service, loading, error} = useProjectData(projectTitle, servicePath);
    const {specialists, loading: specialistsLoading, error: specialistsError} = useSpecialists(specialty, service);

    const handleServiceChange = useCallback((service) => {
        if (service) {
            projectsLocalApi.deleteProject();
            navigate(paths.request.create
                .replace(":servicePath", service?.fullId || "")
                .replace(":projectTitle", service?.label || ""), {replace: true});
        }
    }, [navigate]);

    return (
        <>
            <Seo title="Services"/>
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                    pb: '40px',
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
                        <FullLoadServicesAutocomplete
                            externalSearchText={projectTitle}
                            onChange={handleServiceChange}
                        />
                    </Stack>
                </Container>
            </Box>
            <Box component="main" sx={{py: 2}}>
                <Container maxWidth="lg">
                    <Grid container>
                        {/* Left side */}
                        {Boolean(SHOW_SPECIALIST_COLUMN) ?
                            <Grid item xs={0} lg={4}>
                                {specialistsLoading ? (
                                    <CircularProgress/>
                                ) : specialistsError ? (
                                    <Typography color="error">{specialistsError}</Typography>
                                ) : (
                                    <SpecialistList theme={theme} specialists={specialists}/>
                                )}
                            </Grid>
                            :
                            <Grid
                                xs={0}
                                sm={4}
                                sx={{
                                    height: 780,
                                    backgroundImage: draft?.specialty?.imgVertical ? `url(${draft?.specialty?.imgVertical}` : 'url(/assets/renovation-project-min.jpg)',
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
                        }

                        {/* Right side */}
                        <Grid item xs={12} lg={8}>
                            <Box sx={{pl: 4}}>
                                {loading ? <CircularProgress/> :
                                    <ProjectCreateForm key={draft?.title || "default"} project={draft}/>}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;

