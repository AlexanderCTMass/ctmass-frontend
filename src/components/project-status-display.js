import {Archive, Cancel, CheckCircle, Construction, HourglassEmpty, PauseCircle} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import {Box, Chip, SvgIcon, Typography} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import {ProjectStatus} from "src/enums/project-state";

// Цвета и иконки для каждого статуса
const STATUS_STYLES = {
    [ProjectStatus.DRAFT]: {color: "default", icon: <EditIcon />},
    [ProjectStatus.PUBLISHED]: {color: "default", icon: <CheckCircleIcon />},
    [ProjectStatus.IN_PROGRESS]: {color: "info", icon: <Construction/>},
    [ProjectStatus.ON_HOLD]: {color: "secondary", icon: <PauseCircle/>},
    [ProjectStatus.COMPLETED]: {color: "success", icon: <CheckCircle/>},
    [ProjectStatus.ARCHIVED]: {color: "warning", icon: <Archive/>},
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
                color={statusStyle.color}
                // variant="outlined"
                sx={{ fontWeight: 500, textTransform: "capitalize" }}
            />
        </Box>
    );
};

// Пропсы компонента
ProjectStatusDisplay.propTypes = {
    status: PropTypes.oneOf(Object.values(ProjectStatus)).isRequired,
};

export default ProjectStatusDisplay;
