import {Box, Button, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";

export const ProfileSpecialtiesHeader = ({editMode, openAddServiceDialog}) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography mt={3}  variant="h6" color="text.secondary">
                SERVICES & PRICES
            </Typography>
            {editMode && (
                <Button sx={{mt: 2, mb: 0.5}} variant="outlined" onClick={openAddServiceDialog}
                        startIcon={<AddIcon color="primary"/>}>
                    Add new Service
                </Button>
            )}
        </Box>
    )
}