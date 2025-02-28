import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Grid, TextField, Typography} from "@mui/material";
import CertifiedBadge from "../CertifiedBadge";
import {SpecialistAvailabilityComponent} from "./SpecialistAvailabilityComponent";
import {Location} from "./Location";
import {ProfileAvatar} from "./ProfileAvatar";
import {AddressEditModal} from "./AddressEditModal";
import {Rating} from "./Raiting";
import {ButtonsGroup} from "./ButtonsGroup";

const ProfileHeader = ({
                           isOwnProfile,
                           profile,
                           editMode,
                           handleSave,
                           setProfile,
                           setEditMode
                       }) => {

    const handleNameChange = (e) => {
        setProfile(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                businessName: e.target.value
            }
        }));
    };

    const hasCertificates = profile?.education?.some(edu =>
        edu?.certificates && edu?.certificates?.length > 0
    );

    const [openAddressModal, setOpenAddressModal] = useState(false);

    return (
        <div>
            <Grid container spacing={3} alignItems="flex-start">
                <ProfileAvatar profile={profile} setProfile={setProfile} editMode={editMode}/>
                <Grid item xs>
                    {/* Блок имени и сертификации */}
                    {editMode ? (
                        <TextField
                            fullWidth
                            label="Name"
                            value={profile?.profile?.businessName}
                            onChange={handleNameChange}
                            variant="outlined"
                            margin="dense"
                        />
                    ) : (
                        <Box display="flex" alignItems="flex-start" gap={4}>
                            <Typography component="h1" variant="h4" fontWeight="bold">
                                {profile?.profile?.businessName}
                            </Typography>
                            {hasCertificates &&
                                <CertifiedBadge/>}
                        </Box>
                    )}

                    {/* Блок рейтинга */}

                    <Rating profile={profile}/>
                    <Location profile={profile} editMode={editMode} setOpenAddressModal={setOpenAddressModal}/>
                    <SpecialistAvailabilityComponent profile={profile} setProfile={setProfile} editMode={editMode}/>
                    <ButtonsGroup profile={profile} isOwnProfile={isOwnProfile} editMode={editMode} setEditMode={setEditMode}
                                  handleSave={handleSave}/>

                </Grid>
            </Grid>
            <AddressEditModal profile={profile} setProfile={setProfile} openAddressModal={openAddressModal}
                              setOpenAddressModal={setOpenAddressModal}/>
        </div>
    );
};

ProfileHeader.propTypes = {
    isOwnProfile: PropTypes.bool,
    profile: PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
        rating: PropTypes.string,
        reviewsCount: PropTypes.number,
        address: PropTypes.shape({
            location: PropTypes.string,
            city: PropTypes.string,
            country: PropTypes.string,
            duration: PropTypes.string,
            zipCode: PropTypes.string,
        }),
        isCertified: PropTypes.bool
    }),
    editMode: PropTypes.bool,
    handleSave: PropTypes.func,
    setProfile: PropTypes.func,
};

export default memo(ProfileHeader);