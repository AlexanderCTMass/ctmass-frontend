import PropTypes from 'prop-types';
import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    Link,
    Rating,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import {ProjectResponse} from "src/sections/customer/projects/detail/project-response";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import {ChatMessages} from "src/sections/dashboard/chat/chat-messages";
import ClockIcon from "@untitled-ui/icons-react/build/esm/Clock";
import {getInitials} from "src/utils/get-initials";
import {useRouter} from "src/hooks/use-router";
import {profileApi} from "src/api/profile";
import {paths} from "src/paths";
import {useAuth} from "src/hooks/use-auth";
import {getMessagesRealtime, markMessagesAsRead} from "src/chatService";
import {ChatMessageAdd} from "src/sections/dashboard/chat/chat-message-add";

const useParticipants = (threadKey, userId) => {
    const router = useRouter();
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                // Получаем данные участников чата
                let users = [];
                if (threadKey.includes("_")) {
                    users = threadKey.split('_');
                } else {
                    users.push(threadKey)
                    users.push(userId)
                }
                const participants = await profileApi.getChatProfilesById(users);
                setParticipants(participants);
            } catch (err) {
                console.error('Error loading participants:', err);
                router.push(paths.dashboard.chat);
            }
        };

        if (threadKey) {
            fetchParticipants();
        }
    }, [threadKey, router]);

    return participants;
};

const useThread = (threadKey) => {
    const [thread, setThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const {user} = useAuth();

    useEffect(() => {
        if (!threadKey) return;

        // Подписываемся на сообщения в реальном времени
        const unsubscribe = getMessagesRealtime(threadKey, (newMessages) => {
            setMessages(newMessages);

            // Помечаем сообщения как прочитанные
            if (user?.id) {
                markMessagesAsRead(threadKey, user.id);
            }
        });

        return () => unsubscribe();
    }, [threadKey, user]);

    return {messages, participants: thread?.participants || []};
};

export const ProjectResponses = (props) => {
    const {responses, project, user, ...other} = props;
    const participants = useParticipants("09dtBAEkwKb4NMiouZ1wHGVsYJ43_zWWSI9cTesUKv6eUXVgMky4bGxd2", "zWWSI9cTesUKv6eUXVgMky4bGxd2")
    const {messages} = useThread("09dtBAEkwKb4NMiouZ1wHGVsYJ43_5RhCetRuUiQWDoa3hfinqjskpeu1");


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
                            <Avatar src={selectedResponse.contractorAvatar} sx={{width: 56, height: 56}}>
                                {getInitials(selectedResponse.contractorName)}
                            </Avatar>
                        )}
                        // disableTypography
                        subheader={(
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                                divider={<span>·</span>}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Rating
                                        value={selectedResponse.contractorRating}
                                        precision={0.1}
                                        readOnly
                                        max={1}
                                    />
                                    <Typography
                                        noWrap
                                        variant="subtitle2"
                                    >
                                        {selectedResponse.contractorRating}
                                    </Typography>
                                </Stack>

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
                                    {selectedResponse.contractorName}
                                </Link>
                            </Stack>
                        )}
                    />
                    <CardContent>
                        {selectedResponse ?
                            <Stack direction={"column"} spacing={1} divider={<Divider/>}>
                                <ChatMessages
                                    showUserInfo={false}
                                    messages={messages}
                                    participants={participants}
                                />
                                <
                                    ChatMessageAdd onSend={() => {
                                }}/>
                            </Stack> :
                            <Typography>Start a dialogue with one of the specialists from the list on the
                                left</Typography>
                        }
                    </CardContent>
                    {/*<CardActions>
                        <Stack direction={"column"} spacing={1} divider={<Divider/>}>
                            <Stack direction={"row"} spacing={1}>
                                <Button>
                                    Отказаться от специалиста
                                </Button>
                                <Button>
                                    Выбрать специалиста
                                </Button>
                            </Stack>

                        </Stack>
                    </CardActions>*/}
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
