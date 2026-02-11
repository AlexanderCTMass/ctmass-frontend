import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Rating,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from 'src/hooks/use-auth';
import ReviewComment from './ReviewComment';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';

const ReviewDialog = memo(({
    open,
    review,
    authorData,
    projectTitle,
    comments,
    authorsData,
    onClose,
    onCommentSubmit
}) => {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        currentIndex: 0
    });

    const handleCommentSubmit = useCallback(async () => {
        if (!commentText.trim() || !user) return;

        setIsSubmitting(true);

        try {
            await onCommentSubmit(review.id, {
                id: Date.now(),
                authorId: user.id,
                text: commentText.trim(),
                date: new Date().toISOString(),
                authorData: {
                    id: user.id,
                    avatar: user.avatar,
                    businessName: user.businessName || user.name
                }
            });

            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [commentText, user, review, onCommentSubmit]);

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

    if (!review) return null;

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="md"
                open={open}
                onClose={onClose}
                scroll="paper"
            >
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
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar
                                src={authorData?.avatar}
                                sx={{ width: 48, height: 48 }}
                                alt={authorData?.businessName}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {authorData?.businessName}
                                        </Typography>
                                        <Rating
                                            value={review.rating}
                                            precision={0.5}
                                            size="small"
                                            readOnly
                                            sx={{ color: '#FFB400' }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {review.date
                                            ? formatDistanceToNow(
                                                review.date.toDate
                                                    ? review.date.toDate()
                                                    : new Date(review.date),
                                                { addSuffix: true }
                                            )
                                            : ''}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>

                        <Typography variant="body1">
                            {review.text}
                        </Typography>

                        {review.images?.length > 0 && (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {review.images.map((img, index) => (
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
                                        onClick={() => handleOpenImage(review.images, index)}
                                    />
                                ))}
                            </Box>
                        )}

                        {projectTitle && (
                            <Typography variant="body2" color="primary">
                                Project: {projectTitle}
                            </Typography>
                        )}

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} mb={2}>
                                Comments ({comments.length})
                            </Typography>

                            {comments.map((comment) => (
                                <ReviewComment
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
});

ReviewDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    review: PropTypes.object,
    authorData: PropTypes.object,
    projectTitle: PropTypes.string,
    comments: PropTypes.array,
    authorsData: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onCommentSubmit: PropTypes.func.isRequired
};

export default ReviewDialog;
