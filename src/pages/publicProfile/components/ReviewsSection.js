import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Rating,
    Skeleton,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from 'src/hooks/use-auth';
import { profileApi } from 'src/api/profile';
import { projectsApi } from 'src/api/projects';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';

const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const AVATAR_MAPPING = [
    { name: "Alcides Antonio", image: "avatar-alcides-antonio.png" },
    { name: "Anika Visser", image: "avatar-anika-visser.png" },
    { name: "Cao Yu", image: "avatar-cao-yu.png" },
    { name: "Carson Darrin", image: "avatar-carson-darrin.png" },
    { name: "Chinasa Neo", image: "avatar-chinasa-neo.png" },
    { name: "Fran Perez", image: "avatar-fran-perez.png" },
    { name: "Luila Albu", image: "avatar-luila-albu.png" },
    { name: "Jane Rotanson", image: "avatar-jane-rotanson.png" },
    { name: "Jie Yan Song", image: "avatar-jie-yan-song.png" },
    { name: "Marcus Finn", image: "avatar-marcus-finn.png" },
    { name: "Miron Vitold", image: "avatar-miron-vitold.png" },
    { name: "Nasimiyu Danai", image: "avatar-nasimiyu-danal.png" },
    { name: "Neha Punita", image: "avatar-neha-punita.png" },
    { name: "Omar Darboe", image: "avatar-omar-darboe.png" },
    { name: "Perjani Inyene", image: "avatar-perjani-inyene.png" },
    { name: "Seo Hyeon Ji", image: "avatar-seo-hyeon-ji.png" },
    { name: "Siegbert Gottfried", image: "avatar-siegbert-gottfried.png" }
];

const getFallbackAuthorData = (reviewId) => {
    const hash = simpleHash(reviewId || 'default');
    const index = hash % AVATAR_MAPPING.length;
    const selected = AVATAR_MAPPING[index];
    return {
        businessName: selected.name,
        avatar: `/assets/avatars/${selected.image}`
    };
};

const RatingBar = ({ label, value, hasRating }) => (
    <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="body2" fontWeight={600} color={hasRating ? 'text.primary' : 'text.disabled'}>
                    {hasRating ? value.toFixed(1) : 'N/A'}
                </Typography>
                <Rating
                    value={hasRating ? value : 0}
                    precision={0.5}
                    size="small"
                    readOnly
                    sx={{ color: hasRating ? '#FFB400' : 'action.disabled' }}
                />
            </Stack>
        </Stack>
        <LinearProgress
            variant="determinate"
            value={hasRating ? (value / 5) * 100 : 0}
            sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: hasRating ? '#3366FF' : 'grey.400'
                }
            }}
        />
    </Box>
);

RatingBar.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    hasRating: PropTypes.bool.isRequired
};

const Comment = memo(({ comment, authorsData }) => {
    if (!comment || !comment.authorId) {
        return null;
    }

    const isValidDate = (date) => {
        return date && !isNaN(new Date(date).getTime());
    };

    const date = isValidDate(comment.date) ? new Date(comment.date) : comment.date?.toDate?.() || new Date();

    const authorData = comment?.authorData || authorsData[comment?.authorId] ||
        getFallbackAuthorData(comment.authorId);

    return (
        <Box sx={{
            mt: 1.5,
            borderLeft: '2px solid',
            borderColor: 'divider',
            pl: 2,
            position: 'relative'
        }}>
            <Box display="flex" alignItems="center" mb={0.5}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        fontSize: '0.75rem'
                    }}
                >
                    {format(date, 'd MMMM yyyy')}
                </Typography>
                <Avatar
                    src={authorData.avatar}
                    sx={{
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        fontSize: '0.8rem',
                        bgcolor: 'primary.main',
                    }}
                    alt={authorData.businessName}
                />
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {authorData.businessName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(date, { addSuffix: true })}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {comment.text}
            </Typography>
        </Box>
    );
});

Comment.propTypes = {
    comment: PropTypes.object,
    authorsData: PropTypes.object
};

