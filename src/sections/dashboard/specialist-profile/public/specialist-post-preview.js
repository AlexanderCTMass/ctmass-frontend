import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {formatDistanceToNowStrict} from 'date-fns';
import ClockIcon from '@untitled-ui/icons-react/build/esm/Clock';
import HeartIcon from '@untitled-ui/icons-react/build/esm/Heart';
import Share07Icon from '@untitled-ui/icons-react/build/esm/Share07';
import {
    Avatar,
    Box, Button,
    Card,
    CardHeader,
    Divider,
    IconButton,
    ImageList,
    ImageListItem,
    Link,
    Rating,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import {SpecialistComment} from './specialist-comment';
import {SpecialistCommentAdd} from './specialist-comment-add';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import toast from "react-hot-toast";
import {useMounted} from "../../../../hooks/use-mounted";
import {profileApi} from "../../../../api/profile";
import {servicesFeedApi} from "../../../../api/servicesFeed";
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import Fancybox from "../../../../components/myfancy/myfancybox";
import {getFileExtension, getFileType} from "../../../../utils/get-file-type";
import {FileIcon} from "../../../../components/file-icon";
import {FacebookProvider, LoginButton, ShareButton} from 'react-facebook';
import {Facebook} from "@mui/icons-material";
import {Helmet} from "react-helmet-async";
import {useLocation} from "react-router-dom";
import {SharingMenu} from "../../../../components/sharing-menu";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";

const labels1: { [index: string]: string } = {
    0: '',
    1: 'Got more problems than benefits',
    2: 'I`ve got couple major problems',
    3: 'Acceptable',
    4: 'Good, but I`ve got a couple problems',
    5: 'Perfect',
};
const useAuthor = (authorId) => {
    const isMounted = useMounted();
    const [autor, setAutor] = useState(null);

    const handleProfileGet = useCallback(async () => {
        try {
            const response = await profileApi.get(authorId);
            console.log(response);
            if (isMounted()) {
                setAutor(response);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
            handleProfileGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return autor;
};

function getPostSharedLink(user, post) {
    return process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + user.profilePage + "?postId=" + post.id;
}

export const SpecialistPostPreview = (props) => {
    const {
        user,
        post,
        userSpecialties,
        comments,
        createdAt,
        isLiked,
        likes,
        media,
        rating,
        message, handlePostRemove, handlePostsGet,
        withOgTags,
        ...other
    } = props;

    const location = useLocation();

    const handleLike = async () => {
        try {
            await servicesFeedApi.like(post.id, user.id);
            await handlePostsGet();
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }

    const handleUnlike = async () => {
        try {
            await servicesFeedApi.unlike(post.id, user.id);
            await handlePostsGet();
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }

    return (
        post.type === "review" ? <Card {...other}>
                <CardHeader
                    avatar={(
                        <Avatar
                            component="a"
                            href="#"
                            src={post.authorAvatar}
                        />
                    )}
                    disableTypography
                    subheader={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            <SvgIcon color="action">
                                <ClockIcon/>
                            </SvgIcon>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {formatDistanceToNowStrict(createdAt)}
                                {' '}
                                ago
                            </Typography>
                        </Stack>
                    )}
                    title={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.5}
                            sx={{mb: 1}}
                        >
                            <Link
                                color="text.primary"
                                href="#"
                                variant="subtitle2"
                            >
                                {post.authorName}
                            </Link>
                            <Typography variant="body2">
                                added a review
                            </Typography>
                        </Stack>
                    )}
                />
                <Box
                    sx={{
                        pb: 2,
                        px: 3
                    }}
                >
                    {rating > 0 &&
                        <Stack direction={"row"} spacing={2} alignItems={"center"} sx={{mb: 2}}>
                            <Rating
                                size="medium"
                                value={rating}
                                readOnly={true}
                            />
                            <Typography component={"legend"} variant={"subtitle2"}>
                                {labels1[rating]}
                            </Typography>
                        </Stack>}
                    <Typography variant="body1">
                        <div dangerouslySetInnerHTML={{__html: post.description}}/>
                    </Typography>
                    {post.photos &&
                        <ImageList cols={4} gap={8} variant="masonry" rowHeight={164}>
                            {post.photos.map((item) => (
                                <ImageListItem key={item}>
                                    <img
                                        src={`${item}`}
                                        srcSet={`${item}`}
                                        // alt={item.title}
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    }
                    {post.photos &&
                        (<LightGallery plugins={[lgZoom, lgVideo]} mode="lg-fade">
                            {post.photos.map((item) => (
                                <>
                                    <a
                                        className="gallery-item"
                                        data-src={`${item}`}
                                        key={item}
                                    >
                                        <img
                                            style={{maxWidth: '400px'}}
                                            className="img-responsive"
                                            alt=""
                                            src={`${item}`}
                                        />
                                    </a>
                                </>
                            ))}

                        </LightGallery>)
                    }
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{mt: 2}}
                    >
                        <div>
                        </div>
                        <div>
                            {user.id === post.authorId ?
                                (handlePostRemove ?
                                    <Tooltip title={"delete"}>
                                        <IconButton onClick={() => {
                                            handlePostRemove(post);
                                        }}>
                                            <SvgIcon>
                                                <HighlightOffIcon sx={{color: "red"}}
                                                />
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip> : <></>)
                                : <></>}
                        </div>
                    </Stack>
                    {comments.length > 0 && <>
                        <Divider sx={{my: 3}}/>
                        <Stack spacing={3}>
                            {comments.map((comment) => (
                                <SpecialistComment
                                    authorAvatar={comment.authorAvatar}
                                    authorName={comment.authorName}
                                    authorId={comment.authorId}
                                    createdAt={comment.createdAt.toDate()}
                                    key={comment.id}
                                    id={comment.id}
                                    message={comment.message}
                                    post={post}
                                    user={user}
                                    handlePostsGet={handlePostsGet}
                                />
                            ))}
                        </Stack>
                    </>}
                    <Divider sx={{my: 3}}/>
                    <SpecialistCommentAdd user={user} post={post} handlePostsGet={handlePostsGet}/>
                </Box>
            </Card>


            :


            <Card {...other}>
                <Helmet>
                    <meta property="og:url"
                          content={process.env.REACT_APP_HOST_P + location.pathname}/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:title" content="Please leave a review on this work"/>
                    <meta property="og:description" content={post.description}/>
                    {post.photos.map((item) => {
                        if (getFileType(item) === "video") {
                            return (<meta property="og:video" content={item}/>);
                        } else if (getFileType(item) === "image") {
                            return (<meta property="og:image" content={item}/>);
                        }
                    })}

                </Helmet>
                <CardHeader
                    avatar={(
                        <Avatar
                            component="a"
                            href="#"
                            src={post.authorAvatar}
                        />
                    )}
                    disableTypography
                    subheader={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            <SvgIcon color="action">
                                <ClockIcon/>
                            </SvgIcon>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {formatDistanceToNowStrict(createdAt)}
                                {' '}
                                ago
                            </Typography>
                        </Stack>
                    )}
                    title={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.5}
                            sx={{mb: 1}}
                        >
                            <Link
                                color="text.primary"
                                href="#"
                                variant="subtitle2"
                            >
                                {post.authorName}
                            </Link>
                        </Stack>
                    )}
                />
                <Box
                    sx={{
                        pb: 2,
                        px: 3
                    }}
                >
                    {post.location &&
                        (<Typography variant="caption" sx={{mb: 1}}>
                            Location: {post.location.place_name.split(",")[0]}<br/>
                        </Typography>)}
                    {post.startDate && post.endDate &&
                        (<Typography variant="caption" sx={{mb: 3}}>
                            Times: {post.startDate.toDate().toDateString()} - {post.endDate.toDate().toDateString()}
                        </Typography>)}
                    <Typography variant="body1" sx={{mb: 3, mt: 3}}>
                        <div dangerouslySetInnerHTML={{__html: post.description}}/>
                    </Typography>
                    {post.photos &&
                        (<Fancybox
                            options={{
                                Carousel: {
                                    infinite: false,
                                },
                            }}
                        >
                            {post.photos.map((item) => {
                                if (getFileType(item) === "video") {
                                    return (
                                        <a data-fancybox="gallery" href={item} className={"my-fancy-link"}>
                                            <video muted preload={"metadata"} controls={false}>
                                                <source src={item}/>
                                            </video>
                                        </a>);
                                } else if (getFileType(item) === "image") {
                                    return (
                                        <a data-fancybox="gallery" href={item} className={"my-fancy-link"}>
                                            <img src={item}/>
                                        </a>
                                    );
                                } else {
                                    return (<a data-fancybox="gallery" href={item} className={"my-fancy-link"}>
                                        <FileIcon extension={getFileExtension(item)}/>
                                    </a>)
                                }
                            })}

                        </Fancybox>)
                    }
                    <Divider sx={{my: 3}}/>

                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{mt: 2}}
                    >
                        <div>
                            <Stack
                                alignItems="center"
                                direction="row"
                            >
                                <IconButton variant="filled" onClick={isLiked ? handleUnlike : handleLike}>
                                    <SvgIcon
                                        sx={isLiked ? {
                                            color: 'error.main',
                                            '& path': {
                                                fill: (theme) => theme.palette.error.main,
                                                fillOpacity: 1
                                            }
                                        } : {}}
                                    >
                                        <HeartIcon/>
                                    </SvgIcon>
                                </IconButton>
                                <Typography
                                    color="text.secondary"
                                    variant="subtitle2"
                                >
                                    {likes}
                                </Typography>
                            </Stack>
                        </div>
                        <div>
                            {user.id === post.authorId ?
                                <>
                                    <SharingMenu url={getPostSharedLink(user, post)}
                                                 title={"Please leave a review on this work"}
                                                 post={post}
                                                 user={user}/>
                                    <Tooltip title={"delete"}>
                                        <IconButton onClick={() => {
                                            handlePostRemove(post);
                                        }}>
                                            <SvgIcon>
                                                <HighlightOffIcon sx={{color: "red"}}
                                                />
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                </>
                                : <></>
                            }
                        </div>
                    </Stack>
                    {/*<Divider sx={{my: 3}}/>*/}
                    {comments.length > 0 && <>
                        <Stack spacing={3}>
                            {comments.map((comment) => (
                                <SpecialistComment
                                    authorAvatar={comment.authorAvatar}
                                    authorName={comment.authorName}
                                    authorId={comment.authorId}
                                    createdAt={comment.createdAt.toDate()}
                                    key={comment.id}
                                    id={comment.id}
                                    message={comment.message}
                                    post={post}
                                    user={user}
                                    handlePostsGet={handlePostsGet}
                                />
                            ))}
                        </Stack>
                    </>
                    }
                    {/*<SpecialistCommentAdd user={user} post={post} handlePostsGet={handlePostsGet}/>*/}
                </Box>
            </Card>
    );
};

SpecialistPostPreview.propTypes = {
    comments: PropTypes.array.isRequired,
    createdAt:
    PropTypes.number.isRequired,
    isLiked:
    PropTypes.bool.isRequired,
    likes:
    PropTypes.number.isRequired,
    media:
    PropTypes.string,
    message:
    PropTypes.string.isRequired,
    withOgTags:
    PropTypes.bool
};
