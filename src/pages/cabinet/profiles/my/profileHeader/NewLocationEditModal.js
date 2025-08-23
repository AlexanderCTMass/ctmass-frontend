import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ImageList,
    Modal,
    Paper,
    Stack,
    TextField,
    Typography, useMediaQuery
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { AddressEditForm } from "../../../../../sections/dashboard/account/general/address-edit-form";
import React, { useCallback } from "react";
import {
    SpecialistAvailabilityComponent
} from "src/pages/cabinet/profiles/my/profileHeader/SpecialistAvailabilityComponent";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { PhotosDropzone } from "src/components/photos-dropzone";
import Fancybox from "src/components/myfancy/myfancybox";
import { PreviewEditable } from "src/components/myfancy/image-preview-editable";
import { SpecialistBusinessStep } from "src/sections/dashboard/specialist-profile/specialist-business-step";
import { profileApi } from "src/api/profile";
import { roles } from "src/roles";
import { ERROR, INFO } from "src/libs/log";
import toast from "react-hot-toast";
import { SpecialistLocationStep } from "src/sections/dashboard/specialist-profile/specialist-location-step";

export const LocationEditModal = ({ profile, setProfile, open, onClose }) => {
    const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const handleProfileChange = useCallback(async (values) => {
        await profileApi.update(profile.id, values);

        setProfile(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                ...values
            }
        }));
    }, [profile]);

    const handleNext = useCallback((changedProfile) => {
        INFO("CHANGE PROFILE", changedProfile);
        try {
            if (changedProfile) {
                handleProfileChange(changedProfile);
            }
            onClose(false);
        } catch (error) {
            ERROR(error);
            toast.error('Error while changing profile!');
        }
    }, [handleProfileChange])

    return (
        <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="md" fullScreen={mdDown}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <IconButton
                        onClick={() => onClose(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <SpecialistLocationStep
                    onNext={handleNext}
                    profile={profile}
                    step={null}
                />
            </DialogContent>
        </Dialog>
    )
}