import PropTypes from 'prop-types';
import {format} from 'date-fns';
import {Avatar, Box, Button, Card, CardContent, Link, Stack, Typography} from '@mui/material';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem, TimelineOppositeContent,
    TimelineSeparator
} from '@mui/lab';
import {getInitials} from 'src/utils/get-initials';
import {isValidDate} from "src/utils/date-locale";
import ProjectStatusDisplay from "src/components/project-status-display";

const renderContent = (activity) => {
    switch (activity.type) {
        case 'publish':
            return (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography
                        sx={{mr: 0.5}}
                        variant="subtitle2"
                    >
                        {activity.changedByName}
                    </Typography>
                    <Typography
                        sx={{mr: 0.5}}
                        variant="body2"
                    >
                        publish project
                    </Typography>
                </Box>
            );
        case 'pending_response':
            return (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography
                        sx={{mr: 0.5}}
                        variant="subtitle2"
                    >
                        {activity.changedByName}
                    </Typography>
                    <Typography
                        sx={{mr: 0.5}}
                        variant="body2"
                    >
                        send response to project
                    </Typography>
                </Box>
            );
        case 'edit':
            return (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography
                        sx={{mr: 0.5}}
                        variant="subtitle2"
                    >
                        {activity.changedByName}
                    </Typography>
                    <Typography
                        sx={{mr: 0.5}}
                        variant="body2"
                    >
                        edit project
                    </Typography>
                </Box>
            );
        case 'unpublish':
            return (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography
                        sx={{mr: 0.5}}
                        variant="subtitle2"
                    >
                        {activity.changedByName}
                    </Typography>
                    <Typography
                        sx={{mr: 0.5}}
                        variant="body2"
                    >
                        unpublish project
                    </Typography>
                </Box>
            );
        case 'created':
            return (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography
                        sx={{mr: 0.5}}
                        variant="subtitle2"
                    >
                        {activity.author}
                    </Typography>
                    <Typography
                        sx={{mr: 0.5}}
                        variant="body2"
                    >
                        created
                    </Typography>
                    <Typography variant="subtitle2">
                        {activity.createdCompany}
                    </Typography>
                </Box>
            );
        default:
            return null;
    }
};

export const ProjectActivity = (props) => {
    const {activities, ...other} = props;

    return (
        <Stack {...other}>
            <Card>
                <CardContent>
                    <Timeline
                        sx={{
                            p: 0,
                            m: 0
                        }}
                    >
                        {activities.map((activity, index) => {
                            const showConnector = activities.length - 1 > index;
                            const createDate = isValidDate(activity.changedAt) ? new Date(activity.changedAt) : activity.changedAt.toDate();
                            const createdAt = format(createDate, 'MMM dd, HH:mm a');

                            return (
                                <TimelineItem
                                    key={activity.id}
                                    sx={{
                                        '&:before': {
                                            display: 'none'
                                        }
                                    }}
                                >

                                    <TimelineOppositeContent align="left">
                                        {activity.oldStatus !== activity.newStatus &&
                                            <Stack spacing={1} divider={<span>-></span>} direction={"row"} sx={{mt: 1}}
                                                   justifyContent={"flex-end"}>
                                                <ProjectStatusDisplay status={activity.oldStatus} size={"small"}/>
                                                <ProjectStatusDisplay status={activity.newStatus} size={"small"}/>
                                            </Stack>
                                        }
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot
                                            sx={{
                                                border: 0,
                                                p: 0
                                            }}
                                        >
                                            <Avatar src={activity.changedByAvatar}>
                                                {getInitials(activity.changedByName)}
                                            </Avatar>
                                        </TimelineDot>
                                        {showConnector && (
                                            <TimelineConnector sx={{minHeight: 30}}/>
                                        )}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        {renderContent(activity)}
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                            sx={{mt: 1}}
                                        >
                                            {createdAt}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            );
                        })}
                    </Timeline>
                </CardContent>
            </Card>
        </Stack>
    );
};

ProjectActivity.defaultProps = {
    activities: []
};

ProjectActivity.propTypes = {
    activities: PropTypes.array
};
