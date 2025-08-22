import { Archive, Cancel, CheckCircle, Construction, HourglassEmpty, PauseCircle } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Chip, SvgIcon, Typography } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { ProjectStatus } from "src/enums/project-state";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";

// Цвета и иконки для каждого статуса
const STATUS_STYLES = {
    [ProjectSpecialistStatus.RESPONDED]: { color: "#64b13e", icon: <CheckCircle /> },
};

// Основной компонент
const ProjectSpecialistStatusDisplay = ({ status, size = "medium", ...other }) => {
    const statusStyle = STATUS_STYLES[status] || { color: "gray", icon: <HourglassEmpty /> };
    if (!status) {
        return;
    }

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Chip
                size={size}
                // icon={statusStyle.icon}
                label={status.replace("_", " ").toUpperCase()}
                // variant="outlined"
                sx={{
                    fontWeight: 500,
                    textTransform: "capitalize",
                    backgroundColor: statusStyle.color,
                    color: statusStyle.fontColor || "#FFF"
                }}
                other
            />
        </Box>
    );
};

// Пропсы компонента
ProjectSpecialistStatusDisplay.propTypes = {
    status: PropTypes.oneOf(Object.values(ProjectSpecialistStatus)).isRequired,
};

export default ProjectSpecialistStatusDisplay;
