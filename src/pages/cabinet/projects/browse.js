import React, {useCallback, useEffect, useState} from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {useMounted} from "src/hooks/use-mounted";
import {projectsApi} from "src/api/projects";
import {useAuth} from "src/hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import {useDispatch, useSelector} from "src/store";
import {thunks} from "src/thunks/dictionary";
import {ProjectListTabs} from "src/sections/customer/projects/projects-list-tabs";
import {ProjectCard} from "src/components/projects/project-card";
import {ProjectStatus} from "src/enums/project-state";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import useDictionary from "src/hooks/use-dictionaries";
import useElevateComponent from "src/hooks/use-elevate-component";
import {alpha} from "@mui/material/styles";
import {roles} from "src/roles";
import {useSearchParams} from "src/hooks/use-search-params";
import {navigateToCurrentWithParams} from "src/utils/navigate";
import {useNavigate} from "react-router-dom";
import {INFO} from "src/libs/log";
import * as turf from "@turf/turf";
import {ProjectSpecialistStatus} from "src/enums/project-specialist-state";
import {projectService} from "src/service/project-service";
import {projectFlow} from "src/flows/project/project-flow";

const useProjectsSearch = () => {
    const {user} = useAuth();
    const searchParams = useSearchParams();
    const selectedRole = searchParams.get('selectedRole') || "customer";

    const [state, setState] = useState({
        filters: {
            customer: selectedRole === "customer" ? user : undefined,
            contractor: selectedRole === "contractor" ? user : undefined,
            state: undefined,
            specialist: user?.id,
            showNotInterested: false,
        },
        page: 0,
        rowsPerPage: 20,
        lastVisible: null, // Добавляем lastVisible в состояние
        removedProjects: []
    });

    const handleFiltersChange = useCallback((newFilters) => {
        setState((prevState) => ({
            ...prevState,
            filters: {
                ...prevState.filters,
                ...newFilters,
            },
            page: 0,
            lastVisible: null,
            removedProjects: []
        }));
    }, [selectedRole]);

    const handlePageNext = useCallback((lastVisible) => {
        setState((prevState) => ({
            ...prevState,
            page: prevState.page + 1, // Увеличиваем номер страницы
            lastVisible, // Обновляем lastVisible
        }));
    }, []);

    const handleSetRemoved = useCallback((newRemovedProjects) => {
        setState((prevState) => ({
            ...prevState,
            removedProjects: [...prevState.removedProjects, ...newRemovedProjects]
        }));
    }, []);


    const handleRowsPerPageChange = useCallback((event) => {
        setState((prevState) => ({
            ...prevState,
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0, // Сбрасываем страницу при изменении rowsPerPage
            lastVisible: null, // Сбрасываем lastVisible
            removedProjects: []
        }));
    }, []);

    return {
        handleFiltersChange,
        handlePageNext,
        handleSetRemoved,
        handleRowsPerPageChange,
        selectedRole,
        state
    };
}

