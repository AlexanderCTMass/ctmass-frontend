import {Avatar, Box, Grid, CircularProgress, Button, Slider, Typography} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";
import React, {useRef, useState, useCallback} from "react";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import toast from "react-hot-toast";
import {storage} from "src/libs/firebase";
import imageCompression from 'browser-image-compression';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export const ProfileAvatar = ({profile, setProfile, isMyProfile}) => {
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [crop, setCrop] = useState({
        unit: 'px',
        x: 0,
        y: 0,
        width: 150,
        height: 160
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [src, setSrc] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const handleAvatarClick = () => {
        if (!isUploading && !isEditing) {
            fileInputRef.current.click();
        }
    };

    const avatarStyles = {
        width: 150,
        height: 160,
        borderRadius: 2
    };

    const onImageLoad = useCallback((img) => {
        imgRef.current = img;
        // Initialize crop to cover the whole image
        setCrop({
            unit: 'px',
            x: 0,
            y: 0,
            width: Math.min(img.width, 150),
            height: Math.min(img.height, 160),
            aspect: 150/160
        });
    }, []);

    const compressImage = async (imageFile) => {
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/jpeg'
        };

        try {
            return await imageCompression(imageFile, options);
        } catch (error) {
            console.error('Image compression error:', error);
            toast.error('Error processing image');
            throw error;
        }
    };

    const getCroppedImg = async (image, crop, fileName) => {
        if (!image || !crop) {
            throw new Error('Image or crop data missing');
        }

        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        // Ensure crop values are numbers
        const x = typeof crop.x === 'number' ? crop.x : 0;
        const y = typeof crop.y === 'number' ? crop.y : 0;
        const width = typeof crop.width === 'number' ? crop.width : 150;
        const height = typeof crop.height === 'number' ? crop.height : 160;

        ctx.drawImage(
            image,
            x * scaleX,
            y * scaleY,
            width * scaleX,
            height * scaleY,
            0,
            0,
            width,
            height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                blob.name = fileName;
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                setSrc(reader.result);
                setIsEditing(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        try {
            if (!completedCrop || !imgRef.current) {
                toast.error('Please select a crop area');
                return;
            }

            setIsUploading(true);

            const croppedImageBlob = await getCroppedImg(
                imgRef.current,
                completedCrop,
                'avatar.jpg'
            );

            const croppedImageFile = new File([croppedImageBlob], 'avatar.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            const compressedFile = await compressImage(croppedImageFile);

            const storageRef = ref(storage, `/avatar/${profile.profile.id}-${Date.now()}`);
            await uploadBytes(storageRef, compressedFile);
            const url = await getDownloadURL(storageRef);

            const updatedProfile = {
                ...profile.profile,
                avatar: url
            };

            setProfile(prev => ({
                ...prev,
                profile: updatedProfile
            }));

            await extendedProfileApi.updateProfileInfo(profile.profile.id, {
                "avatar": url
            });

            toast.success("Avatar updated successfully!");
        } catch (err) {
            console.error("Failed to update avatar:", err);
            toast.error(err.message || 'Error uploading avatar!');
        } finally {
            setIsUploading(false);
            setIsEditing(false);
            setSrc(null);
            setCrop({
                unit: 'px',
                x: 0,
                y: 0,
                width: 150,
                height: 160
            });
            setCompletedCrop(null);
        }
    };

    const handleAvatarChange = async (e) => {
        if (!isMyProfile) return;
        handleFileChange(e);
    };

    return (
        <Grid item>
            {!isMyProfile ? (
                <Avatar
                    variant="square"
                    src={profile?.profile?.avatar}
                    sx={avatarStyles}
                    alt={`${profile?.profile?.businessName}'s avatar`}
                />
            ) : isEditing ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                    maxWidth: '100%'
                }}>
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 400,
                        maxHeight: 400,
                        overflow: 'hidden'
                    }}>
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={150/160}
                            ruleOfThirds
                            minWidth={50}
                            minHeight={50}
                        >
                            <img
                                ref={imgRef}
                                src={src}
                                style={{
                                    width: '100%',
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    maxHeight: 400
                                }}
                                onLoad={onImageLoad}
                                alt="Crop preview"
                            />
                        </ReactCrop>
                    </Box>

                    <Box sx={{ width: '100%', px: 2 }}>
                        <Typography gutterBottom>Zoom</Typography>
                        <Slider
                            value={zoom}
                            min={0.5}
                            max={3}
                            step={0.1}
                            onChange={(e, newValue) => setZoom(newValue)}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <Box sx={{ width: '100%', px: 2 }}>
                        <Typography gutterBottom>Rotation</Typography>
                        <Slider
                            value={rotation}
                            min={-180}
                            max={180}
                            onChange={(e, newValue) => setRotation(newValue)}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveCrop}
                            disabled={isUploading}
                            startIcon={isUploading ? <CircularProgress size={20} /> : <CropIcon />}
                        >
                            {isUploading ? 'Saving...' : 'Save Avatar'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setIsEditing(false)}
                            disabled={isUploading}
                            startIcon={<CloseIcon />}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            ) : (
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
                </Box>
            )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{display: 'none'}}
                disabled={isUploading || isEditing}
            />
        </Grid>
    )
}