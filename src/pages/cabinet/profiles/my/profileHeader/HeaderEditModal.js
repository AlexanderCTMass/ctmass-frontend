import { Box, Grid, Modal, TextField, Typography, Paper, Divider } from "@mui/material";
import { AddressEditForm } from "../../../../../sections/dashboard/account/general/address-edit-form";
import React from "react";
import { SpecialistAvailabilityComponent } from "src/pages/cabinet/profiles/my/profileHeader/SpecialistAvailabilityComponent";

export const HeaderEditModal = ({ profile, setProfile, openAddressModal, setOpenAddressModal }) => {
    const handleAddressSubmit = (newAddress) => {
        setProfile(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                address: newAddress.address
            }
        }));
        setOpenAddressModal(false);
    };

    const handleNameChange = (e) => {
        setProfile(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                businessName: e.target.value
            }
        }));
    };

    return (
        <Modal
            open={openAddressModal}
            onClose={() => setOpenAddressModal(false)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box sx={{
                backgroundColor: 'background.paper',
                p: 4,
                borderRadius: 2,
                width: '90%',
                maxWidth: 900,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <Typography variant="h6" gutterBottom>
                    Profile Settings
                </Typography>

                {/* Business Name Section */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Business Name
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Enter the name that will be displayed to clients and other users on the platform.
                        This is how you'll appear in search results and profiles.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Your business name"
                        value={profile?.profile?.businessName || ''}
                        onChange={handleNameChange}
                        variant="outlined"
                        margin="normal"
                    />
                </Paper>

                {/* Availability Section */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Availability Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current network availability status.
                        Until what day do you not want to accept new applications or orders.
                    </Typography>
                    <SpecialistAvailabilityComponent
                        profile={profile}
                        setProfile={setProfile}
                        editMode={true}
                    />
                </Paper>

                {/* Address Section */}
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Service Area
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Define the geographic area in which you provide services.
                        Specific location and maximum distance, as well as travel/walking preference.
                    </Typography>
                    <AddressEditForm
                        address={profile?.profile?.address}
                        onSubmit={handleAddressSubmit}
                        onCancel={() => setOpenAddressModal(false)}
                    />
                </Paper>
            </Box>
        </Modal>
    )
}