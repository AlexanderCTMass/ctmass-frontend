import PropTypes from 'prop-types';
import {Box, Button, Stack, Typography} from '@mui/material';
import {ProjectResponse} from "src/sections/customer/projects/detail/project-response";

export const ProjectResponses = (props) => {
    const {responses, project, user, ...other} = props;

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Responses
                </Typography>
            </div>
            <Stack spacing={3}>
                {responses.map((response) => (
                    <ProjectResponse
                        key={response.id}
                        response={response}
                        project={project}
                        user={user}
                    />
                ))}
            </Stack>
        </Stack>
    );
};

ProjectResponses.defaultProps = {
    responses: []
};

ProjectResponses.propTypes = {
    responses: PropTypes.array.isRequired,
};
