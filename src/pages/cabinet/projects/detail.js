import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Dialog,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography,
    useMediaQuery
} from '@mui/material';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import { BackLink, dashScopeSx, pillTabsSx, StatusPill, Surface } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
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
import { ProjectActivity } from "src/sections/customer/projects/detail/project-activity";
import { useAuth } from "src/hooks/use-auth";
import { ProjectChat } from "src/sections/customer/projects/detail/project-chats";
import { useSearchParams } from "src/hooks/use-search-params";
import useDictionary from "src/hooks/use-dictionaries";
import { projectService } from "src/service/project-service";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import { ERROR } from "src/libs/log";
import { ProjectStatus } from "src/enums/project-state";
import DonationCardUS from "src/components/stripe/donate-project-card";

const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Chats', value: 'chats' },
    { label: 'Activity', value: 'activity' },
    // {label: 'Team', value: 'team'},
    // {label: 'Assets', value: 'assets'}
];

const useProject = () => {
    const isMounted = useMounted();
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const { user } = useAuth();

    const handleProjectGet = useCallback(async () => {
        try {
            const projectGet = await projectsApi.getProjectById(projectId);
            projectGet.history = await projectsApi.getHistoryRecords(projectId);

            if (isMounted()) {
                setProject(projectGet);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
        if (!projectId) return;

        const docRef = doc(firestore, 'projects', projectId);
        const unsubscribe = onSnapshot(docRef, async (doc) => {
            if (doc.exists) {
                const updatedProject = { id: doc.id, ...doc.data() };
                updatedProject.history = await projectsApi.getHistoryRecords(projectId);

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

    return { project, isMy: project?.userId === user?.id };
};

const Page = () => {
    const { project, isMy } = useProject();
    const { categories, specialties, services } = useDictionary();
    const { user } = useAuth();
    const [currentTab, setCurrentTab] = useState('overview');
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    useEffect(() => {
        if (threadKey) {
            setCurrentTab("chats");
        }
    }, [threadKey]);

    const handleClose = useCallback(() => {
        setCurrentTab("overview");
    }, [])

    const createDate = project?.createdAt ? (isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate?.() || null) : null;


    const serviceLabel = projectService.getServiceLabel(project, services);

    return (
        <>
            <Seo title="Cabinet: Project Details" />
            <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, sm: 3 }, ...dashScopeSx }}>
                <BackLink href={paths.cabinet.projects.index}>All projects</BackLink>

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
                        <Box sx={{ mb: { xs: 3, md: 4 } }}>
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

                        <Tabs
                            onChange={handleTabsChange}
                            value={currentTab}
                            variant="scrollable"
                            scrollButtons={false}
                            aria-label="Project sections"
                            sx={{ ...pillTabsSx, mb: { xs: 3, md: 4 }, width: { sm: 'fit-content' } }}
                        >
                            {tabs.map((tab) => (
                                <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
                            ))}
                        </Tabs>

                        {currentTab === 'overview' && (
                            <>
                                {project.state === ProjectStatus.COMPLETED && <DonationCardUS />}
                                <ProjectOverview
                                    project={project}
                                    user={user}
                                    specialties={specialties}
                                    serviceLabel={serviceLabel}
                                    createDate={createDate}
                                />
                            </>
                        )}

                        {currentTab === 'activity' && (
                            <Surface>
                                <ProjectActivity activities={project.history || []} />
                            </Surface>
                        )}
                        <Dialog
                            fullWidth
                            fullScreen={!mdUp}
                            maxWidth="lg"
                            onClose={handleClose}
                            open={currentTab === 'chats'}
                            scroll="body"
                            PaperProps={{ sx: { borderRadius: { xs: 0, md: RADIUS.card }, boxShadow: SHADOW.lg, backgroundImage: 'none' } }}
                        >
                            <ProjectChat
                                threadKey={threadKey}
                                project={project}
                                user={user}
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
