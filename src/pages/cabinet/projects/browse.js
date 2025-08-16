import { useCallback, useEffect, useState } from 'react';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    Stack,
    SvgIcon,
    Typography, useMediaQuery, Tooltip, Backdrop
} from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useMounted } from "src/hooks/use-mounted";
import { projectsApi } from "src/api/projects";
import { useAuth } from "src/hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import { ProjectListTabs } from "src/sections/customer/projects/projects-list-tabs";
import { ProjectCard } from "src/components/projects/project-card";
import { ProjectStatus } from "src/enums/project-state";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import useDictionary from "src/hooks/use-dictionaries";
import useElevateComponent from "src/hooks/use-elevate-component";
import { alpha } from "@mui/material/styles";
import { roles } from "src/roles";
import { useSearchParams } from "src/hooks/use-search-params";
import { navigateToCurrentWithParams } from "src/utils/navigate";
import { useNavigate } from "react-router-dom";
import { ERROR, INFO } from "src/libs/log";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";
import { projectService } from "src/service/project-service";
import { projectFlow } from "src/flows/project/project-flow";
import { ProjectWithReviewRequestDialog } from "src/components/project-with-review-request-dialog";
import toast from "react-hot-toast";

const useProjectsSearch = () => {
    const { user } = useAuth();
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
    const [loading, setLoading] = useState(false);

    const handleProjectsGet = useCallback(async () => {
        try {
            setLoading(true);
            const response = await projectsApi.getProjects(searchState);

            if (isMounted()) {
                let newProjects = response.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }));
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
        } finally {
            setLoading(false);
        }
    }, [searchState, isMounted]);

    useEffect(() => {
        handleProjectsGet();
    }, [handleProjectsGet]);

    return {
        state,
        handleProjectsGet,
        loading
    };
};

const Page = () => {
    const projectsSearch = useProjectsSearch();
    const projectsStore = useProjectsStore(projectsSearch.state);
    const { categories, specialties, services } = useDictionary();
    const [isFetching, setIsFetching] = useInfiniteScroll(() => {
        if (projectsStore.state.lastVisible)
            projectsSearch.handlePageNext(projectsStore.state.lastVisible);
        setIsFetching(false);
    });
    const [addPortfolioDialogOpen, setAddPortfolioDialogOpen] = useState(false);
    const [submitPortfolio, setSubmitPortfolio] = useState(false);
    const [newPortfolioProject, setNewPortfolioProject] = useState({
        email: '',
        message: ''
    });

    const { user } = useAuth();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));


    const elevate = useElevateComponent(64, 100);
    const navigate = useNavigate();

    const updateProjectList = async () => {
        projectsStore.state.projects = [];
        await projectsStore.handleProjectsGet();
    }

    useEffect(() => {
        if (user.role !== roles.WORKER && projectsSearch.selectedRole === "contractor") {
            handleSelectRole("customer");
            return;
        }

        projectsSearch.handleFiltersChange({
            customer: projectsSearch.selectedRole === "customer" ? user : undefined,
            contractor: projectsSearch.selectedRole === "contractor" ? user : undefined,
        });
    }, [projectsSearch.selectedRole]);

    usePageView();

    const handleSelectRole = (role) => {
        navigateToCurrentWithParams(navigate, "selectedRole", role);
    };

    const resetAddPortfolioDialogState = () => {
        setAddPortfolioDialogOpen(false);
        setNewPortfolioProject({
            email: '',
            message: ''
        });
    };

    const handleSubmitAddPortfolio = useCallback(async (request) => {
        INFO("handleSubmitRequest", request)
        setSubmitPortfolio(true);
        try {
            const project = {
                addToPortfolio: true,
                projectName: request.projectName,
                projectDate: request.date,
                projectDescription: request.projectDescription,
                specialtyId: request.specialty,
                files: request.files?.map(f => ({ url: f.preview, description: f.description || "" })) || [],
                location: request.location || ''
            };
            INFO("handleOnNext", request, project);
            await projectFlow.sendReviewRequestPastClients(user.id, user.name, user.email, project, request.email, request.message);
            toast.success("Request successfully sent!");

            navigate(paths.cabinet.profiles.my.index);
        } catch (e) {
            ERROR(e);
            toast.error(e.message);
        } finally {
            setSubmitPortfolio(false);
        }

    }, [newPortfolioProject]);


    if (submitPortfolio) {
        return (<>
            <Backdrop open={true} />
            <CircularProgress />
        </>)

    }

    return (
        <>
            <Seo title="Cabinet: My projects" />
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
                        sx={{ mb: elevate ? 0 : 2 }}
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
                                {projectsSearch.selectedRole === "customer" ? "My projects" : "My works on CTMASS"}
                            </Typography>
                            <Typography variant={"subtitle2"} sx={{
                                transition: (theme) => theme.transitions.create('all', {
                                    easing: theme.transitions.easing.easeInOut,
                                    duration: 200
                                }),
                                ...(elevate && {
                                    fontSize: "12px !important"
                                })
                            }}>
                                {projectsSearch.selectedRole === "customer" ? "Here are the projects you’ve posted to find contractors. Manage active listings, track bids, or create new projects."
                                    : "These are projects you’ve been hired for. Update progress, communicate with customers, or manage deliverables."}
                            </Typography>
                        </Stack>
                        {/* {user.role === roles.WORKER &&
                                <ButtonGroup
                                    size={elevate ? "small" : (mdUp ? "medium" : "small")}
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
                                </ButtonGroup>}*/}
                        {mdUp &&
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={3}
                            >
                                {projectsSearch.selectedRole === "customer" &&
                                    <Button
                                        component={RouterLink}
                                        href={paths.cabinet.projects.create}
                                        startIcon={(
                                            <SvgIcon>
                                                <PlusIcon />
                                            </SvgIcon>
                                        )}
                                        variant="text"
                                    >
                                        Find contractor
                                    </Button>}
                                {projectsSearch.selectedRole === "contractor" &&
                                    <Tooltip
                                        title="This project will appear in your public portfolio for clients to see.">
                                        <Button
                                            startIcon={(
                                                <SvgIcon>
                                                    <PlusIcon />
                                                </SvgIcon>
                                            )}
                                            variant="text"
                                            onClick={() => {
                                                setAddPortfolioDialogOpen(true);
                                            }}
                                        >
                                            Add portfolio project
                                        </Button>
                                    </Tooltip>
                                }
                            </Stack>}
                    </Stack>

                    <ProjectListTabs
                        projectsCount={projectsStore.state.projectsCount}
                        onFiltersChange={projectsSearch.handleFiltersChange}
                        role={projectsSearch.selectedRole}
                    />
                </Container>
                <Container
                    maxWidth="lg">
                    <Stack
                        spacing={4}
                        sx={{ mt: 4 }}
                    >
                        {projectsStore.loading ? <CircularProgress /> :
                            (projectsStore.state && projectsStore.state.projects.length > 0) ?
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
                                        sx={{ mt: 2 }}
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
                                    <ChevronRightIcon />
                                </SvgIcon>
                            </IconButton>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <ProjectWithReviewRequestDialog
                open={addPortfolioDialogOpen}
                onClose={resetAddPortfolioDialogState}
                onSubmit={handleSubmitAddPortfolio}
                currentRequest={newPortfolioProject}
                setCurrentRequest={() => {
                }}
                isEditMode={false}
                profile={user}
                existingRequests={[]}
            />
        </>
    );
}
    ;

export default Page;
