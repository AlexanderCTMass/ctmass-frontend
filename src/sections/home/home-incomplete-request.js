import {
    Box,
    Button,
    Container,
    TextField,
    OutlinedInput,
    IconButton,
    InputAdornment,
    Paper,
    Link,
    SvgIcon,
    Unstable_Grid2 as Grid,
    Stack,
    Typography,
    Divider,
    CardActions,
    Card,
    Avatar,
    Drawer,
    useMediaQuery,
    ButtonBase
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {useKindOfServices, useKindOfServicesMap} from "../../hooks/use-kind-of-services";
import {RouterLink} from "../../components/router-link";
import {SeverityPill} from "../../components/severity-pill";
import RefreshCcw02Icon from "@untitled-ui/icons-react/build/esm/RefreshCcw02";
import CottageIcon from '@mui/icons-material/Cottage';
import ConstructionIcon from '@mui/icons-material/Construction';
import * as React from "react";
import {useEffect, useState} from "react";
import FeedbackIcon from "@mui/icons-material/Feedback";
import {useDispatch, useSelector} from 'src/store';
import {thunks} from 'src/thunks/dictionary';
import {useAuth} from "../../hooks/use-auth";
import {paths} from 'src/paths';


export const HomeIncompleteApplications = () => {
    const theme = useTheme();
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [draft, setDraft] = useState();


    useEffect(() => {
        const restoreProject = projectsLocalApi.restoreProject();
        setDraft(restoreProject);
    }, []);

    if (!draft)
        return;

    return (
        <Box>
            <Container maxWidth="lg" sx={{pt: 5}}>
                <Typography variant={"h5"} sx={{mb:2}}>Incomplete applications</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3} >
                        <Link
                            component={RouterLink}
                            href={paths.request.create.replace(":serviceId", draft.serviceId)
                                .replace(":projectTitle", draft.title)}
                            underline="none"
                        >
                            <Card
                                sx={{
                                    ':hover': {
                                        boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                        cursor: 'pointer',
                                    },
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    direction={{
                                        xs: 'column',
                                        sm: 'row',
                                    }}
                                    spacing={3}
                                    sx={{
                                        px: (downSm ? 1 : 4),
                                        py: 3,
                                        minHeight: 117,
                                        // backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 56%, rgba(255,255,255,0)), url(${spec.img})`,
                                        backgroundPosition: 'right',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                >
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography
                                            color="text.primary"
                                            variant={up1024 ? "h5" : "h6"}
                                            gutterBottom
                                        >
                                            {draft.title}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >

                                        </Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        </Link>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
