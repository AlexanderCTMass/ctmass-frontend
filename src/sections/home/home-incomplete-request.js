import DeleteIcon from "@mui/icons-material/Delete";
import {
    Avatar,
    AvatarGroup,
    Box,
    Card,
    Container,
    IconButton,
    Link,
    Stack,
    Tooltip,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import {useEffect, useState} from "react";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {paths} from 'src/paths';
import {RouterLink} from "../../components/router-link";


export const HomeIncompleteRequest = () => {
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
                <Typography variant={"h5"} sx={{mb: 0}}>Incomplete requests</Typography>
                <Typography variant={"body2"} color="text.secondary" sx={{mb: 2}}>You recently started applying for a
                    project, but something prevented you from finishing it. Continue filling in the form</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Link
                            component={RouterLink}
                            href={paths.request.create.replace(":servicePath", draft?.servicePath || "")
                                .replace(":projectTitle", draft?.title || "")}
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
                                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                                            <Typography
                                                color="text.secondary"
                                                variant="h6"
                                            >
                                                {draft?.specialty.label}
                                            </Typography>
                                            <Tooltip title={"Remove request"}>
                                                <IconButton aria-label="delete" size="small" onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    projectsLocalApi.deleteProject();
                                                    setDraft(null);
                                                }}>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                        <Typography
                                            color="text.primary"
                                            variant={"h5"}
                                            gutterBottom
                                        >
                                            {draft.title}
                                        </Typography>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{mt: 2}}>
                                            <AvatarGroup max={3}>
                                                {(draft?.showedSpecialists || []).map((avatar) => (
                                                    <Avatar src={avatar}/>
                                                ))}
                                            </AvatarGroup>
                                            <Typography color="text.primary"
                                                        variant={"subtitle2"}>
                                                +{draft?.specialistsCount-3 || 0} specialists
                                            </Typography>
                                        </Stack>
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
