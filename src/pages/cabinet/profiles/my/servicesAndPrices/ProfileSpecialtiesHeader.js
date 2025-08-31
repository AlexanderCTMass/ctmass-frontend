import { Box, Typography } from "@mui/material";
import React from "react";
import { Add } from "@mui/icons-material";

export const ProfileSpecialtiesHeader = ({ isMyProfile, openAddServiceDialog }) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography mt={3} mb={2} variant="h6" color="text.secondary">
                SERVICES & PRICES
            </Typography>
            {isMyProfile && (
                <Add color="success"
                    onClick={openAddServiceDialog}
                    sx={{
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": {
                            transform: "scale(1.2)",
                        },
                        mr: 1
                    }}
                />
            )}
        </Box>
    )
}