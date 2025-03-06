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
import {isProjectRemovable, ProjectStatus} from "src/enums/project-state";
import {projectsLocalApi} from "src/api/projects/project-local-storage";


export const ProjectCardRemoveButton = (props) => {
    const {project, role, onApply, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (!isProjectRemovable(project.state)) {
        return null;
    }

    const handleCancelProject = async () => {
        try {
            if (project.state === ProjectStatus.DRAFT) {
                projectsLocalApi.deleteProject();
            } else {
                await projectsApi.deleteProject(project.id);
            }
            toast.success(`Project ${project.id} removed!`)
            closeDialog();
            onApply([project.id]);
        } catch (e) {
            toast.error(`Error project ${project.id} removed!`)
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Remove project?',
            message: 'Are you sure you want to delete the project? All data will be permanently deleted.',
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
                        onClick={handleCancelProject}
                    >
                        Yes, Remove
                    </Button>
                </>
            ),
        });
    };


    return (
        <Button
            variant="outlined"
            color={"error"}
            onClick={handleOpenDialog}
        >
            Remove
        </Button>
    );
};

ProjectCardRemoveButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "specialist", "admin"]).isRequired
};
