import { Typography } from "@mui/material";
import { formatDateRange, getValidDate } from "src/utils/date-locale";
import { StatusPill } from "src/components/ctmass-ui";

export const ProjectDatesView = (props) => {
    const { project, ...other } = props;

    if (project?.projectStartType === "asap") {
        return <StatusPill tone="danger">As soon as possible</StatusPill>;
    }

    if (project?.projectStartType === "specialist") {
        return <StatusPill tone="amber">Specialist&apos;s choice</StatusPill>;
    }

    if (!project?.start || !project?.end) {
        return <Typography variant="subtitle2" color="text.secondary" {...other}>Dates not set</Typography>;
    }

    return (
        <Typography variant="subtitle2" {...other}>
            {formatDateRange(getValidDate(project.start), getValidDate(project.end))}
        </Typography>
    );
};
