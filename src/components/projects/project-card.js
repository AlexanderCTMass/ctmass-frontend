import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    ImageList,
    ImageListItem,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import ClockIcon from "@untitled-ui/icons-react/build/esm/Clock";
import BookOpen01Icon from "@untitled-ui/icons-react/build/esm/BookOpen01";
import Home02Icon from "@untitled-ui/icons-react/build/esm/Home02";
import MarkerPin01 from "@untitled-ui/icons-react/build/esm/MarkerPin01";
import BankNote01 from "@untitled-ui/icons-react/build/esm/BankNote01";
import Mail01Icon from "@untitled-ui/icons-react/build/esm/Mail01";
import * as React from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Fancybox from "src/components/myfancy/myfancybox";
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {formatDateRange} from "src/utils/date-locale";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import ProjectStatusDisplay from "src/components/project-status-display";
import {formatDistanceToNow} from "date-fns";
import {isProjectRemovable, ProjectStatus} from "src/enums/project-state";
import {useContextDialog} from "src/hooks/use-context-dialog";
import AlertTriangleIcon from "@untitled-ui/icons-react/build/esm/AlertTriangle";
import {ProjectCardRemoveButton} from "src/components/projects/project-card-remove-button";
import {ProjectCardUnpublishButton} from "src/components/projects/project-card-unpublish-button";
import {ProjectCardPublishButton} from "src/components/projects/project-card-publish-button";

const Preview = (props) => {
    const {attach, ...other} = props;

    if (!attach || !attach.preview)
        return;

    return (
        <ImageListItem key={attach.preview}>
            {attach.preview.includes('video') ? (
                <video src={attach.preview} controls style={{width: '100%', height: "90px"}}/>
            ) : (
                <img src={attach.preview} alt="existing" loading="lazy" style={{width: '100%', height: "90px"}}/>
            )}
        </ImageListItem>
    );
}

export const ProjectCard = (props) => {
        const {project, specialty, role, onProjectListChanged, ...other} = props;

        const isValidDate = (date) => {
            return date && !isNaN(new Date(date).getTime());
        };

        const createDate = isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate();

        return (
            <Card {...other}>
                <CardContent>
                    <Stack direction="row"
                           justifyContent="space-between"
                           spacing={4}>
                        <Stack spacing={2}>
                            <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>{specialty?.label}</Typography>
                                <Typography> · </Typography>
                                <ProjectStatusDisplay status={project.state}/>
                                <Typography> · </Typography>
                                <Typography
                                    variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                            </Stack>

                            <Link
                                color="text.primary"
                                variant="h5"
                                underline={"none"}
                            >
                                {project.title}
                            </Link>

                        </Stack>

                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={3}
                        >
                            <ProjectCardPublishButton project={project} role={role} onApply={onProjectListChanged}/>
                            <ProjectCardUnpublishButton project={project} role={role} onApply={onProjectListChanged}/>
                            <ProjectCardRemoveButton project={project} role={role} onApply={onProjectListChanged}/>
                        </Stack>
                    </Stack>
                    <Divider sx={{mt: 2}}/>
                    <Stack direction={"column"} spacing={2}>
                        <div
                            dangerouslySetInnerHTML={{__html: project.description}}/>
                        {project.attach &&
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                <ImageList
                                    variant="quilted"
                                    cols={8}
                                    rowHeight={101}
                                >
                                    {project.attach.map((url) =>
                                        <a data-fancybox="gallery" href={url} className={"my-fancy-link"}><Preview
                                            attach={{preview: url}}/>
                                        </a>
                                    )}
                                </ImageList>
                            </Fancybox>
                        }
                    </Stack>
                    <List>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <ClockIcon/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                disableTypography
                                primary={project.projectStartType === "asap" ? (
                                    <Chip label={"ASAP"} color={"error"} variant={"outlined"}/>
                                ) : (
                                    project.projectStartType === "specialist" ?
                                        (<Chip label={"Specialist's choice"} color={"warning"} variant={"outlined"}/>)
                                        :
                                        (
                                            <Typography variant="subtitle2">
                                                {formatDateRange(project.start?.toDate(), project.end?.toDate())}
                                            </Typography>))}
                            />
                        </ListItem>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <MarkerPin01/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                primary={(
                                    <Typography variant="subtitle2">
                                        {project.location?.place_name}
                                    </Typography>
                                )}
                            />
                        </ListItem>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <BankNote01/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                primary={(
                                    <Typography variant="subtitle2">
                                        Max budget: <Chip label={"$" + project.projectMaximumBudget}/>
                                    </Typography>
                                )}
                            />
                        </ListItem>

                    </List>
                </CardContent>
            </Card>
        );
    }
;

ProjectCard.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "specialist", "admin"]).isRequired,
    onProjectListChanged: PropTypes.func
};
