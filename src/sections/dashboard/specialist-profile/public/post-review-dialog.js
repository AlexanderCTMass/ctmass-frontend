import {Box, Dialog, Typography, useMediaQuery} from '@mui/material';
import {SpecialistPostCard} from "./specialist-post-card";

export const PostReviewDialog = (props) => {
    const {
        user,
        post,
        comments,
        createdAt,
        isLiked,
        likes,
        media,
        rating,
        message, handlePostsGet,
        onClose,
        open = false,
    } = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));


    return (
        <Dialog
            fullWidth
            fullScreen={!smUp}
            maxWidth="md"
            onClose={onClose}
            open={open}
            scroll={"body"}
        >
            <Box sx={{p: 3}}>
                <Typography
                    align="center"
                    gutterBottom
                    variant="h5"
                >
                    Please leave a review on this work
                </Typography>
            </Box>
            <SpecialistPostCard
                user={user}
                handlePostsGet={handlePostsGet}
                key={post.id}
                post={post}
                rating={post.rating || 0}
                comments={post.comments || []}
                createdAt={post.createdAt ? post.createdAt.toDate() : new Date()}
                isLiked={post.likes && post.likes.find(item => item === user.id)}
                likes={post.likes ? post.likes.length : 0}
                media={post.media}
                message={post.message}
                withOgTags={true}
                feedbackShow={true}
            />
        </Dialog>
    );
};