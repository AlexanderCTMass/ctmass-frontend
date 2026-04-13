import PropTypes from 'prop-types';
import {
    Button,
    Card, CardActions,
    CardContent,
    CardHeader, Checkbox, Dialog, FormControlLabel,
    IconButton,
    Rating,
    Stack,
    SvgIcon, TextField,
    Typography,
    useMediaQuery, CircularProgress
} from '@mui/material';
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatContainer } from "src/sections/dashboard/chatNew/chat-container";
import { ChatThread } from "src/sections/dashboard/chatNew/chat-thread";
import { ChatBlank } from "src/sections/dashboard/chatNew/chat-blank";
import { useSelector } from "src/store";
import { useChatSubscriptions, useOneChatSubscriptions } from "src/hooks/use-chat-subscriptions";
import useNotificationSound from "src/hooks/use-notification-sound";
import { ERROR, INFO } from "src/libs/log";
import { projectFlow } from "src/flows/project/project-flow";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { ProjectStatus } from "src/enums/project-state";
import { addDoc, collection } from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import { projectsApi } from "src/api/projects";
import DonationSection from "src/components/stripe/donate-section";
import { wait } from "src/utils/wait";
import { ProfileSettingFeatureToggles } from "src/featureToggles/ProfileSettingFeatureToggles";

const useThreads = (userId, projectId) => {
    const chats = useSelector((state) => state.chatNew.threads);
    const loading = useSelector((state) => state.chatNew.loading);
    const error = useSelector((state) => state.chatNew.error);
    const unreadMessages = useSelector((state) => state.chatNew.unreadMessages);

    useChatSubscriptions(userId, projectId)

    return { chats, loading, error, unreadMessages };
};

const useMessages = (threadId) => {
    const messages = useSelector((state) => state.chatNew.messages[threadId] || []);
    const loading = useSelector((state) => state.chatNew.loadingMessages);
    const error = useSelector((state) => state.chatNew.errorMessages);
    const threads = useSelector((state) => state.chatNew.threads);
    const participants = threads.filter(c => c.id === threadId).flatMap(c => c.users);
    const currentChat = threads.find(c => c.id === threadId);
    return { currentChat, messages, participants, loading, error };
};


