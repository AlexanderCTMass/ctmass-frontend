import {Box, IconButton, Modal} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect} from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function ImageModalWindow({ open, handleClose, images, currentIndex, setCurrentIndex  }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") prevImage();
            if (event.key === "ArrowRight") nextImage();
            if (event.key === "Escape") handleClose();
        };

        if (open) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, currentIndex]);

    const prevImage = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const nextImage = () => {
        if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    };

    return (
        <Modal open={open} onClose={handleClose} sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Box sx={{
                position: "relative",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100vw",
                height: "100vh"
            }}>
                {/* Кнопка закрытия (крестик) */}
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.4)"}
                    }}
                >
                    <CloseIcon sx={{fontSize: 30}}/>
                </IconButton>

                {images && images.length > 1 && currentIndex > 0 && (
                    <IconButton onClick={prevImage} sx={{ position: "absolute", left: 20, color: "white" }}>
                        <ArrowBackIosNewIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                )}

                {/* Увеличенное изображение */}
                {images && images.length > 0 && (
                    <Box component="img" src={images[currentIndex]} alt="Image"
                     sx={{maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px"}}
                />
                )}

                {/* Кнопка "вперёд" */}
                {images && images.length > 1 && currentIndex < images.length - 1 && (
                    <IconButton onClick={nextImage} sx={{ position: "absolute", right: 20, color: "white" }}>
                        <ArrowForwardIosIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                )}
            </Box>
        </Modal>
    );
}