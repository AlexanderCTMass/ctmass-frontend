import PropTypes from 'prop-types';
import {Box, Card, CardContent, Divider, ImageList, Typography, useMediaQuery} from '@mui/material';
import * as React from "react";
import Fancybox from "src/components/myfancy/myfancybox";
import {Preview} from "src/components/myfancy/image-preview";
import Grid from "@mui/material/Unstable_Grid2";
import {ProjectSummary} from "src/sections/customer/projects/detail/project-summary";
import {ProjectInnerSummary} from "src/sections/customer/projects/detail/project-inner-summary";
import {roles} from "src/roles";

export const ProjectOverview = (props) => {
    const {project, specialties, isMyResponded, serviceLabel, role, user, createDate, ...other} = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm')); // Проверка на ширину экрана

    const images = project.attach || [];

    const isWorker = role === roles.WORKER;

    // Контент карточки
    const cardContent = (
        <>
            <Typography
                color="text.secondary"
                component="p"
                sx={smUp ? {mb: 2} : {mb: 0}}
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
                sx={smUp ? {mb: 2} : {mb: 0}}
                variant="overline"
            >
                Photos & videos
            </Typography>
            {images && (
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
                        {images.map((url) => (
                            <a data-fancybox="gallery" href={url} className={"my-fancy-link"}>
                                <Preview attach={{preview: url}}/>
                            </a>
                        ))}
                    </ImageList>
                </Fancybox>
            )}
        </>
    );

    return (
        <Grid {...other} container spacing={2}>
            <Grid xs={12} lg={8}>
                {smUp ? ( // Если экран больше или равен sm, рендерим карточку
                    <Card>
                        <CardContent>
                            {cardContent}
                        </CardContent>
                    </Card>
                ) : ( // Если экран меньше sm, рендерим контент без карточки
                    <>
                        <Box sx={{p: 0}}>
                            {cardContent}
                        </Box>
                        <Divider sx={{my: 2}}/>
                    </>
                )}
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
