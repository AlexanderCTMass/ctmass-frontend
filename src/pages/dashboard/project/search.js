import { useCallback, useEffect, useState } from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import { Box, Button, Container, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useMounted } from "../../../hooks/use-mounted";
import { projectsApi } from "src/api/projects";
import { useAuth } from "../../../hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import { useDispatch, useSelector } from "../../../store";
import { thunks } from "../../../thunks/dictionary";
import { ProjectListSearch } from "../../../sections/dashboard/project/search/project-list-search";
import { ProjectCard } from "src/components/projects/project-card";
import { ProjectStatus } from "src/enums/project-state";

const useProjectsSearch = () => {
    const { user } = useAuth();

    const [state, setState] = useState({
        filters: {
            customer: undefined,
            specialty: user && user.specialties ? user.specialties.map((spec) => spec.id) : [],
            categories: user && user.specialties ? user.specialties.map((spec) => spec.id) : [],
            state: ProjectStatus.PUBLISHED,
            notInterested: user.id
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
                // Фильтруем документы
                const filteredDocs = response.docs.filter((doc) => {
                    const uninterestedSpecialists = doc.data().uninterestedSpecialists || [];
                    return !uninterestedSpecialists.includes(searchState.filters.notInterested);
                });

                const newProjects = filteredDocs.map((doc) => ({ id: doc.id, ...doc.data() }));

                const lastVisible = filteredDocs[filteredDocs.length - 1] || null;
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

    return { categories: dictionary.categories, specialties: dictionary.specialties };
};

const Page = () => {
    const projectsSearch = useProjectsSearch();
    const projectsStore = useProjectsStore(projectsSearch.state);
    const { categories, specialties } = useDictionary();
    const [isFetching, setIsFetching] = useInfiniteScroll(() => {
        if (projectsStore.lastVisible)
            projectsSearch.handlePageNext(projectsStore.lastVisible);
        setIsFetching(false);
    });
    const { user } = useAuth();

    usePageView();

    return (
        <>
            <Seo title="Dashboard: Project Search" />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={4}
                    >
                        <Stack spacing={1}>
                            <Typography variant="h4">
                                Find and respond to the work
                            </Typography>
                        </Stack>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={3}
                        >
                            <Button
                                component={RouterLink}
                                href={paths.dashboard.jobs.create}
                                startIcon={(
                                    <SvgIcon>
                                        <PlusIcon />
                                    </SvgIcon>
                                )}
                                variant="contained"
                            >
                                Add
                            </Button>
                        </Stack>
                    </Stack>
                    <Stack
                        spacing={4}
                        sx={{ mt: 4 }}
                    >
                        <ProjectListSearch onFiltersChange={projectsSearch?.handleFiltersChange} />
                        {projectsStore.state && projectsStore.state.projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                specialty={specialties.byId[project.specialtyId]}
                                role={"contractor"}
                                user={user}
                                onProjectListChanged={projectsSearch.handleSetRemoved}
                            />
                        ))}
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
                                projectsSearch.handlePageNext(projectsStore.lastVisible)
                            }}>
                                <SvgIcon fontSize="small">
                                    <ChevronRightIcon />
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
