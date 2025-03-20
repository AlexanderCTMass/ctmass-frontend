import PropTypes from 'prop-types';
import {Button, CircularProgress} from '@mui/material';
import * as React from "react";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {useContextDialog} from "src/hooks/use-context-dialog";
import AlertTriangleIcon from "@untitled-ui/icons-react/build/esm/AlertTriangle";
import toast from "react-hot-toast";
import {isProjectUnpublished, ProjectStatus} from "src/enums/project-state";
import {projectFlow} from "src/flows/project/project-flow";
import {useState} from "react";
import {projectService} from "src/service/project-service";
import {chatApi} from "src/api/chat/newApi";


export const ProjectCardRejectButton = (props) => {
    const {project, role, user, onApply, isSubmitting, setIsSubmitting, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (role !== "contractor") {
        return null;
    }

    if (project.state !== ProjectStatus.PUBLISHED) {
        return null;
    }

    if (!projectService.getRespondedChatId(project, user)) {
        return null;
    }


    const handle = async () => {
        try {
            closeDialog();
            setIsSubmitting(true);
            const respondedChatId = projectService.getRespondedChatId(project, user);
            await projectFlow.rejectProjectResponse(respondedChatId, user.id);
            toast.success(`Project ${project.id} unpublished!`)
            onApply([project.id]);
        } catch (e) {
            console.log(e);
            toast.error(`Error project ${project.id} unpublished!`)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDialog = () => {
        openDialog({
            icon: <AlertTriangleIcon/>,
            title: 'Reject project?',
            message: 'Are you sure you want to reject the project?',
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
                        Yes, Reject
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
            Reject
        </Button>
    );
};

ProjectCardRejectButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
