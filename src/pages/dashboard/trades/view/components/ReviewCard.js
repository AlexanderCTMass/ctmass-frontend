import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    IconButton,
    Paper,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { format } from 'date-fns';
import { useAuth } from 'src/hooks/use-auth';

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
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={authorData?.avatar}
                        sx={{
                            width: 40,
                            height: 40
                        }}
                        alt={authorData?.businessName}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {displayName}
                        </Typography>
                        <Rating
                            value={review.rating}
                            precision={0.5}
                            size="small"
                            readOnly
                            sx={{ color: '#FFB400' }}
                        />
                    </Box>
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

export default ReviewCard;
