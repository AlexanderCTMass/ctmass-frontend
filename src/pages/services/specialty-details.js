import {
    Avatar,
    Box, Button,
    Card,
    CardHeader,
    Container,
    Divider, IconButton, ImageList, ImageListItem,
    Link, Rating,
    Stack,
    SvgIcon, Tooltip,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {useKindOfServices, useKindOfServicesMap} from "../../hooks/use-kind-of-services";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import CardContent from "@mui/material/CardContent";
import {useParams} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {profileApi} from "../../api/profile";
import DotsHorizontalIcon from "@untitled-ui/icons-react/build/esm/DotsHorizontal";
import Star01Icon from "@untitled-ui/icons-react/build/esm/Star01";
import {useDispatch, useSelector} from "../../store";
import {thunks} from "../../thunks/dictionary";
import VerifiedIcon from "@mui/icons-material/Verified";
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import * as React from "react";


const useDictionary = () => {
    const dispatch = useDispatch();
    const dictionary = useSelector((state) => state.dictionary);

    const handleDictionaryGet = useCallback(() => {
        dispatch(thunks.getDictionaryWithServices({}));
    }, [dispatch]);

    useEffect(() => {
            handleDictionaryGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    if (!dictionary)
        return {};

    const specialties = dictionary.specialties.allIds.map((id) => dictionary.specialties.byId[id]).filter((spec) => spec.accepted);
    const categories = dictionary.categories.allIds.map((id) => {
        return {...dictionary.categories.byId[id], childs: specialties.filter((spec) => spec.parent === id)}
    }).filter((spec) => spec.accepted);


    const map = new Map();
    categories.map((kind) => {
        if (kind.childs) {
            map.set(kind.id, {label: kind.label, id: kind.id, childs: kind.childs.map(child => child.id)});

            kind.childs.map((spec) => {
                if (spec.services) {
                    map.set(spec.id, {
                        label: spec.label,
                        id: spec.id,
                        parent: kind.id,
                        services: spec.services.map(ser => ser.id)
                    });

                    spec.services.map((service) => {
                        map.set(service.id, {name: service.name, id: service.id, parent: spec.id});
                    })
                } else {
                    map.set(spec.id, {label: spec.label, id: spec.id, parent: kind.id});
                }
            })
        } else {
            map.set(kind.id, {label: kind.label, id: kind.id});
        }
    })
    return map;
};
const Page = () => {
    const {specialtyId} = useParams();
    const kindOfServicesMap = useDictionary();
    console.log(kindOfServicesMap);

    const [specialty, setSpecialty] = useState(kindOfServicesMap.get(specialtyId));
    const [selectedService, setSelectedService] = useState(null);


    const [specialists, setSpecialists] = useState([]);


    const getSpecialtists = async () => {
        if (!specialty)
            return;
        const userSpecialties = await profileApi.getUsers(specialty.id);
        console.log(userSpecialties);
        setSpecialists(userSpecialties);
    }

    const filterSpecialists = (userSpecialties) => {
        const filter = selectedService ? userSpecialties.filter((spec) => spec.services.map(ser => ser.name).includes(selectedService.name)) : userSpecialties;
        return filter;
    }


    // Only check on mount, this allows us to redirect the user manually when auth state changes
    useEffect(() => {
            getSpecialtists();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [specialty]);


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
                            You can choose from 100 specialists providing 200 different services
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
                        <Grid lg={3}>
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
                        </Grid>
                        <Grid lg={9}>
                            <Stack
                                spacing={3}
                            >
                                {filterSpecialists(specialists).map((specialist) => {
                                    return (
                                        <Link href={process.env.REACT_APP_HOST_P+"/specialist/" + specialist.profilePage} variant={"overline"}>
                                        <Card variant="outlined">
                                            <Stack
                                                alignItems="start"
                                                direction="row"
                                                sx={{
                                                    px: 2,
                                                    pt: 1.5
                                                }}
                                                spacing={2}
                                                useFlexGap
                                            >
                                                <Avatar
                                                    alt="Applicant"
                                                    src={specialist.avatar}
                                                    sx={{
                                                        border: '3px solid #FFFFFF',
                                                        height: 120,
                                                        width: 120
                                                    }}
                                                />
                                                <Stack direction="column" spacing={1} sx={{width: "100%"}}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems={"center"}>
                                                        <Stack spacing={1}>
                                                            <Typography variant="h5">
                                                                {specialist.businessName}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    alignItems: 'center',
                                                                    display: 'flex'
                                                                }}
                                                            >
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{textTransform: 'uppercase'}}>
                                                                    category
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        height: 4,
                                                                        width: 4,
                                                                        borderRadius: 4,
                                                                        backgroundColor: 'text.secondary',
                                                                        mx: 1
                                                                    }}
                                                                />
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{textTransform: 'uppercase'}}>
                                                                    specialty
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Tooltip title={"Profile verified"}>
                                                            <SvgIcon color="success" fontSize="large">
                                                                <VerifiedIcon/>
                                                            </SvgIcon>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Divider/>
                                                    <Box
                                                        sx={{
                                                            alignItems: 'center',
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <SvgIcon>
                                                                <Users01Icon sx={{color: "6C737F"}}/>
                                                            </SvgIcon>
                                                            <Typography
                                                                color="text.secondary"
                                                                sx={{ml: 1}}
                                                                variant="subtitle2"
                                                            >
                                                                {8}
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
                                                                <RateReviewIcon sx={{color: "6C737F"}}/>
                                                            </SvgIcon>
                                                            <Typography
                                                                color="text.secondary"
                                                                sx={{ml: 1}}
                                                                variant="subtitle2"
                                                            >
                                                                {2}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{flexGrow: 1}}/>
                                                        <Rating
                                                            readOnly
                                                            precision={0.1}
                                                            // size="small"
                                                            value={4.4}
                                                        />
                                                        <Typography
                                                            color="text.secondary"
                                                            sx={{ml: 1}}
                                                            variant="subtitle2"
                                                        >
                                                            {4.4}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                            </Stack>
                                            <Stack
                                                direction="column"
                                                sx={{
                                                    px: 2
                                                }}
                                            >
                                                <div dangerouslySetInnerHTML={{__html: specialist.description}}/>
                                            </Stack>
                                            <Stack sx={{
                                                px: 2
                                            }}>
                                                <ImageList cols={5} gap={8} variant="masonry" rowHeight={64}>
                                                    {(specialist.gallery || []).map((item) => (
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
                                            </Stack>

                                        </Card>
                                        </Link>

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
