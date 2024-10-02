import {useCallback, useEffect, useState} from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import {
    Avatar,
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
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {CompanyActivity} from 'src/sections/dashboard/jobs/company-activity';
import {CompanyAssets} from 'src/sections/dashboard/jobs/company-assets';
import {CompanyOverview} from 'src/sections/dashboard/jobs/company-overview';
import {CompanyReviews} from 'src/sections/dashboard/jobs/company-reviews';
import {CompanySummary} from 'src/sections/dashboard/jobs/company-summary';
import {CompanyTeam} from 'src/sections/dashboard/jobs/company-team';
import {getInitials} from 'src/utils/get-initials';
import {doc, getDoc} from "firebase/firestore";
import {firestore} from "../../../../libs/firebase";

const tabs = [
    {label: 'Overview', value: 'overview'},
    {label: 'Reviews', value: 'reviews'},
    {label: 'Activity', value: 'activity'},
    {label: 'Team', value: 'team'},
    {label: 'Assets', value: 'assets'}
];

const Page = () => {
    const url = window.location.href.split("/");
    const end = url[url.length - 1].toString();
    let [companyCurrent, setCompanyCurrent] = useState({}|undefined);
    useEffect(() => {
        async function fetchData() {
            if (end === "all") {
                setCompanyCurrent(await jobsApi.getCompany())
            } else {
                getDoc(doc(firestore, "jobs", end)).then(value => {
                    const companyMass = value._document.data.value.mapValue.fields;
                    if (companyMass)
                        setCompanyCurrent(companyMass)
                })
            }
        }

        fetchData();
    }, [])
    const [currentTab, setCurrentTab] = useState('overview');

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    if (!companyCurrent) {
        return null;
    }

    return (
        <>
            <Seo title="Dashboard: Company Details"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
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
                                    href={paths.dashboard.jobs.index}
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
                                        Jobs
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
                                        <Stack
                                            alignItems="flex-start"
                                            direction="row"
                                            spacing={2}
                                        >
                                            <Avatar
                                                src={companyCurrent.logo}
                                                variant="rounded"
                                            >
                                                {getInitials(companyCurrent&&companyCurrent.title.stringValue.toString())}
                                            </Avatar>
                                            <Stack spacing={1}>
                                                <Typography variant="h6">
                                                    {companyCurrent&&companyCurrent.phone}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {companyCurrent&&companyCurrent.description}
                                                </Typography>
                                            </Stack>
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
                                    {currentTab === 'overview' && <CompanyOverview company={companyCurrent}/>}
                                    {currentTab === 'reviews' && (
                                        <CompanyReviews
                                            reviews={companyCurrent.reviews || []}
                                            averageRating={companyCurrent.averageRating}
                                        />
                                    )}
                                    {currentTab === 'activity' && (
                                        <CompanyActivity activities={companyCurrent.activities || []}/>
                                    )}
                                    {currentTab === 'team' && <CompanyTeam members={companyCurrent.members || []}/>}
                                    {currentTab === 'assets' && <CompanyAssets assets={companyCurrent.assets || []}/>}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid
                            xs={12}
                            lg={4}
                        >
                            <CompanySummary company={companyCurrent}/>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;
