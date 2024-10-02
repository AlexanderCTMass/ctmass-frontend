import {useCallback, useEffect, useState} from 'react';
import ChevronLeftIcon from '@untitled-ui/icons-react/build/esm/ChevronLeft';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import {Box, Button, Container, IconButton, Stack, SvgIcon, Typography} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {JobCard} from 'src/sections/dashboard/jobs/job-card';
import {JobListSearch} from 'src/sections/dashboard/jobs/job-list-search';
import {collection, getDocs} from "firebase/firestore";
import {firestore} from "../../../libs/firebase";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {useMounted} from "../../../hooks/use-mounted";
import {jobsApi} from "src/api/jobs";
import {useAuth} from "../../../hooks/use-auth";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll";
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";

const useJobsSearch = () => {
    const {user} = useAuth();

    const [state, setState] = useState({
        filters: {
            specialty: user &&  user.specialties ? user.specialties.map((spec) => spec.id) : []
        },
        page: 0,
        rowsPerPage: 2,
    });

    const handleFiltersChange = useCallback((filters) => {
        setState((prevState) => ({
            ...prevState,
            filters,
            lastVisible: null
        }));
    }, []);

    const handlePageNext = useCallback((lastVisible) => {
        setState((prevState) => ({
            ...prevState,
            lastVisible
        }));
    }, []);


    const handleRowsPerPageChange = useCallback((event) => {
        setState((prevState) => ({
            ...prevState,
            rowsPerPage: parseInt(event.target.value, 10)
        }));
    }, []);

    return {
        handleFiltersChange,
        handlePageNext,
        handleRowsPerPageChange,
        state
    };
}

const useJobsStore = (searchState) => {
    const isMounted = useMounted();
    const [state, setState] = useState({
        jobs: [],
        jobsCount: 0,
        lastVisible: null,
        filters: []
    });

    const handleJobsGet = useCallback(async () => {
        try {
            const response = await jobsApi.getJobs(searchState);

            if (isMounted()) {
                const jobs = state.filters === searchState.filters ? state.jobs : [];

                const lastVisible = response.docs[response.docs.length - 1];
                response.forEach((doc) => {
                    jobs.push(doc.data());
                });

                setState((prevState) => ({
                    jobs: jobs,
                    jobsCount: jobs.length,
                    lastVisible: lastVisible,
                    filters: searchState.filters
                }))
            }
        } catch (err) {
            console.error(err);
        }
    }, [searchState, isMounted]);

    useEffect(() => {
            handleJobsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]);

    return {
        ...state
    };
};


const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getCategories({}));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return {
        categories,
        specialties
    }
};

const Page = () => {
        const jobsSearch = useJobsSearch();
        const jobsStore = useJobsStore(jobsSearch.state);
        const dictionary = useCategories();
        const [isFetching, setIsFetching] = useInfiniteScroll(() => {
            if (jobsStore.lastVisible)
                jobsSearch.handlePageNext(jobsStore.lastVisible);
            setIsFetching(false);
        });

        usePageView();

        return (
            <>
                <Seo title="Dashboard: Job Browse"/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 8
                    }}
                >
                    <Container maxWidth="lg">
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={4}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h4">
                                    Find and respond to the work
                                </Typography>
                            </Stack>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={3}
                            >
                                <Button
                                    component={RouterLink}
                                    href={paths.dashboard.jobs.create}
                                    startIcon={(
                                        <SvgIcon>
                                            <PlusIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="contained"
                                >
                                    Add
                                </Button>
                            </Stack>
                        </Stack>
                        <Stack
                            spacing={4}
                            sx={{mt: 4}}
                        >
                            <JobListSearch onFiltersChange={jobsSearch.handleFiltersChange}/>
                            {jobsStore && jobsStore.jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    category={dictionary.categories.byId[job.category]?.label}
                                    specialty={dictionary.specialties.byId[job.specialty]?.label}
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
                                    jobsSearch.handlePageNext(jobsStore.lastVisible)
                                }}>
                                    <SvgIcon fontSize="small">
                                        <ChevronRightIcon/>
                                    </SvgIcon>
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>
            </>
        );
    }
;

export default Page;
