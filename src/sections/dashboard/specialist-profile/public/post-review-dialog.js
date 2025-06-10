import {Box, Dialog, IconButton, Stack, SvgIcon, Typography, useMediaQuery} from '@mui/material';
import {SpecialistPostCard} from "./specialist-post-card";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";
import {useNavigate} from "react-router-dom";

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
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(window.location.pathname);
        onClose();
    }

    return (
        <Dialog
            fullWidth
            fullScreen={!smUp}
            maxWidth="md"
            onClose={handleClose}
            open={open}
            scroll={"body"}
        >
            <Box sx={{p: 3}}>
                <Stack justifyContent={"space-between"} alignItems={"center"} direction={"row"}>
                    <Typography
                        align="center"
                        gutterBottom
                        variant="h5"
                    >
                        Please leave a review on this work
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <SvgIcon>
                            <CloseIcon/>
                        </SvgIcon>
                    </IconButton>
                </Stack>
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