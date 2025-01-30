import {Box, Button, Chip, Container, Stack, Unstable_Grid2 as Grid, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import {useState} from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import {RouterLink} from "src/components/router-link";
import {useAuth} from "src/hooks/use-auth";
import {paths} from "src/paths";


export const HomeFind = () => {
    const theme = useTheme();
    const {user} = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [tag, setTag] = useState();
    const [findService, setFindService] = useState();
    const [projectTitle, setProjectTitle] = useState();


    return (
        <Box sx={{pt: '40px'}}>
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2}>
                        {!downSm &&
                            <Grid item xs={9}>
                                <FullLoadServicesAutocomplete externalSearchText={tag}
                                                              onChange={(service) => {
                                                                  setFindService(service);
                                                              }}

                                                              onInputChange={(value) => {
                                                                  setProjectTitle(value);
                                                              }}/>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    flexWrap="wrap"
                                    spacing={1}
                                    sx={{pt: 2}}
                                >
                                    {["Electrical wiring installation", "Water heater setup", "Interior 3D rendering"].map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            variant="filled"
                                            size="medium"
                                            clickable
                                            onClick={() => {
                                                setTag(tag);
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
                                sx={{py: "12px", fontSize: '1.35rem'}}
                                component={RouterLink}
                                href={paths.request.create.replace(":serviceId", findService ? findService.fullId : "new")
                                    .replace(":projectTitle", projectTitle)}
                            >
                                Find {downSm ? " service" : ""}
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </form>
        </Box>
    );
};
