import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
    Avatar,
    Box,
    Card,
    Container,
    Divider,
    ImageList,
    ImageListItem,
    Link,
    Rating,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
    Unstable_Grid2 as Grid, useMediaQuery
} from '@mui/material';
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
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
import {useDispatch, useSelector} from "../../store";
import {thunks} from "../../thunks/dictionary";
import FactCheckIcon from '@mui/icons-material/FactCheck';

const useDictionary = () => {
    const {specialtyId} = useParams();
    const dispatch = useDispatch();
    const dictionary = useSelector((state) => state.dictionary);
    const [specialists, setSpecialists] = useState([]);
    const [specialty, setSpecialty] = useState();

    const handleDictionaryGet = async () => {

        const specialties = dictionary.specialties.allIds.map((id) => dictionary.specialties.byId[id]).filter((spec) => spec.accepted);
        const categories = dictionary.categories.allIds.map((id) => {
            return {...dictionary.categories.byId[id], childs: specialties.filter((spec) => spec.parent === id)}
        }).filter((spec) => spec.accepted);


        const map = new Map();
        categories.map((kind) => {
            if (kind.childs) {
                map.set(kind.id, {
                    label: kind.label,
                    id: kind.id,
                    description: kind.description,
                    childs: kind.childs.map(child => child.id)
                });

                kind.childs.map((spec) => {
                    if (spec.services) {
                        map.set(spec.id, {
                            label: spec.label,
                            id: spec.id,
                            parent: kind.id,
                            description: spec.description,
                            services: spec.services.map(ser => ser.id)
                        });

                        spec.services.map((service) => {
                            map.set(service.id, {name: service.name, id: service.id, parent: spec.id});
                        })
                    } else {
                        map.set(spec.id, {
                            label: spec.label,
                            id: spec.id,
                            parent: kind.id,
                            description: spec.description
                        });
                    }
                })
            } else {
                map.set(kind.id, {label: kind.label, id: kind.id, description: kind.description});
            }
        });

        setSpecialty(map.get(specialtyId));

        const specialists = await profileApi.getUsers(specialtyId);


        const userPostPromises = specialists.map(user =>
            servicesFeedApi.getPosts({userId: user.id})
        );

        const userPosts = await Promise.all(userPostPromises);


        Array.from(specialists).forEach((id, index) => {
            const specialist = specialists[index];
            specialist.since = Boolean(specialist && specialist.registrationAt) ? getSiteDuration(specialist.registrationAt.toDate()) : null;
            const posts = userPosts[index];
            if (!posts)
                return;
            const completedProjects = posts.filter((p) => (p.postType === "project" && p.projectStatus === ProjectStatus.COMPLETED));
            specialist.completedProjects = completedProjects.length;
            specialist.gallery = completedProjects.map((p) => p.photos).flat().slice(0, 14);
            const reviews = posts.filter((p) => (p.postType === "project" && p.rating > 0));
            specialist.reviewsLength = reviews.length;
            if (reviews.length > 0) {
                let result = reviews.reduce((sum, current) => sum + current.rating, 0);
                specialist.rating = result / reviews.length;
            }
            specialist.commonContacts = 0;
        });


        setSpecialists(specialists);

    };

    useEffect(() => {
        dispatch(thunks.getDictionaryWithServices({}));
    }, [dispatch]);

    useEffect(() => {
            const newVar = async () => {
                await handleDictionaryGet();
            };
            newVar();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dictionary]);


    return {specialists, specialty};
};

