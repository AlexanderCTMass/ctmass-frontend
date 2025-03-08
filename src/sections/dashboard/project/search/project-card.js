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
import Fancybox from "../../../../components/myfancy/myfancybox";
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {formatDateRange} from "../../../../utils/date-locale";
import {RouterLink} from "../../../../components/router-link";
import {paths} from "../../../../paths";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
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
        const {project, ...other} = props;

        return (
            <Card {...other}>
                <CardContent>
                    <Stack direction="row"
                           justifyContent="space-between"
                           spacing={4}>
                        <div>
                            <Link
                                color="text.primary"
                                variant="h5"
                                underline={"none"}
                            >
                                {project.title}
                            </Link>
                            <Typography>{project.specialty?.label} {project.service ? (project.service.label !== project.title ? (" · " + project.service.label) : "") : ""}</Typography>
                        </div>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={3}
                        >
                            <ProjectCardPublishButton project={project} user={user} role={role}
                                                      onApply={onProjectListChanged}/>
                            <Button
                               /* startIcon={(
                                    <SvgIcon>
                                        <PlusIcon/>
                                    </SvgIcon>
                                )}*/
                                variant="contained"
                            >
                                Respond
                            </Button>
                            <Button
                                /*startIcon={(
                                    <SvgIcon>
                                        <PlusIcon/>
                                    </SvgIcon>
                                )}*/
                                variant="outlined"
                                color={"error"}
                            >
                                Not interested
                            </Button>
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
                                    <Chip label={"ASAP"} color={"error"}/>
                                ) : (
                                    project.projectStartType === "specialist" ?
                                        (<Chip label={"Specialist's choice"} color={"warning"}/>)
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
    project: PropTypes.object.isRequired
};
