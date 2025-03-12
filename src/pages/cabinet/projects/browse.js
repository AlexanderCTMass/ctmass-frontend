import React, {useCallback, useEffect, useState} from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {Box, Button, CircularProgress, Container, Divider, IconButton, Stack, SvgIcon, Typography} from '@mui/material';
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

const useProjectsSearch = () => {
    const {user} = useAuth();

    const [state, setState] = useState({
        filters: {
            customer: user,
            contractor: user,
            state: undefined
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
            page: 0, // Сбрасываем страницу при изменении фильтров
            lastVisible: null, // Сбрасываем lastVisible,
            removedProjects: []
        }));
    }, []);

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
                const newProjects = response.docs
                    .map(doc => ({id: doc.id, ...doc.data()}));
                console.log(newProjects);
                const lastVisible = response.docs[response.docs.length - 1] || null;

                setState(prevState => {
                    let newState;
                    // Если фильтры изменились, сбрасываем проекты
                    if (JSON.stringify(prevState.filters) !== JSON.stringify(searchState.filters)) {
                        newState = {
                            projects: [...newProjects],
                            projectsCount: newProjects.length,
                            lastVisible,
                            filters: searchState.filters,
                        };
                    } else {
                        // Иначе добавляем новые проекты, исключая дубликаты
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

                    if (searchState.filters?.state === ProjectStatus.DRAFT || !searchState.filters?.state) {
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


const useDictionary = () => {
    const dispatch = useDispatch();
    const dictionary = useSelector((state) => state.dictionary);

    const handleDictionaryGet = useCallback(() => {
        dispatch(thunks.getDictionary({}));
    }, [dispatch]);

    useEffect(() => {
            handleDictionaryGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return {categories: dictionary.categories, specialties: dictionary.specialties};
};

const Page = () => {
        const projectsSearch = useProjectsSearch();
        const projectsStore = useProjectsStore(projectsSearch.state);
        const {categories, specialties} = useDictionary();
        const [isFetching, setIsFetching] = useInfiniteScroll(() => {
            if (projectsStore.state.lastVisible)
                projectsSearch.handlePageNext(projectsStore.state.lastVisible);
            setIsFetching(false);
        });
        const {user} = useAuth();

        const updateProjectList = async () => {
            projectsStore.state.projects = [];
            await projectsStore.handleProjectsGet();
        }

        usePageView();

        return (
            <>
                <Seo title="Cabinet: My projects"/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={4}
                            sx={{mb: 2}}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h2">
                                    My projects
                                </Typography>
                            </Stack>
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
                            </Stack>
                        </Stack>
                        <ProjectListTabs
                            onFiltersChange={projectsSearch.handleFiltersChange}
                        />
                        <Divider/>
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
                                    role={"customer"}
                                    user={user}
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
