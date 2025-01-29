import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import React, { useState } from "react";
import ImageModalWindow from "./ImageModalWindow";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

export default function Education(props) {
    const { education: initialEducation, editMode } = props;
    const [education, setEducation] = useState(initialEducation);
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addEducationDialogOpen, setAddEducationDialogOpen] = useState(false);
    const [newEducation, setNewEducation] = useState({ title: "", year: "", description: "", certificates: [] });
    const [editEducationIndex, setEditEducationIndex] = useState(null);

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

    const deleteEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const openAddEducationDialog = () => {
        setNewEducation({ title: "", year: "", description: "", certificates: [] });
        setAddEducationDialogOpen(true);
    };

    const saveNewEducation = () => {
        setEducation([...education, newEducation]);
        setAddEducationDialogOpen(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEducation({ ...newEducation, certificates: [...newEducation.certificates, reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    const deleteImage = (imgIndex) => {
        const updatedCertificates = newEducation.certificates.filter((_, i) => i !== imgIndex);
        setNewEducation({ ...newEducation, certificates: updatedCertificates });
    };

    const openEditEducationDialog = (index) => {
        setEditEducationIndex(index);
        setNewEducation(education[index]);
        setAddEducationDialogOpen(true);
    };

    const saveEditedEducation = () => {
        const updatedEducation = [...education];
        updatedEducation[editEducationIndex] = newEducation;
        setEducation(updatedEducation);
        setAddEducationDialogOpen(false);
        setEditEducationIndex(null);
    };

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography mt={3} color="text.secondary">EDUCATION</Typography>
                {editMode && (
                    <Button sx={{ mt: 2, mb: 0.5 }} variant="outlined" onClick={openAddEducationDialog}
                            startIcon={<AddIcon color="primary" />}>
                        Add New Education
                    </Button>
                )}
            </Box>

            {education.map((edu, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            <Typography>
                                {edu.title} ({edu.year})
                            </Typography>
                            {editMode && (
                                <Box>
                                    <IconButton onClick={() => openEditEducationDialog(index)} sx={{ ml: 1 }}>
                                        <ModeEditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => deleteEducation(index)} sx={{ ml: 1 }}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ ml: 2 }}>
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
                </Accordion>
            ))}

            <ImageModalWindow open={open} handleClose={handleClose} images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />

            <Dialog open={addEducationDialogOpen} onClose={() => setAddEducationDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {editEducationIndex !== null ? "Edit Education" : "Add New Education"}
                        <IconButton onClick={() => setAddEducationDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newEducation.title}
                        onChange={(e) => setNewEducation({ ...newEducation, title: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        value={newEducation.year}
                        onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={newEducation.description}
                        onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                        margin="dense"
                        multiline
                        rows={4}
                    />
                    <Box sx={{ mt: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="upload-button"
                            type="file"
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="upload-button">
                            <Button
                                variant="outlined"
                                component="span"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload Certificate
                            </Button>
                        </label>
                    </Box>
                    {newEducation.certificates.length > 0 && (
                        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {newEducation.certificates.map((cert, certIndex) => (
                                <Box key={certIndex} position="relative">
                                    <Box
                                        component="img"
                                        src={cert}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                        }}
                                    />
                                    {editMode && (
                                        <IconButton
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                color: "error.main",
                                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                            }}
                                            onClick={() => deleteImage(certIndex)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddEducationDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={editEducationIndex !== null ? saveEditedEducation : saveNewEducation} color="primary">
                        {editEducationIndex !== null ? "Save Changes" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}