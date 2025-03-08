import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Chip,
    Divider,
    ImageList,
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
import MarkerPin01 from "@untitled-ui/icons-react/build/esm/MarkerPin01";
import BankNote01 from "@untitled-ui/icons-react/build/esm/BankNote01";
import * as React from "react";
import Fancybox from "src/components/myfancy/myfancybox";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {isValidDate} from "src/utils/date-locale";
import ProjectStatusDisplay from "src/components/project-status-display";
import {formatDistanceToNow} from "date-fns";
import {ProjectCardRemoveButton} from "src/components/projects/project-card-remove-button";
import {ProjectCardUnpublishButton} from "src/components/projects/project-card-unpublish-button";
import {ProjectCardPublishButton} from "src/components/projects/project-card-publish-button";
import {Preview} from "src/components/myfancy/image-preview";
import {ProjectDatesView} from "src/components/project-dates-view";
import {paths} from 'src/paths';
import {ProjectCardNotInterestedButton} from "src/components/projects/project-card-not-interested-button";
import {ProjectCardResponseButton} from "src/components/projects/project-card-response-button";


export const ProjectCard = (props) => {
        const {project, specialty, role, user, onProjectListChanged, ...other} = props;

        const createDate = isValidDate(project.createdAt) ? new Date(project.createdAt) : project.createdAt.toDate();

        return (
            <Card {...other}>
                <CardContent>
                    <Stack direction="row"
                           justifyContent="space-between"
                           alignItems={"start"}
                           spacing={4}>
                        <Stack spacing={2}>
                            <Stack direction={"row"} spacing={1} alignItems={"center"} divider={<span>·</span>}>
                                <Typography>{specialty?.label}</Typography>
                                <ProjectStatusDisplay status={project.state}/>
                                <Typography
                                    variant={"caption"}>{formatDistanceToNow(createDate, {addSuffix: true})}</Typography>
                            </Stack>

                            <Link
                                color="text.primary"
                                variant="h5"
                                href={paths.customer.projects.detail.replace(":projectId", project.id)}
                                underline={"none"}
                            >
                                {project.title}
                            </Link>

                        </Stack>

                        <Stack
                            alignItems={"start"}
                            direction="row"
                            spacing={3}
                        >
                            <ProjectCardPublishButton project={project} user={user} role={role}
                                                      onApply={onProjectListChanged}/>
                            <ProjectCardUnpublishButton project={project} user={user} role={role}
                                                        onApply={onProjectListChanged}/>
                            <ProjectCardRemoveButton project={project} user={user} role={role}
                                                     onApply={onProjectListChanged}/>
                            <ProjectCardResponseButton project={project} user={user} role={role}
                                                      onApply={onProjectListChanged}/>
                            <ProjectCardNotInterestedButton project={project} user={user} role={role}
                                                     onApply={onProjectListChanged}/>
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
                                primary={<ProjectDatesView project={project}/>}
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
                    <Typography
                        variant={"caption"} color={"text.secondary"}>#{project.id}</Typography>
                </CardContent>
            </Card>
        );
    }
;

ProjectCard.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired,
    onProjectListChanged: PropTypes.func
};
