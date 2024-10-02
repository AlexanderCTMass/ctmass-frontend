import PropTypes from 'prop-types';
import CheckVerified01 from '@untitled-ui/icons-react/build/esm/CheckVerified01';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import Users01Icon from '@untitled-ui/icons-react/build/esm/Users01';
import {Avatar, Box, Card, CardContent, Link, Stack, SvgIcon, Typography} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {getInitials} from 'src/utils/get-initials';
import {CompanyJobs} from './company-jobs';
import {useEffect, useState} from "react";
import {profileApi} from "../../../api/profile";
import {dictionaryApi} from "../../../pages/components/dictionary/dictionaryApi";

export const CompanyCard = (props) => {
        const {company, ...other} = props;
        const companyId = company && company.id && company.id;
        const jsonCompany = company._document.data.value.mapValue.fields;
        const [author, setAuthor] = useState();
        const [specil, setSpec] = useState();
        const [child, setChild] = useState();

        useEffect(() => {
            async function fetchData() {
                const resp = profileApi.get(jsonCompany.userId.stringValue);
                dictionaryApi.getSpecialityByIdAndSetState(jsonCompany.category.integerValue, setSpec, jsonCompany.specialty.integerValue, setChild)
                setAuthor(await resp)
            }

            fetchData();
        }, [jsonCompany])

        return (
            <Card {...other}>
                <CardContent>
                    <Stack
                        alignItems="flex-start"
                        spacing={2}
                        direction={{
                            xs: 'column',
                            sm: 'row'
                        }}
                    >
                        <Avatar
                            component={RouterLink}
                            href={paths.dashboard.jobs.companies.details}
                            src={author && author.avatar}
                            variant="rounded"
                        >
                            {getInitials(company.name)}
                        </Avatar>
                        <div>
                            <Link
                                color="text.primary"
                                component={RouterLink}
                                href={paths.dashboard.jobs.companies.details}
                                variant="h6"
                            >
                                {jsonCompany && jsonCompany.title.stringValue}
                            </Link>
                            <Typography variant="body2">
                                {specil && specil.label}
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                flexWrap="wrap"
                                spacing={3}
                                sx={{mt: 1}}
                            >
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                    direction="row"
                                >
                                    <SvgIcon color="action">
                                        <Users01Icon/>
                                    </SvgIcon>
                                    <Typography
                                        color="text.secondary"
                                        noWrap
                                        variant="overline"
                                    >
                                        {"1-2"}
                                    </Typography>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                    direction="row"
                                >
                                    <SvgIcon color="action">
                                        <Star01Icon/>
                                    </SvgIcon>
                                    <Typography
                                        color="text.secondary"
                                        noWrap
                                        variant="overline"
                                    >
                                        {5}
                                        /5
                                    </Typography>
                                </Stack>
                                {/*{company.isVerified && (*/}
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={0.5}
                                >
                                    <SvgIcon
                                        sx={{
                                            color: 'background.paper',
                                            '& path': {
                                                fill: (theme) => theme.palette.success.main,
                                                fillOpacity: 1
                                            }
                                        }}
                                    >
                                        <CheckVerified01/>
                                    </SvgIcon>
                                    <Typography
                                        color="success"
                                        noWrap
                                        variant="overline"
                                    >
                                        Verified
                                    </Typography>
                                </Stack>
                            </Stack>
                        </div>
                    </Stack>
                    <Box sx={{mt: 2}}>
                        <CompanyJobs jobs={child} desc={jsonCompany.description.stringValue}
                                     address={jsonCompany.address.stringValue}
                                     jobsId={companyId}/>
                    </Box>
                </CardContent>
            </Card>
        );
    }
;

CompanyCard.propTypes = {
    company: PropTypes.object.isRequired
};
