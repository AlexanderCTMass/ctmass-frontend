import { Box, Typography, IconButton, Tooltip, Stack, useMediaQuery } from "@mui/material";
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";

import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import React, { useState } from "react";
import { INFO } from "src/libs/log";

export const Location = ({ profile, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    INFO("Location", profile);

    const formatAddress = () => {
        const address = profile?.profile?.address;
        if (!address || Object.keys(address).length === 0) {
            return 'Address not specified';
        }

        const parts = [];
        if (address.zipCode) parts.push(address.zipCode);
        if (address.location?.place_name) parts.push(address.location.place_name);

        return parts.length > 0 ? parts.join(', ') : 'Address not specified';
    };

    const renderTransportIcon = () => {
        const transport = profile?.profile?.address?.profile;
        const duration = profile?.profile?.address?.duration;

        if (!transport || !duration) return null;

        const IconComponent = transport === 'walking'
            ? DirectionsWalkIcon
            : DirectionsCarIcon;

        return (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <IconComponent fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                    {duration} min
                </Typography>
            </Stack>
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mt: 1,
                position: 'relative',
                flexDirection: 'column'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                    component="img"
                    src="/place.png"
                    alt="Location"
                    sx={{ height: 20, mr: 1 }}
                />

                <Typography variant="body2" color="text.secondary">
                    {formatAddress()}
                </Typography>

                {onEdit && (
                    <Tooltip title="Edit address">
                        <IconButton
                            size="small"
                            onClick={onEdit}
                            sx={{
                                opacity: isHovered || !mdUp ? 1 : 0,
                                transition: 'opacity 0.2s',
                                ml: 1,
                                p: 0.5,
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {renderTransportIcon()}
        </Box>
    );
};