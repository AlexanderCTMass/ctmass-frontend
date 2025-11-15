import {
    Box,
    Button,
    Container,
    Grid,
    Link,
    Typography,
    useMediaQuery,
    Paper,
    Stack,
    IconButton
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import { useCallback, useMemo, useRef } from "react";
import { useState } from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import { trackClick } from 'src/libs/analytics/behavior';
import { paths } from "src/paths";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { ProjectStatus } from "src/enums/project-state";
import { useNavigate } from "react-router-dom";
import { useSpecialties } from './home-hero';

export const HomeFind = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [tag, setTag] = useState();
    const [findService, setFindService] = useState();
    const [customService, setCustomService] = useState("");
    const navigate = useNavigate();
    const specialties = useSpecialties();

    const listRef = useRef();
    const scrollBy = amount =>
        listRef.current?.scrollBy({ left: amount, behavior: 'smooth' });

    const servicesTags = useMemo(() => [
            /*{
                label: "Electrical wiring installation",
                fullId: 'specialtiesCategories/UexOZq2JfzbyMnp4pUFl/specialties/ZfTMzTHWKQPxDh62nMXG/services/E0zVkJNVzWOHkuWRpgld',
                type: "Service"
            },
            {label: "Water heater setup", fullId: ""},
            {label: "Interior 3D rendering", fullId: ""}*/], []);

    const createSearchParams = useCallback(() => {
        if (!findService) {
            projectsLocalApi.storeProject({
                state: ProjectStatus.DRAFT,
            })
        } else {
            if (findService.type === "Specialties") {
                projectsLocalApi.storeProject({
                    state: ProjectStatus.DRAFT,
                    specialtyId: findService?.id,
                })
            } else {
                projectsLocalApi.storeProject({
                    state: ProjectStatus.DRAFT,
                    specialtyId: findService?.parentSpecialty,
                    serviceId: findService?.id
                })
            }
        }
        navigate(paths.request.create);
    }, [navigate, findService])

    const createSearchSpecParams = useCallback((service) => {
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            specialtyId: service.id
        })
        navigate(paths.request.create);
    }, [navigate])

    return (
        <Box sx={{ mt: -6 }}>
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} direction={downSm ? 'column' : 'row'} alignItems="stretch">
                        {!downSm &&
                            <Grid item xs={12} sm={6} md={5}>
                                <FullLoadServicesAutocomplete externalSearchText={tag}
                                    onChange={(service) => {
                                        if (!service?.other) {
                                            setFindService(service);
                                        }
                                    }}
                                    onInputChange={(value) => {
                                        setCustomService(value);
                                    }}
                                    allowCustomInput={false}
                                    onNoOptionClick={() => {
                                        projectsLocalApi.storeProject({
                                            state: ProjectStatus.DRAFT,
                                            notKnowSpecialistCategory: true,
                                            specialtyId: "other",
                                            customService: "Other services"
                                        })
                                        navigate(paths.request.create);
                                    }}
                                />
                            </Grid>}
                        <Grid item xs={downSm ? 12 : 3} sm="auto">
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 2,
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    backgroundColor: '#1F2D77',
                                    '&:hover': { backgroundColor: '#16337F' },
                                    mb: 4,
                                }}
                                data-track="home_find_describe_project"
                                onClick={() => {
                                    trackClick('home_find_describe_project');
                                    createSearchParams();
                                }}
                            >
                                {/* Request{downSm ? " service" : ""} */}
                                Describe a project
                            </Button>

                            {/* <Typography variant="body2" align="center" marginTop={1}>
                                <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                                    OR
                                </Box>
                                <Link
                                    component={RouterLink}
                                    to={paths.services.index}
                                    underline="hover"
                                    sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                >
                                    Find specialist
                                </Link>
                            </Typography> */}
                        </Grid>
                    </Grid>
                </Container>
            </form>

            <Grid sx={{ mt: 5, ml: 1, mr: 1 }}>
                <Paper
                    elevation={3}
                    sx={{
                        pl: 4,
                        pr: 4,
                        mx: 'auto',
                        maxWidth: 1320,
                        height: 158,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        zIndex: 3,
                        position: 'relative'
                    }}
                >
                    <IconButton onClick={() => scrollBy(-260)}>
                        <ChevronLeftIcon fontSize="large" />
                    </IconButton>

                    {specialties.length === 0 ? (
                        <Stack
                            direction="row"
                            spacing={4}
                            sx={{ flexGrow: 1, px: 2, justifyContent: 'center' }}
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rectangular"
                                    width={120}
                                    height={124}
                                    animation="wave"
                                    sx={{ borderRadius: 1 }}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Stack
                            direction="row"
                            ref={listRef}
                            sx={{
                                flexGrow: 1,
                                overflowX: 'auto',
                                scrollBehavior: 'smooth',
                                '::-webkit-scrollbar': { display: 'none' },
                                columnGap: downSm ? 4 : 6,
                                px: 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {specialties.map(spec => (
                                <Stack
                                    key={spec.id}
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ minWidth: 120, cursor: 'pointer' }}
                                    data-track="home_find_specialty_tag"
                                    onClick={() => {
                                        trackClick('home_find_specialty_tag', { specialtyId: spec.id });
                                        createSearchSpecParams(spec);
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1,
                                            border: `2px solid ${theme.palette.primary.main}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.main',
                                            fontWeight: 600
                                        }}
                                    >
                                        {spec.label[0]}
                                    </Box>
                                    <Typography fontWeight={500}>{spec.label}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    )}

                    <IconButton onClick={() => scrollBy(260)}>
                        <ChevronRightIcon fontSize="large" />
                    </IconButton>
                </Paper>
            </Grid>
        </Box>
    );
}
    ;
