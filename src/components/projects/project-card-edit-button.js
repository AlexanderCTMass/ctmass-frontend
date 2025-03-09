import PropTypes from 'prop-types';
import {Button} from '@mui/material';
import * as React from "react";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {useContextDialog} from "src/hooks/use-context-dialog";
import AlertTriangleIcon from "@untitled-ui/icons-react/build/esm/AlertTriangle";
import {projectsApi} from "src/api/projects";
import toast from "react-hot-toast";
import {isProjectPublished, isProjectUnpublished, ProjectStatus} from "src/enums/project-state";
import {projectFlow} from "src/flows/project/project-flow";


export const ProjectCardEditButton = (props) => {
    const {project, user, role, onApply, ...other} = props;

    if (role === "contractor") {
        return null;
    }
    if (project.state !== ProjectStatus.DRAFT) {
        return null;
    }

    return (
        <Button
            variant="outlined"
            color={"warning"}
            onClick={onApply}
        >
            Edit
        </Button>
    );
};

ProjectCardEditButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
