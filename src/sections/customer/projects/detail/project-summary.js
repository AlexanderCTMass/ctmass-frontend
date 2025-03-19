import PropTypes from 'prop-types';
import {Avatar, Button, Card, CardContent, Divider, Rating, Stack, Typography} from '@mui/material';
import {PropertyList} from 'src/components/property-list';
import {PropertyListItem} from 'src/components/property-list-item';
import {getInitials} from 'src/utils/get-initials';
import {formatDateRange, getValidDate} from "src/utils/date-locale";
import {roles} from "src/roles";
import {projectFlow} from "src/flows/project/project-flow";
import {navigateToCurrentWithParams} from "src/utils/navigate";
import {useNavigate} from "react-router-dom";
import {projectsApi} from "src/api/projects";
import {projectService} from "src/service/project-service";
import React from "react";

export const ProjectSummary = (props) => {
    const {project, isMyResponded, user, role, ...other} = props;
    const navigate = useNavigate();

    const isWorker = role === roles.WORKER;

    const handleSendResponse = async () => {
        const threadId = !isMyResponded ? await projectFlow.response(project, user) : projectService.getRespondedChatId(project, user);
        navigateToCurrentWithParams(navigate, "threadKey", threadId);
    }

    return (
        <Card {...other}>
            <CardContent>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    Customer
                </Typography>
                <Stack spacing={2}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        <Avatar src={project.customerAvatar}>
                            {getInitials(project.customerName)}
                        </Avatar>
                        <div>
                            <Typography variant="subtitle2">
                                {project.customerName}
                            </Typography>
                            {/*<Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {founder.role}
                                </Typography>*/}
                        </div>
                    </Stack>
                </Stack>
                {project.customerCompleteReview &&
                    <Stack>
                        <Typography
                            color="text.secondary"
                            component="p"
                            sx={{mt: 2}}
                            variant="overline"
                        >
                            Customer's review
                        </Typography>
                        <Rating value={project.customerCompleteReview.rating} readOnly size={"large"}/>
                        <Typography variant="body2" mt={1}>
                            {project.customerCompleteReview.message}
                        </Typography>
                    </Stack>}
                <Divider sx={{my: 2}}/>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    Contractor
                </Typography>
                <Stack spacing={2}>
                    {project.contractorId ?
                        <>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                            >
                                <Avatar src={project.contractorAvatar}>
                                    {getInitials(project.contractorName)}
                                </Avatar>
                                <div>
                                    <Typography variant="subtitle2">
                                        {project.contractorName}
                                    </Typography>
                                    {/*<Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {founder.role}
                                </Typography>*/}
                                </div>
                            </Stack>
                            {project.contractorCompleteReview &&
                                <Stack>
                                    <Typography
                                        color="text.secondary"
                                        component="p"
                                        sx={{mt: 2}}
                                        variant="overline"
                                    >
                                        Contractor's review
                                    </Typography>
                                    <Rating value={project.contractorCompleteReview.rating} readOnly size={"large"}/>
                                    <Typography variant="body2" mt={1}>
                                        {project.contractorCompleteReview.message}
                                    </Typography>
                                </Stack>}
                        </> :
                        (
                            isWorker ?
                                <Button color={"success"} variant={isMyResponded ? "outlined" : "contained"}
                                        onClick={handleSendResponse}>
                                    {isMyResponded ? "Go to chat" : "I want to be"}</Button>
                                :
                                <Typography variant="subtitle2">
                                    Still in the search
                                </Typography>
                        )}
                </Stack>
                <Divider sx={{my: 2}}/>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    Details
                </Typography>
                <PropertyList>
                    {!isWorker &&
                        <PropertyListItem
                            align="vertical"
                            label="Id"
                            sx={{
                                px: 0,
                                py: 1
                            }}
                            value={"#" + project.id}
                        />}
                    <PropertyListItem
                        align="vertical"
                        label="Dates"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={project.projectStartType === "period" ? formatDateRange(getValidDate(project.start), getValidDate(project.end)) : project.projectStartType}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Location"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={project.location?.place_name}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Maximum budget"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={"$" + project.projectMaximumBudget}
                    />
                </PropertyList>
            </CardContent>
        </Card>
    );
};

ProjectSummary.propTypes = {
    project: PropTypes.object.isRequired
};