const ReviewCard = memo(({
    review,
    authorData,
    projectTitle,
    onCardClick,
    likesCount,
    commentsCount,
    isLiked,
    onLike
}) => {
    const { user } = useAuth();

    const reviewDate = useMemo(() => {
        if (!review.date) return null;
        try {
            return review.date.toDate ? review.date.toDate() : new Date(review.date);
        } catch {
            return null;
        }
    }, [review.date]);

    const formattedDate = reviewDate
        ? format(reviewDate, 'MMM yyyy')
        : '';

    const displayName = useMemo(() => {
        if (!authorData?.businessName) return '';
        const parts = authorData.businessName.split(' ');
        if (parts.length > 1) {
            return `${parts[0]} ${parts[1][0]}.`;
        }
        return parts[0];
    }, [authorData]);

    const handleLikeClick = useCallback((e) => {
        e.stopPropagation();
        if (user && onLike) {
            onLike(review.id);
        }
    }, [user, onLike, review.id]);

    return (
        <Paper
            elevation={0}
            onClick={() => onCardClick(review)}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Rating
                        value={review.rating}
                        precision={0.5}
                        size="small"
                        readOnly
                        sx={{ color: '#FFB400' }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {displayName}
                    </Typography>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        flex: 1
                    }}
                >
                    "{review.text}"
                </Typography>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 1 }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            {formattedDate}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconButton
                                size="small"
                                onClick={handleLikeClick}
                                disabled={!user}
                                sx={{ p: 0.5 }}
                            >
                                {isLiked ? (
                                    <ThumbUpIcon fontSize="small" color="primary" />
                                ) : (
                                    <ThumbUpOutlinedIcon fontSize="small" />
                                )}
                            </IconButton>
                            <Typography variant="caption" color="text.secondary">
                                {likesCount}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ChatBubbleOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {commentsCount}
                            </Typography>
                        </Stack>
                    </Stack>

                    {projectTitle && (
                        <Typography
                            variant="caption"
                            color="primary"
                            sx={{
                                maxWidth: 150,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Project: {projectTitle}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
});

ReviewCard.propTypes = {
    review: PropTypes.object.isRequired,
    authorData: PropTypes.object,
    projectTitle: PropTypes.string,
    onCardClick: PropTypes.func.isRequired,
    likesCount: PropTypes.number,
    commentsCount: PropTypes.number,
    isLiked: PropTypes.bool,
    onLike: PropTypes.func
};

const ReviewsSection = ({ profileData, setProfileData, dictionarySpecialties, dictionaryServices }) => {
    const { user } = useAuth();
    const [selectedReview, setSelectedReview] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [authorsData, setAuthorsData] = useState({});
    const [projectsData, setProjectsData] = useState({});
    const [comments, setComments] = useState({});
    const [likes, setLikes] = useState({});
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        currentIndex: 0
    });

    const reviews = useMemo(() => profileData?.reviews || [], [profileData?.reviews]);
    const services = useMemo(() => profileData?.services || [], [profileData?.services]);

    const visibleReviews = useMemo(() => {
        return showAllReviews ? reviews : reviews.slice(0, 4);
    }, [reviews, showAllReviews]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const serviceRatings = useMemo(() => {
        if (!reviews.length || !services.length) {
            return {};
        }

        const ratings = {};

        reviews.forEach((review) => {
            if (review.serviceId) {
                if (!ratings[review.serviceId]) {
                    ratings[review.serviceId] = { sum: 0, count: 0 };
                }
                ratings[review.serviceId].sum += review.rating || 0;
                ratings[review.serviceId].count += 1;
            }
        });

        return ratings;
    }, [reviews, services]);

    const displayCategories = useMemo(() => {
        if (!services || services.length === 0) {
            return [];
        }

        const servicesToDisplay = services.slice(0, 4);

        return servicesToDisplay.map((service) => {
            const serviceId = service.id || service.serviceId || service.service;
            const label = service.label || service.name ||
                dictionaryServices?.byId?.[serviceId]?.label ||
                serviceId;

            const rating = serviceRatings[serviceId];
            const hasRating = rating && rating.count > 0;
            const value = hasRating ? rating.sum / rating.count : averageRating || 0;

            return {
                label,
                value,
                hasRating
            };
        });
    }, [services, serviceRatings, averageRating, dictionaryServices]);

    useEffect(() => {
        const fetchAuthorsData = async () => {
            if (!reviews.length) return;

            const authorIds = [...new Set(reviews.map((r) => r.authorId).filter(Boolean))];
            if (!authorIds.length) return;

            try {
                const authorsProfiles = await profileApi.getProfilesById(authorIds);
                const map = {};
                authorsProfiles.forEach((profile) => {
                    map[profile.id] = {
                        ...profile,
                        businessName: profile.businessName || profile.name
                    };
                });
                setAuthorsData(map);
            } catch (err) {
                console.error('Failed to load authors data:', err);
            }
        };

        fetchAuthorsData();
    }, [reviews]);

    useEffect(() => {
        const fetchProjectsData = async () => {
            if (!reviews.length) return;

            const projectIds = [...new Set(reviews.map((r) => r.projectId).filter(Boolean))];
            if (!projectIds.length) return;

            try {
                const projectsMap = {};
                await Promise.all(
                    projectIds.map(async (id) => {
                        const project = await projectsApi.getProjectById(id);
                        if (project) {
                            projectsMap[id] = project;
                        }
                    })
                );
                setProjectsData(projectsMap);
            } catch (err) {
                console.error('Failed to load projects data:', err);
            }
        };

        fetchProjectsData();
    }, [reviews]);

    useEffect(() => {
        const initialComments = {};
        const initialLikes = {};
        reviews.forEach((review) => {
            initialComments[review.id] = Array.isArray(review.comments) ? review.comments : [];
            initialLikes[review.id] = Array.isArray(review.likes) ? review.likes : [];
        });
        setComments(initialComments);
        setLikes(initialLikes);
    }, [reviews]);

    const handleCardClick = useCallback((review) => {
        setSelectedReview(review);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setSelectedReview(null);
        setCommentText('');
    }, []);

    const handleLike = useCallback(async (reviewId) => {
        if (!user || !profileData?.profile?.id) return;

        const currentLikes = likes[reviewId] || [];
        const hasLiked = currentLikes.includes(user.id);
        const newLikes = hasLiked
            ? currentLikes.filter((id) => id !== user.id)
            : [...currentLikes, user.id];

        setLikes((prev) => ({
            ...prev,
            [reviewId]: newLikes
        }));
    }, [user, profileData?.profile?.id, likes]);

    const handleCommentSubmit = useCallback(async () => {
        if (!commentText.trim() || !selectedReview || !user || !profileData?.profile?.id) return;

        setIsSubmitting(true);

        const newComment = {
            id: Date.now(),
            authorId: user.id,
            text: commentText.trim(),
            date: new Date().toISOString()
        };

        try {
            await extendedProfileApi.addReviewComment(
                profileData.profile.id,
                selectedReview.id,
                newComment
            );

            const commentWithAuthorData = {
                ...newComment,
                authorData: {
                    id: user.id,
                    avatar: user.avatar,
                    businessName: user.businessName || user.name
                }
            };

            setComments((prev) => ({
                ...prev,
                [selectedReview.id]: [...(prev[selectedReview.id] || []), commentWithAuthorData]
            }));

            setAuthorsData((prev) => ({
                ...prev,
                [user.id]: {
                    id: user.id,
                    avatar: user.avatar,
                    businessName: user.businessName || user.name
                }
            }));

            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [commentText, selectedReview, user, profileData?.profile?.id]);

    const handleOpenImage = useCallback((images, index) => {
        setImageModal({
            open: true,
            images,
            currentIndex: index
        });
    }, []);

    const handleCloseImage = useCallback(() => {
        setImageModal((prev) => ({ ...prev, open: false }));
    }, []);

    if (!reviews.length) {
        return (
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    p: { xs: 3, md: 4 }
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <StarIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Client Reviews
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    There are no reviews yet.
                </Typography>
            </Paper>
        );
    }

    const selectedAuthor = selectedReview
        ? authorsData[selectedReview.authorId] || getFallbackAuthorData(selectedReview.id)
        : null;

    const selectedProjectTitle = selectedReview?.projectId
        ? projectsData[selectedReview.projectId]?.title || projectsData[selectedReview.projectId]?.name
        : null;

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    p: { xs: 3, md: 4 }
                }}
            >
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <StarIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Client Reviews
                        </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 3,
                                    textAlign: 'center',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="h2" fontWeight={700} color="text.primary">
                                    {averageRating.toFixed(1)}
                                </Typography>
                                <Rating
                                    value={averageRating}
                                    precision={0.5}
                                    readOnly
                                    sx={{ mx: 'auto', mt: 1, color: '#FFB400' }}
                                />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Based on {reviews.length}+ reviews
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Average of {displayCategories.length} categories
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            {displayCategories.length > 0 ? (
                                <Stack spacing={2}>
                                    {displayCategories.map((cat) => (
                                        <RatingBar
                                            key={cat.label}
                                            label={cat.label}
                                            value={cat.value}
                                            hasRating={cat.hasRating}
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No services yet.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    <Divider />

                    <Grid container spacing={2}>
                        {visibleReviews.map((review) => {
                            const authorData = authorsData[review.authorId] || getFallbackAuthorData(review.id);
                            const projectTitle = review.projectId
                                ? projectsData[review.projectId]?.title || projectsData[review.projectId]?.name
                                : null;
                            const reviewLikes = likes[review.id] || [];
                            const reviewComments = comments[review.id] || [];
                            const isLiked = user ? reviewLikes.includes(user.id) : false;

                            return (
                                <Grid item xs={12} sm={6} key={review.id}>
                                    <ReviewCard
                                        review={review}
                                        authorData={authorData}
                                        projectTitle={projectTitle}
                                        onCardClick={handleCardClick}
                                        likesCount={reviewLikes.length}
                                        commentsCount={reviewComments.length}
                                        isLiked={isLiked}
                                        onLike={handleLike}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    {reviews.length > 4 && !showAllReviews && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                color="primary"
                                onClick={() => setShowAllReviews(true)}
                                sx={{ fontWeight: 600 }}
                            >
                                View all reviews
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Paper>

            <Dialog
                fullWidth
                maxWidth="md"
                open={Boolean(selectedReview)}
                onClose={handleCloseDialog}
                scroll="paper"
            >
                {selectedReview && (
                    <>
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="h6">Review Details</Typography>
                            <IconButton onClick={handleCloseDialog}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ py: 3 }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Avatar
                                        src={selectedAuthor?.avatar}
                                        sx={{ width: 48, height: 48 }}
                                        alt={selectedAuthor?.businessName}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {selectedAuthor?.businessName}
                                                </Typography>
                                                <Rating
                                                    value={selectedReview.rating}
                                                    precision={0.5}
                                                    size="small"
                                                    readOnly
                                                    sx={{ color: '#FFB400' }}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {selectedReview.date
                                                    ? formatDistanceToNow(
                                                        selectedReview.date.toDate
                                                            ? selectedReview.date.toDate()
                                                            : new Date(selectedReview.date),
                                                        { addSuffix: true }
                                                    )
                                                    : ''}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Typography variant="body1">
                                    {selectedReview.text}
                                </Typography>

                                {selectedReview.images?.length > 0 && (
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        {selectedReview.images.map((img, index) => (
                                            <Box
                                                key={index}
                                                component="img"
                                                src={img}
                                                alt={`Review image ${index + 1}`}
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    objectFit: 'cover'
                                                }}
                                                onClick={() => handleOpenImage(selectedReview.images, index)}
                                            />
                                        ))}
                                    </Box>
                                )}

                                {selectedProjectTitle && (
                                    <Typography variant="body2" color="primary">
                                        Project: {selectedProjectTitle}
                                    </Typography>
                                )}

                                <Divider />

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                                        Comments ({(comments[selectedReview.id] || []).length})
                                    </Typography>

                                    {(comments[selectedReview.id] || []).map((comment) => (
                                        <Comment
                                            key={comment.id}
                                            comment={comment}
                                            authorsData={authorsData}
                                        />
                                    ))}

                                    {user && (
                                        <Box mt={3}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                variant="outlined"
                                                placeholder="Write a comment..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                disabled={isSubmitting}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={handleCommentSubmit}
                                                                disabled={!commentText.trim() || isSubmitting}
                                                                sx={{ mr: -1 }}
                                                            >
                                                                {isSubmitting ? (
                                                                    <CircularProgress size={24} />
                                                                ) : (
                                                                    <SendIcon color="primary" />
                                                                )}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            <ImageModalWindow
                open={imageModal.open}
                handleClose={handleCloseImage}
                images={imageModal.images}
                currentIndex={imageModal.currentIndex}
                setCurrentIndex={(index) => setImageModal((prev) => ({ ...prev, currentIndex: index }))}
            />
        </>
    );
};

ReviewsSection.propTypes = {
    profileData: PropTypes.object,
    setProfileData: PropTypes.func,
    dictionarySpecialties: PropTypes.object,
    dictionaryServices: PropTypes.object
};

ReviewsSection.defaultProps = {
    profileData: null,
    setProfileData: () => {},
    dictionarySpecialties: {},
    dictionaryServices: {}
};

export default memo(ReviewsSection);
