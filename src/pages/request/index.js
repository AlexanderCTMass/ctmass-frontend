import {Box, Container, Divider, Grid, Stack, Typography, useTheme} from '@mui/material';
import {collectionGroup, getDoc, getDocs, query, where} from "firebase/firestore";
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
import {SpecialistMiniPreview} from "src/sections/components/specialist/specialist-mini-preview";
import {ProjectCreateForm} from "src/sections/dashboard/project/project-create-form";

const useDraft = (projectTitle, serviceId) => {
    const {user} = useAuth();
    const [draft, setDraft] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
            setLoading(true);
            if (user) {
                projectsApi.getUserDraftProject(user.id)
                    .then(r => {
                        if (r) {
                            setDraft(r);
                            toast.custom("Draft project loaded");
                        } else {
                            projectsApi.createProject({userId: user.id, state: ProjectStatus.DRAFT})
                                .then(r => setDraft(r));
                            toast.custom("Draft project created");
                        }
                    })
                    .catch(reason => setError(reason))
                    .finally(() => setLoading(false));
            } else {
                let project = projectsLocalApi.restoreProject();
                if (project && project.serviceId === serviceId) {
                    toast.custom("Local Storage draft project loaded");
                } else {
                    project = {title: projectTitle, serviceId: serviceId};

                    if (projectTitle) {
                        projectsLocalApi.storeProject(project);
                        toast.custom("Local Storage draft project created");
                    }
                }
                setDraft(project);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, serviceId, projectTitle]);

    return {draft, loading, error};
};

const specialists = [
    {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://picsum.photos/200/300"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://picsum.photos/200/300"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://picsum.photos/200"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }];


function SpecialistListScrollable(props: { theme: any, callbackfn: (specialist, index) => any }) {
    return <Grid item xs={12} lg={4} sx={{height: "calc(100vh - 150px)"}}>
        <Typography sx={{fontSize: "22px", fontWeight: 400, mt: 1}}>
            <Typography
                component="span"
                sx={{
                    mr: 1,
                    background: "#DCDEE0",
                    padding: "10px",
                    borderRadius: "12px"
                }}
                variant="inherit"
            >259</Typography>
            specialists
        </Typography>
        <Box sx={{
            pt: 4,
            maxHeight: "100%",
            overflowY: "hidden",
            scrollbarWidth: "none",
            "&:hover": {
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: `${props.theme.palette.primary.main} #f1f1f1`,
            },
            "&::-webkit-scrollbar": {
                width: "8px"
            },
            "&:hover::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "10px"
            },
            "&:hover::-webkit-scrollbar-thumb": {
                background: props.theme.palette.primary.main,
                borderRadius: "10px"
            },
            "&:hover::-webkit-scrollbar-thumb:hover": {
                background: props.theme.palette.primary.dark
            }
        }}>
            {specialists.map(props.callbackfn)}
        </Box>
    </Grid>;
}

function SpecialistList(props: { theme: any, callbackfn: (specialist, index) => any }) {
    return <Grid item xs={12} lg={4}>
        <Typography sx={{fontSize: "22px", fontWeight: 400, mt: 1}}>
            <Typography
                component="span"
                sx={{
                    mr: 1,
                    background: "#DCDEE0",
                    padding: "10px",
                    borderRadius: "12px"
                }}
                variant="inherit"
            >259</Typography>
            specialists
        </Typography>
        <Box sx={{
            pt: 4
        }}>
            {specialists.map(props.callbackfn)}
        </Box>
    </Grid>;
}

const Page = () => {
    const theme = useTheme();
    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const serviceId = searchParams.get("serviceId") || "";
    const projectTitle = searchParams.get('projectTitle');
    const {draft, loading, error} = useDraft(projectTitle, serviceId);
    const [category, setCategory] = useState();
    const [specialty, setSpecialty] = useState();
    const [service, setService] = useState();

    const handleServiceChange = useCallback((service) => {
        if (service) {
            projectsLocalApi.deleteProject();
            setService(null);
            setCategory(null);
            setSpecialty(null);
            navigate(`/request/create?serviceId=${service.fullId}&projectTitle=${service.label}`, {replace: true});
        }
    }, [navigate]);


    useEffect(() => {
        const fetchData = async () => {
            if (!serviceId) return;
            try {
                const servicesQuery = query(collectionGroup(firestore, "services"), where("__name__", "==", serviceId));
                const serviceSnapshot = await getDocs(servicesQuery);

                if (serviceSnapshot.empty) {
                    alert("Service not found");
                    return;
                }

                let foundService = null;
                let specialtyRef = null;

                serviceSnapshot.forEach((doc) => {
                    foundService = doc.data();
                    specialtyRef = doc.ref.parent.parent; // Получаем ссылку на specialty
                });

                if (!foundService || !specialtyRef) {
                    alert("Invalid service data");
                    return;
                }

                // 🔎 Найти specialty
                const specialtySnapshot = await getDoc(specialtyRef);
                if (!specialtySnapshot.exists()) {
                    alert("Specialty not found");
                    return;
                }
                const specialtyData = specialtySnapshot.data();
                console.log(specialtyData);
                const categoryRef = specialtySnapshot.ref.parent.parent; // Получаем ссылку на category

                const categorySnapshot = await getDoc(categoryRef);
                if (!categorySnapshot.exists()) {
                    alert("Category not found");
                    return;
                }
                const categoryData = categorySnapshot.data();

                setCategory(categoryData);
                setSpecialty(specialtyData);
                setService(foundService);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error loading service");
            } finally {
            }
        };

        fetchData();
    }, [serviceId]);

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
                            <Typography
                                component="span"
                                color="primary.main"
                                variant="inherit"
                            > for your project</Typography>
                        </Typography>
                        <FullLoadServicesAutocomplete
                            externalSearchText={projectTitle}
                            onChange={handleServiceChange}
                            onInputChange={(value) => {

                            }}/>
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography sx={{fontSize: "22px", fontWeight: 600}}>{specialty?.label || null}</Typography>
                            <Typography sx={{fontSize: "22px", fontWeight: 600}}>·</Typography>
                            <Typography sx={{fontSize: "22px", fontWeight: 300}}>{category?.label || null}</Typography>
                        </Stack>

                    </Stack>
                </Container>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {/* Левая колонка с прокруткой */}
                        <SpecialistList theme={theme} callbackfn={(specialist, index) => (
                            <Box key={index} sx={{pb: 2}}>
                                <SpecialistMiniPreview specialist={{
                                    ...specialist,
                                    avatar: "https://robohash.org/user" + index + ".png?set=set2"
                                }}/>
                                <Divider sx={{pt: 2}}/>
                            </Box>
                        )}/>

                        {/* Правая колонка без прокрутки */}
                        <Grid item xs={12} lg={8}>
                            <Box>
                                <ProjectCreateForm key={draft?.title || "default"} project={draft}/>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;
