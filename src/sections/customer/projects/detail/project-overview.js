import PropTypes from 'prop-types';
import {Box, Card, CardContent, ImageList, Typography} from '@mui/material';
import * as React from "react";
import Fancybox from "src/components/myfancy/myfancybox";
import {Preview} from "src/components/myfancy/image-preview";
import Grid from "@mui/material/Unstable_Grid2";
import {ProjectSummary} from "src/sections/customer/projects/detail/project-summary";
import {ProjectInnerSummary} from "src/sections/customer/projects/detail/project-inner-summary";
import {roles} from "src/roles";
import {ChatThread} from "src/sections/dashboard/chatNew/chat-thread";
import {ChatBlank} from "src/sections/dashboard/chatNew/chat-blank";
import {ChatContainer} from "src/sections/dashboard/chatNew/chat-container";

export const ProjectOverview = (props) => {
    const {project,isMyResponded, role, user, ...other} = props;

    const images = project.attach || [];

    const isWorker = role === roles.WORKER;
    return (
        <Grid {...other} container spacing={2}>
            <Grid xs={12} lg={8}>
                <Card>
                    <CardContent>
                        <Typography
                            color="text.secondary"
                            component="p"
                            sx={{mb: 2}}
                            variant="overline"
                        >
                            Description
                        </Typography>
                        <Box sx={{textAlign: "justify"}}>
                            <div dangerouslySetInnerHTML={{__html: project.description}}/>
                        </Box>
                        <Typography
                            color="text.secondary"
                            component="p"
                            sx={{mb: 2}}
                            variant="overline"
                        >
                            Photos & videos
                        </Typography>
                        {images &&
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                <ImageList
                                    variant="quilted"
                                    cols={4}
                                    rowHeight={101}
                                >
                                    {images.map((url) =>
                                        <a data-fancybox="gallery" href={url} className={"my-fancy-link"}>
                                            <Preview attach={{preview: url}}/>
                                        </a>
                                    )}
                                </ImageList>
                            </Fancybox>
                        }
                    </CardContent>
                </Card>
                {isWorker && <></>}
            </Grid>
            <Grid xs={12} lg={4}>
                <ProjectSummary isMyResponded={isMyResponded} project={project} role={role} user={user}/>
                {!isWorker &&
                    <ProjectInnerSummary project={project} sx={{mt: 2}}/>}
            </Grid>
        </Grid>
    );
};

ProjectOverview.propTypes = {
    project: PropTypes.object.isRequired
};
