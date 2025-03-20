import {Chip, Typography} from "@mui/material";
import * as React from "react";
import {formatDateRange, getValidDate} from "src/utils/date-locale";

export const ProjectDatesView = (props) => {
    const {project, ...other} = props;

    if (!project || (!project.projectStartType && (!project.start || !project.end)))
        return;

    if (project.projectStartType === "asap") {
        return <Chip label={"ASAP"} color={"error"} variant={"outlined"} {...other}/>;
    } else if (project.projectStartType === "specialist") {
        return <Chip label={"Specialist's choice"} color={"warning"} variant={"outlined"}  {...other}/>;
    } else {
        return <Typography variant="subtitle2" {...other}>
            {formatDateRange(getValidDate(project.start), getValidDate(project.end))}
        </Typography>;
    }
}