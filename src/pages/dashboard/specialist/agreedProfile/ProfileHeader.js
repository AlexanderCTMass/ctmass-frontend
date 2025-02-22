import React, {memo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Avatar, Box, Button, Grid, IconButton, Modal, Stack, TextField, Tooltip, Typography} from "@mui/material";
import CertifiedBadge from "./CertifiedBadge";
import {AddressEditForm} from "../../../../sections/dashboard/account/general/address-edit-form";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {useNavigate} from "react-router-dom";
import {paths} from "../../../../paths";
import {RouterLink} from "../../../../components/router-link";

// Стилизованные константы
const avatarStyles = {
    width: 150,
    height: 160,
    borderRadius: 2
};

const iconStyle = {
    height: 20,
    mr: 1
};

const ratingContainer = {
    display: 'flex',
    alignItems: 'center',
    mt: 1
};

const ProfileHeader = ({
                           isOwnProfile,
                           profile,
                           editMode,
                           handleEditToggle,
                           handleSave,
                           setProfile
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

    const calculateAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 0;

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviews.length;
        return Number(average.toFixed(1));
    };
    const [openAddressModal, setOpenAddressModal] = useState(false);

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

    // const [isHovered, setIsHovered] = useState(false);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        avatar: reader.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const formatAddress = () => {
        if (!profile?.profile?.address || Object.keys(profile?.profile?.address).length === 0) {
            return 'address not specified';
        }

        const parts = [];
        if (profile?.profile?.address?.zipCode) parts.push(profile?.profile.address.zipCode);
        if (profile?.profile?.address?.location?.place_name) parts.push(profile?.profile.address.location.place_name);
        if (profile?.profile?.address?.profile) parts.push("\n(" + profile?.profile.address.profile + " " + profile?.profile.address.duration + " minutes)");

        return parts.length > 0
            ? parts
            : 'address not specified';
    };
    const navigate = useNavigate();

    const handleChatClick = () => {
        navigate(`/dashboard/chat/${profile.profile.id}`);
    };

    return (
        <div>
            <Grid container spacing={3} alignItems="flex-start">
                <Grid item>
                    {!editMode ? (
                        <Avatar
                            variant="square"
                            src={profile?.profile?.avatar}
                            sx={avatarStyles}
                            alt={`${profile?.profile?.businessName}'s avatar`}
                        />) : (
                        <Box
                            sx={{
                                position: 'relative',
                                cursor: 'pointer',
                                '&:hover .avatar-overlay': {
                                    opacity: 1
                                }
                            }}
                            // onMouseEnter={() => setIsHovered(true)}
                            // onMouseLeave={() => setIsHovered(false)}
                            onClick={handleAvatarClick}
                        >
                            <Avatar
                                variant="square"
                                src={profile?.profile?.avatar}
                                sx={avatarStyles}
                                alt={`${profile?.profile?.businessName}'s avatar`}
                            />

                            {/* Затемнение и иконка камеры */}
                            <Box
                                className="avatar-overlay"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2
                                }}
                            >
                                <CameraAltIcon sx={{color: 'white', fontSize: 40}}/>
                            </Box>
                        </Box>)
                    }

                    {/* Скрытый input для загрузки файла */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                </Grid>
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
                    {profile?.profile?.reviewCount && (
                        <Box sx={ratingContainer}>
                            <Box
                                component="img"
                                src="/star.png"
                                alt="Rating"
                                sx={iconStyle}
                            />
                            <Typography variant="body1" color="text.secondary">
                                {profile?.profile?.rating
                                    + " · " +
                                    profile?.profile?.reviewCount + " reviews"}

                            </Typography>
                        </Box>)}

                    {/* Блок локации */}
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

                    {/* Блок кнопок */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                        mt: 2.5
                    }}>
                        {isOwnProfile ? (
                            editMode ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    sx={{width: 'fit-content'}}
                                >
                                    Save
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    onClick={handleEditToggle}
                                    sx={{width: 'fit-content'}}
                                >
                                    Edit Profile
                                </Button>
                            )
                        ) : (
                            <Box display="flex" gap={2}>
                                <Button variant="contained">
                                    Offer an order
                                </Button>
                                <Tooltip
                                    title="A friend request will be sent. Once accepted, this user will appear in your friend list."
                                >
                                    <Button variant="contained">
                                        Add Friend
                                    </Button>
                                </Tooltip>
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    href={paths.dashboard.chat.replace(":userId", `${profile.profile.id}`)}
                                    component={RouterLink}
                                    sx={{
                                        color: "white",
                                        '&:hover': {
                                            backgroundColor: 'grey.600'
                                        }
                                    }}
                                    // onClick={handleChatClick}
                                >
                                    Chat
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
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
    handleEditToggle: PropTypes.func,
    handleSave: PropTypes.func,
    setProfile: PropTypes.func,
};

export default memo(ProfileHeader);