const useProjectsStore = (searchState) => {
    const isMounted = useMounted();
    const [state, setState] = useState({
        projects: [],
        projectsCount: 0,
        lastVisible: null,
        filters: searchState?.filters || []
    });

    const handleProjectsGet = useCallback(async () => {
        try {
            const response = await projectsApi.getProjects(searchState);

            if (isMounted()) {
                let newProjects = response.docs
                    .map(doc => ({id: doc.id, ...doc.data()}));
                const lastVisible = response.docs[response.docs.length - 1] || null;

                INFO("New project list", newProjects);
                if (searchState.filters.state === ProjectSpecialistStatus.RESPONDED) {
                    newProjects = newProjects.filter(p =>
                        p.respondedSpecialists?.some(r => r.userId === searchState.filters.contractor.id) || false
                    )
                }
                INFO("Filtered project list", newProjects);


                setState(prevState => {
                    let newState;
                    if (JSON.stringify(prevState.filters) !== JSON.stringify(searchState.filters)) {
                        newState = {
                            projects: [...newProjects],
                            projectsCount: newProjects.length,
                            lastVisible,
                            filters: searchState.filters,
                        };
                    } else {
                        const uniqueProjects = [...prevState.projects.filter(project => !searchState.removedProjects.includes(project.id))];
                        newProjects.forEach((project) => {
                            if (!uniqueProjects.some((p) => p.id === project.id)) {
                                uniqueProjects.push(project);
                            }
                        });

                        newState = {
                            projects: uniqueProjects,
                            projectsCount: uniqueProjects.length,
                            lastVisible,
                            filters: searchState.filters,
                        };
                    }

                    if (searchState.filters?.state === ProjectStatus.PUBLISHED || !searchState.filters?.state) {
                        let localProject = projectsLocalApi.restoreProject();
                        if (localProject && !newState.projects.some((p) => p.createdAt === localProject.createdAt)) {
                            newState.projects = [localProject, ...newState.projects];
                        }
                    }
                    return newState;
                });

                console.log("Updated state:", state);
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    }, [searchState, isMounted]);

    useEffect(() => {
        handleProjectsGet();
    }, [handleProjectsGet]);

    return {
        state,
        handleProjectsGet
    };
};

const Page = () => {
        const projectsSearch = useProjectsSearch();
        const projectsStore = useProjectsStore(projectsSearch.state);
        const {categories, specialties, services} = useDictionary();
        const [isFetching, setIsFetching] = useInfiniteScroll(() => {
            if (projectsStore.state.lastVisible)
                projectsSearch.handlePageNext(projectsStore.state.lastVisible);
            setIsFetching(false);
        });
        const {user} = useAuth();

        const elevate = useElevateComponent(64, 100);
        const navigate = useNavigate();

        const updateProjectList = async () => {
            projectsStore.state.projects = [];
            await projectsStore.handleProjectsGet();
        }

        useEffect(() => {
            projectsSearch.handleFiltersChange({
                customer: projectsSearch.selectedRole === "customer" ? user : undefined,
                contractor: projectsSearch.selectedRole === "contractor" ? user : undefined,
            });
        }, [projectsSearch.selectedRole]);

        usePageView();

        const handleSelectRole = (role) => {
            navigateToCurrentWithParams(navigate, "selectedRole", role);
        };


        return (
            <>
                <Seo title="Cabinet: My projects"/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 0
                    }}
                >
                    <Container
                        maxWidth="lg"
                        sx={{
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'transparent',
                            borderRadius: 2.5,
                            position: 'sticky',
                            top: '100px',
                            boxShadow: 'none',
                            zIndex: 1000,
                            py: 2,
                            transition: (theme) => theme.transitions.create('box-shadow, background-color, font-size', {
                                easing: theme.transitions.easing.easeInOut,
                                duration: 200
                            }),
                            ...(elevate && {
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.90),
                                boxShadow: 8,
                            })
                        }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={4}
                            sx={{mb: elevate ? 0 : 2}}
                        >
                            <Stack spacing={1}>
                                <Typography variant={"h2"} sx={{
                                    transition: (theme) => theme.transitions.create('all', {
                                        easing: theme.transitions.easing.easeInOut,
                                        duration: 200
                                    }),
                                    ...(elevate && {
                                        fontSize: "22px !important"
                                    })
                                }}>
                                    My projects
                                </Typography>
                            </Stack>
                            {user.role === roles.WORKER &&
                                <ButtonGroup
                                    size={elevate ? "small" : "medium"}
                                    color={"info"}
                                    aria-label="Disabled button group"
                                >
                                    <Button
                                        variant={projectsSearch.selectedRole !== "contractor" ? "contained" : "outlined"}
                                        onClick={() => handleSelectRole("customer")}>
                                        I'm customer</Button>
                                    <Button
                                        variant={projectsSearch.selectedRole === "contractor" ? "contained" : "outlined"}
                                        onClick={() => handleSelectRole("contractor")}>
                                        I'm contractor</Button>
                                </ButtonGroup>}
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={3}
                            >
                                <Button
                                    component={RouterLink}
                                    href={paths.cabinet.projects.create}
                                    startIcon={(
                                        <SvgIcon>
                                            <PlusIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="text"
                                >
                                    Create Project
                                </Button>
                                {process.env.REACT_APP_TEST_MODE && 1 === 2 &&
                                    <Button
                                        startIcon={(
                                            <SvgIcon>
                                                <PlusIcon/>
                                            </SvgIcon>
                                        )}
                                        variant="text"
                                        onClick={async () => {
                                            await projectFlow.create({
                                                "projectStartType": "asap",
                                                "end": null,
                                                "customerAvatar": "data:image/jpeg;base64,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gkW03RzzywzfH7b/AN+2fv4w46edb7+a98PqXAetQNk4AUNNYYww8Hzf294lUcO18V2nU49B/wD384vCzPPPIBb/ALiq6hjSxcPy6m82/wAt1Bgu1cZXwN402BvU88kP5t28nJ8uU8sf14n16s/0o1JqE3r95q719Om888X7cl8Eos81O8880w4SEiM/9tx/d8y663z4p4tU8ITfDwwo7p1vVU88wsoc40vzefp9A4Sug8ype1984oLxqa2vllsdku884IKAmkimrk9181eu++8m9ZFD88c6s26/f9V9sb08oGv050FIYvO08eseW4/2XF/r88YuOR871dV9d/U84R/Gm8c8IWf/AOPtvcuvPBV+K8PPNPgumrHZHq91PKLm83vf2Nf1jnvPsnPoVfK7ry/PDIvJdUPfNqt1PLPPt86vvNPLa/FXHiPcX/ud05mdPONtVbf738iPPILmw79jvtEO7/FdXSdVuL9P6knmPPLFHc/+ruHPNHe/b/60oIvctPPPfEKDr3kc/UumxvPPHPMBHHPKDTOP/wCmeevrU67zz1xtc+vO/wB56ca9pcw88888gIdRqCn/AK+6FT3upmRH9872+7gtH+bvO0EqvOsstZedYvqPy/OD9vvu++G/767u9j3v6b/ItE/PFLXfdTfO/P8AHzz/ADXP/bP+Ifuz7+qqnr/l10y+9870NNl57/2HfIL77fvfbzvyz/C/ns+L3/8A81/4ULsVd1dbf/GvdPxO/wA+P/8A3v3mH38fbKf33t/n/e//AOvP5K+hJGA7Bv37L+T+077/AL/ZDTf8+dtvtuvV96pO9iz2/eezzHtftyW9/wD7z/f3n/z373zfvj7vnzSO6fzX3zzf4tjD7zng/wD+035+/f/EACERAAICAgMBAQEBAQAAAAAAAAERABAgMCExUUFAYVBx/9oACAEDAQE/EKBncH4Y9gFCcUVEQiuuw6EI4398UydI4MAnqlQYT2g0D8i1qGATBACnTAHBS5wdogMHFwjQoorBnrlFGGKELcOE7EI+4qK3iCEJdizDFCHtAJgFCGwHFPU6FkcxPNhpUHqACKKnzdCli48gcAJx9go2H3ICAQCLAA1Wbi0gqlEYoWChCMVEI4qLAEYAFnLung8vgYoIoo2iIeYQsBQMwe4ABD3iRxgY6WCzQx+oowh4H+wAMDQiih61K1Dg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",
                                                "customService": "Custom test service",
                                                "start": null,
                                                "attach": [],
                                                "description": "<p>Test description for test project for test specisliasts</p>",
                                                "state": "published",
                                                "specialtyId": "5NTq1E957m4BbL44jr7e",
                                                "projectMaximumBudget": "100",
                                                "serviceId": null,
                                                "location": {
                                                    "center": [
                                                        37.50912,
                                                        55.780495
                                                    ],
                                                    "address": "7с3",
                                                    "relevance": 1,
                                                    "properties": {
                                                        "accuracy": "rooftop",
                                                        "mapbox_id": "dXJuOm1ieGFkcjo5MTMzZTI2OC1iYTEwLTQ1MzMtOGYxYS04MDlhMjZlNGY1NDI"
                                                    },
                                                    "text": "Улица Зорге",
                                                    "context": [
                                                        {
                                                            "mapbox_id": "dXJuOm1ieHBsYzpMSTdD",
                                                            "id": "postcode.2920130",
                                                            "text": "123308"
                                                        },
                                                        {
                                                            "id": "locality.714312386",
                                                            "text": "Хорошевский",
                                                            "mapbox_id": "dXJuOm1ieHBsYzpLcE9Ld2c"
                                                        },
                                                        {
                                                            "mapbox_id": "dXJuOm1ieHBsYzpDSVRD",
                                                            "wikidata": "Q649",
                                                            "short_code": "RU-MOW",
                                                            "id": "place.558274",
                                                            "text": "Moscow"
                                                        },
                                                        {
                                                            "wikidata": "Q159",
                                                            "text": "Russia",
                                                            "short_code": "ru",
                                                            "mapbox_id": "dXJuOm1ieHBsYzpJc0k",
                                                            "id": "country.8898"
                                                        }
                                                    ],
                                                    "geometry": {
                                                        "type": "Point",
                                                        "coordinates": [
                                                            37.50912,
                                                            55.780495
                                                        ]
                                                    },
                                                    "place_type": [
                                                        "address"
                                                    ],
                                                    "type": "Feature",
                                                    "place_name": "Russia, Moscow, Хорошевский, 123308, Улица Зорге 7с3",
                                                    "id": "address.6038568117829288"
                                                },
                                                "title": "Test Project #" + Math.floor(Math.random() * 1000)
                                            }, user);
                                            await updateProjectList();
                                        }}
                                    >
                                        Create TEST Project
                                    </Button>
                                }
                            </Stack>
                        </Stack>

                        <ProjectListTabs
                            projectsCount={projectsStore.state.projectsCount}
                            onFiltersChange={projectsSearch.handleFiltersChange}
                            role={projectsSearch.selectedRole}
                        />
                        <Divider/>
                    </Container>
                    <Container
                        maxWidth="lg">
                        <Stack
                            spacing={4}
                            sx={{mt: 4}}
                        >
                            {(projectsStore.state && projectsStore.state.projects.length > 0) ?
                                projectsStore.state.projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        specialty={specialties.byId[project.specialtyId]}
                                        serviceLabel={projectService.getServiceLabel(project, services)}
                                        role={projectsSearch.selectedRole}
                                        user={user}
                                        rollback={projectsSearch.selectedRole === "contractor"}
                                        onProjectListChanged={projectsSearch.handleSetRemoved}
                                        updateProjectList={updateProjectList}
                                    />
                                )) : <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        flexGrow: 1,
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography
                                        color="text.secondary"
                                        sx={{mt: 2}}
                                        variant="subtitle1"
                                    >
                                        {"Not yet"}
                                    </Typography>
                                </Box>}
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="flex-end"
                                spacing={2}
                                sx={{
                                    px: 3,
                                    py: 2
                                }}
                            >
                                <IconButton onClick={() => {
                                    projectsSearch.handlePageNext(projectsStore.state.lastVisible)
                                }}>
                                    <SvgIcon fontSize="small">
                                        <ChevronRightIcon/>
                                    </SvgIcon>
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>
            </>
        );
    }
;

export default Page;
