import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import {
    Box,
    Button,
    CircularProgress,
    Container, Dialog,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography, useMediaQuery
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {ProjectOverview} from "src/sections/customer/projects/detail/project-overview";
import {projectsApi} from "src/api/projects";
import {useParams} from "react-router";
import {useDispatch, useSelector} from "src/store";
import {thunks} from "src/thunks/dictionary";
import ProjectStatusDisplay from "src/components/project-status-display";
import {formatDistanceToNow} from "date-fns";
import {isValidDate} from "src/utils/date-locale";
import {ProjectActivity} from "src/sections/customer/projects/detail/project-activity";
import {company} from "src/api/jobs/data";
import {useAuth} from "src/hooks/use-auth";
import {ProjectResponseStatus} from "src/enums/project-response-state";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {ProjectChat} from "src/sections/customer/projects/detail/project-chats";
import {useSearchParams} from "src/hooks/use-search-params";
import useDictionary from "src/hooks/use-dictionaries";
import {useRouter} from "src/hooks/use-router";
import {roles} from "src/roles";
import {ProjectSpecialistChat} from "src/sections/customer/projects/detail/project-specialist-chat";
import {INFO} from "src/libs/log";
import {navigateToCurrentWithParams} from "src/utils/navigate";
import {useNavigate} from "react-router-dom";
import {projectService} from "src/service/project-service";
import {ProjectStatus} from "src/enums/project-state";
import ProjectSpecialistStatusDisplay from "src/components/project-specialist-status-display";
import {ProjectSpecialistStatus} from "src/enums/project-specialist-state";

const tabs = [
    {label: 'Overview', value: 'overview'},
    {label: 'Chat', value: 'chat'},
];

const useProject = () => {
    const isMounted = useMounted();
    const {projectId} = useParams();
    const [project, setProject] = useState(null);
    const {user} = useAuth();

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
    const {project, isMy} = useProject();
    const {categories, specialties, services} = useDictionary();
    const {user} = useAuth();
    const [currentTab, setCurrentTab] = useState('overview');
    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;
    const rollback = searchParams.get('rollback') || false;
    const navigate = useNavigate();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

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


    const handleGoBack = () => {
        navigate(-1);
    };

    const getRollback = useCallback(() => {
        if (rollback) {
            navigate(paths.cabinet.projects.index + "?selectedRole=contractor");
        } else {
            navigate(paths.cabinet.projects.find.index);
        }
    }, [rollback]);

    const handleClose = () => {
        setCurrentTab("overview");
    }

    const createDate = project ? (isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate()) : "";


    const serviceLabel = projectService.getServiceLabel(project, services);

    return (
        <>
            <Seo title="Cabinet: Project Details"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1
                }}
            >
                <Container maxWidth="lg">
                    {rollback ?
                        <Link
                            color="text.primary"
                            sx={{
                                alignItems: 'center',
                                display: 'inline-flex',
                                mb: 2
                            }}
                            underline="hover"
                            onClick={(e) => {
                                e.preventDefault();
                                handleGoBack();
                            }}
                            style={{cursor: 'pointer'}}
                        >
                            <SvgIcon sx={{mr: 1}}>
                                <ArrowLeftIcon/>
                            </SvgIcon>
                            <Typography variant="subtitle2">
                                My projects
                            </Typography>
                        </Link>
                        :
                        <Link
                            color="text.primary"
                            component={RouterLink}
                            href={paths.cabinet.projects.find.index}
                            sx={{
                                alignItems: 'center',
                                display: 'inline-flex',
                                mb: 2
                            }}
                            underline="hover"
                        >
                            <SvgIcon sx={{mr: 1}}>
                                <ArrowLeftIcon/>
                            </SvgIcon>
                            <Typography variant="subtitle2">
                                Find projects
                            </Typography>
                        </Link>
                    }
                    {!project ?
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                flexGrow: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <CircularProgress/>
                            <Typography
                                color="text.secondary"
                                sx={{mt: 2}}
                                variant="subtitle1"
                            >
                                {"Loading info"}
                            </Typography>
                        </Box>
                        :

                        <>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={4}
                                sx={{mb: 3}}
                            >
                                <Stack spacing={1}>
                                    <Typography variant="h3">
                                        {project.title}
                                    </Typography>
                                    <Stack direction={"row"} spacing={1} alignItems={"center"}
                                           divider={<span>·</span>}>
                                        <Typography>{specialties.byId[project.specialtyId]?.label}</Typography>
                                        {serviceLabel !== project.title &&
                                            <Typography>{serviceLabel}</Typography>}
                                        {isMyResponded && project.state === ProjectStatus.PUBLISHED ?
                                            <ProjectSpecialistStatusDisplay status={ProjectSpecialistStatus.RESPONDED}/>
                                            :
                                            <ProjectStatusDisplay status={project.state}/>}
                                        <Typography
                                            variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={3}
                                >
                                    {isMy &&
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
                                    }
                                </Stack>
                            </Stack>

                            <Tabs
                                indicatorColor="primary"
                                onChange={handleTabsChange}
                                scrollButtons="auto"
                                // sx={{px: 3}}
                                textColor="primary"
                                value={currentTab}
                                variant="scrollable"
                            >
                                {tabs.map((tab) => (
                                    <Tab
                                        key={tab.value}
                                        label={tab.label}
                                        value={tab.value}
                                    />
                                ))}
                            </Tabs>
                            <Divider sx={{mb: 2}}/>

                            {currentTab === 'overview' &&
                                <ProjectOverview isMyResponded={isMyResponded} project={project} role={roles.WORKER}
                                                 user={user}/>

                            }

                            <Dialog
                                fullWidth
                                fullScreen={!smUp}
                                maxWidth="md"
                                onClose={handleClose}
                                open={currentTab === 'chat'}
                                scroll={"body"}
                            >
                                <ProjectSpecialistChat
                                    threadKey={threadKey}
                                    project={project}
                                    user={user}
                                    rollback={getRollback}
                                    onCloseDialog={handleClose}
                                />
                            </Dialog>

                        </>}
                </Container>
            </Box>
        </>
    );
};

export default Page;
