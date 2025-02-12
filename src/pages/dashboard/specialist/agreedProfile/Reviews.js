import React, {useState, useCallback, useMemo, memo} from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    List,
    ListItem,
    Rating,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    IconButton,
    DialogContent,
    Divider,
    TextField,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import {format, formatDistanceToNow, formatRelative} from 'date-fns';
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageModalWindow from "./ImageModalWindow";

const Comment = memo(({comment}) => (
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
                {comment.date
                    ? format(new Date(comment.date), 'd MMMM yyyy') : 'recently'}
            </Typography>
            <Avatar sx={{
                width: 28,
                height: 28,
                mr: 1.5,
                fontSize: '0.8rem',
                bgcolor: 'primary.main'
            }}>
                {comment.authorAvatar || comment.authorId[0]}
            </Avatar>
            <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                    {comment.authorId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.date), {addSuffix: true})}
                </Typography>
            </Box>
        </Box>
        <Typography variant="body2" sx={{wordBreak: 'break-word'}}>
            {comment.text}
        </Typography>
    </Box>
));

const Reviews = ({profile}) => {
    const [openAllReviews, setOpenAllReviews] = useState(false);
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        currentIndex: 0
    });

    const [comments, setComments] = useState(() =>
        profile?.reviews?.reduce((acc, review) => {
            acc[review.id] = Array.isArray(review.comments)
                ? review.comments.map(c => ({...c, date: c.date || new Date().toISOString()}))
                : [];
            return acc;
        }, {})
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Исправленный обработчик для изображений
    const handleOpenImage = useCallback((images, index) => {
        setImageModal({
            open: true,
            images,
            currentIndex: index
        });
    }, []);

    // 2. Исправленный обработчик комментариев
    const handleCommentSubmit = useCallback(async (reviewId, text) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        setComments(prev => ({
            ...prev,
            [reviewId]: [
                ...(prev[reviewId] || []),
                {
                    id: Date.now(),
                    authorId: "currentUser",
                    text: text,
                    date: new Date().toISOString(),
                    authorAvatar: 'U'
                }
            ]
        }));

        setIsSubmitting(false);
    }, []);

    const ReviewItem = memo(({review, isDetailed}) => {
        const [commentText, setCommentText] = useState('');

        const handleSubmit = useCallback(() => {
            handleCommentSubmit(review.id, commentText);
            setCommentText('');
        }, [commentText, review.id, handleCommentSubmit]);

        return (
            <ListItem sx={{p: 0, alignItems: "flex-start"}}>
                <Box width="100%" position="relative">
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
                        {review.date
                            ? formatDistanceToNow(new Date(review?.date), {addSuffix: true}): 'recently'}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1.5}>
                        <Avatar src={review.avatar} sx={{mr: 2, width: 40, height: 40}}/>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {review.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {review.location}
                            </Typography>
                        </Box>
                    </Box>

                    <Rating value={review.rating} precision={0.5} readOnly size="small"/>
                    <Typography variant="body1" mt={1} mb={isDetailed ? 2 : 0}>
                        {review.text}
                    </Typography>

                    {isDetailed && review.images?.length > 0 && (
                        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                            {review.images.map((img, index) => (
                                <Box
                                    key={index}
                                    component="img"
                                    src={img}
                                    alt={`Review content ${index + 1}`}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        objectFit: 'cover'
                                    }}
                                    onClick={() => handleOpenImage(review.images, index)}
                                />
                            ))}
                        </Box>
                    )}

                    {isDetailed && (
                        <Box mt={3}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                                Comments ({(comments[review.id] || []).length})
                            </Typography>

                            {(comments[review.id] || []).map(comment => (
                                <Comment key={comment.id} comment={comment}/>
                            ))}

                            <Box mt={3} position="relative">
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
                                                    onClick={handleSubmit}
                                                    disabled={!commentText.trim() || isSubmitting}
                                                    sx={{mr: -1}}
                                                >
                                                    {isSubmitting ? (
                                                        <CircularProgress size={24}/>
                                                    ) : (
                                                        <SendIcon color="primary"/>
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </ListItem>
        );
    });

    const visibleReviews = useMemo(() => profile?.reviews?.slice(0, 3), [profile?.reviews]);

    return (
        <Box>
            <Typography variant="h6" color="text.secondary" mb={2}>
                Reviews ({profile?.reviews?.length || 0})
            </Typography>

            {(!visibleReviews || visibleReviews.length === 0) && (
                <Typography color="secondary">there are no reviews yet</Typography>
            )}

            <List disablePadding>
                {visibleReviews?.map(review => (
                    <React.Fragment key={review.id}>
                        <ReviewItem
                            review={review}
                            isDetailed={false}
                        />
                        <Divider sx={{my: 2}}/>
                    </React.Fragment>
                ))}

                {visibleReviews && visibleReviews.length > 0 && (<Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setOpenAllReviews(true)}
                        sx={{borderRadius: 1}}
                    >
                        View All Reviews
                    </Button>
                )}
            </List>

            <Dialog
                fullWidth
                maxWidth="md"
                open={openAllReviews}
                onClose={() => setOpenAllReviews(false)}
                scroll="paper"
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6">All Reviews</Typography>
                    <IconButton onClick={() => setOpenAllReviews(false)}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <List disablePadding>
                        {profile?.reviews?.map((review, index) => (
                            <React.Fragment key={review.id}>
                                <ReviewItem
                                    review={review}
                                    isDetailed={true}
                                />
                                {index < profile?.reviews?.length - 1 && (
                                    <Divider sx={{my: 3, mx: -2}}/>
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <ImageModalWindow
                open={imageModal.open}
                handleClose={() => setImageModal(prev => ({...prev, open: false}))}
                images={imageModal.images}
                currentIndex={imageModal.currentIndex}
                setCurrentIndex={(index) => setImageModal(prev => ({...prev, currentIndex: index}))}
            />
        </Box>
    );
};

Reviews.propTypes = {
    profile: PropTypes.shape({
        reviews: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                author: PropTypes.string.isRequired,
                location: PropTypes.string.isRequired,
                rating: PropTypes.number.isRequired,
                text: PropTypes.string.isRequired,
                images: PropTypes.arrayOf(PropTypes.string),
                comments: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                        authorId: PropTypes.string.isRequired,
                        text: PropTypes.string.isRequired,
                        date: PropTypes.string.isRequired
                    })
                )
            })
        ).isRequired
    }).isRequired
};

export default memo(Reviews);