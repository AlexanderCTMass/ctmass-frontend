import { Box, Button, Chip, Container, Stack, Unstable_Grid2 as Grid, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from "react";
import { useState } from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import { paths } from "src/paths";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { ProjectStatus } from "src/enums/project-state";
import { useNavigate } from "react-router-dom";


export const HomeFind = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [tag, setTag] = useState();
    const [findService, setFindService] = useState();
    const [customService, setCustomService] = useState("");
    const navigate = useNavigate();

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

    return (
        <Box sx={{ pt: '40px' }}>
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2}>
                        {!downSm &&
                            <Grid item xs={9}>
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
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    flexWrap="wrap"
                                    spacing={1}
                                    sx={{ pt: 2 }}
                                >
                                    {servicesTags.map((tag) => (
                                        <Chip
                                            key={tag.label}
                                            label={tag.label}
                                            variant="filled"
                                            size="medium"
                                            clickable
                                            onClick={() => {
                                                setTag(tag.label);
                                                setFindService(tag);
                                            }}
                                            component="a"
                                        />
                                    ))}
                                </Stack>
                            </Grid>}
                        <Grid item xs={downSm ? 12 : 3}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ py: "12px", fontSize: '1.35rem' }}
                                onClick={createSearchParams}
                            >
                                Find {downSm ? " service" : ""}
                            </Button>
                        </Grid>
                    </Grid>
                    {/* <Alert severity="info">

                        </Alert>*/}
                </Container>
            </form>
        </Box>
    );
}
    ;
