import {Accordion, AccordionDetails, AccordionSummary, Box, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, {useState} from "react";
import ImageModalWindow from "./ImageModalWindow";

export default function Education(props) {
    const {education} = props;
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOpen = (imageIndex, certImages) => {
        setImages(certImages);
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
            <Typography mt={3} color="text.secondary">EDUCATION</Typography>
            {education.map((edu, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>
                            {edu.title} ({edu.year})
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ml: 2}}>
                            <Typography>{edu.description}</Typography>
                            {edu.certificates.length > 0 && (
                                <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {edu.certificates.map((cert, certIndex) => (
                                        <Box key={certIndex} component="img" src={cert} onClick={() => handleOpen(certIndex, edu.certificates)}
                                             sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: "4px" }} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>))}

            <ImageModalWindow open={open} handleClose={handleClose} images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        </div>
    );
}