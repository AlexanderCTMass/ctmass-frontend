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

export const ProjectResponse = (props) => {
    const {response} = props;

    const ago = formatDistanceStrict(response.createdAt, new Date(), {addSuffix: true});

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
                        <Avatar src={response.avatar}>
                            {getInitials(response.author)}
                        </Avatar>
                        <Stack spacing={1}>
                            <Typography variant="subtitle1">
                                {response.author}
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                divider={<span>·</span>}
                                // divider={<span>•</span>}
                                flexWrap="wrap"
                                spacing={2}
                            >
                                <Typography
                                    noWrap
                                    variant="subtitle2"
                                >
                                    Plumber
                                </Typography>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Rating
                                        value={response.rating}
                                        precision={0.1}
                                        readOnly
                                        max={1}
                                    />
                                    <Typography
                                        noWrap
                                        variant="subtitle2"
                                    >
                                        {response.rating}
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
                        {response.description}
                    </Typography>
                </Stack>
            </CardContent>
            <CardActions sx={{justifyContent: "space-between"}}>
                <Button
                    variant={"text"}
                    size={"small"}
                >
                    View profile
                </Button>
                <div>
                    <Button
                        variant={"contained"}
                        color="primary"
                        size={"small"}
                    >
                        Accept
                    </Button>
                    <Button
                        variant={"text"}
                        color="error"
                        size={"small"}
                    >
                        Reject
                    </Button>
                </div>
            </CardActions>
        </Card>
    );
};

ProjectResponse.propTypes = {
    response: PropTypes.object.isRequired
};
