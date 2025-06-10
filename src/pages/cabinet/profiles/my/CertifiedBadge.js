import React from "react";
import {Box, Typography} from "@mui/material";

export default function CertifiedBadge() {
    return (
        <Box display="flex" alignItems="center" marginLeft="30px">
            <Box
                component="img"
                src="/certificatedUser.png"
                alt="Certified Badge"
                sx={{height: 35, width: 27, mr: 1}}
            />

            <Typography fontWeight="bold" variant="body2" color="primary.main" sx={{lineHeight: 1.2}}>
                Certified <br/> specialist
            </Typography>
        </Box>
    );
}
