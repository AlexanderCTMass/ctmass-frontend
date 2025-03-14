import React, {useCallback, useEffect, useState} from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {Box, Button, CircularProgress, Container, Divider, IconButton, Stack, SvgIcon, Typography} from '@mui/material';
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
import {ProjectListSearch} from "../../../sections/dashboard/project/search/project-list-search";
import {ProjectCard} from "src/components/projects/project-card";
import {ProjectStatus} from "src/enums/project-state";
import {INFO} from "src/libs/log";
import {profileApi} from "src/api/profile";
import useDictionary from "src/hooks/use-dictionaries";
import {useUpdateEffect} from "src/hooks/use-update-effect";
import * as turf from "@turf/turf";

const useProjectsSearch = () => {
    const {user} = useAuth();

    const [state, setState] = useState({
        filters: {
            customer: undefined,
            specialist: user?.id,
            specialties: [],
            categories: [],
            state: ProjectStatus.PUBLISHED,
            regionFilter: undefined,
            showNotInterested: false,
            notShowMy: true

        },
        page: 0,
        rowsPerPage: 20,
        lastVisible: null,
        removedProjects: []
    });

    const handleFiltersChange = useCallback((newFilters) => {
        INFO("Filters change. New filters:", newFilters);
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
            page: 0,
            lastVisible: null,
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
                let newProjects = response.docs.map((doc) => ({id: doc.id, ...doc.data()}));
                INFO("New project list", newProjects);
                const lastVisible = newProjects[newProjects.length - 1] || null;

                if (searchState.filters.regionFilter && searchState.filters.regionFilter.isochronePolygon) {
                    const bbox = turf.bbox(searchState.filters.regionFilter.isochronePolygon);
                    newProjects = newProjects.filter(p => {
                        return p.location.center[0] >= bbox[0] && p.location.center[0] <= bbox[2] &&
                            p.location.center[1] >= bbox[1] && p.location.center[1] <= bbox[3];
                    })
                }
                if (!searchState.filters.showNotInterested && searchState.filters.specialist) {
                    newProjects = newProjects.filter(p => !p.uninterestedSpecialists?.includes(searchState.filters.specialist) || false);
                }
                INFO("Filtered for region project list", newProjects);
                setState(prevState => {
                    let newState;
                    const prevF = JSON.stringify(prevState.filters);
                    const newF = JSON.stringify(searchState.filters);
                    if (prevF !== newF) {
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

                    return newState;
                });

                console.log("Updated state:", state);
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    }, [searchState, isMounted]);

    return {
        state,
        handleProjectsGet
    };
};


const Page = () => {
        const projectsSearch = useProjectsSearch();
        const [defaultInitialized, setDefaultInitialized] = useState(false);
        const projectsStore = useProjectsStore(projectsSearch.state);
        const {specialties} = useDictionary();
        const [isFetching, setIsFetching] = useInfiniteScroll(() => {
            if (projectsStore.lastVisible)
                projectsSearch.handlePageNext(projectsStore.lastVisible);
            setIsFetching(false);
        });
        const {user} = useAuth();


        useEffect(() => {
            if (defaultInitialized) {
                projectsStore.handleProjectsGet();
            }
        }, [projectsSearch.state, defaultInitialized]);

        const handleDefaultFiltersInitialized = (value) => {
            setDefaultInitialized(value);
        };

        usePageView();

        return (
            <>
                <Seo title="Cabinet: Project Find & Respond"/>
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
                                    Find and respond to the work
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={3}
                            >
                                <Button
                                    component={RouterLink}
                                    href={paths.cabinet.profiles.my.index}
                                    variant="text"
                                >
                                    My profile
                                </Button>
                            </Stack>
                        </Stack>
                        <Stack
                            spacing={4}
                            sx={{mt: 4}}
                        >
                            <Box
                                sx={{
                                    position: 'sticky',
                                    top: '100px', // Расстояние от верхнего края
                                    zIndex: 1, // Убедитесь, что компонент находится поверх других элементов
                                    paddingBottom: 2, // Отступ снизу для визуального разделения
                                }}
                            >
                                <ProjectListSearch
                                    onFiltersChange={projectsSearch?.handleFiltersChange}
                                    onDefaultFiltersInitialized={handleDefaultFiltersInitialized}
                                    filters={projectsSearch.state.filters}
                                    projectsCount={projectsStore?.state?.projects?.length || 0}
                                />
                            </Box>

                            {!defaultInitialized ? (
                                <CircularProgress color={"inherit"}/>
                            ) : (
                                <>
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
                                                <ChevronRightIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    </Container>
                </Box>
            </>
        );
    }
;

export default Page;
