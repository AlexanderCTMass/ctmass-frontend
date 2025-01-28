import {Box, Typography} from "@mui/material";
import React, {useState} from "react";
import ImageModalWindow from "./ImageModalWindow";

export default function Portfolio(props) {
    const {profile} = props;
    const port = profile.portfolio;

    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOpen = (imageIndex) => {
        setImages(port);
        setCurrentIndex(imageIndex);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImages([]);
        setCurrentIndex(0);
    };

    return (
        <div>
            <Typography color="text.secondary">PORTFOLIO</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                    <Box sx={{display: "flex", flexWrap: "wrap", gap: 1}}>
                        {profile.portfolio.map((image, imgIndex) => (
                            <Box
                                key={imgIndex}
                                component="img"
                                src={image}
                                sx={{width: 130, height: 130, objectFit: "cover", borderRadius: "4px" }}
                                onClick={() => handleOpen(imgIndex)}
                            />))}
                    </Box>
            </Box>

            <ImageModalWindow open={open} handleClose={handleClose} images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        </div>
    );
}