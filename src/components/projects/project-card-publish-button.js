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
import {isProjectPublished, isProjectUnpublished, ProjectStatus} from "src/enums/project-state";
import {projectFlow} from "src/flows/project/project-flow";
import {INFO} from "src/libs/log";
import {useNavigate} from "react-router-dom";
import {paths} from "src/paths";


export const ProjectCardPublishButton = (props) => {
    const {project, user, role, onApply, isSubmitting, setIsSubmitting,...other} = props;
    const {openDialog, closeDialog} = useContextDialog();
    const navigate = useNavigate();

    if (!isProjectPublished(project, role)) {
        return null;
    }

    const handle = async () => {
        INFO("Publish");
        try {
            closeDialog();
            setIsSubmitting(true);
            if (project.id) {
                await projectFlow.publish(project.id, user);
                toast.success(`Project ${project.id} Published!`)
                navigate(paths.cabinet.projects.detail.replace(":projectId", project.id));
            } else {
                await projectFlow.create(project, user);
                toast.success(`Project Published!`)
            }
            onApply([project.id]);
        } catch (e) {
            console.log(e);
            toast.error(`Error project ${project.id} Published!`)
        }finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Published projects?',
            message: 'Are you sure you want to Published the projects?',
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
            Publish
        </Button>
    );
};

ProjectCardPublishButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
