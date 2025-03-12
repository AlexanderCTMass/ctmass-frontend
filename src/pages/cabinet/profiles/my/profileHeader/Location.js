import {Box, IconButton, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

export const Location = ({profile, editMode, setOpenAddressModal}) => {
    const formatAddress = () => {
        if (!profile?.profile?.address || Object.keys(profile?.profile?.address).length === 0) {
            return 'address not specified';
        }

        const parts = [];
        if (profile?.profile?.address?.zipCode) parts.push(profile?.profile.address.zipCode);
        if (profile?.profile?.address?.location?.place_name) parts.push(profile?.profile.address.location.place_name);
        // if (profile?.profile?.address?.profile) parts.push("\n(" + profile?.profile.address.profile + " " + profile?.profile.address.duration + " minutes)");

        return parts.length > 0
            ? parts
            : 'address not specified';
    };

    const ratingContainer = {
        display: 'flex',
        alignItems: 'center',
        mt: 1
    };

    const iconStyle = {
        height: 20,
        mr: 1
    };
    
    return (
        <Box sx={ratingContainer} position="relative">
            <Box
                component="img"
                src="/place.png"
                alt="Location"
                sx={iconStyle}
            />
            <Typography variant="body1" color="text.secondary" sx={{whiteSpace: 'pre-wrap'}}>
                {formatAddress()}
            </Typography>


            {editMode && (
                <IconButton
                    sx={{
                        ml: 2,
                    }}
                    onClick={() => setOpenAddressModal(true)}
                >
                    <EditIcon fontSize="small" color="success"/>
                </IconButton>
            )}
        </Box>
    )
}