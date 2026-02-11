import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Paper,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';

const NewReviewCard = memo(({ review, authorData, onReply }) => {
    const reviewDate = useMemo(() => {
        if (!review.date) return null;
        try {
            return review.date.toDate ? review.date.toDate() : new Date(review.date);
        } catch {
            return null;
        }
    }, [review.date]);

    const formattedDate = reviewDate
        ? format(reviewDate, 'MMM dd, yyyy')
        : '';

    const timeAgo = reviewDate
        ? formatDistanceToNow(reviewDate, { addSuffix: true })
        : '';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                p: 3,
                backgroundColor: 'background.paper',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 700
                }}
            >
                NEW REVIEW
            </Box>

            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        src={authorData?.avatar}
                        sx={{ width: 56, height: 56 }}
                        alt={authorData?.businessName}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                            {authorData?.businessName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <Rating
                                value={review.rating}
                                precision={0.5}
                                size="small"
                                readOnly
                                sx={{ color: '#FFB400' }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                                {review.rating.toFixed(1)}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            {formattedDate} • {timeAgo}
                        </Typography>
                    </Box>
                </Stack>

                <Typography variant="body1" color="text.primary">
                    "{review.text}"
                </Typography>

                {review.images && review.images.length > 0 && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {review.images.slice(0, 3).map((img, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={img}
                                alt={`Review image ${index + 1}`}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 1,
                                    objectFit: 'cover'
                                }}
                            />
                        ))}
                        {review.images.length > 3 && (
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700
                                }}
                            >
                                +{review.images.length - 3}
                            </Box>
                        )}
                    </Box>
                )}

                <Stack direction="row" justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onReply(review)}
                    >
                        Reply
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
});

NewReviewCard.propTypes = {
    review: PropTypes.object.isRequired,
    authorData: PropTypes.object,
    onReply: PropTypes.func.isRequired
};

export default NewReviewCard;
