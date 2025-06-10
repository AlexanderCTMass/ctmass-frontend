import PropTypes from 'prop-types';
import {Button, CircularProgress} from '@mui/material';
import * as React from "react";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {useContextDialog} from "src/hooks/use-context-dialog";
import AlertTriangleIcon from "@untitled-ui/icons-react/build/esm/AlertTriangle";
import toast from "react-hot-toast";
import {isProjectUnpublished} from "src/enums/project-state";
import {projectFlow} from "src/flows/project/project-flow";
import {useState} from "react";


export const ProjectCardUnpublishButton = (props) => {
    const {project, role, user, onApply, isSubmitting, setIsSubmitting, ...other} = props;
    const {openDialog, closeDialog} = useContextDialog();

    if (!isProjectUnpublished(project.state, role)) {
        return null;
    }

    const handle = async () => {
        try {
            closeDialog();
            setIsSubmitting(true);
            await projectFlow.unpublish(project.id, user);
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
            title: 'Unpublished projects?',
            message: 'Are you sure you want to unpublished the projects?',
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
                        Yes, Unpublish
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
            Unpublish
        </Button>
    );
};

ProjectCardUnpublishButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
