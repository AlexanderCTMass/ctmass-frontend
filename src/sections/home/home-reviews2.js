import {
    Avatar,
    Box,
    Card,
    CardContent, CardMedia,
    Container,
    Divider, IconButton, Link,
    Rating,
    Stack, SvgIcon, Tooltip,
    Typography,
    Unstable_Grid2 as Grid, useMediaQuery
} from '@mui/material';
import HeartIcon from "@untitled-ui/icons-react/build/esm/Heart";
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import {formatDistanceToNowStrict} from "date-fns";
import debug from "debug";
import numeral from "numeral";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useMounted} from "../../hooks/use-mounted";
import {servicesFeedApi} from "../../api/servicesFeed";
import {RouterLink} from "../../components/router-link";
import Slider from "react-slick"; // Импорт react-slick
const logger = debug("[Home reviews]")


const labels1: { [index: string]: string } = {
    0: '',
    1: 'Got more problems than benefits',
    2: 'I`ve got couple major problems',
    3: 'Acceptable',
    4: 'Good, but I`ve got a couple problems',
    5: 'Perfect',
};

function getPostSharedLink(url, postid) {
    return getReviewerSharedLink(url) + "?postId=" + postid;
}


function getReviewerSharedLink(url) {
    return process.env.REACT_APP_HOST_P + "/specialist/" + url;
}

export const useReviews = (count) => {
    const [reviews, setReviews] = useState([]);
    const isMounted = useMounted();

    const handleReviewsGet = useCallback(async () => {
        const posts = await servicesFeedApi.getLastPostsReviews(count);
        const lastReviews = [];
        posts.forEach((post) => {
            logger(post);
            lastReviews.push({
                createdAt: post.createdAt.toDate(),
                contractorName: post.contractorName,
                contractorAvatar: post.contractorAvatar,
                title: post.title || labels1[post.rating],
                reviewer: post.customerName,
                reviewerAvatar: post.customerAvatar,
                message: post.customerFeedback,
                rating: post.rating,
                commentsCount: post.comments.length,
                postUrl: getPostSharedLink(post.contractorId, post.id),
                reviewerUrl: getReviewerSharedLink(post.customerId),
                image: post.photos[0],
                likes: (post.likes || []).length
            })
        });
        if (isMounted()) {
            setReviews(lastReviews);
        }
    }, [isMounted]);

    useEffect(() => {
            handleReviewsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return [reviews, handleReviewsGet];
};

export const HomeReviews2 = () => {
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [reviews, handleReviewsGet] = useReviews(downSm ? 10 : 24);

    const maxLength = 200;
    const sliderSettings = {
        dots: true,
        arrows: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div>
            <Container maxWidth="lg">
                <Stack
                    spacing={8}
                    sx={{py: '120px'}}
                >
                    <Stack spacing={2}>
                        <Typography
                            align="center"
                            variant="h3"
                        >
                            We strive to be useful and people are grateful to us.
                        </Typography>
                        <Typography
                            align="center"
                            color="text.secondary"
                            variant="subtitle1"
                        >
                            Every specialist and performer undergoes a thorough check, so we guarantee customers quality
                            and deadlines.<br/> Each client can leave a review, and you can see them
                        </Typography>
                    </Stack>
                    <Slider {...sliderSettings}>
                        {reviews.length > 0 &&
                            reviews.reduce((chunks, review, index) => {
                                const chunkIndex = Math.floor(index / (downSm ? 2 : 6));
                                if (!chunks[chunkIndex]) {
                                    chunks[chunkIndex] = [];
                                }
                                chunks[chunkIndex].push(review);
                                return chunks;
                            }, []).map((chunk, chunkIndex) => (
                                <Box key={chunkIndex} sx={{px: 1}}>
                                    <Grid container spacing={2}>
                                        {chunk.map((review, index) => (
                                            <Grid
                                                key={index}
                                                item
                                                xs={12}
                                                sm={4}
                                            >
                                                <Box>
                                                    <Box sx={{p: 2}}>
                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                mt: 2
                                                            }}
                                                        >
                                                            <Avatar src={review.contractorAvatar}/>
                                                            <Box sx={{ml: 2}}>
                                                                <Link
                                                                    color="text.primary"
                                                                    variant="h6"
                                                                    href={review.postUrl}
                                                                >
                                                                    {review.contractorName}
                                                                </Link>
                                                                <Typography
                                                                    color="text.secondary"
                                                                    variant="body2"
                                                                >
                                                                    review from{' '}
                                                                    <Link
                                                                        color="text.primary"
                                                                        variant="subtitle2"
                                                                        href={review.reviewerUrl}
                                                                    >
                                                                        {review.reviewer}
                                                                    </Link>
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            pb: 2,
                                                            px: 3
                                                        }}
                                                    >
                                                        <Link
                                                            color="text.primary"
                                                            variant="h6"
                                                            href={review.postUrl}
                                                        >
                                                            {review.title}
                                                        </Link>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="body2"
                                                        >
                                                            {review.message.length > maxLength ? (
                                                                <>
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: review.message.slice(0, maxLength) +
                                                                    "..."
                                                            }}/>
                                                                    <Link href={review.postUrl} color="primary">Read
                                                                        more</Link>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        dangerouslySetInnerHTML={{__html: review.message}}/>
                                                                    <Link href={review.postUrl} color="primary">Read
                                                                        more</Link>
                                                                </>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            alignItems: 'center',
                                                            display: 'flex',
                                                            pl: 2,
                                                            pr: 3,
                                                            pb: 2
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex'
                                                            }}
                                                        >
                                                                <IconButton>
                                                                    <SvgIcon
                                                                        sx={{
                                                                            color: 'error.main',
                                                                            '& path': {
                                                                                fill: (theme) => {
                                                                                    if (review.likes > 0) {
                                                                                        return theme.palette.error.main;
                                                                                    } else {
                                                                                        return theme.palette.grey.main;
                                                                                    }
                                                                                },
                                                                                fillOpacity: 1
                                                                            }
                                                                        }}
                                                                    >
                                                                        <HeartIcon/>
                                                                    </SvgIcon>
                                                                </IconButton>
                                                            <Typography
                                                                color="text.secondary"
                                                                variant="subtitle2"
                                                            >
                                                                {review.likes}
                                                            </Typography>
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                ml: 2
                                                            }}
                                                        >
                                                            <SvgIcon>
                                                                <Users01Icon/>
                                                            </SvgIcon>
                                                            <Typography
                                                                color="text.secondary"
                                                                sx={{ml: 1}}
                                                                variant="subtitle2"
                                                            >
                                                                {review.commentsCount}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{flexGrow: 1}}/>
                                                        <Rating
                                                            readOnly
                                                            size="small"
                                                            value={review.rating}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                    </Slider>
                </Stack>
            </Container>
        </div>
    );
}
