import PropTypes from 'prop-types';
import {Button, CircularProgress} from '@mui/material';
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
import {projectFlow} from "src/flows/project/project-flow";


export const ProjectCardRemoveButton = (props) => {
    const {project, role, onApply,isSubmitting, setIsSubmitting, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (!isProjectRemovable(project.state, role)) {
        return null;
    }

    const handleCancelProject = async () => {
        try {
            closeDialog();
            setIsSubmitting(true);
            await projectFlow.remove(project)
            toast.success(`Project ${project.id} removed!`)
            onApply([project.id]);
        } catch (e) {
            console.log(e);
            toast.error(`Error project ${project.id} removed!`)
        }finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Remove projects?',
            message: 'Are you sure you want to delete the projects? All data will be permanently deleted.',
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
            disabled={isSubmitting}
            startIcon={
                isSubmitting && (
                    <CircularProgress
                        size={20}
                        color="inherit"
                    />
                )
            }
        >
            Remove
        </Button>
    );
};

ProjectCardRemoveButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
