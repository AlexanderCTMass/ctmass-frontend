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


export const ProjectCardPublishButton = (props) => {
    const {project, role, onApply, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (!isProjectPublished(project)) {
        return null;
    }

    const handle = async () => {
        try {
            await projectsApi.updateProject(project.id, {state: ProjectStatus.PUBLISHED});
            toast.success(`Project ${project.id} Published!`)
            closeDialog();
            onApply([project.id]);
        } catch (e) {
            toast.error(`Error project ${project.id} Published!`)
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Published project?',
            message: 'Are you sure you want to Published the project?',
            buttons: (
                <>
                    <Button color="inherit" sx={{mr: 2}} onClick={closeDialog}>
                        No
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.dark',
                            },
                        }}
                        variant="contained"
                        onClick={handle}
                    >
                        Yes, Publish
                    </Button>
                </>
            ),
        });
    };


    return (
        <Button
            variant="outlined"
            color={"success"}
            onClick={handleOpenDialog}
        >
            Publish
        </Button>
    );
};

ProjectCardPublishButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "specialist", "admin"]).isRequired
};
