import { Box, Button, Chip, Container, Link, Typography, Stack, Unstable_Grid2 as Grid, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import { useAuth } from "src/hooks/use-auth";
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";


export const HomeFind = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [find, setFind] = useState();

    return (
        <Box
            sx={{
                pt: '40px',
            }}
        >
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg"
                    sx={{
                        // pb: '60px',
                    }}
                >
                    <Grid container spacing={2}>
                        {!downSm &&
                            <Grid item xs={9}>
                                <FullLoadServicesAutocomplete externalSearchText={find} />
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    flexWrap="wrap"
                                    spacing={1}
                                    sx={{ pt: 2 }}
                                >
                                    {["Electrical wiring installation", "Water heater setup", "Interior 3D rendering"].map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            variant="filled"
                                            size="medium"
                                            /* sx={{
                                                 fontSize: '1.125rem',
                                                 padding: '12px 16px',
                                             }}*/
                                            clickable
                                            onClick={() => {
                                                setFind(tag);
                                            }}
                                            component="a"
                                        // color="primary"
                                        />
                                    ))}
                                </Stack>
                            </Grid>}
                        <Grid item xs={downSm ? 12 : 3}>
                            <Button fullWidth variant="contained" size="large" sx={{ py: "12px", fontSize: '1.35rem' }}
                                onClick={() => {

                                }}>
                                Request{downSm ? " service" : ""}
                            </Button>

                            <Typography variant="body2" align="center" marginTop={1}>
                                <Link
                                    component={RouterLink}
                                    to={paths.services.index}
                                    underline="hover"
                                >
                                    Find specialist
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </form>
        </Box>
    );
};
