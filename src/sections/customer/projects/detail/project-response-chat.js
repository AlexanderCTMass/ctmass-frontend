import PropTypes from 'prop-types';
import {formatDistanceStrict} from 'date-fns';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    IconButton,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import {getInitials} from 'src/utils/get-initials';
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {getValidDate} from "src/utils/date-locale";
import {paths} from "src/paths";
import {projectFlow} from "src/flows/project/project-flow";
import toast from "react-hot-toast";

export const ProjectResponseChat = (props) => {
    const {response, user, project} = props;

    const ago = formatDistanceStrict(getValidDate(response.createdAt), new Date(), {addSuffix: true});

    const handleAcceptResponse = async () => {
        try {
            await projectFlow.acceptResponse(project, user, response);
            toast.success("Success");
        } catch (e) {
            console.log(e);
            toast.error("Error");
        }
    }

    const handleRejectResponse = async () => {
        try {
            await projectFlow.rejectResponse(project, user, response);
            toast.success("Success");
        } catch (e) {
            console.log(e);
            toast.error("Error");
        }
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        spacing={2}
                        alignItems={{
                            xs: 'flex-start',
                            sm: 'center'
                        }}
                        direction={{
                            xs: 'column',
                            sm: 'row'
                        }}
                    >
                        <Avatar src={response.contractorAvatar}>
                            {getInitials(response.contractorName)}
                        </Avatar>
                        <Stack spacing={1}>
                            <Typography variant="subtitle1">
                                {response.contractorName}
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                divider={<span>·</span>}
                                // divider={<span>•</span>}
                                flexWrap="wrap"
                                spacing={2}
                            >
                                {/*<Typography
                                    noWrap
                                    variant="subtitle2"
                                >
                                    Plumber
                                </Typography>*/}
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Rating
                                        value={response.contractorRating}
                                        precision={0.1}
                                        readOnly
                                        max={1}
                                    />
                                    <Typography
                                        noWrap
                                        variant="subtitle2"
                                    >
                                        {response.contractorRating}
                                    </Typography>
                                </Stack>
                                <Typography
                                    color="text.secondary"
                                    noWrap
                                    variant="body2"
                                >
                                    {ago}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Typography variant="body1">
                        {response.message}
                    </Typography>
                </Stack>
            </CardContent>
            <CardActions sx={{justifyContent: "space-between"}}>
                <Button
                    variant={"text"}
                    size={"small"}
                    href={paths.cabinet.contractors.detail.replace(":profileId", response.contractorId)}
                >
                    View profile
                </Button>
                <Stack spacing={1} direction={"row"}>
                    <Button
                        variant={"contained"}
                        color="primary"
                        size={"small"}
                        onClick={handleAcceptResponse}
                    >
                        Link
                    </Button>
                    {/*<Button*/}
                    {/*    variant={"text"}*/}
                    {/*    color="primary"*/}
                    {/*    size={"small"}*/}
                    {/*>*/}
                    {/*    Chat*/}
                    {/*</Button>*/}

                    <Button
                        variant={"text"}
                        color="error"
                        size={"small"}
                        sx={{ml: 2}}
                        onClick={handleRejectResponse}
                    >
                        Hide
                    </Button>
                </Stack>
            </CardActions>
        </Card>
    );
};

ProjectResponseChat.propTypes = {
    response: PropTypes.object.isRequired
};
