import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Container,
    Link, Rating,
    Stack,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from '@mui/material';
import { styled } from "@mui/material/styles";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import Slider from 'react-slick';
import { dictionaryApi } from "src/api/dictionary";
import { profileApi } from "src/api/profile";
import { servicesFeedApi } from "src/api/servicesFeed";
import { ProjectStatus } from "src/enums/project-state";
import { useMounted } from "src/hooks/use-mounted";
import { firestore } from "src/libs/firebase";
import { getSiteDuration } from "src/utils/date-locale";
import { roles } from "src/roles";

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
    };
    cursor: "pointer";
`

export const useContractors = () => {
    const [contractors, setContractors] = useState([]);
    const isMounted = useMounted();

    const handleContractorsGet = useCallback(async () => {
        try {
            // 1. Получаем активных исполнителей (сортировка по lastSeen)
            const profilesCollection = collection(firestore, "profiles");
            const profilesQuery = query(
                profilesCollection,
                where("role", "==", roles.WORKER),
                orderBy("lastSeen", "desc"),
                limit(8)
            );

            const profilesSnapshot = await getDocs(profilesQuery);
            const activeProfiles = profilesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!isMounted() || activeProfiles.length === 0) {
                setContractors([]);
                return;
            }

            // 2. Параллельно получаем:
            // - специализации пользователей
            // - проекты пользователей
            // - словарь специальностей
            const [userSpecialtiesList, userProjects, specialtiesDictionary] = await Promise.all([
                Promise.all(activeProfiles.map(profile =>
                    profileApi.getUserSpecialtiesById(profile.id)
                )),
                Promise.all(activeProfiles.map(profile =>
                    servicesFeedApi.getProjects({ userId: profile.id })
                )),
                dictionaryApi.getAllSpecialties()
            ]);

            // 3. Формируем обогащенные профили
            const enrichedProfiles = activeProfiles.map((profile, index) => {
                const specialties = userSpecialtiesList[index]
                    .map(uS => specialtiesDictionary.byId[uS.specialty])
                    .filter(Boolean);

                const projects = userProjects[index];
                const completedProjects = projects.filter(p =>
                    p.projectStatus === ProjectStatus.COMPLETED
                );
                const ratedProjects = projects.filter(p => p.rating > 0);

                return {
                    ...profile,
                    specialties,
                    completedProjectsCount: completedProjects.length,
                    reviewsCount: ratedProjects.length,
                    rating: ratedProjects.length > 0
                        ? ratedProjects.reduce((sum, p) => sum + p.rating, 0) / ratedProjects.length
                        : 0,
                    lastProject: projects[0] || null // самый свежий проект
                };
            });

            // 4. Формируем финальный список подрядчиков
            const contractorsData = enrichedProfiles.map(profile => {
                const specImages = profile.specialties.filter(s => s.img);
                return {
                    id: profile.id,
                    profile,
                    url: `/contractors/${profile.id}`,
                    avatar: profile.avatar,
                    name: profile.name || profile.displayName,
                    completedProjects: profile.completedProjectsCount,
                    reviewsCount: profile.reviewsCount,
                    rating: profile.rating,
                    memberSince: profile.registrationAt
                        ? getSiteDuration(profile.registrationAt.toDate())
                        : null,
                    skills: profile.specialties.slice(0, 5).map(s => s.label),
                    coverImage: profile.cover ||
                        (specImages[0]?.img || "/assets/covers/abstract-1-4x4-small.png"),
                    lastActivity: profile.lastSeen?.toDate() || null,
                    lastProject: profile.lastProject
                };
            });

            setContractors(contractorsData);
        } catch (error) {
            console.error("Failed to load contractors:", error);
            if (isMounted()) {
                setContractors([]);
            }
        }
    }, [isMounted]);

    useEffect(() => {
        handleContractorsGet();
    }, [handleContractorsGet]);

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
                    sx={{ pb: '60px', pt: '60px' }}
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
                                    <ShadowCard sx={{ height: '100%' }}>
                                        <CardMedia
                                            image={applicant.coverImage}
                                            sx={{ height: 100 }}
                                        />
                                        <CardContent sx={{ pt: 0 }}>
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
                                                    sx={{ display: 'block', fontSize: "19px" }}
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
