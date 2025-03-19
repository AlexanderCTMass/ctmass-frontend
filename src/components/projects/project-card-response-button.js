import PropTypes from 'prop-types';
import {Button, Dialog} from '@mui/material';
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
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {navigateToCurrentWithParams} from "src/utils/navigate";
import {paths} from "src/paths";
import {projectService} from "src/service/project-service";


export const ProjectCardResponseButton = (props) => {
    const {project, user, role, onApply, ...other} = props;
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();


    if (!isProjectSearched(project, role)) {
        return null;
    }

    const isMyResponded = role === "contractor" && projectService.getRespondedChatId(project, user);
    if (isMyResponded) {
        return null;
    }

    const handleOpenDialog = async () => {
        try {
            const threadKey = await projectFlow.response(project, user);
            navigate(paths.cabinet.projects.find.detail.replace(":projectId", project.id) + "?threadKey=" + threadKey);
            // onApply([project.id]);
        } catch (e) {
            console.log(e);
            toast.error(`Error project response!`)
        }

    };
    return (
        <>
            <Button
                variant="outlined"
                color={"success"}
                onClick={handleOpenDialog}
            >
                Submit
            </Button>
            {/* <Dialog
                open={open}
                onClose={handleCloseDialog}
                fullWidth
                fullHeight
                maxWidth="sm"
            >

            </Dialog>*/}
        </>
    );
};

ProjectCardResponseButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
