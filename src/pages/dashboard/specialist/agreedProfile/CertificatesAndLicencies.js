import ImageModalWindow from "./ImageModalWindow";
import React, {useState} from "react";
import {Box, Typography} from "@mui/material";

export default function CertificatesAndLicencies(props) {
    const {certs} = props;

    const handleOpen = (imageIndex) => {
        setImages(certs);
        setCurrentIndex(imageIndex);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImages([]);
        setCurrentIndex(0);
    };

    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    return (
        <div>
            <Typography color="text.secondary" mt={4}>CERTIFICATES & LICENCIES</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
                <Box sx={{display: "flex", flexWrap: "wrap", gap: 1}}>
                    {certs.map((image, imgIndex) => (
                        <Box
                            key={imgIndex}
                            component="img"
                            src={image}
                            sx={{width: 130, height: 130, objectFit: "cover", borderRadius: "4px" }}
                            onClick={() => handleOpen(imgIndex)}
                        />))}
                </Box>
            </Box>
            <ImageModalWindow open={open} handleClose={handleClose} images={certs} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />

        </div>
    );
}