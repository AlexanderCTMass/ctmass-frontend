import {Box, Grid, Modal, Stack, Typography} from "@mui/material";
import {AddressEditForm} from "../../../../../sections/dashboard/account/general/address-edit-form";
import React from "react";

export const AddressEditModal = ({profile, setProfile, openAddressModal, setOpenAddressModal}) => {
    const handleAddressSubmit = (newAddress) => {
        setProfile(prev => ({
            ...prev, // Копируем предыдущее состояние
            profile: {
                ...prev.profile, // Копируем предыдущее состояние profile
                address: newAddress.address // Обновляем только поле address
            }
        }));
        setOpenAddressModal(false); // Закрываем модальное окно
    };

    return (
        <Modal
            open={openAddressModal}
            onClose={() => setOpenAddressModal(false)}
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
            <Box sx={{
                backgroundColor: 'background.paper',
                p: 4,
                borderRadius: 2,
                width: '80%',
                maxWidth: 600
            }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <Typography variant="h6">
                                Service Location
                            </Typography>
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                To receive orders nearby, specify the exact address. Other users will not see it, we
                                will select orders taking into account the specified distance
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <AddressEditForm
                            address={profile?.profile?.address}
                            onSubmit={handleAddressSubmit}
                            onCancel={() => setOpenAddressModal(false)}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    )
}