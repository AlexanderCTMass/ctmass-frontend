import {Avatar, Box, Grid} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import React, {useRef} from "react";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

export const ProfileAvatar = ({profile, setProfile, editMode, isMyProfile}) => {
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const avatarStyles = {
        width: 150,
        height: 160,
        borderRadius: 2
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                // 1. Сначала обновляем локальное состояние
                const updatedProfile = {
                    ...profile.profile,
                    avatar: reader.result
                };

                setProfile(prev => ({
                    ...prev,
                    profile: updatedProfile
                }));

                extendedProfileApi.updateProfileInfo(profile.profile.id, {
                    "avatar": reader.result
                }).catch(error => {
                    console.error("Failed to update avatar:", error);
                    // Можно добавить откат состояния при ошибке
                });
            };

            reader.readAsDataURL(file);
        }
    };
    return (
        <Grid item>
            {!isMyProfile ? (
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
    )
}