export const ProjectSpecialistChat = (props) => {
    const { project, threadKey, user, rollback, onCloseDialog, ...other } = props;
    const [actions, setActions] = useState([])
    const rootRef = useRef(null);
    const threads = useThreads(user.id, project.id);
    const threadMessages = useMessages(threadKey);
    const navigate = useNavigate();
    useNotificationSound(user.id, threads.unreadMessages);
    const [actionSubmitting, setActionSubmitting] = useState(false);

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [rating, setRating] = useState(0); // Состояние для рейтинга
    const [reviewMessage, setReviewMessage] = useState(""); // Состояние для сообщения
    const [publishToPortfolio, setPublishToPortfolio] = useState(false);
    const [completeFormTitle, setCompleteFormTitle] = useState({
        isPublish: false,
        title: "Complete project",
        subheader: "Leave a review about the interaction with the customer"
    })
    const [errors, setErrors] = useState({
        rating: false,
        reviewMessage: false,
    });
    const [showDonationSection, setShowDonationSection] = useState(false);

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));


    const handleRejectAction = useCallback(async () => {
        try {
            setActionSubmitting(ACTIONS.REJECT.label);
            await projectFlow.rejectProjectResponse(threadMessages.currentChat.id, user.id);
            rollback();
        } catch (e) {
            ERROR("Error reject", e);
            toast.error("Error reject");
        } finally {
            setActionSubmitting(false);
        }
    }, [threadKey, threadMessages.currentChat]);

    const handleReviewAction = useCallback(async () => {
        // setActionSubmitting(ACTIONS.REVIEW.label);
        setCompleteFormTitle({
            isPublish: true,
            title: "Review customer",
            subheader: "Leave a review about the interaction with the customer"
        });

        setReviewDialogOpen(true);
    }, [project, threadKey, threadMessages.currentChat, threads.chats]);

    const handleCompleteAction = useCallback(async () => {
        setActionSubmitting(ACTIONS.COMPLETE.label);
        const upproject = await projectsApi.getProjectById(project.id);
        if (upproject.state === ProjectStatus.COMPLETED) {
            await handleReviewAction();
        } else {
            await projectFlow.completeProjectFromContractor(project, threadMessages.currentChat);
            setActions([]);
        }
        setActionSubmitting(false);
    }, [project, threadKey, threadMessages.currentChat, threads.chats]);

    const ACTIONS = {
        REJECT: {
            label: "Reject",
            color: "error",
            handle: handleRejectAction,
            disabled: actionSubmitting,
        },
        REVIEW: {
            label: "Review",
            handle: handleReviewAction,
            disabled: actionSubmitting,
        },
        COMPLETE: {
            label: "Complete",
            handle: handleCompleteAction,
            disabled: actionSubmitting,
        },
    };

    useEffect(() => {
        const updateActions = () => {
            const { currentChat } = threadMessages;
            const { state, contractorCompleteReview } = project;

            // Ранние возвраты для упрощения логики
            if (state === ProjectStatus.DRAFT || !currentChat || currentChat.rejected) {
                setActions([]);
                return;
            }

            const actions = [];

            // Логика для невыбранного чата
            if (!currentChat.selectedForProject && state !== ProjectStatus.IN_PROGRESS && state !== ProjectStatus.COMPLETED) {
                actions.push({ ...ACTIONS.REJECT });
            } else {
                // Логика для выбранного чата
                if (state === ProjectStatus.COMPLETED) {
                    if (!contractorCompleteReview) {
                        actions.push({ ...ACTIONS.REVIEW });
                    }
                } else {
                    actions.push({ ...ACTIONS.COMPLETE });
                }
            }

            setActions(actions);
        };

        updateActions();
    }, [threadMessages.currentChat, project.state, project.contractorCompleteReview]);


    const onReviewDialogClose = () => {
        setReviewDialogOpen(false);
    };

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleReviewMessageChange = (event) => {
        setReviewMessage(event.target.value); // Обновляем сообщение
    };

    const handlePublishToPortfolioChange = (event) => {
        setPublishToPortfolio(event.target.checked);
    };

    const handleSubmitReview = async () => {
        try {
            let hasError = false;
            const newErrors = { rating: false, reviewMessage: false };

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

            setActionSubmitting(ACTIONS.REVIEW.label);

            await projectFlow.reviewFromContractor(project, {
                rating,
                message: reviewMessage
            }, threadMessages.currentChat, publishToPortfolio ? {
                date: project.createdAt,
                title: project.title,
                shortDescription: project.description,
                images: project.attach?.map(i => ({
                    url: i
                })) || []
            } : null);


            toast.success("Review submitted successfully");
            setActions([]);
            if (!ProfileSettingFeatureToggles.donation) {
                onReviewDialogClose(); // Закрываем диалог
            } else {
                setShowDonationSection(true);
            }
        } catch (error) {
            ERROR("Error submitting review", error);
            toast.error("Error submitting review");
        } finally {
            setActionSubmitting(false);
        }
    };

    const view = threadKey
        ? 'thread'
        : 'blank';

    const isDisableMessaging = (project.state !== ProjectStatus.PUBLISHED && project.state !== ProjectStatus.IN_PROGRESS) || threadMessages?.currentChat?.rejected;

    return (
        <Card>
            <CardContent>
                <Stack
                    direction={"row"}
                    spacing={0}
                    ref={rootRef}
                >
                    <ChatContainer open>
                        {view === 'thread' && <ChatThread threadMessages={threadMessages}
                            threadKey={threadKey}
                            showUserInfo={false}
                            actions={actions}
                            projectId={project.id}
                            disableMessaging={isDisableMessaging}
                            onCloseDialog={onCloseDialog}
                        />}
                        {view === 'blank' && <ChatBlank
                            text={"Start a dialogue with the customer"} event={() => {
                                // alert("Yahoo!")
                            }} />}
                    </ChatContainer>
                </Stack>
            </CardContent>
            <Dialog fullWidth fullScreen={!mdUp} maxWidth="md" open={reviewDialogOpen} onClose={onReviewDialogClose}>
                <Card>
                    {!showDonationSection ? (
                        <>
                            <CardHeader title={completeFormTitle.title} subheader={completeFormTitle.subheader} />
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="body1">Rate the customer:</Typography>
                                    <Rating
                                        name="specialist-rating"
                                        value={rating}
                                        onChange={handleRatingChange}
                                        size="large"
                                        disabled={actionSubmitting === ACTIONS.REVIEW.label}
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
                                        disabled={actionSubmitting === ACTIONS.REVIEW.label}
                                    />
                                    {errors.reviewMessage && (
                                        <Typography variant="body2" color="error">
                                            Please write a review.
                                        </Typography>
                                    )}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={publishToPortfolio}
                                                onChange={handlePublishToPortfolioChange}
                                                color="primary"
                                                disabled={actionSubmitting === ACTIONS.REVIEW.label}
                                            />
                                        }
                                        label="Publish the project in the portfolio?"
                                    />
                                </Stack>
                            </CardContent>
                            <CardActions>
                                <Button
                                    onClick={onReviewDialogClose}
                                    color="error"
                                    disabled={actionSubmitting === ACTIONS.REVIEW.label}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReview}
                                    color="primary"
                                    variant="contained"
                                    disabled={actionSubmitting === ACTIONS.REVIEW.label}
                                    startIcon={actionSubmitting === ACTIONS.REVIEW.label ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : null}
                                >
                                    {actionSubmitting === ACTIONS.REVIEW.label ? 'Submitting...' : 'Send'}
                                </Button>
                            </CardActions>
                        </>
                    ) : (
                        <DonationSection onClose={() => {
                            wait(1000).then(r => onReviewDialogClose());
                        }} />
                    )}
                </Card>
            </Dialog>
        </Card>
    );
};

ProjectSpecialistChat.defaultProps = {
    responses: []
};

ProjectSpecialistChat.propTypes = {
    responses: PropTypes.array.isRequired,
};
