import {useCallback, useEffect, useState} from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {Box, Button, Container, IconButton, Stack, SvgIcon, Typography} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {useMounted} from "../../../hooks/use-mounted";
import {projectsApi} from "src/api/projects";
import {useAuth} from "../../../hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";
import {ProjectListSearch} from "../../../sections/dashboard/project/browse/project-list-search";
import {ProjectCard} from "../../../sections/dashboard/project/browse/project-card";

const useProjectsSearch = () => {
    const {user} = useAuth();

    const [state, setState] = useState({
        filters: {
            specialty: user && user.specialties ? user.specialties.map((spec) => spec.id) : [],
            categories: user && user.specialties ? user.specialties.map((spec) => spec.id) : [],
        },
        page: 0,
        rowsPerPage: 20,
    });

    const handleFiltersChange = useCallback((filters) => {
        setState((prevState) => ({
            ...prevState,
            filters,
            lastVisible: null
        }));
    }, []);

    const handlePageNext = useCallback((lastVisible) => {
        setState((prevState) => ({
            ...prevState,
            lastVisible
        }));
    }, []);


    const handleRowsPerPageChange = useCallback((event) => {
        setState((prevState) => ({
            ...prevState,
            rowsPerPage: parseInt(event.target.value, 10)
        }));
    }, []);

    return {
        handleFiltersChange,
        handlePageNext,
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
                const newProjects = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const lastVisible = response.docs[response.docs.length - 1] || null;

                setState(prevState => ({
                    projects: JSON.stringify(prevState.filters) === JSON.stringify(searchState.filters)
                        ? [...prevState.projects, ...newProjects]
                        : newProjects,
                    projectsCount: newProjects.length,
                    lastVisible,
                    filters: searchState.filters
                }));

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
        ...state
    };
};



const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getCategories({}));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return {
        categories,
        specialties
    }
};

const Page = () => {
        const projectsSearch = useProjectsSearch();
        const projectsStore = useProjectsStore(projectsSearch.state);
        const dictionary = useCategories();
        const [isFetching, setIsFetching] = useInfiniteScroll(() => {
            if (projectsStore.lastVisible)
                projectsSearch.handlePageNext(projectsStore.lastVisible);
            setIsFetching(false);
        });

        usePageView();

        return (
            <>
                <Seo title="Dashboard: Project Browse"/>
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
                                            <PlusIcon/>
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
                            sx={{mt: 4}}
                        >
                            <ProjectListSearch onFiltersChange={projectsSearch.handleFiltersChange}/>
                            {projectsStore && projectsStore.projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
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
