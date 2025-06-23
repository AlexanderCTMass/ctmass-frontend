import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import {
    Avatar,
    Box,
    Card, CircularProgress,
    Container,
    Divider,
    Link,
    Rating,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from '@mui/material';
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import * as React from "react";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {servicesFeedApi} from "src/api/servicesFeed";
import {FileIcon} from "src/components/file-icon";
import Fancybox from "src/components/myfancy/myfancybox";
import {Seo} from 'src/components/seo';
import {ProjectStatus} from "src/enums/project-state";
import {usePageView} from 'src/hooks/use-page-view';
import {getSiteDuration} from "src/utils/date-locale";
import {getFileExtension, getFileType} from "src/utils/get-file-type";
import {profileApi} from "../../api/profile";
import PropTypes from 'prop-types';
import {INFO} from "src/libs/log";
import {paths} from "src/paths";
import {RouterLink} from "src/components/router-link";
import useDictionaries from "src/hooks/use-dictionaries";

const useSpecialists = (specialtyId) => {
    const [specialists, setSpecialists] = useState([]);
    const [specialty, setSpecialty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSpecialistsGet = async () => {
        try {
            setLoading(true);

            // First get the specialists
            const specialists = await profileApi.getUsers(specialtyId);
            INFO("Users list:", specialists);

            // Then get their posts
            const userPostPromises = specialists.map(user =>
                servicesFeedApi.getPosts({userId: user.id})
            );

            const userPosts = await Promise.all(userPostPromises);

            const processedSpecialists = specialists.map((specialist, index) => {
                const posts = userPosts[index] || [];
                const completedProjects = posts.filter((p) =>
                    (p.postType === "project" && p.projectStatus === ProjectStatus.COMPLETED)
                );
                const reviews = posts.filter((p) =>
                    (p.postType === "project" && p.rating > 0)
                );

                return {
                    ...specialist,
                    since: specialist?.registrationAt ? getSiteDuration(specialist.registrationAt.toDate()) : null,
                    completedProjects: completedProjects.length,
                    gallery: completedProjects.map((p) => p.photos || []).flat().slice(0, 14),
                    reviewsLength: reviews.length,
                    rating: reviews.length > 0 ?
                        reviews.reduce((sum, current) => sum + current.rating, 0) / reviews.length : 0,
                    commonContacts: 0
                };
            });

            setSpecialists(processedSpecialists);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching specialists:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (specialtyId) {
            handleSpecialistsGet();
        }
    }, [specialtyId]);

    return {specialists, specialty, loading, error};
};

const SpecialistCard = ({specialist, smUp}) => {
    const replaceValue = specialist.profilePage || specialist.id;
    const href = paths.specialist.publicPage.replace(":profileId", replaceValue);
    return (
        <Card variant="outlined" sx={{p: 2}}>
            <Stack
                alignItems="start"
                direction="row"
                sx={{
                    px: smUp ? 2 : "10px",
                    pt: 1.5
                }}
                spacing={2}
                useFlexGap
            >
                {smUp && (
                    <Link href={href} component={RouterLink}>
                        <Avatar
                            alt="Specialist"
                            src={specialist.avatar}
                            sx={{
                                border: '3px solid #FFFFFF',
                                height: smUp ? 80 : 36,
                                width: smUp ? 80 : 36
                            }}
                        />
                    </Link>
                )}
                <Stack direction="column" spacing={1} sx={{width: "100%"}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        {!smUp && (
                            <Link href={href}  component={RouterLink}>
                                <Avatar
                                    src={specialist.avatar}
                                    variant="square"
                                    sx={{
                                        opacity: 1
                                    }}
                                    alt={`${specialist.businessName}'s avatar`}
                                />
                            </Link>
                        )}
                        <Stack spacing={1}>
                            <Link
                                color="text.primary"
                                href={href}
                                component={RouterLink}
                            >
                                <Typography variant="h5">
                                    {specialist.businessName}
                                </Typography>
                            </Link>
                            <Typography variant="caption" color="text.secondary">
                                {specialist.since}
                            </Typography>
                            {smUp && (
                                <Stack direction="column" sx={{px: 2}}>
                                    <div dangerouslySetInnerHTML={{__html: specialist.description}}/>
                                </Stack>
                            )}
                        </Stack>
                        {smUp && (
                            <Tooltip title="Profile verified">
                                <SvgIcon color="success" fontSize="large">
                                    <VerifiedIcon/>
                                </SvgIcon>
                            </Tooltip>
                        )}
                    </Stack>
                    {!smUp && (
                        <Stack direction="column" sx={{px: 0}}>
                            <div dangerouslySetInnerHTML={{__html: specialist.description}}/>
                        </Stack>
                    )}
                    {specialist.gallery?.length > 0 && (
                        <Stack sx={{py: 4}}>
                            <Typography color="text.secondary" variant="overline">
                                Gallery from projects:
                            </Typography>
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                {specialist.gallery.map((item) => {
                                    const fileType = getFileType(item);
                                    if (fileType === "video") {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <video muted preload="metadata" controls={false}>
                                                    <source src={item}/>
                                                </video>
                                            </a>
                                        );
                                    } else if (fileType === "image") {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <img src={item} alt="Project gallery"/>
                                            </a>
                                        );
                                    } else {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <FileIcon extension={getFileExtension(item)}/>
                                            </a>
                                        );
                                    }
                                })}
                            </Fancybox>
                        </Stack>
                    )}
                    <Divider/>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: smUp ? "row" : "column",
                        }}
                    >
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <Users01Icon sx={{color: "6C737F"}}/>
                            </SvgIcon>
                            <Link href={href}  component={RouterLink}>
                                <Typography color="text.secondary" sx={{ml: 1}} variant="subtitle2">
                                    {specialist.commonContacts} connections in common
                                </Typography>
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                ml: 2,
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <FactCheckIcon sx={{color: "6C737F"}}/>
                            </SvgIcon>
                            <Link href={href}  component={RouterLink}>
                                <Typography color="text.secondary" sx={{ml: 1}} variant="subtitle2">
                                    {specialist.completedProjects} completed projects
                                </Typography>
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                ml: 2,
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <RateReviewIcon sx={{color: "6C737F"}}/>
                            </SvgIcon>
                            <Link href={href}  component={RouterLink}>
                                <Typography color="text.secondary" sx={{ml: 1}} variant="subtitle2">
                                    {specialist.reviewsLength} reviews
                                </Typography>
                            </Link>
                        </Box>
                        <Box sx={{flexGrow: 1}}/>
                        <Stack direction="row" alignItems="center">
                            <Rating
                                readOnly
                                precision={0.1}
                                size="large"
                                value={specialist.rating}
                            />
                            <Typography color="text.secondary" sx={{ml: 1}} variant="subtitle2">
                                {specialist.rating.toFixed(1)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
        </Card>
    );
};