const Page = () => {
    const {specialists, specialty} = useDictionary();
    const [selectedService, setSelectedService] = useState(null);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    const filterSpecialists = (userSpecialties) => {
        if (!userSpecialties) return [];
        return selectedService ? userSpecialties.filter((spec) => spec.services.map(ser => ser.name).includes(selectedService.name)) : userSpecialties;
    }

    usePageView();

    return specialty ? (
        <>
            <Seo title={"Specialty: ".concat(specialty.label)}/>
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
                            {specialty.label}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body1"
                        >
                            {specialty.description}
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
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {/*<Grid lg={3}>
                            <Typography sx={{fontWeight: 600}}
                                        variant="h6" gutterBottom>
                                Services
                            </Typography>
                            <Stack>
                                {specialty.services && specialty.services.map((serviceId) => {
                                    const service = kindOfServicesMap.get(serviceId);
                                    return (
                                        <Typography
                                            onClick={() => {
                                                setSelectedService(service)
                                            }}
                                            sx={{
                                                ml: 1,
                                                pb: 1,
                                                cursor: "pointer",
                                                color: (theme) => (selectedService && service.id === selectedService.id) ? theme.palette.primary.main : theme.palette.text.secondary,
                                                ':hover': {
                                                    color: (theme) => theme.palette.text.primary
                                                },
                                            }}
                                            variant={"body2"}
                                        >
                                            {service.name}
                                        </Typography>
                                    )
                                })}
                            </Stack>
                        </Grid>*/}
                        <Grid lg={12}>
                            <Stack
                                spacing={3}
                            >
                                {filterSpecialists(specialists).map((specialist) => {
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
                                                {smUp && <Link
                                                    href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                    <Avatar
                                                        alt="Applicant"
                                                        src={specialist.avatar}
                                                        sx={{
                                                            border: '3px solid #FFFFFF',
                                                            height: smUp ? 80 : 36,
                                                            width: smUp ? 80 : 36
                                                        }}
                                                    />
                                                </Link>}
                                                <Stack direction="column" spacing={1} sx={{width: "100%"}}>
                                                    <Stack direction="row" justifyContent="space-between"
                                                           alignItems={"flex-start"}>
                                                        {!smUp && <Link
                                                            href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                            <Avatar
                                                                alt="Applicant"
                                                                src={specialist.avatar}
                                                                sx={{
                                                                    border: '3px solid #FFFFFF',
                                                                    height: smUp ? 80 : 36,
                                                                    width: smUp ? 80 : 36
                                                                }}
                                                            />
                                                        </Link>}
                                                        <Stack spacing={1}>
                                                            <Link color="text.primary"
                                                                  href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                                <Typography variant="h5">
                                                                    {specialist.businessName}
                                                                </Typography>
                                                            </Link>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {specialist.since}
                                                            </Typography>
                                                            {smUp && <Stack
                                                                direction="column"
                                                                sx={{
                                                                    px: 2
                                                                }}
                                                            >
                                                                <div
                                                                    dangerouslySetInnerHTML={{__html: specialist.description}}/>
                                                            </Stack>}
                                                        </Stack>
                                                        {smUp && <Tooltip title={"Profile verified"}>
                                                            <SvgIcon color="success" fontSize="large">
                                                                <VerifiedIcon/>
                                                            </SvgIcon>
                                                        </Tooltip>}
                                                    </Stack>
                                                    {!smUp && <Stack
                                                        direction="column"
                                                        sx={{
                                                            px: 0
                                                        }}
                                                    >
                                                        <div
                                                            dangerouslySetInnerHTML={{__html: specialist.description}}/>
                                                    </Stack>}
                                                    {specialist.gallery && specialist.gallery.length > 0 &&
                                                        < Stack sx={{
                                                            py: 4
                                                        }}>
                                                            <Typography
                                                                color="text.secondary"
                                                                variant="overline"
                                                            >
                                                                Gallery from projects:
                                                            </Typography>
                                                            <Fancybox
                                                                options={{
                                                                    Carousel: {
                                                                        infinite: false,
                                                                    },
                                                                }}
                                                            >
                                                                {(specialist.gallery || []).map((item) => {
                                                                    if (getFileType(item) === "video") {
                                                                        return (
                                                                            <a data-fancybox="gallery" href={item}
                                                                               className={"my-fancy-link"}>
                                                                                <video muted preload={"metadata"}
                                                                                       controls={false}>
                                                                                    <source src={item}/>
                                                                                </video>
                                                                            </a>);
                                                                    } else if (getFileType(item) === "image") {
                                                                        return (
                                                                            <a data-fancybox="gallery" href={item}
                                                                               className={"my-fancy-link"}>
                                                                                <img src={item}/>
                                                                            </a>
                                                                        );
                                                                    } else {
                                                                        return (<a data-fancybox="gallery" href={item}
                                                                                   className={"my-fancy-link"}>
                                                                            <FileIcon
                                                                                extension={getFileExtension(item)}/>
                                                                        </a>)
                                                                    }
                                                                })}

                                                            </Fancybox>
                                                        </Stack>}
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
                                                                py:1
                                                            }}
                                                        >
                                                            <SvgIcon>
                                                                <Users01Icon sx={{color: "6C737F"}}/>
                                                            </SvgIcon>
                                                            <Link
                                                                href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                                <Typography
                                                                    color="text.secondary"
                                                                    sx={{ml: 1}}
                                                                    variant="subtitle2"
                                                                >
                                                                    {specialist.commonContacts}
                                                                    {' '}
                                                                    connections in common
                                                                </Typography>
                                                            </Link>
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                ml: 2,
                                                                justifyContent: "flex-start",
                                                                py:1
                                                            }}
                                                        >

                                                            <SvgIcon>
                                                                <FactCheckIcon sx={{color: "6C737F"}}/>
                                                            </SvgIcon>
                                                            <Link
                                                                href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                                <Typography
                                                                    color="text.secondary"
                                                                    sx={{ml: 1}}
                                                                    variant="subtitle2"
                                                                >
                                                                    {specialist.completedProjects}
                                                                    {' '}
                                                                    completed projects
                                                                </Typography>

                                                            </Link>
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                ml: 2,
                                                                justifyContent: "flex-start",
                                                                py:1
                                                            }}
                                                        >
                                                            <SvgIcon>
                                                                <RateReviewIcon sx={{color: "6C737F"}}/>
                                                            </SvgIcon>
                                                            <Link
                                                                href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + specialist.profilePage}>
                                                                <Typography
                                                                    color="text.secondary"
                                                                    sx={{ml: 1}}
                                                                    variant="subtitle2"
                                                                >
                                                                    {specialist.reviewsLength}
                                                                    {' '}
                                                                    reviews
                                                                </Typography>
                                                            </Link>
                                                        </Box>
                                                        <Box sx={{flexGrow: 1}}/>
                                                        <Stack direction={"row"} alignItems={"center"}>
                                                        <Rating
                                                            readOnly
                                                            precision={0.1}
                                                            size="large"
                                                            value={specialist.rating}
                                                        />
                                                        <Typography
                                                            color="text.secondary"
                                                            sx={{ml: 1}}
                                                            variant="subtitle2"
                                                        >
                                                            {specialist.rating}
                                                        </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Stack>

                                            </Stack>

                                        </Card>

                                        /* <Card key={specialist.id}>
                                             <Stack
                                                 alignItems="center"
                                                 direction="row"
                                                 sx={{p: 2}}
                                                 spacing={2}
                                             >
                                                 <Avatar
                                                     src={specialist.avatar}
                                                     sx={{
                                                         height: 60,
                                                         width: 60
                                                     }}
                                                 />
                                                 <Box sx={{flexGrow: 1}}>
                                                     <Link
                                                         color="text.primary"
                                                         variant="h5"
                                                         href={process.env.REACT_APP_HOST_P+"/specialist/" + specialist.profilePage}
                                                     >
                                                         {specialist.name || "Carson Darrin"}
                                                     </Link>
                                                     <IconButton>
                                                         <SvgIcon
                                                             fontSize="small"
                                                             sx={{color: 'warning.main'}}
                                                         >
                                                             <Star01Icon/>
                                                         </SvgIcon>
                                                     </IconButton> <IconButton>
                                                     <SvgIcon
                                                         fontSize="small"
                                                         sx={{color: 'action.active'}}
                                                     >
                                                         <Star01Icon/>
                                                     </SvgIcon>
                                                 </IconButton> <IconButton>
                                                     <SvgIcon
                                                         fontSize="small"
                                                         sx={{color: 'action.active'}}
                                                     >
                                                         <Star01Icon/>
                                                     </SvgIcon>
                                                 </IconButton> <IconButton>
                                                     <SvgIcon
                                                         fontSize="small"
                                                         sx={{color: 'action.active'}}
                                                     >
                                                         <Star01Icon/>
                                                     </SvgIcon>
                                                 </IconButton> <IconButton>
                                                     <SvgIcon
                                                         fontSize="small"
                                                         sx={{color: 'action.active'}}
                                                     >
                                                         <Star01Icon/>
                                                     </SvgIcon>
                                                 </IconButton>
                                                     <Typography
                                                         color="text.secondary"
                                                         gutterBottom
                                                         variant="body2"
                                                     >
                                                         {specialist.commonContacts}
                                                         {' '}
                                                         connections in common
                                                     </Typography>
                                                     <Button
                                                         size="small"
                                                         variant="outlined"
                                                     >
                                                         {specialist.status || "Go"}
                                                     </Button>
                                                 </Box>
                                                 <IconButton>
                                                     <SvgIcon>
                                                         <DotsHorizontalIcon/>
                                                     </SvgIcon>
                                                 </IconButton>
                                             </Stack>
                                         </Card>*/
                                    )
                                })}

                            </Stack>
                        </Grid>
                    </Grid>

                </Container>
            </Box>
        </>
    ) : null;
};

export default Page;
