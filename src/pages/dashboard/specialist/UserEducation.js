import React from "react";
import { Typography, Box } from "@mui/material";

const UserEducation = ({ education }) => {
    return (
        <Box>
            <Typography variant="h6">Education</Typography>
            <Typography variant="body2" color="text.secondary">
                {education}
            </Typography>
        </Box>
    );
};

export default UserEducation;