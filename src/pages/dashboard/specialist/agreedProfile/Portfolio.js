import React, {memo, useCallback, useState} from 'react';
import {Box, Button, CircularProgress, Divider, IconButton, Modal, Typography} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ImageModalWindow from "./ImageModalWindow";
//todo delete
const imageStyles = {
    small: {
        width: 155,
        height: 155,
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {transform: 'scale(1.1)'}
    },
    gallery: {
        width: 150,
        height: 150,
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

const Portfolio = ({profile, onUpload, editMode}) => {
    const portfolio = profile?.portfolio || [];
    debugger
    const [modalState, setModalState] = useState({
        galleryOpen: false,
        imageModalOpen: false,
        images: [],
        currentIndex: 0
    });
    const [isUploading, setIsUploading] = useState(false);

    // Обработчик загрузки изображений
    const handleUpload = useCallback(async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        setIsUploading(true);

        try {
            const newImages = await Promise.all(
                files.map(file => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                }))
            );

            onUpload([...portfolio, ...newImages]);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [onUpload, portfolio]);

    // Управление модальными окнами
    const openGallery = useCallback(() => setModalState(prev => ({
        ...prev,
        galleryOpen: true,
        images: portfolio
    })), [portfolio]);

    const openImage = useCallback((index) => setModalState(prev => ({
        ...prev,
        imageModalOpen: true,
        currentIndex: index
    })), []);

    const closeModals = useCallback(() => setModalState(prev => ({
        ...prev,
        galleryOpen: false,
        imageModalOpen: false
    })), []);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                    Portfolio ({portfolio.length})
                </Typography>

                {/* Кнопка загрузки */}
                {editMode && (<Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon/>}
                    disabled={isUploading}
                >
                    {isUploading ? <CircularProgress size={24}/> : 'Upload Photos'}
                    <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                    />
                </Button>)}
            </Box>

            {/* Основная галерея */}
            {(!portfolio || portfolio.length===0) && <Typography color="secondary">there is no completed portfolio information</Typography>}

            <Box display="flex" flexWrap="wrap" gap={1}>
                {portfolio?.slice(0, 9).map((img, index) => (
                    <Box
                        key={img.id}
                        component="img"
                        src={img}
                        alt={`Portfolio item ${index + 1}`}
                        sx={imageStyles.small}
                        onClick={() => openImage(index)}
                    />
                ))}
            </Box>

            {portfolio.length > 9 && (
                <>
                    <Divider sx={{my: 2}}/>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={openGallery}
                        sx={{
                            backgroundColor: 'background.default',
                            '&:hover': {backgroundColor: 'action.hover'}
                        }}
                    >
                        View All Images ({portfolio.length})
                    </Button>
                </>
            )}

            {/* Модальное окно галереи */}
            <Modal open={modalState.galleryOpen} onClose={closeModals}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 3,
                    borderRadius: 2,
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">All Images</Typography>
                        <IconButton onClick={closeModals}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {portfolio.map((img, index) => (
                            <Box
                                key={img.id}
                                component="img"
                                src={img}
                                alt={`Gallery item ${index + 1}`}
                                sx={imageStyles.gallery}
                                onClick={() => openImage(index)} // Теперь не закрывает галерею
                            />
                        ))}
                    </Box>
                </Box>
            </Modal>

            {/* Модальное окно просмотра изображения */}
            <ImageModalWindow
                open={modalState.imageModalOpen}
                handleClose={closeModals}
                images={portfolio.map(img => img)}
                currentIndex={modalState.currentIndex}
                setCurrentIndex={(index) => setModalState(prev => ({...prev, currentIndex: index}))}
            />
        </Box>
    );
};

export default memo(Portfolio);