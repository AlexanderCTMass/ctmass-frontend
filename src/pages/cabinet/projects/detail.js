import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography
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

const tabs = [
    {label: 'Overview', value: 'overview'},
    {label: 'Responses', value: 'responses'},
    {label: 'Activity', value: 'activity'},
    // {label: 'Team', value: 'team'},
    // {label: 'Assets', value: 'assets'}
];

const useProject = () => {
    const isMounted = useMounted();
    const {projectId} = useParams();
    const [project, setProject] = useState(null);


    const handleProjectGet = useCallback(async () => {
        try {
            const projectGet = await projectsApi.getProjectById(projectId);
            projectGet.history = await projectsApi.getHistoryRecords(projectId);
            projectGet.responses = [...await projectsApi.getProjectResponses(projectId), ...company.reviews].filter((p) => p.state !== ProjectResponseStatus.REJECTED);

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
        []);

    return project;
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

    return {categories: dictionary.categories, specialties: dictionary.specialties};
};

const Page = () => {
    const project = useProject();
    const {categories, specialties} = useDictionary();
    const {user} = useAuth();
    const [currentTab, setCurrentTab] = useState('overview');

    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    useEffect(() => {
        if (threadKey) {
            setCurrentTab("responses");
        }
    }, [threadKey]);


    const createDate = project ? (isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate()) : "";


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
                                        <Typography>{specialties.byId[project.specialtyId]?.label}</Typography>
                                        <ProjectStatusDisplay status={project.state}/>
                                        <Typography
                                            variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={3}
                                >
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
                                <ProjectOverview project={project}/>

                            }

                            {currentTab === 'activity' && (

                                <ProjectActivity activities={project.history || []}/>

                            )}
                            {currentTab === 'responses' && (
                                /*<ProjectResponses
                                    responses={projects.responses || []}
                                    projects={projects}
                                    user={user}
                                />*/
                                <ProjectChat
                                    threadKey={threadKey}
                                    project={project}
                                    user={user}/>

                            )}
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
