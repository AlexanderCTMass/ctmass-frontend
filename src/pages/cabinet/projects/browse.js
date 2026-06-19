import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    SvgIcon,
    Typography, useMediaQuery, Tooltip, Backdrop
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BriefcaseIcon from '@untitled-ui/icons-react/build/esm/Briefcase02';
import UserIcon from '@untitled-ui/icons-react/build/esm/User01';
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
import { ProjectResponseStatus } from "src/enums/project-response-state";
import { projectService } from "src/service/project-service";
import { tradesApi } from "src/api/trades";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { PortfolioCreateModal } from "src/pages/dashboard/trades/view/modals/PortfolioCreateModal";
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
                        p.respondedSpecialists?.some(r =>
                            r.userId === searchState.filters.contractor.id &&
                            r.state !== ProjectResponseStatus.REJECTED
                        ) || false
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
    const [tradePickerOpen, setTradePickerOpen] = useState(false);
    const [trades, setTrades] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [selectedTradeId, setSelectedTradeId] = useState(null);
    const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
    const [submitPortfolio, setSubmitPortfolio] = useState(false);

    const { user } = useAuth();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));


    const elevate = useElevateComponent(64, 100);
    const navigate = useNavigate();

    const displayedProjects = useMemo(() => {
        const projects = projectsStore.state.projects;
        if (projectsSearch.state.filters.state === ProjectSpecialistStatus.RESPONDED) {
            return projects.filter(p =>
                p.respondedSpecialists?.some(r =>
                    r.userId === projectsSearch.state.filters.contractor?.id &&
                    r.state !== ProjectResponseStatus.REJECTED
                ) || false
            );
        }
        return projects;
    }, [projectsStore.state.projects, projectsSearch.state.filters]);

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

    const loadTrades = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoadingTrades(true);
            const userTrades = await tradesApi.getTradesByUser(user.id);
            setTrades(userTrades);
        } catch (e) {
            ERROR('Failed to load trades:', e);
            toast.error('Failed to load resumes');
        } finally {
            setLoadingTrades(false);
        }
    }, [user?.id]);

    const handleOpenTradePicker = useCallback(() => {
        setTradePickerOpen(true);
        loadTrades();
    }, [loadTrades]);

    const handleCloseTradePicker = useCallback(() => {
        setTradePickerOpen(false);
    }, []);

    const handleSelectTradeForPortfolio = useCallback((tradeId) => {
        setSelectedTradeId(tradeId);
        setTradePickerOpen(false);
        setPortfolioModalOpen(true);
    }, []);

    const handleClosePortfolioModal = useCallback(() => {
        setPortfolioModalOpen(false);
        setSelectedTradeId(null);
    }, []);

    const handleSubmitPortfolio = useCallback(async (values) => {
        if (!selectedTradeId || !user?.id) return;
        setSubmitPortfolio(true);
        try {
            const withUrl = (arr) =>
                (arr || []).map((f) => ({ ...f, url: f.url || f.preview }));
            const beforeImages = withUrl(values.beforeImages);
            const afterImages = withUrl(values.afterImages);
            const portfolioData = {
                title: values.title,
                date: values.date,
                specialtyId: values.specialtyId,
                shortDescription: values.shortDescription,
                location: values.location,
                tags: values.tags,
                tradeId: selectedTradeId,
                beforeImage: beforeImages[0]?.url || null,
                afterImage: afterImages[0]?.url || null,
                images: [...beforeImages, ...afterImages]
            };
            INFO('Adding portfolio from My Works', portfolioData);
            await extendedProfileApi.addPortfolio(user.id, portfolioData, true);
            toast.success('Portfolio added successfully');
            const targetTradeId = selectedTradeId;
            setPortfolioModalOpen(false);
            setSelectedTradeId(null);
            navigate(`${paths.dashboard.trades.view.replace(':tradeId', targetTradeId)}?tab=portfolio`);
        } catch (e) {
            ERROR(e);
            toast.error(e?.message || 'Failed to add portfolio');
        } finally {
            setSubmitPortfolio(false);
        }
    }, [selectedTradeId, user, navigate]);

    const activeTrades = useMemo(
        () => trades.filter((t) => t.status === 'active'),
        [trades]
    );


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
                    sx={{ py: 2 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={4}
                        sx={{ mb: 2 }}
                    >
                        <Stack spacing={{ xs: 1.5, sm: 1 }}>
                            <Stack direction="row" alignItems="center" rowGap={1} columnGap={1.5} flexWrap="wrap">
                                <Typography variant={mdUp ? "h3" : "h5"}>
                                    {projectsSearch.selectedRole === "customer" ? "My projects" : "My works on CTMASS"}
                                </Typography>
                                <Chip
                                    icon={
                                        <SvgIcon sx={{ fontSize: '16px !important' }}>
                                            {projectsSearch.selectedRole === "customer" ? <UserIcon /> : <BriefcaseIcon />}
                                        </SvgIcon>
                                    }
                                    label={
                                        projectsSearch.selectedRole === "customer"
                                            ? "Viewing as Customer"
                                            : "Viewing as Contractor"
                                    }
                                    size="small"
                                    sx={{
                                        height: 26,
                                        fontWeight: 600,
                                        backgroundColor: projectsSearch.selectedRole === "customer"
                                            ? alpha('#2e7d32', 0.12)
                                            : alpha('#1565c0', 0.12),
                                        color: projectsSearch.selectedRole === "customer"
                                            ? '#2e7d32'
                                            : '#1565c0',
                                        border: '1px solid',
                                        borderColor: projectsSearch.selectedRole === "customer"
                                            ? alpha('#2e7d32', 0.3)
                                            : alpha('#1565c0', 0.3),
                                        '& .MuiChip-icon': {
                                            color: 'inherit',
                                            ml: '6px',
                                        },
                                    }}
                                />
                            </Stack>
                            <Typography variant={"subtitle2"}>
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
                                            onClick={handleOpenTradePicker}
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
                        loading={projectsStore.loading}
                    />
                </Container>
                <Container
                    maxWidth="lg">
                    <Stack
                        spacing={4}
                        sx={{ mt: 4 }}
                    >
                        {projectsStore.loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box> :
                            (displayedProjects.length > 0) ?
                                displayedProjects.map((project) => (
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
                                        hideMobileActions={projectsSearch.selectedRole === "contractor"}
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
                    </Stack>
                </Container>
            </Box>

            <Dialog
                open={tradePickerOpen}
                onClose={handleCloseTradePicker}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Select Resume</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Choose which resume this portfolio project should be added to.
                    </Typography>
                    {loadingTrades ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : trades.length === 0 ? (
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                You don't have any resumes yet. Create one to start building your portfolio.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleCloseTradePicker();
                                    navigate(paths.dashboard.trades.create);
                                }}
                            >
                                Create resume
                            </Button>
                        </Box>
                    ) : activeTrades.length === 0 ? (
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                You have resumes, but none of them are currently active.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleCloseTradePicker();
                                    navigate(paths.dashboard.trades.index);
                                }}
                            >
                                View Resumes
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {activeTrades.map((trade) => (
                                <ListItem key={trade.id} disablePadding>
                                    <ListItemButton onClick={() => handleSelectTradeForPortfolio(trade.id)}>
                                        <ListItemText
                                            primary={trade.title}
                                            secondary={trade.subtitle || trade.primarySpecialtyLabel}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTradePicker}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {portfolioModalOpen && selectedTradeId && (
                <PortfolioCreateModal
                    open={portfolioModalOpen}
                    onClose={handleClosePortfolioModal}
                    onSubmit={handleSubmitPortfolio}
                    profile={user}
                    tradeId={selectedTradeId}
                    currentPortfolio={{}}
                    isEditMode={false}
                />
            )}

            <Fab
                variant="extended"
                size="small"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{
                    position: 'fixed',
                    top: { xs: 86, md: 90 },
                    left: '50%',
                    transform: elevate ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.85)',
                    bgcolor: '#16B364',
                    color: '#fff',
                    '&:hover': { bgcolor: '#13A058' },
                    opacity: elevate ? 1 : 0,
                    pointerEvents: elevate ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease, transform 0.25s ease',
                    zIndex: 1200,
                    boxShadow: 3,
                    px: 2,
                    height: 32,
                    minHeight: 'unset',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    gap: 0.5,
                    whiteSpace: 'nowrap',
                }}
            >
                <KeyboardArrowUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                Back to top
            </Fab>
        </>
    );
}
    ;

export default Page;
