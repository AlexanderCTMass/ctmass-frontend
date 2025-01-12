import ArrowDownIcon from '@untitled-ui/icons-react/build/esm/ArrowDown';
import {
    Box,
    Card, CardHeader,
    Container,
    Divider, Link,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {useKindOfServices} from "../../hooks/use-kind-of-services";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import CardContent from "@mui/material/CardContent";
import {useDispatch, useSelector} from "../../store";
import {useCallback, useEffect} from "react";
import {thunks} from "../../thunks/dictionary";

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

    return {categories: categories};
};

function getCountOfSpecialist(categories) {
    const set = new Set();
    for (let categoriesKey of categories) {
        categoriesKey.childs.forEach(value => {
            if (value && value.users)
                for (let userKey of value.users) {
                    set.add(userKey.user);
                }
        })
    }
    return set.size;
}


const Page = () => {
    const theme = useTheme();

    const {categories} = useDictionary();


    usePageView();

    const countOfSpecialists = getCountOfSpecialist(categories);
    return (
        <>
            <Seo title="Services"/>
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
                        <Typography variant="h1">
                            Services
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body1"
                        >
                            Catalog of services from {countOfSpecialists} specialists
                        </Typography>
                    </Stack>
                </Container>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        divider={<Divider/>}
                        spacing={4}
                    >
                        {categories.map((section) => (
                            <Grid
                                key={section.label}
                                container
                                spacing={4}
                            >
                                <Grid
                                    xs={12}
                                    lg={3}
                                >
                                    <Typography
                                        sx={{fontWeight: 600}}
                                        variant="h5"
                                    >
                                        {section.label}
                                    </Typography>
                                </Grid>
                                <Grid
                                    xs={12}
                                    lg={9}
                                >
                                    <Grid
                                        container
                                        disableEqualOverflow
                                    >
                                        {section.childs.map((spec) => (
                                            <Grid
                                                xs={12}
                                                sm={6}
                                                lg={4}
                                            >
                                                <Link
                                                    color="text.primary"
                                                    component={RouterLink}
                                                    href={paths.services.service.replace(":specialtyId", spec.id)}
                                                    sx={{
                                                        alignItems: 'center',
                                                        display: 'inline-flex',
                                                        width: '100%', cursor: 'pointer',
                                                    }}
                                                    underline="none"
                                                >
                                                    <Card sx={{
                                                        width: '100%',
                                                        cursor: 'pointer',
                                                        ':hover': {
                                                            boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                                            cursor: 'pointer'
                                                        },
                                                    }}>
                                                        <Stack
                                                            alignItems="center"
                                                            direction={{
                                                                xs: 'column',
                                                                sm: 'row'
                                                            }}
                                                            spacing={3}
                                                            sx={{
                                                                px: 4,
                                                                py: 3,
                                                                backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 66%, rgba(255,255,255,0)), url(${spec.img})`,
                                                                backgroundPosition: 'right',
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                ':hover': {
                                                                    boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                                                    cursor: 'pointer'
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{flexGrow: 1}}>
                                                                <Typography
                                                                    color="text.primary"
                                                                    variant="h5"
                                                                    gutterBottom
                                                                >
                                                                    {spec.label}
                                                                </Typography>
                                                                <Typography
                                                                    color="text.secondary"
                                                                    variant="body2"
                                                                >
                                                                    {spec.users ? spec.users.map((us) => us.services).flat().length : 0} specialists
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Card>
                                                </Link>
                                            </Grid>
                                        ))}

                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Page;
