import PropTypes from 'prop-types';
import {Button, Card, Divider, Stack, Typography} from '@mui/material';
import {Link} from "react-router-dom";
import {companies} from "../../../api/jobs/data";

export const CompanyJobs = (props) => {
    const {jobs = [], desc, address, jobsId} = props;

    return (
        <Card variant="outlined">
            <Stack divider={<Divider/>}>
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    key={props.jobs && jobs.id}
                    sx={{
                        px: 2,
                        py: 1.5
                    }}
                >
                    <div>
                        <Typography variant="subtitle1">
                            {jobs.label}
                        </Typography>

                        <Typography color="text.secondary"
                                    variant="caption">
                            {address}
                        </Typography>
                        <div dangerouslySetInnerHTML={{__html: desc}}/>
                    </div>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        <Button size="small"
                        >
                            <Link to={"companies/"+jobsId}>
                                Apply
                            </Link>
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    );
};

CompanyJobs.propTypes = {
    jobs: PropTypes.object
};
