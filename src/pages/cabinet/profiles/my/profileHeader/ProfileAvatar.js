import {Avatar, Box, Grid, CircularProgress} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import React, {useRef, useState} from "react";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import toast from "react-hot-toast";
import {storage} from "src/libs/firebase";
import imageCompression from 'browser-image-compression';

export const ProfileAvatar = ({profile, setProfile, isMyProfile}) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarClick = () => {
        if (!isUploading) {
            fileInputRef.current.click();
        }
    };

    const avatarStyles = {
        width: 150,
        height: 160,
        borderRadius: 2
    };

    const compressImage = async (imageFile) => {
        const options = {
            maxSizeMB: 0.5, // Maximum file size in MB
            maxWidthOrHeight: 800, // Maximum width/height
            useWebWorker: true, // Use web worker for faster compression
            fileType: 'image/jpeg' // Output file format
        };

        try {
            return await imageCompression(imageFile, options);
        } catch (error) {
            console.error('Image compression error:', error);
            toast.error('Error processing image');
            throw error;
        }
    };

    const handleAvatarChange = async (e) => {
        try {
            if (e.target.files && e.target.files[0]) {
                setIsUploading(true);
                let file = e.target.files[0];

                // Compress image before upload
                toast.promise(
                    compressImage(file),
                    {
                        loading: 'Compressing image...',
                        success: 'Image compressed',
                        error: 'Error compressing image'
                    }
                ).then(async compressedFile => {
                    file = compressedFile;
                    const storageRef = ref(storage, '/avatar/' + profile.profile.id + '-' + file.name);

                    // Upload compressed file to Firebase Storage
                    await toast.promise(
                        uploadBytes(storageRef, file),
                        {
                            loading: 'Uploading avatar...',
                            success: 'Avatar uploaded',
                            error: 'Error uploading avatar'
                        }
                    );

                    // Get download URL
                    const url = await getDownloadURL(storageRef);

                    // Update local state
                    const updatedProfile = {
                        ...profile.profile,
                        avatar: url
                    };

                    setProfile(prev => ({
                        ...prev,
                        profile: updatedProfile
                    }));

                    // Update server
                    await extendedProfileApi.updateProfileInfo(profile.profile.id, {
                        "avatar": url
                    });

                    toast.success("Avatar updated successfully!");
                });
            }
        } catch (err) {
            console.error("Failed to update avatar:", err);
            toast.error('Error uploading avatar!');
        } finally {
            setIsUploading(false);
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
                        cursor: isUploading ? 'wait' : 'pointer',
                        '&:hover .avatar-overlay': {
                            opacity: isUploading ? 0 : 1
                        }
                    }}
                    onClick={handleAvatarClick}
                >
                    <Avatar
                        variant="square"
                        src={profile?.profile?.avatar}
                        sx={{
                            ...avatarStyles,
                            opacity: isUploading ? 0.5 : 1
                        }}
                        alt={`${profile?.profile?.businessName}'s avatar`}
                    />

                    {/* Dark overlay and camera icon */}
                    {!isUploading && (
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
                    )}

                    {/* Loading indicator */}
                    {isUploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2
                            }}
                        >
                            <CircularProgress sx={{color: 'white'}} />
                        </Box>
                    )}
                </Box>)
            }

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{display: 'none'}}
                disabled={isUploading}
            />
        </Grid>
    )
}