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
import {isProjectPublished, isProjectSearched, isProjectUnpublished, ProjectStatus} from "src/enums/project-state";
import {projectFlow} from "src/flows/project/project-flow";
import {projectService} from "src/service/project-service";


export const ProjectCardNotInterestedButton = (props) => {
    const {project, user, role, onApply,isSubmitting, setIsSubmitting, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (!isProjectSearched(project, role)) {
        return null;
    }

    const isHide = projectService.isUninterestedForMe(project, user);
    if (isHide) {
        return null;
    }

    const isMyResponded = role === "contractor" && projectService.getRespondedChatId(project, user);
    if (isMyResponded) {
        return null;
    }

    const handle = async () => {
        try {
            closeDialog();
            setIsSubmitting(true);
            await projectFlow.notInterested(project, user);

            toast.success(`Success`)
            onApply([project.id]);
        } catch (e) {
            console.log(e);
            toast.error(`Error`)
        }finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Mark projects is not interested?',
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
                        Yes, mark
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
            Hide
        </Button>
    );
};

ProjectCardNotInterestedButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
