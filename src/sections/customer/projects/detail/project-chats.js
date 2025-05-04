import PropTypes from 'prop-types';
import {
    Box, Button,
    Card, CardActions,
    CardContent, CardHeader, Dialog,
    Divider,
    IconButton, Rating,
    Stack,
    SvgIcon, TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {ChatContainer} from "src/sections/dashboard/chatNew/chat-container";
import {ChatThread} from "src/sections/dashboard/chatNew/chat-thread";
import {ChatBlank} from "src/sections/dashboard/chatNew/chat-blank";
import {ChatSidebar} from "src/sections/dashboard/chatNew/chat-sidebar";
import {useSelector} from "src/store";
import {useChatSubscriptions} from "src/hooks/use-chat-subscriptions";
import useNotificationSound from "src/hooks/use-notification-sound";
import {projectFlow} from "src/flows/project/project-flow";
import toast from "react-hot-toast";
import {ERROR} from "src/libs/log";
import {useSearchParams} from "src/hooks/use-search-params";
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import CloseIcon from "@mui/icons-material/Close";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import {ProjectStatus} from "src/enums/project-state";
import DonationSection from "src/components/stripe/donate-section";
import CircularProgress from '@mui/material/CircularProgress';
import {wait} from "src/utils/wait";

const useSidebar = () => {
    const searchParams = useSearchParams();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [open, setOpen] = useState(mdUp);

    const handleScreenResize = useCallback(() => {
        if (!mdUp) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [mdUp]);

    useEffect(() => {
            handleScreenResize();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mdUp]);

    const handeParamsUpdate = useCallback(() => {
        if (!mdUp) {
            setOpen(false);
        }
    }, [mdUp]);

    useEffect(() => {
            handeParamsUpdate();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchParams]);

    const handleToggle = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return {
        handleToggle,
        handleClose,
        open,
        isMdUp: mdUp
    };
};

const useThreads = (projectId) => {
    const chats = useSelector((state) => state.chatNew.threads);
    const loading = useSelector((state) => state.chatNew.loading);
    const error = useSelector((state) => state.chatNew.error);
    const unreadMessages = useSelector((state) => state.chatNew.unreadMessages);

    useChatSubscriptions(null, projectId)

    return {chats, loading, error, unreadMessages};
};

const useMessages = (threadId) => {
    const messages = useSelector((state) => state.chatNew.messages[threadId] || []);
    const loading = useSelector((state) => state.chatNew.loadingMessages);
    const error = useSelector((state) => state.chatNew.errorMessages);
    const threads = useSelector((state) => state.chatNew.threads);
    const participants = threads.filter(c => c.id === threadId).flatMap(c => c.users);
    const currentChat = threads.find(c => c.id === threadId);
    return {currentChat, messages, participants, loading, error};
};


export const ProjectChat = (props) => {
    const {project, threadKey, user, onCloseDialog, ...other} = props;
    const sidebar = useSidebar();

    const rootRef = useRef(null);
    const [profiles, setProfiles] = useState();
    const [actions, setActions] = useState([])
    const threadMessages = useMessages(threadKey);
    const threads = useThreads(project.id);
    const [actionSubmitting, setActionSubmitting] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [showDonationSection, setShowDonationSection] = useState(false);
    const [rating, setRating] = useState(0); // Состояние для рейтинга
    const [reviewMessage, setReviewMessage] = useState(""); // Состояние для сообщения
    const [errors, setErrors] = useState({
        rating: false,
        reviewMessage: false,
    });

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    useNotificationSound(user.id, threads.unreadMessages);

    const view = threadKey
        ? 'thread'
        : 'blank';

    const handleRejectAction = useCallback(async () => {
        try {
            setActionSubmitting(ACTIONS.REJECT.label);
            await projectFlow.rejectSpecialist(threadMessages.currentChat, user.id);
        } catch (e) {
            ERROR("Error select specialist", e);
            toast.error("Error reject");
        } finally {
            setActionSubmitting(false);
        }
    }, [threadKey, threadMessages.currentChat]);

    const handleSelectSpecialistAction = useCallback(async () => {
        try {
            setActionSubmitting(ACTIONS.CHOOSE_SPECIALIST.label);
            await projectFlow.selectSpecialist(threadMessages.currentChat, threads.chats, user);
        } catch (e) {
            ERROR("Error select specialist", e);
            toast.error("Error select specialist");
        } finally {
            setActionSubmitting(false);
        }
    }, [threadKey, threadMessages.currentChat, threads.chats]);

    const handleCompleteAction = useCallback(async () => {
        setReviewDialogOpen(true);
    }, [threadKey, threadMessages.currentChat, threads.chats]);

    const handleUnRejectAction = useCallback(async () => {
        try {
            setActionSubmitting(ACTIONS.UNREJECT.label);
            await projectFlow.unrejectSpecialist(threadMessages.currentChat, user.id);
        } catch (e) {
            ERROR("Error select specialist", e);
            toast.error("Error unreject");
        } finally {
            setActionSubmitting(false);
        }
    }, [threadKey, threadMessages.currentChat]);


    const ACTIONS = {
        CHOOSE_SPECIALIST: {
            label: "Choose a specialist",
            handle: handleSelectSpecialistAction,
            disabled: actionSubmitting,
        },
        REJECT: {
            label: "Reject",
            color: "error",
            handle: handleRejectAction,
            disabled: actionSubmitting,

        },
        COMPLETE: {
            label: "Complete",
            handle: handleCompleteAction,
            disabled: actionSubmitting,

        },
        UNREJECT: {
            label: "UnReject",
            color: "warning",
            handle: handleUnRejectAction,
            disabled: actionSubmitting,

        },
    };

    useEffect(() => {
        const {currentChat} = threadMessages;
        const {state} = project;

        // Ранний возврат, если чат отсутствует
        if (!currentChat) {
            setActions([]);
            return;
        }

        // Ранний возврат, если проект завершён
        if (state === ProjectStatus.COMPLETED) {
            setActions([]);
            return;
        }

        let actions = [];

        // Логика для отклонённого чата
        if (currentChat.rejected) {
            if (state === ProjectStatus.PUBLISHED) {
                actions.push({
                    ...ACTIONS.UNREJECT,
                });
            }
        } else {
            // Логика для невыбранного чата
            if (!currentChat.selectedForProject) {
                actions.push(
                    {
                        ...ACTIONS.CHOOSE_SPECIALIST,
                    },
                    {
                        ...ACTIONS.REJECT,
                    }
                );
            } else {
                // Логика для выбранного чата
                actions.push(
                    {
                        ...ACTIONS.COMPLETE,
                    },
                    {
                        ...ACTIONS.REJECT,
                    }
                );
            }
        }

        // Установка действий
        setActions(actions);
    }, [threadMessages.currentChat, actionSubmitting, project.state]);

    const onReviewDialogClose = () => {
        setReviewDialogOpen(false);
    };

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleReviewMessageChange = (event) => {
        setReviewMessage(event.target.value); // Обновляем сообщение
    };

    const handleSubmitReview = async () => {
        try {
            let hasError = false;
            const newErrors = {rating: false, reviewMessage: false};

            if (rating === 0) {
                newErrors.rating = true;
                hasError = true;
            }

            if (reviewMessage.trim() === "") {
                newErrors.reviewMessage = true;
                hasError = true;
            }

            if (hasError) {
                setErrors(newErrors);
                return;
            }

            setActionSubmitting(ACTIONS.COMPLETE.label);

            await projectFlow.completeProject(project, {
                rating,
                message: reviewMessage
            }, threadMessages.currentChat);

            toast.success("Review submitted successfully");
            setActions([]);
            setShowDonationSection(true);
        } catch (error) {
            ERROR("Error submitting review", error);
            toast.error("Error submitting review");
        } finally {
            setActionSubmitting(false);
        }
    };

    const isDisableMessaging = (project.state !== ProjectStatus.PUBLISHED && project.state !== ProjectStatus.IN_PROGRESS) || threadMessages?.currentChat?.rejected;

    return (
        <Card ref={rootRef}>
            <CardContent>
                <Stack
                    direction={"row"}
                    spacing={0}

                >
                    <ChatSidebar
                        currentThreadId={threadKey}
                        threads={threads}
                        onClose={sidebar.handleClose}
                        open={sidebar.open}
                        container={rootRef.current}
                        profiles={profiles}
                        setProfiles={setProfiles}
                        sidebarLabel={<Typography
                            color="text.secondary"
                            component="p"
                            variant="overline"
                        >
                            Specialists
                        </Typography>}
                        searchEnabled={false}
                    />
                    <ChatContainer open={sidebar.open}>
                        <Box sx={{p: 2, display: 'flex', alignItems: 'center'}}>
                            <IconButton onClick={sidebar.handleToggle}>
                                <SvgIcon>
                                    {sidebar.open ? <ArrowLeftIcon/> :
                                        <Menu01Icon/>}
                                </SvgIcon>
                            </IconButton>

                            <Typography
                                color="text.secondary"
                                component="p"
                                variant="overline"
                            >
                                Specialists
                            </Typography>
                            <Box sx={{flexGrow: 1}}/>
                            {onCloseDialog &&
                                <Tooltip title="Close chat dialog">
                                    <IconButton onClick={onCloseDialog}>
                                        <SvgIcon>
                                            <CloseIcon/>
                                        </SvgIcon>
                                    </IconButton>
                                </Tooltip>
                            }
                        </Box>
                        <Divider/>
                        {view === 'thread' && <ChatThread threadMessages={threadMessages}
                                                          threadKey={threadKey}
                                                          showUserInfo={false}
                                                          projectId={project.id}
                                                          actions={actions}
                                                          disableMessaging={isDisableMessaging}
                        />}
                        {view === 'blank' && <Box sx={{p: 3}}><ChatBlank
                            text={"Start a dialogue with one of the specialists from the list on the left"}/></Box>}
                    </ChatContainer>
                </Stack>
            </CardContent>
            <Dialog fullWidth fullScreen={!mdUp} maxWidth="md" open={reviewDialogOpen} onClose={onReviewDialogClose}>
                <Card>
                    {!showDonationSection ? (
                        <>
                            <CardHeader title={"Complete project"} subheader={"Send review"}/>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="body1">Rate the specialist:</Typography>
                                    <Rating
                                        name="specialist-rating"
                                        value={rating}
                                        onChange={handleRatingChange}
                                        size="large"
                                        disabled={actionSubmitting === ACTIONS.COMPLETE.label}
                                    />
                                    {errors.rating && (
                                        <Typography variant="body2" color="error">
                                            Please provide a rating.
                                        </Typography>
                                    )}

                                    <TextField
                                        label="Your review"
                                        multiline
                                        rows={4}
                                        value={reviewMessage}
                                        onChange={handleReviewMessageChange}
                                        fullWidth
                                        variant="outlined"
                                        disabled={actionSubmitting === ACTIONS.COMPLETE.label}
                                    />
                                    {errors.reviewMessage && (
                                        <Typography variant="body2" color="error">
                                            Please write a review.
                                        </Typography>
                                    )}
                                </Stack>
                            </CardContent>
                            <CardActions>
                                <Button
                                    onClick={onReviewDialogClose}
                                    color="error"
                                    disabled={actionSubmitting === ACTIONS.COMPLETE.label}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReview}
                                    color="primary"
                                    variant="contained"
                                    disabled={actionSubmitting === ACTIONS.COMPLETE.label}
                                    startIcon={actionSubmitting === ACTIONS.COMPLETE.label ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : null}
                                >
                                    {actionSubmitting === ACTIONS.COMPLETE.label ? 'Submitting...' : 'Complete project'}
                                </Button>
                            </CardActions>
                        </>
                    ) : (
                        <DonationSection onClose={() => {
                            wait(1000).then(r => onReviewDialogClose());
                        }}/>
                    )}
                </Card>
            </Dialog>
        </Card>

    );
};

ProjectChat.defaultProps = {
    responses: []
};

ProjectChat.propTypes = {
    responses: PropTypes.array.isRequired,
};
