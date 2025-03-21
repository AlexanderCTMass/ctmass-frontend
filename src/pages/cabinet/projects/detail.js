import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
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
import {projectService} from "src/service/project-service";
import {doc, onSnapshot} from "firebase/firestore";
import {firestore} from "src/libs/firebase";
import {ERROR} from "src/libs/log";

const tabs = [
    {label: 'Overview', value: 'overview'},
    {label: 'Chats', value: 'chats'},
    {label: 'Activity', value: 'activity'},
    // {label: 'Team', value: 'team'},
    // {label: 'Assets', value: 'assets'}
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
        if (!projectId) return;

        const docRef = doc(firestore, 'projects', projectId);
        const unsubscribe = onSnapshot(docRef, async (doc) => {
                if (doc.exists) {
                    const updatedProject = {id: doc.id, ...doc.data()};
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

    return {project, isMy: project?.userId === user?.id};
};

const Page = () => {
    const {project, isMy} = useProject();
    const {categories, specialties, services} = useDictionary();
    const {user} = useAuth();
    const [currentTab, setCurrentTab] = useState('overview');
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;
    const rootRef = useRef(null);

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    useEffect(() => {
        if (threadKey) {
            setCurrentTab("chats");
        }
    }, [threadKey]);

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
                    <Link
                        color="text.primary"
                        component={RouterLink}
                        href={paths.cabinet.projects.index}
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
                            All projects
                        </Typography>
                    </Link>

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
                                        <Typography
                                            variant={smUp ? "body1" : "caption"}>{specialties.byId[project.specialtyId]?.label}</Typography>
                                        {serviceLabel !== project.title &&
                                            <Typography
                                                variant={smUp ? "body1" : "caption"}>{serviceLabel}</Typography>}
                                        {smUp &&
                                            <ProjectStatusDisplay status={project.state}/>}
                                        {smUp && <Typography
                                            variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                                        }
                                    </Stack>
                                    {!smUp &&
                                        <Stack direction={"row"} spacing={1} alignItems={"center"}
                                               divider={<span>·</span>}>
                                            <ProjectStatusDisplay status={project.state}
                                                                  size={"small"}/>
                                            <Typography
                                                variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                                        </Stack>
                                    }
                                </Stack>
                                {/*<Stack
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
                                </Stack>*/}
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
                                <ProjectOverview project={project} user={user} specialties={specialties}
                                                 serviceLabel={serviceLabel} createDate={createDate}/>

                            }

                            {currentTab === 'activity' && (

                                <ProjectActivity activities={project.history || []}/>

                            )}
                            <Dialog
                                fullWidth
                                fullScreen={!mdUp}
                                maxWidth="lg"
                                onClose={handleClose}
                                open={currentTab === 'chats'}
                                scroll={"body"}
                            >
                                <ProjectChat
                                    threadKey={threadKey}
                                    project={project}
                                    user={user}
                                    onCloseDialog={handleClose}
                                />

                            </Dialog>
                            {/*<ProjectSummary projects={projects}/>*/}
                            {/*<ProjectInnerSummary projects={projects} sx={{mt: 4}}/>*/}
                            {/*
                                    {currentTab === 'team' && <ProjectTeam members={projects.members || []} />}
                                    {currentTab === 'assets' && <ProjectAssets assets={projects.assets || []} />}*/}
                        </>}
                </Container>
            </Box>
        </>
    );
};

export default Page;
