import { useState, useCallback } from 'react';
import {
    Box,
    Button,
    ImageList,
    ImageListItem,
    IconButton,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { FileDropzone } from 'src/components/file-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import { blogService } from 'src/service/blog-service';

export const GalleryUploader = ({ images = [], onChange, disabled }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const uploadedImages = await blogService.uploadGalleryImages(acceptedFiles);
            onChange([...images, ...uploadedImages]);
        } catch (error) {
            console.error('Error uploading gallery images:', error);
            setError('Failed to upload some images. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [images, onChange]);

    const handleRemove = useCallback((imageId) => {
        const updatedImages = images.filter(img => img.id !== imageId);
        onChange(updatedImages);

        // Опционально: удалить из storage
        // const imageToRemove = images.find(img => img.id === imageId);
        // if (imageToRemove) {
        //   blogService.deleteImage(imageToRemove.url);
        // }
    }, [images, onChange]);

    return (
        <Box>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Gallery Images
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Upload multiple images to create a gallery. Images will be displayed in a grid.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {images.length > 0 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                            </Typography>
                        </Stack>
                        <ImageList
                            sx={{
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr)) !important'
                            }}
                        >
                            {images.map((image) => (
                                <ImageListItem
                                    key={image.id}
                                    sx={{
                                        position: 'relative',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        '&:hover .delete-button': {
                                            opacity: 1
                                        }
                                    }}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        style={{
                                            height: 150,
                                            width: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <IconButton
                                        className="delete-button"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.7)'
                                            }
                                        }}
                                        onClick={() => handleRemove(image.id)}
                                        disabled={disabled}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Box>
                )}

                <FileDropzone
                    accept={{ 'image/*': [] }}
                    maxFiles={10}
                    onDrop={handleDrop}
                    disabled={disabled || uploading}
                    caption="(JPG, PNG, GIF up to 10 images)"
                />

                {uploading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </Stack>
        </Box>
    );
};