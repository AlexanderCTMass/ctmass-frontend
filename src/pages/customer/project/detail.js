import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {jobsApi} from 'src/api/jobs';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {ProjectOverview} from "src/sections/customer/projects/detail/project-overview";
import {ProjectSummary} from "src/sections/customer/projects/detail/project-summary";
import {projectsApi} from "src/api/projects";
import {useParams} from "react-router";
import {useDispatch, useSelector} from "src/store";
import {thunks} from "src/thunks/dictionary";
import ProjectStatusDisplay from "src/components/project-status-display";
import {formatDistanceToNow} from "date-fns";
import {isValidDate} from "src/utils/date-locale";
import {ProjectInnerSummary} from "src/sections/customer/projects/detail/project-inner-summary";
import {ProjectResponses} from "src/sections/customer/projects/detail/project-responses";
import {ProjectActivity} from "src/sections/customer/projects/detail/project-activity";

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
            const response = await jobsApi.getCompany();
            const projectGet = await projectsApi.getProjectById(projectId);
            projectGet.history = await projectsApi.getHistoryRecords(projectId);
            response.project = projectGet;

            if (isMounted()) {
                setProject(response);
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

    const [currentTab, setCurrentTab] = useState('overview');

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    if (!project) {
        return null;
    }
    const createDate = isValidDate(project.project.createdAt) ? new Date(project.project.createdAt) : project.project.createdAt.toDate();

    return (
        <>
            <Seo title="Dashboard: Project Details"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1
                }}
            >
                <Container maxWidth="lg">
                    <Grid
                        container
                        spacing={4}
                    >
                        <Grid xs={12}>
                            <div>
                                <Link
                                    color="text.primary"
                                    component={RouterLink}
                                    href={paths.customer.projects.index}
                                    sx={{
                                        alignItems: 'center',
                                        display: 'inline-flex'
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
                            </div>
                        </Grid>
                        <Grid
                            xs={12}
                            lg={8}
                        >
                            <Card>
                                <CardHeader
                                    disableTypography
                                    title={(
                                        <Stack spacing={2}>
                                            <Stack direction={"row"} spacing={1} alignItems={"center"}
                                                   divider={<span>·</span>}>
                                                <Typography>{specialties.byId[project.project.specialtyId]?.label}</Typography>
                                                <ProjectStatusDisplay status={project.project.state}/>
                                                <Typography
                                                    variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                                            </Stack>

                                            <Link
                                                color="text.primary"
                                                variant="h5"
                                                underline={"none"}
                                            >
                                                {project.project.title}
                                            </Link>

                                        </Stack>
                                    )}
                                />
                                <Divider/>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={handleTabsChange}
                                    scrollButtons="auto"
                                    sx={{px: 3}}
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
                                <Divider/>
                                <CardContent>
                                    {currentTab === 'overview' && <ProjectOverview project={project}/>}
                                    {currentTab === 'responses' && (
                                        <ProjectResponses
                                            responses={project.reviews || []}
                                        />
                                    )}

                                    {currentTab === 'activity' && (
                                        <ProjectActivity activities={project.project.history || []}/>
                                    )}

                                    {/*
                                    {currentTab === 'team' && <ProjectTeam members={project.members || []} />}
                                    {currentTab === 'assets' && <ProjectAssets assets={project.assets || []} />}*/}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid
                            xs={12}
                            lg={4}
                        >
                            <ProjectSummary project={project}/>
                            <ProjectInnerSummary project={project} sx={{mt: 4}}/>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;
