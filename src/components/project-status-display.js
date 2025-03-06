import {Archive, Cancel, CheckCircle, Construction, HourglassEmpty, PauseCircle} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import {Box, Chip, SvgIcon, Typography} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import {ProjectStatus} from "src/enums/project-state";

// Цвета и иконки для каждого статуса
const STATUS_STYLES = {
    [ProjectStatus.DRAFT]: {color: "rgba(170,170,170,0.45)", fontColor: "#000", icon: <EditIcon/>},
    [ProjectStatus.PUBLISHED]: {color: "#0077ff", icon: <CheckCircleIcon/>},
    [ProjectStatus.IN_PROGRESS]: {color: "#ffba10", fontColor: "#000", icon: <Construction/>},
    [ProjectStatus.ON_CONFIRM]: {color: "#ff6c10", icon: <Construction/>},
    [ProjectStatus.COMPLETED]: {color: "#64b13e", icon: <CheckCircle/>},

    [ProjectStatus.ARCHIVED]: {color: "warning", icon: <Archive/>},
    [ProjectStatus.ON_HOLD]: {color: "secondary", icon: <PauseCircle/>},
    [ProjectStatus.CANCELLED]: {color: "error", icon: <Cancel/>},
};

// Основной компонент
const ProjectStatusDisplay = ({status}) => {
    const statusStyle = STATUS_STYLES[status] || {color: "gray", icon: <HourglassEmpty/>};
    if (!status) {
        return;
    }

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Chip
                // icon={statusStyle.icon}
                label={status.replace("_", " ").toUpperCase()}
                // variant="outlined"
                sx={{
                    fontWeight: 500,
                    textTransform: "capitalize",
                    backgroundColor: statusStyle.color,
                    color: statusStyle.fontColor || "#FFF"
                }}
            />
        </Box>
    );
};

// Пропсы компонента
ProjectStatusDisplay.propTypes = {
    status: PropTypes.oneOf(Object.values(ProjectStatus)).isRequired,
};

export default ProjectStatusDisplay;
