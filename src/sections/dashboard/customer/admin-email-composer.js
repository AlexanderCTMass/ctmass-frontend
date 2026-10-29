import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { storage } from 'src/libs/firebase';

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const EMPTY_EMAIL_DRAFT = { subject: '', message: '', images: [] };

export const isEmailDraftReady = (draft) => Boolean(draft.subject.trim() && draft.message.trim());

const uploadEmailImage = async (file) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `admin-emails/${uuidv4()}_${safeName}`);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return { url: await getDownloadURL(storageRef), name: file.name };
};

export const AdminEmailComposer = (props) => {
    const { value, onChange, onUploadingChange, disabled = false } = props;
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(0);

    useEffect(() => {
        onUploadingChange?.(uploading > 0);
    }, [uploading, onUploadingChange]);

    const update = (patch) => onChange((prev) => ({ ...prev, ...patch }));

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        const room = MAX_IMAGES - value.images.length;
        if (files.length > room) {
            toast.error(`You can attach up to ${MAX_IMAGES} images`);
        }
        const accepted = files.slice(0, Math.max(room, 0)).filter((file) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name}: only JPG, PNG or GIF images work in emails`);
                return false;
            }
            if (file.size > MAX_IMAGE_BYTES) {
                toast.error(`${file.name} is larger than 5 MB`);
                return false;
            }
            return true;
        });
        if (!accepted.length) return;

        setUploading((count) => count + accepted.length);
        const uploaded = [];
        for (const file of accepted) {
            try {
                uploaded.push(await uploadEmailImage(file));
            } catch (err) {
                console.error(err);
                toast.error(`Failed to upload ${file.name}`);
            } finally {
                setUploading((count) => count - 1);
            }
        }
        if (uploaded.length) {
            onChange((prev) => ({ ...prev, images: [...prev.images, ...uploaded].slice(0, MAX_IMAGES) }));
        }
    };

    const removeImage = (url) => onChange((prev) => ({ ...prev, images: prev.images.filter((image) => image.url !== url) }));

    return (
        <Stack spacing={2}>
            <TextField
                disabled={disabled}
                fullWidth
                inputProps={{ maxLength: 150 }}
                label="Subject"
                onChange={(event) => update({ subject: event.target.value })}
                value={value.subject}
            />
            <TextField
                disabled={disabled}
                fullWidth
                inputProps={{ maxLength: 5000 }}
                label="Message"
                minRows={5}
                multiline
                onChange={(event) => update({ message: event.target.value })}
                value={value.message}
            />
            <Stack spacing={1}>
                {(value.images.length > 0 || uploading > 0) && (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1.5}
                    >
                        {value.images.map((image) => (
                            <Box
                                key={image.url}
                                sx={{
                                    position: 'relative',
                                    width: 96,
                                    height: 96,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: (theme) => `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Box
                                    alt={image.name}
                                    component="img"
                                    src={image.url}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                {!disabled && (
                                    <IconButton
                                        aria-label={`Remove ${image.name}`}
                                        onClick={() => removeImage(image.url)}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            p: 0.25,
                                            bgcolor: 'rgba(0,0,0,0.55)',
                                            color: '#fff',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                        {Array.from({ length: uploading }).map((_, index) => (
                            <Box
                                key={`uploading-${index}`}
                                sx={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: (theme) => `1px dashed ${theme.palette.divider}`
                                }}
                            >
                                <CircularProgress size={22} />
                            </Box>
                        ))}
                    </Stack>
                )}
                <Stack
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                >
                    <Button
                        disabled={disabled || value.images.length >= MAX_IMAGES}
                        onClick={() => inputRef.current?.click()}
                        size="small"
                        startIcon={<AddPhotoAlternateOutlinedIcon />}
                        variant="outlined"
                    >
                        Add images
                    </Button>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        Up to {MAX_IMAGES} JPG, PNG or GIF images, 5 MB each. They appear below the message.
                    </Typography>
                </Stack>
                <input
                    accept={ALLOWED_TYPES.join(',')}
                    hidden
                    multiple
                    onChange={handleFiles}
                    ref={inputRef}
                    type="file"
                />
            </Stack>
        </Stack>
    );
};

AdminEmailComposer.propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onUploadingChange: PropTypes.func,
    disabled: PropTypes.bool
};
