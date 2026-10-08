import { useCallback, useEffect, useState } from 'react';
import ShareIcon from '@mui/icons-material/LinkRounded';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import {
    Box,
    Button,
    Dialog,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography,
    useMediaQuery
} from '@mui/material';
import { BackLink, btn, dashScopeSx, pillTabsSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { ProjectOverview } from "src/sections/customer/projects/detail/project-overview";
import { projectsApi } from "src/api/projects";
import { useParams } from "react-router";
import ProjectStatusDisplay from "src/components/project-status-display";
import { formatDistanceToNow } from "date-fns";
import { isValidDate } from "src/utils/date-locale";
import { useAuth } from "src/hooks/use-auth";
import { ProjectChat } from "src/sections/customer/projects/detail/project-chats";
import { useSearchParams } from "src/hooks/use-search-params";
import useDictionary from "src/hooks/use-dictionaries";
import { roles } from "src/roles";
import { ProjectSpecialistChat } from "src/sections/customer/projects/detail/project-specialist-chat";
import { ERROR, INFO } from "src/libs/log";
import { navigateToCurrentWithParams } from "src/utils/navigate";
import { useNavigate } from "react-router-dom";
import { projectService } from "src/service/project-service";
import { ProjectStatus } from "src/enums/project-state";
import ProjectSpecialistStatusDisplay from "src/components/project-specialist-status-display";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";
import { firestore } from "src/libs/firebase";
import toast from "react-hot-toast";
import { collection, doc, onSnapshot } from "firebase/firestore";
import DonationCardUS from "src/components/stripe/donate-project-card";

const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Chat', value: 'chat' },
];

const useProject = () => {
    const isMounted = useMounted();
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const { user } = useAuth();

    const handleProjectGet = useCallback(async () => {
        try {
            const projectGet = await projectsApi.getProjectById(projectId);

            if (isMounted()) {
                setProject(projectGet);
            }
        } catch (err) {
            ERROR(err);
            throw err;
        }
    }, [isMounted]);

    useEffect(() => {
        if (!projectId) return;

        const docRef = doc(firestore, 'projects', projectId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists) {
                const updatedProject = { id: doc.id, ...doc.data() };

                if (isMounted()) {
                    setProject(updatedProject);
                }
            }
        },
            (err) => {
                ERROR(err);
                throw err;
            });

        return () => unsubscribe();
    }, [projectId, isMounted]);

    useEffect(() => {
        handleProjectGet();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [projectId]);

    return {
        project,
        isMy: project?.userId === user?.id
    };
};


