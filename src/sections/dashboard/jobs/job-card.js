import PropTypes from 'prop-types';
import CheckVerified01 from '@untitled-ui/icons-react/build/esm/CheckVerified01';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import Users01Icon from '@untitled-ui/icons-react/build/esm/Users01';
import {Avatar, Box, Card, CardContent, Divider, Link, Stack, SvgIcon, Typography} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {getInitials} from 'src/utils/get-initials';
import {CompanyJobs} from './company-jobs';
import {useEffect, useState} from "react";
import {profileApi} from "../../../api/profile";
import {dictionaryApi} from "../../../pages/components/dictionary/dictionaryApi";
import {SeverityPill} from "../../../components/severity-pill";
import {useAuth} from "../../../hooks/use-auth";

export const JobCard = (props) => {
        const {job, category, specialty, ...other} = props;
        const [author, setAuthor] = useState({name: "", avatar: ""});
        const [specil, setSpec] = useState();
        const [child, setChild] = useState();


        const jobb = {
            title: "Perform plumbing work",
            category: "Renovation and construction",
            specialty: "Plumbing and heating services",
            status: "Search for performers",
            create: "Created 6 hours ago",
            description: "Need a plumber for a wide range of work in the apartment. It is required to diagnose all problems of different levels of complexity and solve them within 1-2 days",
            address: "Moscow, Revolution Square, 2/3",
            period: "By appointment",
            budget: "By appointment"
        }

        job.status = 'Search for performers';

        const statusColor = job.status === 'Search for performers' ? 'success' : 'info';
        useEffect(() => {
            async function fetchData() {
                const resp = profileApi.get(job.userId);
                console.log(resp);
                setAuthor(await resp)
            }

            fetchData();
        }, [job])
        return (
            <Card {...other}>
                <CardContent>
                    <Link
                        color="text.primary"
                        variant="h5"
                        underline={"none"}
                    >
                        {job.title}
                    </Link>
                    <Stack
                        alignItems="flex-start"
                        spacing={2}
                        sx={{my: 2}}
                        direction={{
                            xs: 'column',
                            sm: 'row'
                        }}
                    >
                        <SeverityPill color={statusColor}>
                            {job.status}
                        </SeverityPill>
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                mt: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" sx={{textTransform: 'uppercase'}}>
                                {category}
                            </Typography>
                            <Box
                                sx={{
                                    height: 4,
                                    width: 4,
                                    borderRadius: 4,
                                    backgroundColor: 'text.secondary',
                                    mx: 1
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{textTransform: 'uppercase'}}>
                                {specialty}
                            </Typography>
                        </Box>
                    </Stack>
                    <Divider/>
                    <Typography
                        variant="body2"
                        sx={{py: 2}}
                    >
                        {job.description}
                    </Typography>
                    <Divider/>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{mt: 3}}
                    >

                        <Avatar src={author.avatar}/>
                        <Typography variant="subtitle2">
                            {author.name}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        );
    }
;

JobCard.propTypes = {
    job: PropTypes.object.isRequired
};
