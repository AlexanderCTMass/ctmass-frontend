import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import {ProjectResponse} from "src/sections/customer/projects/detail/project-response";
import {useCallback, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import {ProjectResponseChat} from "src/sections/customer/projects/detail/project-response-chat";
import {ChatMessages} from "src/sections/dashboard/chat/chat-messages";
import ClockIcon from "@untitled-ui/icons-react/build/esm/Clock";
import * as React from "react";

export const ProjectResponses = (props) => {
    const {responses, project, user, ...other} = props;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedId = searchParams.get('responseId');

    const selectedResponse = selectedId ? responses.find((response) => response.id === selectedId) : null;

    const handleSelectResponse = useCallback((id) => {
        const currentUrl = window.location.href;

        // Создаем объект URL
        const url = new URL(currentUrl);

        // Добавляем или обновляем параметр responseId
        url.searchParams.set('responseId', id);

        // Переходим на новый URL
        navigate(url.pathname + url.search);
    }, [selectedId, navigate]);

    return (
        <Grid
            container
            spacing={2} {...other}
        >
            <Grid xs={12} lg={4}>
                <Card>
                    <CardContent>
                        <Stack spacing={2} divider={<Divider/>}>
                            {responses.map((response) => (
                                <ProjectResponse
                                    key={response.id}
                                    response={response}
                                    project={project}
                                    user={user}
                                    selected={response.id === selectedId}
                                    onClick={() => {
                                        handleSelectResponse(response.id)
                                    }}
                                />
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={12} lg={8}>
                {/*<ProjectResponseChat
                    key={selectedResponse.id}
                    response={selectedResponse}
                    project={project}
                    user={user}
                />*/}
                <Card>
                    <CardHeader
                        avatar={(
                            <Avatar
                                component="a"
                                href="#"
                                src={"post.authorAvatar"}
                            />
                        )}
                        disableTypography
                        subheader={(
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <SvgIcon color="action">
                                    <ClockIcon/>
                                </SvgIcon>

                            </Stack>
                        )}
                        title={(
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={0.5}
                                sx={{mb: 1}}
                            >
                                <Link
                                    color="text.primary"
                                    href="#"
                                    variant="subtitle2"
                                >
                                    {"post.authorName"}
                                </Link>
                                <Typography variant="body2">
                                    added a review
                                </Typography>
                            </Stack>
                        )}
                    />
                    <CardContent>
                        {selectedResponse ?
                            <ChatMessages
                                messages={[{
                                    isRead: true,
                                    senderId: "09dtBAEkwKb4NMiouZ1wHGVsYJ43",
                                    text: "куку ",
                                    timestamp: 12341234123
                                }]}
                                participants={[user]}
                            /> :
                            <Typography>Start a dialogue with one of the specialists from the list on the left</Typography>
                        }
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

ProjectResponses.defaultProps = {
    responses: []
};

ProjectResponses.propTypes = {
    responses: PropTypes.array.isRequired,
};
