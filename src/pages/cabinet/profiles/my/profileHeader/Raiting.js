import {Box, Stack, Typography} from "@mui/material";
import React from "react";
import pluralize from 'pluralize';

export const Rating = ({profile}) => {
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
            <Stack direction={"row"} divider={<span>·</span>} spac>
                <Typography variant="body2" color="text.secondary">
                    {profile?.rating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {profile?.reviewCount + " " + pluralize('review', profile?.reviewCount)}
                </Typography>
            </Stack>
        </Box>
    );
};