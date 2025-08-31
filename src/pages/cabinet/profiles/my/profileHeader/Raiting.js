import { Box, Chip, Stack, Typography } from "@mui/material";
import React from "react";
import pluralize from 'pluralize';
import { Star } from "mdi-material-ui";

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
            <Stack direction="row" spacing={1} mt={1} alignItems={"center"}>
                <Chip
                    icon={<Star fontSize="medium" color={"warning"} />}
                    label={profile?.rating.toFixed(1)}
                    size="medium"
                />
                <Typography variant="body2" color="text.secondary">
                    {profile?.reviewCount + " " + pluralize('review', profile?.reviewCount)}
                </Typography>
            </Stack>

            {/*  <Stack direction={"row"} divider={<span>·</span>} spac>
                <Typography variant="body2" color="text.secondary">
                    {profile?.rating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {profile?.reviewCount + " " + pluralize('review', profile?.reviewCount)}
                </Typography>
            </Stack>*/}
        </Box>
    );
};