const Page = () => {
    const { project, isMy } = useProject();
    const { categories, specialties, services } = useDictionary();
    const { user } = useAuth();
    const [currentTab, setCurrentTab] = useState('overview');
    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;
    const rollback = searchParams.get('rollback') || false;
    const navigate = useNavigate();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    usePageView();

    const isMyResponded = Boolean(threadKey || projectService.getRespondedChatId(project, user));

    const handleTabsChange = useCallback((event, value) => {
        if (value === "chat" && !threadKey) {
            if (project) {
                let threadKey = project.respondedSpecialists?.find(r => r.userId === user?.id)?.threadId || undefined;
                if (threadKey) {
                    navigateToCurrentWithParams(navigate, "threadKey", threadKey);
                }
            }
        } else {
            setCurrentTab(value);
        }
    }, [project, threadKey]);

    useEffect(() => {
        if (threadKey) {
            setCurrentTab("chat");
        }
    }, [threadKey]);


    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const getRollback = useCallback(() => {
        if (rollback) {
            navigate(paths.cabinet.projects.index + "?selectedRole=contractor");
        } else {
            navigate(paths.cabinet.projects.find.index);
        }
    }, [rollback]);

    const handleClose = useCallback(() => {
        setCurrentTab("overview");
    }, []);

    const handleOpenChat = useCallback(() => {
        if (threadKey) {
            setCurrentTab("chat");
        } else if (project) {
            const foundThreadKey = project.respondedSpecialists?.find(r => r.userId === user?.id)?.threadId;
            if (foundThreadKey) {
                navigateToCurrentWithParams(navigate, "threadKey", foundThreadKey);
            }
        }
    }, [threadKey, project, user?.id, navigate]);

    const createDate = project?.createdAt ? (isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate?.() || null) : null;

    const serviceLabel = projectService.getServiceLabel(project, services);

    return (
        <>
            <Seo title="Cabinet: Project Details" />
            <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, sm: 3 }, ...dashScopeSx }}>
                {rollback
                    ? <BackLink onClick={handleGoBack}>My projects</BackLink>
                    : <BackLink href={paths.cabinet.projects.find.index}>Find projects</BackLink>}

                {!project ? (
                    <Stack spacing={3}>
                        <Skeleton variant="rounded" height={64} sx={{ maxWidth: 560, borderRadius: RADIUS.inner }} />
                        <Skeleton variant="rounded" height={48} sx={{ maxWidth: 380, borderRadius: RADIUS.pill }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 3 }}>
                            <Skeleton variant="rounded" height={320} sx={{ borderRadius: RADIUS.card }} />
                            <Skeleton variant="rounded" height={320} sx={{ borderRadius: RADIUS.card }} />
                        </Box>
                    </Stack>
                ) : (
                    <>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            alignItems={{ xs: 'stretch', md: 'flex-end' }}
                            justifyContent="space-between"
                            sx={{ gap: 2.5, mb: { xs: 3, md: 4 } }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 30, sm: 38, md: 46 }, overflowWrap: 'anywhere' }}>
                                    {project.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 1.5, columnGap: 1, rowGap: 1 }}>
                                    <ProjectStatusDisplay status={project.state} />
                                    {specialties.byId[project.specialtyId]?.label && (
                                        <StatusPill tone="navy" icon={<HandymanOutlinedIcon />}>
                                            {specialties.byId[project.specialtyId]?.label}
                                        </StatusPill>
                                    )}
                                    {serviceLabel && serviceLabel !== project.title && (
                                        <StatusPill tone="navy">{serviceLabel}</StatusPill>
                                    )}
                                    {createDate && (
                                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: BRAND.muted }}>
                                            Posted {formatDistanceToNow(createDate, { addSuffix: true })}
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                {isMy && (
                                    <Button component={RouterLink} href={paths.cabinet.projects.create} sx={btn.soft}>
                                        Find a specialist
                                    </Button>
                                )}
                                <Button
                                    startIcon={<ShareIcon />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Link copied');
                                    }}
                                    sx={btn.outline}
                                >
                                    Copy link
                                </Button>
                            </Stack>
                        </Stack>

                        {tabs.filter((tab) => tab.value !== 'chat' || isMyResponded).length > 1 && (
                            <Tabs
                                onChange={handleTabsChange}
                                value={currentTab}
                                variant="scrollable"
                                scrollButtons={false}
                                aria-label="Project sections"
                                sx={{ ...pillTabsSx, mb: { xs: 3, md: 4 }, width: { sm: 'fit-content' } }}
                            >
                                {tabs.filter((tab) => tab.value !== 'chat' || isMyResponded).map((tab) => (
                                    <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
                                ))}
                            </Tabs>
                        )}

                        {currentTab === 'overview' && (
                            <>
                                {project.state === ProjectStatus.COMPLETED && <DonationCardUS />}
                                <ProjectOverview
                                    isMyResponded={isMyResponded}
                                    project={project}
                                    role={roles.WORKER}
                                    user={user}
                                    specialties={specialties}
                                    serviceLabel={serviceLabel}
                                    createDate={createDate}
                                    onOpenChat={handleOpenChat}
                                />
                            </>
                        )}

                        <Dialog
                            fullWidth
                            fullScreen={!mdUp}
                            maxWidth="lg"
                            onClose={handleClose}
                            open={currentTab === 'chat'}
                            scroll="body"
                            PaperProps={{ sx: { borderRadius: { xs: 0, md: RADIUS.card }, boxShadow: SHADOW.lg, backgroundImage: 'none' } }}
                        >
                            <ProjectSpecialistChat
                                threadKey={threadKey}
                                project={project}
                                user={user}
                                rollback={getRollback}
                                onCloseDialog={handleClose}
                            />
                        </Dialog>
                    </>
                )}
            </Box>
        </>
    );
};

export default Page;
