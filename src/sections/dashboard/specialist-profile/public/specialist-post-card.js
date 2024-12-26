import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {styled} from "@mui/material/styles";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
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
    CardHeader, Chip,
    Divider,
    IconButton,
    ImageList,
    ImageListItem,
    Link,
    Rating,
    Stack,
    SvgIcon, TextField,
    Tooltip,
    Typography, useMediaQuery
} from '@mui/material';
import Markdown from "react-markdown";
import ProjectStatusDisplay from "src/components/project-status-display";
import {ProjectStatus} from "src/enums/project-state";
import {paths} from "src/paths";
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
import EditIcon from "@mui/icons-material/Edit";
import {SpecialistPostAdd} from "./specialist-post-add";
import {SpecialistPostEdit} from "./specialist-post-edit";
import dayjs from "dayjs";
import {formatDateRange} from "../../../../utils/date-locale";
import {AddReviewForm} from "./add-review-form";
import DeleteIcon from '@mui/icons-material/Delete';

const labels1: { [index: string]: string } = {
    0: 'The work has not been evaluated yet',
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

const getProfileSharedLink = (userId) => {
    return process.env.REACT_APP_HOST_P + "/specialist/" + userId;
}

function getPostSharedLink(userId, post) {
    return getProfileSharedLink(userId) + "?postId=" + post.id;
}

const getPostAction = (smUp, action, icon, title, color = "info") => {
    return smUp ? (
            <Button
                color={color}
                size="small"
                startIcon={(
                    <SvgIcon>
                        {icon}
                    </SvgIcon>
                )}
                variant="outlined"
                onClick={action}
            >
                {title}
            </Button>
        ) :
        (<Tooltip title={title}>
            <IconButton onClick={action} color={color}>
                <SvgIcon>
                    {icon}
                </SvgIcon>
            </IconButton>
        </Tooltip>);
}
export const SpecialistPostCard = (props) => {
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
        message, handlePostRemove, handlePostsGet, handlePostEdit,
        withOgTags, feedbackShow = false,
        ...other
    } = props;

    const location = useLocation();
    const [showComments, setShowComments] = useState(false);
    const [customerFeedbackEdit, setCustomerFeedbackEdit] = useState(feedbackShow);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const author = useAuthor(post.authorId);

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

    const handleShowComments = () => {
        setShowComments(!showComments);
    }
    const handleHideFeedbackEdit = useCallback(() => {
        setCustomerFeedbackEdit(false);
    }, []);

    const isPostType = post.postType === "post";
    const PROJECT_COMPLETED = post.projectStatus === ProjectStatus.COMPLETED;
    return (
        <Card {...other}>
            <Helmet>
                <meta property="og:url"
                      content={process.env.REACT_APP_HOST_P + location.pathname}/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content="Please leave a review on this work"/>
                <meta property="og:description" content={post.description}/>
                {(post.photos || []).map((item) => {
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
                        href={getProfileSharedLink(post.authorId)}
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
                            href={getProfileSharedLink(post.authorId)}
                            variant="subtitle2"
                        >
                            {post.authorName}
                        </Link>
                    </Stack>
                )}
                action={<Stack spacing={smUp ? 1 : 0} direction={smUp ? "row" : "column"}>
                    {user.id === post.authorId ?
                        <>
                            {/*<SharingMenu url={getPostSharedLink(user, post)}
                                                 title={"Please leave a review on this work"}
                                                 post={post}
                                                 user={user}/>*/}
                            {handlePostEdit &&
                                getPostAction(smUp, () => {
                                    handlePostEdit(post);
                                }, <EditIcon/>, "Edit post")}
                            {handlePostRemove &&
                                getPostAction(smUp, () => {
                                    handlePostRemove(post);
                                }, <DeleteIcon/>, "Delete", "error")}
                        </>
                        : <></>
                    }
                </Stack>}
            />
            <Box
                sx={{
                    pb: 2,
                    px: 3
                }}
            >
                <Stack spacing={2}>
                    {isPostType ?
                        (<>
                            <Typography
                                color="text.primary"
                                variant="h6"
                            >
                                {post.title}
                            </Typography>
                            <Typography variant="subtitle2">
                                <div dangerouslySetInnerHTML={{__html: post.description}}/>
                            </Typography>
                        </>)

                        :

                        (<>
                                <Stack direction={smUp ? "row" : "column"} spacing={smUp ? 14 : 2}>
                                    {post.customerId &&
                                        <Stack spacing={0}>
                                            <Typography
                                                color="text.secondary"
                                                variant="overline"
                                            >
                                                Customer
                                            </Typography>
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                spacing={1}
                                            >
                                                <Avatar src={post.customerAvatar} component={"a"} href={getProfileSharedLink(post.customerId)}/>
                                                <Link
                                                    color="text.primary"
                                                    href={getProfileSharedLink(post.customerId)}
                                                    variant="subtitle2"
                                                >
                                                    {post.customerName}
                                                </Link>
                                            </Stack>
                                        </Stack>}
                                    <Stack spacing={0}>
                                        <Typography
                                            color="text.secondary"
                                            variant="overline"
                                        >
                                            Contractor
                                        </Typography>
                                        {post.contractorId ?
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                spacing={1}
                                            >
                                                <Avatar src={post.contractorAvatar} component={"a"} href={getProfileSharedLink(post.contractorId)}/>
                                                <Link
                                                    color="text.primary"
                                                    href={getProfileSharedLink(post.contractorId)}
                                                    variant="subtitle2"
                                                >
                                                    {post.contractorName}
                                                </Link>
                                            </Stack>
                                            :
                                            <Button
                                                color={"success"}
                                                size="medium"
                                                startIcon={(
                                                    <SvgIcon>
                                                        <PlusIcon/>
                                                    </SvgIcon>
                                                )}
                                                variant="contained"
                                                onClick={() => {
                                                    alert("This feature will be available very soon! Stay tuned for the release.")
                                                }}
                                            >
                                                Apply to participate as a contractor
                                            </Button>
                                        }
                                    </Stack>
                                </Stack>
                                <Divider sx={{my: 3}}/>
                                <Stack direction={smUp ? "row" : "column"} spacing={smUp ? 10 : 2}>
                                    <Stack spacing={0}>
                                        <Typography
                                            color="text.secondary"
                                            variant="overline"
                                        >
                                            Project Name
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            {post.title}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={0}>
                                        <Typography
                                            color="text.secondary"
                                            variant="overline"
                                        >
                                            Dates
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            {formatDateRange(post.startDate.toDate(), post.endDate.toDate())}
                                        </Typography>
                                    </Stack>
                                    {post.location &&
                                        <Stack spacing={0}>
                                            <Typography
                                                color="text.secondary"
                                                variant="overline"
                                            >
                                                Location
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                {post.location.place_name.split(",")[0]}
                                            </Typography>
                                        </Stack>}
                                    <Stack spacing={0}>
                                        <Typography
                                            color="text.secondary"
                                            variant="overline"
                                        >
                                            Status
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            <ProjectStatusDisplay status={post.projectStatus}/>
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Stack spacing={0}>
                                    <Typography
                                        color="text.secondary"
                                        variant="overline"
                                    >
                                        Description
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        <div dangerouslySetInnerHTML={{__html: post.description}}/>
                                    </Typography>
                                </Stack>

                                {PROJECT_COMPLETED &&
                                    <>
                                        <Divider sx={{my: 3}}/>
                                        <Stack spacing={0}>
                                            <Typography
                                                color="text.secondary"
                                                variant="overline"
                                            >
                                                Final Result Description
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                <div dangerouslySetInnerHTML={{__html: post.finalDescription}}/>
                                            </Typography>
                                        </Stack>
                                        {post.specialties &&
                                            <Stack spacing={0}>
                                                <Typography
                                                    color="text.secondary"
                                                    variant="overline"
                                                >
                                                    Specialties Applied
                                                </Typography>
                                                <div>
                                                    <Stack direction={"row"} spacing={1}>
                                                        {post.specialties.map((spec) => (
                                                            <Chip
                                                                key={spec.id}
                                                                label={spec.label}
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Stack>
                                                </div>
                                            </Stack>}
                                    </>}
                            </>
                        )}
                    {PROJECT_COMPLETED && post.photos && post.photos.length !== 0 &&
                        <Stack spacing={0}>
                            {!isPostType && <Typography
                                color="text.secondary"
                                variant="overline"
                            >
                                Photos & videos
                            </Typography>}
                            <Fancybox
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

                            </Fancybox>
                        </Stack>}
                </Stack>

                {PROJECT_COMPLETED && post.customerEmail && !customerFeedbackEdit &&
                    <>
                        <Divider sx={{my: 3}}/>
                        <Stack direction={"row"} justifyContent={"space-between"}>
                            {user.email === post.customerEmail ?
                                (
                                    <>
                                        <Typography variant={"h6"} sx={{mb: 3}}>
                                            My feedback
                                        </Typography>
                                        <Tooltip title={"Edit feedback"}>
                                            <IconButton onClick={() => {
                                                setCustomerFeedbackEdit(true);
                                            }}>
                                                <SvgIcon>
                                                    <EditIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </>) : (
                                    <Typography variant={"h6"} sx={{mb: 3}}>
                                        Customer feedback
                                    </Typography>
                                )}
                        </Stack>
                        <Stack direction={smUp ? "row" : "column"} spacing={2} alignItems={"center"} sx={{mb: 2}}>
                            <Rating
                                size="medium"
                                value={post.rating || 0}
                                readOnly={true}
                            />
                            <Typography component={"legend"} variant={"subtitle2"}>
                                {labels1[post.rating || 0]}
                            </Typography>
                        </Stack>

                        {post.customerFeedback &&
                            <Stack
                                alignItems="flex-start"
                                direction="row"
                                spacing={2}
                                sx={{mt: 3}}
                                {...other}>
                                <Avatar
                                    component="a"
                                    href={process.env.REACT_APP_HOST_P + "/specialist/" + post.customerId}
                                    src={post.customerAvatar}
                                />
                                <Stack
                                    spacing={1}
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                                            ? 'neutral.800'
                                            : 'neutral.50',
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 2
                                    }}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                    >
                                        <Link
                                            color="text.primary"
                                            href={process.env.REACT_APP_HOST_P + "/specialist/" + post.customerId}
                                            variant="subtitle2"
                                        >
                                            {post.customerName}
                                        </Link>
                                        <Box sx={{flexGrow: 1}}/>
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {formatDistanceToNowStrict(post.customerFeedbackDate.toDate())}
                                            {' '}
                                            ago
                                        </Typography>
                                    </Stack>

                                    <Typography variant="body2">
                                        <div dangerouslySetInnerHTML={{__html: post.customerFeedback}}/>
                                    </Typography>
                                </Stack>
                            </Stack>}

                    </>}
                {PROJECT_COMPLETED && post.customerEmail && post.customerEmail === user.email && customerFeedbackEdit && <>
                    <Divider sx={{my: 3}}/>
                    <AddReviewForm post={post} user={user} author={author} onEditHide={handleHideFeedbackEdit}/>
                </>
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
                            <Button
                                onClick={handleShowComments}
                                sx={{ml: "10px"}}
                                color="inherit"
                                /* endIcon={(
                                     <SvgIcon>
                                         <ArrowRightIcon/>
                                     </SvgIcon>
                                 )}*/
                            >
                                {showComments ? "Hide comments" : "Show comments"}
                            </Button>
                        </Stack>
                    </div>
                </Stack>
                {showComments && comments.length > 0 && <>
                    <Stack spacing={3} sx={{my: 3}}>
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
                {showComments && (
                    <>
                        <Divider sx={{my: 3}}/>
                        <SpecialistCommentAdd user={user} post={post} handlePostsGet={handlePostsGet}/>
                    </>
                )}
            </Box>
        </Card>
    );
};

SpecialistPostCard.propTypes = {
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
