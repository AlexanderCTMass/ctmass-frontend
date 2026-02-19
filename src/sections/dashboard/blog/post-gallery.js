import { useState } from 'react';
import {
    Box,
    ImageList,
    ImageListItem,
    IconButton,
    Modal,
    Typography,
    Stack,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DownloadIcon from '@mui/icons-material/Download';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    maxWidth: '90vw',
    maxHeight: '90vh',
    outline: 'none'
};

export const PostGallery = ({ images = [] }) => {
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const handleOpen = (index) => {
        setCurrentIndex(index);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(images[currentIndex].url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = images[currentIndex].name || 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    return (
        <>
            <Box sx={{ my: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Gallery ({images.length})
                </Typography>
                <ImageList
                    sx={{
                        gridAutoFlow: 'column',
                        gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr)) !important',
                        gridAutoColumns: 'minmax(200px, 1fr)'
                    }}
                >
                    {images.map((image, index) => (
                        <ImageListItem
                            key={image.id || index}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 1,
                                overflow: 'hidden',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                            onClick={() => handleOpen(index)}
                        >
                            <img
                                src={image.url}
                                alt={image.name || `Gallery image ${index + 1}`}
                                loading="lazy"
                                style={{
                                    height: 200,
                                    width: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Box>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="gallery-modal"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)'
                                },
                                zIndex: 1
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <IconButton
                            onClick={handlePrevious}
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)'
                                },
                                zIndex: 1
                            }}
                        >
                            <NavigateBeforeIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)'
                                },
                                zIndex: 1
                            }}
                        >
                            <NavigateNextIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleDownload}
                            sx={{
                                position: 'absolute',
                                left: 8,
                                bottom: 8,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)'
                                },
                                zIndex: 1
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>

                        <img
                            src={images[currentIndex]?.url}
                            alt={images[currentIndex]?.name || 'Gallery image'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                display: 'block'
                            }}
                        />
                    </Box>
                </Box>
            </Modal>
        </>
    );
};