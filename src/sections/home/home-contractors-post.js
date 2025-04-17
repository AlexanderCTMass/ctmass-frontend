import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Divider,
    Link, Rating,
    Stack,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from '@mui/material';
import {styled} from "@mui/material/styles";
import {collection, getDocs, query, where} from "firebase/firestore";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import Slider from 'react-slick';
import {dictionaryApi} from "src/api/dictionary";
import {profileApi} from "src/api/profile";
import {servicesFeedApi} from "src/api/servicesFeed";
import {ProjectStatus} from "src/enums/project-state";
import {useMounted} from "src/hooks/use-mounted";
import {firestore} from "src/libs/firebase";
import {getSiteDuration} from "src/utils/date-locale";

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
    return process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + url + "?postId=" + postid;
}



const ShadowCard = styled(Card)`
    box-shadow: none;

    &:hover {
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* Добавляет тень при наведении */
    }

,
cursor: "pointer";

`

export const useContractors = () => {
    const [contractors, setContractors] = useState([]);
    const isMounted = useMounted();

    const handleContractorsGet = useCallback(async () => {
        try {
            const lastPosts = await servicesFeedApi.getLastPosts(8);

            if (!isMounted() || lastPosts.length === 0) {
                setContractors([]);
                return;
            }

            // Получаем уникальные идентификаторы авторов из lastPosts
            const authorIds = [...new Set(lastPosts.map(post => post.authorId))];
            const collectionReference = collection(firestore, "profiles");

            // Разбиваем authorIds на чанки по 10 для Firestore
            const chunkedAuthorIds = [];
            for (let i = 0; i < authorIds.length; i += 10) {
                chunkedAuthorIds.push(authorIds.slice(i, i + 10));
            }

            // Получаем данные профилей из Firestore
            const profilePromises = chunkedAuthorIds.map(chunk => {
                const q = query(collectionReference, where("id", "in", chunk));
                return getDocs(q);
            });

            const profileSnapshots = await Promise.all(profilePromises);
            const profiles = new Map();

            // Обрабатываем данные профилей
            for (const snapshot of profileSnapshots) {
                for (const doc of snapshot.docs) {
                    profiles.set(doc.id, {id: doc.id, ...doc.data()});
                }
            }

            // Параллельно получаем специализации и словарь специальностей
            const userSpecialtiesPromises = Array.from(profiles.keys()).map(id =>
                profileApi.getUserSpecialtiesById(id)
            );
            const userPostPromises = Array.from(profiles.keys()).map(id =>
                servicesFeedApi.getPosts({userId: id})
            );
            const specialtiesDictionaryPromise = dictionaryApi.getAllSpecialties();

            const [userSpecialtiesList, userPosts, specialtiesDictionary] = await Promise.all([
                Promise.all(userSpecialtiesPromises),
                Promise.all(userPostPromises),
                specialtiesDictionaryPromise,
            ]);

            // Добавляем специализации к профилям
            Array.from(profiles.keys()).forEach((id, index) => {
                const userSpecialties = userSpecialtiesList[index];
                const profile = profiles.get(id);
                profile.specialties =
                    userSpecialties.length === 0
                        ? []
                        : userSpecialties.map(uS => specialtiesDictionary.byId[uS.specialty]).filter(spec => Boolean(spec));
                const posts = userPosts[index];
                const completedProjects = posts.filter((p) => (p.postType === "project" && p.projectStatus === ProjectStatus.COMPLETED));
                profile.cocompletedProjects = completedProjects.length;
                const reviews = posts.filter((p) => (p.postType === "project" && p.rating > 0));
                profile.reviewsLength = reviews.length;
                if (reviews.length > 0) {
                    let result = reviews.reduce((sum, current) => sum + current.rating, 0);
                    profile.rating = result / reviews.length;
                }
            });

            // Формируем список исполнителей
            const contractors = lastPosts.map(post => {
                const profile = profiles.get(post.authorId);
                const specImages = profile && profile.specialties.filter(skill => skill.img) || [];
                return {
                    id: post.id,
                    profile: profile || null,
                    url: post.authorId,
                    avatar: post.authorAvatar,
                    name: post.authorName,
                    cocompletedProjects: profile ? profile.cocompletedProjects : 0,
                    reviewsLength: profile ? profile.reviewsLength : 0,
                    rating: profile ? profile.rating : 0,
                    since: Boolean(profile && profile.registrationAt) ? getSiteDuration(profile.registrationAt.toDate()) : null,
                    skills: profile ? profile.specialties.slice(0, 5).map(spec => spec.label) : [],
                    coverImage: profile && profile.cover || (specImages.length > 0 ? specImages[0].img : "/assets/covers/abstract-1-4x4-small.png")
                };
            });

            setContractors(contractors);
        } catch (error) {
            console.error("Ошибка при загрузке исполнителей:", error);
        }
    }, [isMounted]);


    useEffect(() => {
            handleContractorsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return [contractors, handleContractorsGet];
};

function getReviewerSharedLink(url) {
    return process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + url;
}

export const HomeContractors = () => {
    const [contractors, handleContractorsGet] = useContractors();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    return (
        <div>
            <Container maxWidth="lg">
                <Stack
                    spacing={8}
                    sx={{pb: '60px', pt:'60px'}}
                >
                    <Stack spacing={2}>
                        <Typography
                            align="center"
                            variant="h3"
                        >
                            Recently Active Specialists
                        </Typography>
                        <Typography
                            align="center"
                            color="text.secondary"
                            variant="subtitle1"
                        >
                            Meet the experts who have recently shown their activity. They are ready to provide top-notch
                            solutions for your needs.
                        </Typography>
                    </Stack>
                    <Grid
                        container
                        spacing={3}
                    >
                        {contractors.map((applicant) => (
                            // <div key={applicant.id}>
                            <Grid
                                key={applicant.id}
                                md={3}
                                xs={12}
                            > <Link
                                underline="none"
                                href={getReviewerSharedLink(applicant.url)}
                            >
                                <ShadowCard sx={{height: '100%'}}>
                                    <CardMedia
                                        image={applicant.coverImage}
                                        sx={{height: 100}}
                                    />
                                    <CardContent sx={{pt: 0}}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                mb: 2,
                                                mt: '-35px'
                                            }}
                                        >
                                            <Avatar
                                                alt="Applicant"
                                                src={applicant.avatar}
                                                sx={{
                                                    border: '3px solid #FFFFFF',
                                                    height: 70,
                                                    width: 70
                                                }}
                                            />

                                        </Box>
                                        <Stack spacing={1} direction={"column"}>
                                            <Link
                                                align="left"
                                                color="text.primary"
                                                sx={{display: 'block', fontSize: "19px"}}
                                                underline="none"
                                                href={getReviewerSharedLink(applicant.url)}
                                            >
                                                {applicant.name}
                                            </Link>
                                            <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                                <Typography
                                                    noWrap
                                                    variant="body2"
                                                >
                                                    {applicant.since}
                                                </Typography>
                                            </Stack>
                                            <Link
                                                align="left"
                                                color="text.primary"
                                                variant="body2"
                                                href={getReviewerSharedLink(applicant.url)}
                                            >
                                                {applicant.cocompletedProjects} completed projects
                                            </Link>
                                            <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                                <Typography
                                                    noWrap
                                                    variant="body2"
                                                >
                                                    {applicant.rating}
                                                </Typography>
                                                <Rating
                                                    value={applicant.rating}
                                                    precision={0.1}
                                                    readOnly
                                                />

                                            </Stack>
                                            <Link
                                                align="left"
                                                color="text.primary"
                                                variant="body2"
                                                href={getReviewerSharedLink(applicant.url)}
                                            >
                                                {applicant.reviewsLength} reviews
                                            </Link>
                                        </Stack>
                                        {/* <Divider sx={{my: 2}}/>
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
                                        </Stack>*/}
                                    </CardContent>
                                </ShadowCard>
                            </Link>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Container>
        </div>
    );
}
