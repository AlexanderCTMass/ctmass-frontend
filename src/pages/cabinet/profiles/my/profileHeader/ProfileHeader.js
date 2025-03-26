import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
    useMediaQuery
} from "@mui/material";
import CertifiedBadge from "../CertifiedBadge";
import {SpecialistAvailabilityComponent} from "./SpecialistAvailabilityComponent";
import {Location} from "./Location";
import {ProfileAvatar} from "./ProfileAvatar";
import {Rating} from "./Raiting";
import {ButtonsGroup} from "./ButtonsGroup";
import {roles} from "src/roles";
import {HeaderEditModal} from "src/pages/cabinet/profiles/my/profileHeader/NewHeaderEditModal";
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";
import {LocationEditModal} from "src/pages/cabinet/profiles/my/profileHeader/NewLocationEditModal";

const ProfileHeader = ({
                           isOwnProfile,
                           profile,
                           setProfile,
                       }) => {
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const hasCertificates = profile?.education?.some(edu =>
        edu?.certificates && edu?.certificates?.length > 0
    );

    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [openCommonModal, setOpenCommonModal] = useState(false);
    const [editAvailable, setEditAvailable] = useState(false);

    if (!profile) {
        return <CircularProgress/>
    }

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <div>

                <Grid container spacing={3} alignItems="flex-start">
                    <ProfileAvatar profile={profile} setProfile={setProfile} isMyProfile={isOwnProfile}/>
                    <Grid item xs>
                        {/* Блок имени и сертификации */}
                        <Box display="flex" alignItems="flex-start" gap={4}>
                            <Typography component="h1" variant="h4" fontWeight="bold">
                                {profile?.profile?.businessName}
                            </Typography>
                            {profile?.profile?.role === roles.WORKER && hasCertificates && mdUp &&
                                <CertifiedBadge/>}
                        </Box>

                        {/* Блок рейтинга */}

                        {profile?.profile?.role === roles.WORKER && <div>
                            <Rating profile={profile?.profile}/>
                            <Location profile={profile} onEdit={() => {setOpenAddressModal(true)}}/>
                            <SpecialistAvailabilityComponent profile={profile} setProfile={setProfile}
                                                             editMode={editAvailable}/>
                        </div>}
                        <ButtonsGroup profile={profile} setProfile={setProfile} isOwnProfile={isOwnProfile}/>

                    </Grid>
                </Grid>

            </div>
            {isOwnProfile && (
                <IconButton cursor="pointer" onClick={() => {
                    setOpenCommonModal(true)
                }}>
                    <Tooltip title="Edit common information">
                        <SvgIcon fontSize="small">
                            <EditIcon/>
                        </SvgIcon>
                    </Tooltip>
                </IconButton>
            )}
            <HeaderEditModal profile={profile.profile} setProfile={setProfile} open={openCommonModal}
                             onClose={setOpenCommonModal}/>
            <LocationEditModal profile={profile.profile} setProfile={setProfile} open={openAddressModal}
                               onClose={setOpenAddressModal}/>
        </Stack>
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
    handleSave: PropTypes.func,
    setProfile: PropTypes.func,
};

export default memo(ProfileHeader);