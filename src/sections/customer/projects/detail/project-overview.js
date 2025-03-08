import PropTypes from 'prop-types';
import {Box, ImageList} from '@mui/material';
import * as React from "react";
import Fancybox from "src/components/myfancy/myfancybox";
import {Preview} from "src/components/myfancy/image-preview";

export const ProjectOverview = (props) => {
    const {project, ...other} = props;

    const images = project.project.attach || [];

    return (
        <div {...other}>
            <Box sx={{textAlign: "justify"}}>
                <div dangerouslySetInnerHTML={{__html: project.project.description}}/>
            </Box>
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
        </div>
    );
};

ProjectOverview.propTypes = {
    project: PropTypes.object.isRequired
};
