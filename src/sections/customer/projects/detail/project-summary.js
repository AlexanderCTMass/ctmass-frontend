import PropTypes from 'prop-types';
import {
    Avatar, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemText,
    Stack, Typography, useMediaQuery
} from '@mui/material';
import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import { getInitials } from 'src/utils/get-initials';
import { formatDateRange, getValidDate } from "src/utils/date-locale";
import { roles } from "src/roles";
import { projectFlow } from "src/flows/project/project-flow";
import { navigateToCurrentWithParams } from "src/utils/navigate";
import { useNavigate } from "react-router-dom";
import { projectService } from "src/service/project-service";
import { useCallback, useEffect, useState } from "react";
import { Rating } from "src/pages/cabinet/profiles/my/profileHeader/Raiting";
import pluralize from "pluralize";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { profileService } from "src/service/profile-service";
import { ERROR } from "src/libs/log";
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";
import toast from "react-hot-toast";
import { tradesApi } from "src/api/trades";


export const ProjectSummary = (props) => {
    const { project, isMyResponded, user, role, onOpenChat, ...other } = props;
    const navigate = useNavigate();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm')); // Проверка на ширину экрана
    const [reviews, setReviews] = useState(undefined);
    const [reviewsContractor, setReviewsContractor] = useState(undefined);

    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const reviews = await extendedProfileApi.getReviews(project.userId);
                const result = profileService.updateRatingInfo({}, reviews);
                setReviews(result);
            } catch (error) {
                ERROR(error);
            }

        }
        if (project.userId) {
            fetchUserReviews()
        }
    }, [project]);

    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const reviews = await extendedProfileApi.getReviews(project.contractorId);
                const result = profileService.updateRatingInfo({}, reviews);
                setReviewsContractor(result);
            } catch (error) {
                ERROR(error);
            }

        }
        if (project.contractorId) {
            fetchUserReviews()
        }
    }, [project]);


    const isWorker = role === roles.WORKER;

    const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
    const [trades, setTrades] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadTrades = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoadingTrades(true);
            const userTrades = await tradesApi.getTradesByUser(user.id);
            setTrades(userTrades);
        } catch {
            toast.error('Failed to load resumes');
        } finally {
            setLoadingTrades(false);
        }
    }, [user?.id]);

    const handleApplyClick = () => {
        if (isMyResponded) {
            if (onOpenChat) {
                onOpenChat();
            } else {
                const threadId = projectService.getRespondedChatId(project, user);
                navigateToCurrentWithParams(navigate, "threadKey", threadId);
            }
        } else {
            setTradeDialogOpen(true);
            loadTrades();
        }
    };

    const handleSelectTrade = async (tradeId) => {
        try {
            setIsSubmitting(true);
            setTradeDialogOpen(false);
            const threadId = await projectFlow.response(project, user, tradeId);
            navigateToCurrentWithParams(navigate, "threadKey", threadId);
        } catch (e) {
            ERROR(e);
            toast.error('Error submitting response');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Контент карточки
    const cardContent = (
        <>
            <Typography
                color="text.secondary"
                component="p"
                sx={{ mb: 2 }}
                variant="overline"
            >
                Customer
            </Typography>
            <Stack spacing={2}>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                    component={RouterLink}
                    to={paths.cabinet.profiles.profile.replace(":profileId", project.userId) + `?returnTo=${window.location.href}&returnLabel=Back to project`}
                    underline="hover"
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        padding: '8px 12px', // Добавляем отступы
                        borderRadius: '12px', // Закругляем углы
                        transition: 'background-color 0.3s, box-shadow 0.3s', // Плавный переход
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.06)', // Легкий фон при наведении
                            boxShadow: '0 0px 12px rgba(0, 0, 0, 0.1)', // Тень при наведении
                        },
                    }}
                >
                    <Avatar src={project.customerAvatar} sx={{ width: 40, height: 40 }}>
                        {getInitials(project.customerName)}
                    </Avatar>
                    <Stack direction="column" spacing={0}>
                        <Typography variant="subtitle2">
                            {project.customerName}
                        </Typography>
                        {reviews && reviews.rating > 0 && reviews.reviewCount > 0 &&
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>

                                <Stack direction={"row"} divider={<span>·</span>} spacing={1} alignItems={"center"}>
                                    <Typography variant="body2">
                                        ★ {(reviews.rating).toFixed(1)}
                                    </Typography>
                                    <Typography variant="caption">
                                        {reviews.reviewCount + " " + pluralize('review', reviews.reviewCount)}
                                    </Typography>
                                </Stack>
                            </Box>}
                    </Stack>
                </Stack>
            </Stack>
            {project.customerCompleteReview && (
                <Stack>
                    <Typography
                        color="text.secondary"
                        component="p"
                        sx={{ mt: 2 }}
                        variant="overline"
                    >
                        Customer's review
                    </Typography>
                    <Rating value={project.customerCompleteReview.rating} readOnly size={"large"} />
                    <Typography variant="body2" mt={1}>
                        {project.customerCompleteReview.message}
                    </Typography>
                </Stack>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography
                color="text.secondary"
                component="p"
                sx={{ mb: 2 }}
                variant="overline"
            >
                Contractor
            </Typography>
            <Stack spacing={2}>
                {project.contractorId ? (
                    <>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            component={RouterLink}
                            to={paths.cabinet.profiles.profile.replace(":profileId", project.contractorId) + `?returnTo=${window.location.href}&returnLabel=Back to project`}
                            sx={{
                                textDecoration: 'none',
                                color: 'inherit',
                                padding: '8px 12px', // Добавляем отступы
                                borderRadius: '12px', // Закругляем углы
                                transition: 'background-color 0.3s, box-shadow 0.3s', // Плавный переход
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.06)', // Легкий фон при наведении
                                    boxShadow: '0 0px 12px rgba(0, 0, 0, 0.1)', // Тень при наведении
                                },
                            }}
                        >
                            <Avatar src={project.contractorAvatar}>
                                {getInitials(project.contractorName)}
                            </Avatar>
                            <Stack direction="column" spacing={0}>
                                <Typography variant="subtitle2">
                                    {project.contractorName}
                                </Typography>
                                {reviewsContractor && reviewsContractor.rating > 0 && reviewsContractor.reviewCount > 0 &&
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                                        <Stack direction={"row"} divider={<span>·</span>} spacing={1}
                                            alignItems={"center"}>
                                            <Typography variant="body2">
                                                ★ {(reviewsContractor.rating).toFixed(1)}
                                            </Typography>
                                            <Typography variant="caption">
                                                {reviewsContractor.reviewCount + " " + pluralize('review', reviewsContractor.reviewCount)}
                                            </Typography>
                                        </Stack>
                                    </Box>}
                            </Stack>
                        </Stack>
                        {project.contractorCompleteReview && (
                            <Stack>
                                <Typography
                                    color="text.secondary"
                                    component="p"
                                    sx={{ mt: 2 }}
                                    variant="overline"
                                >
                                    Contractor's review
                                </Typography>
                                <Rating value={project.contractorCompleteReview.rating} readOnly size={"large"} />
                                <Typography variant="body2" mt={1}>
                                    {project.contractorCompleteReview.message}
                                </Typography>
                            </Stack>
                        )}
                    </>
                ) : (
                    isWorker ? (
                        <>
                            <Button
                                color="success"
                                variant={isMyResponded ? "outlined" : "contained"}
                                onClick={handleApplyClick}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                            >
                                {isMyResponded ? "Go to chat" : "Apply for this project"}
                            </Button>

                            <Dialog
                                open={tradeDialogOpen}
                                onClose={() => setTradeDialogOpen(false)}
                                fullWidth
                                maxWidth="sm"
                            >
                                <DialogTitle>Select Resume</DialogTitle>
                                <DialogContent>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Choose the resume you want to use for this project response
                                    </Typography>
                                    {loadingTrades ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : trades.length === 0 ? (
                                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                No resumes found. Please create a resume first.
                                            </Typography>
                                            <Button variant="contained" onClick={() => { setTradeDialogOpen(false); navigate(paths.dashboard.trades.create); }}>
                                                Create resume
                                            </Button>
                                        </Box>
                                    ) : trades.filter(t => t.status === 'active').length === 0 ? (
                                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                You have resumes, but none are currently active.
                                            </Typography>
                                            <Button variant="contained" onClick={() => { setTradeDialogOpen(false); navigate(paths.dashboard.trades.index); }}>
                                                View Resumes
                                            </Button>
                                        </Box>
                                    ) : (
                                        <List>
                                            {trades.filter(t => t.status === 'active').map(trade => (
                                                <ListItem key={trade.id} disablePadding>
                                                    <ListItemButton onClick={() => handleSelectTrade(trade.id)}>
                                                        <ListItemText
                                                            primary={trade.title}
                                                            secondary={trade.subtitle || trade.primarySpecialtyLabel}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setTradeDialogOpen(false)}>Cancel</Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    ) : (
                        <Typography variant="subtitle2">
                            Still in the search
                        </Typography>
                    )
                )}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography
                color="text.secondary"
                component="p"
                sx={{ mb: 2 }}
                variant="overline"
            >
                Details
            </Typography>
            <PropertyList>
                {!isWorker && (
                    <PropertyListItem
                        align="vertical"
                        label="Id"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={"#" + project.id}
                    />
                )}
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
        </>
    );

    return (
        <>
            {smUp ? ( // Если экран больше или равен sm, рендерим карточку
                <Card {...other}>
                    <CardContent>
                        {cardContent}
                    </CardContent>
                </Card>
            ) : ( // Если экран меньше sm, рендерим контент без карточки
                <Box sx={{ p: 0 }}>
                    {cardContent}
                </Box>
            )}
        </>
    );
};

ProjectSummary.propTypes = {
    project: PropTypes.object.isRequired
};