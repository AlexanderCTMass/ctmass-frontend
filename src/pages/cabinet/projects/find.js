import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import { btn, dashScopeSx, EmptyState } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, displayTitleSx } from 'src/theme/ctmass-tokens';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { useMounted } from "../../../hooks/use-mounted";
import { projectsApi } from "src/api/projects";
import { useAuth } from "../../../hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import { useDispatch, useSelector } from "../../../store";
import { thunks } from "../../../thunks/dictionary";
import { ProjectListSearch } from "../../../sections/dashboard/project/search/project-list-search";
import { ProjectCard } from "src/components/projects/project-card";
import { ProjectStatus } from "src/enums/project-state";
import { INFO } from "src/libs/log";
import { profileApi } from "src/api/profile";
import useDictionary from "src/hooks/use-dictionaries";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import * as turf from "@turf/turf";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";
import { projectService } from "src/service/project-service";

const useProjectsSearch = () => {
    const { user } = useAuth();

    const [state, setState] = useState({
        filters: {
            customer: undefined,
            specialist: user?.id,
            showNotInterested: false,
            specialties: [],
            categories: [],
            state: ProjectStatus.PUBLISHED,
            regionFilter: undefined,
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
                let newProjects = response.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                INFO("New project list", newProjects);
                const lastVisible = newProjects[newProjects.length - 1] || null;


                newProjects = newProjects.filter(p =>
                    !(p.respondedSpecialists?.some(r => r.userId === searchState.filters.specialist) || false)
                )

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
    const { specialties, services } = useDictionary();
    const [isFetching, setIsFetching] = useInfiniteScroll(() => {
        if (projectsStore.lastVisible)
            projectsSearch.handlePageNext(projectsStore.lastVisible);
        setIsFetching(false);
    });
    const { user } = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));


    useEffect(() => {
        if (defaultInitialized) {
            projectsStore.handleProjectsGet();
        }
    }, [projectsSearch.state, defaultInitialized]);

    const handleDefaultFiltersInitialized = useCallback((value) => {
        setDefaultInitialized(value);
    }, []);

    usePageView();

    return (
        <>
            <Seo title="Find projects" />
            <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, sm: 3 }, ...dashScopeSx }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'stretch', md: 'flex-end' }}
                    justifyContent="space-between"
                    sx={{ gap: { xs: 2.5, md: 4 }, mb: { xs: 3, md: 4 } }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 30, sm: 38, md: 46 } }}>
                            Find projects
                        </Typography>
                        <Typography sx={{ mt: { xs: 1, md: 1.5 }, maxWidth: 620, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, fontWeight: 500, lineHeight: 1.55 }}>
                            Homeowners near you who need your trade. Respond to the ones that fit and start a conversation.
                        </Typography>
                    </Box>
                    <Button component={RouterLink} href={paths.cabinet.projects.contractor} sx={{ ...btn.outline, minHeight: 50, px: 3, flexShrink: 0 }}>
                        My works
                    </Button>
                </Stack>

                <Box sx={{ position: 'sticky', top: { xs: 84, md: 96 }, zIndex: 2, pb: 2 }}>
                    <ProjectListSearch
                        onFiltersChange={projectsSearch?.handleFiltersChange}
                        onDefaultFiltersInitialized={handleDefaultFiltersInitialized}
                        filters={projectsSearch.state.filters}
                        projectsCount={projectsStore?.state?.projects?.length || 0}
                    />
                </Box>

                <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ mt: 1 }}>
                    {!defaultInitialized ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} variant="rounded" sx={{ height: { xs: 220, md: 180 }, borderRadius: RADIUS.card }} />
                        ))
                    ) : projectsStore.state?.projects?.length ? (
                        projectsStore.state.projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                specialty={specialties.byId[project.specialtyId]}
                                serviceLabel={projectService.getServiceLabel(project, services)}
                                role={"contractor"}
                                user={user}
                                onProjectListChanged={projectsSearch.handleSetRemoved}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon={<ManageSearchRoundedIcon />}
                            title="No projects match right now"
                            text="Try a wider area or another specialty. New projects show up here as homeowners post them."
                        />
                    )}
                </Stack>
            </Box>
        </>
    );
}
    ;

export default Page;
