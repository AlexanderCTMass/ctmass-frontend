import {Box, Typography} from "@mui/material";
import React from "react";

export const Rating = ({ profile }) => {
    const ratingContainer = {
        display: 'flex',
        alignItems: 'center',
        mt: 1
    };
    const iconStyle = {
        height: 20,
        mr: 1
    };

    if (!profile?.reviewCount) {
        return null;
    }

    return (
        <Box sx={ratingContainer}>
            <Box
                component="img"
                src="/star.png"
                alt="Rating"
                sx={iconStyle}
            />
            <Typography variant="body2" color="text.secondary">
                {profile?.rating + " · " + profile?.reviewCount + " reviews"}
            </Typography>
        </Box>
    );
};