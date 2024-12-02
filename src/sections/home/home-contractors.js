import {
    Avatar,
    Box,
    Card,
    CardContent, CardMedia, Chip,
    Container,
    Divider, Link,
    Rating,
    Stack,
    Typography,
    Unstable_Grid2 as Grid, useMediaQuery
} from '@mui/material';
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useMounted} from "../../hooks/use-mounted";
import {servicesFeedApi} from "../../api/servicesFeed";
import {RouterLink} from "../../components/router-link";
import Slider from 'react-slick';

const APPLS = [
    {
        id: '5e887a62195cc5aef7e8ca5d',
        avatar: '/assets/avatars/avatar-marcus-finn.png',
        commonContacts: 12,
        cover: '/assets/covers/minimal-1-4x4-small.png',
        name: 'Marcus Finn',
        skills: [
            'UX',
            'Frontend development',
            'HTML5',
            'VueJS',
            'ReactJS'
        ]
    },
    {
        id: '5e86809283e28b96d2d38537',
        avatar: '/assets/avatars/avatar-anika-visser.png',
        commonContacts: 17,
        cover: '/assets/covers/abstract-1-4x4-small.png',
        name: 'Anika Visser',
        skills: [
            'Backend development',
            'Firebase',
            'MongoDB',
            'ExpressJS'
        ]
    },
    {
        id: '5e887ac47eed253091be10cb',
        avatar: '/assets/avatars/avatar-carson-darrin.png',
        commonContacts: 5,
        cover: '/assets/covers/minimal-2-4x4-small.png',
        name: 'Carson Darrin',
        skills: [
            'UI',
            'UX',
            'Full-Stack development',
            'Angular',
            'ExpressJS'
        ]
    },
    {
        id: '5e86809283e28b96d2d38537',
        avatar: '/assets/avatars/avatar-anika-visser.png',
        commonContacts: 17,
        cover: '/assets/covers/abstract-1-4x4-small.png',
        name: 'Anika Visser',
        skills: [
            'Backend development',
            'Firebase',
            'MongoDB',
            'ExpressJS'
        ]
    },
    {
        id: '5e887ac47eed253091be10cb',
        avatar: '/assets/avatars/avatar-carson-darrin.png',
        commonContacts: 5,
        cover: '/assets/covers/minimal-2-4x4-small.png',
        name: 'Carson Darrin',
        skills: [
            'UI',
            'UX',
            'Full-Stack development',
            'Angular',
            'ExpressJS'
        ]
    }
];

function getPostSharedLink(url, postid) {
    return process.env.REACT_APP_HOST_P + "/specialist/" + url + "?postId=" + postid;
}

export const useContractors = () => {
    const [contractors, setContractors] = useState([]);
    const isMounted = useMounted();

    const handleContractorsGet = useCallback(async () => {
        /* const response = await servicesFeedApi.getLastPostsContractors(6);
         const lastContractors = [];
         response.forEach((doc) => {
             const post = doc.data();
             lastContractors.push({
                 author: post.customerName,
                 message: post.customerFeedback,
                 stars: post.rating,
                 url: getPostSharedLink(post.userId, doc.id)
             })
         });*/
        if (isMounted()) {
            setContractors(APPLS);
        }
    }, [isMounted]);

    useEffect(() => {
            handleContractorsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return [contractors, handleContractorsGet];
};

export const HomeContractors = () => {
    const [contractors, handleContractorsGet] = useContractors();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const sliderSettings = {
        arrows: true,
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: (!downSm ? 3 : 2),
        slidesToScroll: 2,
        adaptiveHeight: true,
        autoplay: true,
        lazyLoad: true,
        swipe: downSm
    };

    return (
        <div>
            <Container maxWidth="lg">
                <Stack
                    spacing={8}
                    sx={{pb: '60px'}}
                >
                    <Stack spacing={2}>
                        <Typography
                            align="center"
                            variant="h3"
                        >
                            Experts in Their Field
                        </Typography>
                        <Typography
                            align="center"
                            color="text.secondary"
                            variant="subtitle1"
                        >
                            Each of our specialists brings years of experience and a proven track record to deliver high-quality solutions for any challenge.
                        </Typography>
                    </Stack>
                    <Grid
                        container
                        spacing={3}
                    >
                        {/*<Slider {...sliderSettings} id={"sdf"}>*/}
                            {contractors.map((applicant) => (
                                // <div key={applicant.id}>
                                    <Grid
                                        key={applicant.id}
                                        md={3}
                                        xs={12}
                                    >
                                        <Card sx={{height: '100%'}}>
                                            <CardMedia
                                                image={applicant.cover}
                                                sx={{height: 100}}
                                            />
                                            <CardContent sx={{pt: 0}}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        mb: 2,
                                                        mt: '-50px'
                                                    }}
                                                >
                                                    <Avatar
                                                        alt="Applicant"
                                                        src={applicant.avatar}
                                                        sx={{
                                                            border: '3px solid #FFFFFF',
                                                            height: 100,
                                                            width: 100
                                                        }}
                                                    />
                                                </Box>
                                                <Link
                                                    align="center"
                                                    color="text.primary"
                                                    sx={{display: 'block'}}
                                                    underline="none"
                                                    variant="h6"
                                                >
                                                    {applicant.name}
                                                </Link>
                                                <Typography
                                                    align="center"
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {applicant.commonContacts}
                                                    {' '}
                                                    contacts in common
                                                </Typography>
                                                <Divider sx={{my: 2}}/>
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={0.5}
                                                >
                                                    {applicant.skills.map((skill) => (
                                                        <Chip
                                                            key={skill}
                                                            label={skill}
                                                            sx={{m: 0.5}}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                // </div>
                            ))}
                        {/*</Slider>*/}
                    </Grid>
                </Stack>
            </Container>
        </div>
    );
}
