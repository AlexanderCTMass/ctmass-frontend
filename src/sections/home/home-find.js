import {
    Box, Button, Container, TextField, OutlinedInput, IconButton,
    InputAdornment,
    Paper,
    SvgIcon, Unstable_Grid2 as Grid, Stack, Typography, Divider, CardActions, Card
} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {useKindOfServices, useKindOfServicesMap} from "../../hooks/use-kind-of-services";

export const HomeFind = () => {
    const theme = useTheme();
    const kinds = useKindOfServicesMap();


    return (
        <Box
            sx={{
                pt: '40px',
                pb: '40px'
            }}
        >
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <OutlinedInput
                                fullWidth
                                placeholder="How can I help you?"
                                startAdornment={(
                                    <InputAdornment position="start">
                                        <SvgIcon>
                                            <SearchMdIcon/>
                                        </SvgIcon>
                                    </InputAdornment>
                                )}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button fullWidth variant="contained" size="large">
                                Find
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </form>

            <Container maxWidth="lg" sx={{pt: 4}}>
                <Grid
                    container
                    disableEqualOverflow
                    spacing={{
                        xs: 3,
                        lg: 4
                    }}
                >

                            <Grid
                                xs={12}
                                md={3}
                            >
                                <Card>
                                    <Stack
                                        alignItems="center"
                                        direction={{
                                            xs: 'column',
                                            sm: 'row'
                                        }}
                                        spacing={3}
                                        sx={{
                                            px: 4,
                                            py: 3
                                        }}
                                    >
                                        <div>
                                            <img
                                                src="/assets/iconly/plumbinb.png"
                                                width={48}
                                            />
                                        </div>
                                        <Box sx={{flexGrow: 1}}>
                                            <Typography
                                                color="text.primary"
                                                variant="h5"
                                                gutterBottom
                                            >
                                                Plumbing
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                10 services
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>

                    <Grid
                        xs={12}
                        md={3}
                    >
                        <Card>
                            <Stack
                                alignItems="center"
                                direction={{
                                    xs: 'column',
                                    sm: 'row'
                                }}
                                spacing={3}
                                sx={{
                                    px: 4,
                                    py: 3
                                }}
                            >
                                <div>
                                    <img
                                        src="/assets/iconly/electric.png"
                                        width={48}
                                    />
                                </div>
                                <Box sx={{flexGrow: 1}}>
                                    <Typography
                                        color="text.primary"
                                        variant="h5" gutterBottom
                                    >
                                        Electric
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        24 services
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid
                        xs={12}
                        md={3}
                    >
                        <Card>
                            <Stack
                                alignItems="center"
                                direction={{
                                    xs: 'column',
                                    sm: 'row'
                                }}
                                spacing={3}
                                sx={{
                                    px: 4,
                                    py: 3
                                }}
                            >
                                <div>
                                    <img
                                        src="/assets/iconly/handyman.png"
                                        width={48}
                                    />
                                </div>
                                <Box sx={{flexGrow: 1}}>
                                    <Typography
                                        color="text.primary"
                                        variant="h5" gutterBottom
                                    >
                                        Handyman
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        41 services
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid
                        xs={12}
                        md={3}
                    >
                        <Card>
                            <Stack
                                alignItems="center"
                                direction={{
                                    xs: 'column',
                                    sm: 'row'
                                }}
                                spacing={3}
                                sx={{
                                    px: 4,
                                    py: 3
                                }}
                            >
                                <div>
                                    <img
                                        src="/assets/iconly/framing.png"
                                        width={48}
                                    />
                                </div>
                                <Box sx={{flexGrow: 1}}>
                                    <Typography
                                        color="text.primary"
                                        variant="h5" gutterBottom
                                    >
                                        Framing
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        12 services
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