SpecialistCard.propTypes = {
    specialist: PropTypes.object.isRequired,
    smUp: PropTypes.bool.isRequired
};

const Page = () => {
    const {specialtyId} = useParams();
    const {specialists, loading, error} = useSpecialists(specialtyId);
    const [selectedService, setSelectedService] = useState(null);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const {specialties} = useDictionaries();

    const filterSpecialists = (userSpecialties) => {
        if (!userSpecialties) return [];
        return selectedService
            ? userSpecialties.filter((spec) =>
                spec.services?.map(ser => ser.name).includes(selectedService.name))
            : userSpecialties;
    };

    usePageView();


    return (
        <>
            <Seo title="Specialty"/>
            <Box
                sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'neutral.800'
                        : 'neutral.50',
                    pb: '40px',
                    pt: '100px'
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={1}>
                        <Typography variant="h3">
                            Specialists in {specialties?.byId[specialtyId].label}
                        </Typography>
                        <Typography color="text.secondary" variant="body1">
                            Browse our list of qualified specialists
                        </Typography>
                    </Stack>
                </Container>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pb: 8,
                    pt: 3
                }}
            >
                {error && (
                    <Container maxWidth="lg" sx={{py: 4, pt: '100px'}}>
                        <Typography color="error" variant="h6">
                            Error: {error}
                        </Typography>
                    </Container>
                )}
                {loading && (
                    <Container maxWidth="lg" sx={{py: 4, pt: '100px'}}>
                        <CircularProgress/>
                        <Typography variant="h6">Loading...</Typography>
                    </Container>
                )}
                {!loading && !error && (
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            <Grid lg={12}>
                                <Stack spacing={3}>
                                    {filterSpecialists(specialists).map((specialist) => (
                                        <SpecialistCard
                                            key={specialist.id}
                                            specialist={specialist}
                                            smUp={smUp}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>)}
            </Box>
        </>
    );
};

export default Page;