import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistance, formatDistanceToNowStrict } from 'date-fns';
import ClockIcon from '@untitled-ui/icons-react/build/esm/Clock';
import HeartIcon from '@untitled-ui/icons-react/build/esm/Heart';
import Share07Icon from '@untitled-ui/icons-react/build/esm/Share07';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardHeader,
    CardMedia, Chip,
    Divider,
    IconButton, ImageList, ImageListItem,
    Link,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import { SocialComment } from './social-comment';
import { SocialCommentAdd } from './social-comment-add';
import * as React from "react";
import Expand01Icon from "@untitled-ui/icons-react/build/esm/Expand01";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAuth } from "../../../hooks/use-auth";
import ServicesFeed from "../../../pages/dashboard/servicesFeed";
import { servicesFeedApi } from "../../../api/servicesFeed";

export const ServicePostCard = (props) => {
    const {
        post,
        key,
        authorId,
        authorAvatar,
        authorName,
        comments,
        location,
        createdAt,
        isLiked: isLikedProp,
        likesProp,
        medias,
        start,
        end,
        message,
        services,
        docId,
        ...other
    } = props;
    const { user } = useAuth();

    const isMyLikeExist = () => {
        if (likesProp)
            for (let i = 0; i < likesProp.length; i++) {
                if (likesProp[i] === user.id)
                    return true;
            }
        return false;
    }

    const [isLiked, setIsLiked] = useState(isMyLikeExist());
    const [likes, setLikes] = useState(likesProp ? likesProp.length : 0);

    const handleLike = useCallback(() => {
        setIsLiked(true);
        setLikes((prevLikes) => prevLikes + 1);
        servicesFeedApi.liker(docId, post, user.id)
    }, []);

    const handleUnlike = useCallback(() => {
        setIsLiked(false);
        setLikes((prevLikes) => prevLikes - 1);
        servicesFeedApi.disliker(docId, post, user.id)
    }, []);

    return (
        <Card {...other}>
            <CardHeader
                avatar={(
                    <Avatar
                        component="a"
                        href="#"
                        src={authorAvatar}
                    />
                )}
                disableTypography
                subheader={(
                    <Stack direction="row"
                        spacing={3}>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            <SvgIcon color="action">
                                <ClockIcon />
                            </SvgIcon>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {'from '}
                                {start.toDateString()}
                                {' to '}
                                {end.toDateString()}
                            </Typography>
                        </Stack>

                    </Stack>
                )}
                title={(
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                    >
                        <Typography
                            sx={{ flexGrow: 1 }}
                            variant="h6"
                        >
                            {location}
                        </Typography>
                        <IconButton>
                            <SvgIcon>
                                <EditIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton color={"error"}>
                            <SvgIcon>
                                <DeleteForeverIcon />
                            </SvgIcon>
                        </IconButton>
                    </Stack>
                )}
            />
            <Box
                sx={{
                    pb: 2,
                    px: 3
                }}
            >
                <Stack direction="row" spacing={1} sx={{
                    pb: 2
                }}>
                    {services.map((service) => (
                        <Box key={service.name}>
                            <Chip variant="outlined" label={service.name} />
                        </Box>
                    ))}
                </Stack>

                <Typography variant="body1">
                    {message}
                </Typography>

                <ImageList cols={5} gap={8} variant="masonry" rowHeight={164}>
                    {medias.map((item) => (
                        <ImageListItem variant="quilted" key={item}>
                            <img
                                src={`${item}`}
                                srcSet={`${item}`}
                                // alt={item.title}
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>

                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mt: 2 }}
                >
                    <div>
                        <Stack
                            alignItems="center"
                            direction="row"
                        >
                            {isLiked
                                ? (
                                    <Tooltip title="Unlike">
                                        <IconButton onClick={handleUnlike}>
                                            <SvgIcon
                                                sx={{
                                                    color: 'error.main',
                                                    '& path': {
                                                        fill: (theme) => theme.palette.error.main,
                                                        fillOpacity: 1
                                                    }
                                                }}
                                            >
                                                <HeartIcon />
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                )
                                : (
                                    <Tooltip title="Like">
                                        <IconButton onClick={handleLike}>
                                            <SvgIcon>
                                                <HeartIcon />
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            <Typography
                                color="text.secondary"
                                variant="subtitle2"
                            >
                                {likes}
                            </Typography>
                        </Stack>
                    </div>
                    <div>
                        <IconButton>
                            <SvgIcon>
                                <Share07Icon />
                            </SvgIcon>
                        </IconButton>
                    </div>
                </Stack>

                {comments && (<Stack spacing={3}>
                    {comments.map((comment) => (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <SocialComment
                                authorAvatar={comment.author.avatar}
                                authorName={comment.author.name}
                                createdAt={comment.createdAt}
                                key={comment.id}
                                message={comment.message}
                            />
                        </>
                    ))}
                </Stack>)}
                {/* <Divider sx={{my: 3}}/>
                <SpecialistCommentAdd/>*/}
            </Box>
        </Card>
    );
};

ServicePostCard.propTypes = {
    authorAvatar: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    comments: PropTypes.array.isRequired,
    createdAt: PropTypes.number.isRequired,
    isLiked: PropTypes.bool.isRequired,
    likes: PropTypes.number.isRequired,
    media: PropTypes.string,
    message: PropTypes.string.isRequired
};
