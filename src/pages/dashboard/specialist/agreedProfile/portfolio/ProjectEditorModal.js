import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Alert,
    FormControl,
    FormLabel,
    FormHelperText,
    IconButton,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete"; // Иконка удаления

const ProjectEditorModal = ({ open, onClose, initialProject, setSelectedProject, onSave }) => {
    const emptyProject = {
        title: "",
        shortDescription: "",
        date: "",
        images: [],
        thumbnail: "",
    };

    const [formData, setFormData] = useState(emptyProject);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialProject || emptyProject);
        setErrors({});
    }, [initialProject]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onDrop = (acceptedFiles) => {
        const newImages = acceptedFiles.map((file) => ({
            url: URL.createObjectURL(file),
            description: "",
        }));

        setFormData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...newImages],
            // Если thumbnail не выбран, устанавливаем первое изображение как thumbnail
            thumbnail: prevData.thumbnail || newImages[0]?.url,
        }));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/*",
        multiple: true,
    });

    const setThumbnail = (image) => {
        setFormData((prevData) => ({
            ...prevData,
            thumbnail: image.url,
        }));
    };

    const updateImageDescription = (index, newDescription) => {
        const updatedImages = [...formData.images];
        updatedImages[index].description = newDescription;
        setFormData({ ...formData, images: updatedImages });
    };

    const handleDeleteImage = (index) => {
        const updatedImages = formData.images.filter((_, i) => i !== index);
        let newThumbnail = formData.thumbnail;

        // Если удаляемое изображение было thumbnail, выбираем новое thumbnail
        if (formData.thumbnail === formData.images[index].url) {
            newThumbnail = updatedImages[0]?.url || "";
        }

        setFormData({
            ...formData,
            images: updatedImages,
            thumbnail: newThumbnail,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "This field is required";
        if (!formData.shortDescription.trim()) newErrors.shortDescription = "This field is required";
        if (!formData.date) newErrors.date = "This field is required";
        if (formData.images.length === 0) newErrors.images = "Add at least one image";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        // Если thumbnail не выбран, устанавливаем первое изображение как thumbnail
        const finalThumbnail = formData.thumbnail || formData.images[0]?.url;
        const projectToSave = { ...formData, thumbnail: finalThumbnail };

        onSave(projectToSave);
        setFormData(emptyProject);
        setSelectedProject(null);
        onClose();
    };

    const isFormValid = formData.title.trim() && formData.shortDescription.trim() && formData.date && formData.images.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <Alert severity="info">All fields marked with * are required</Alert>
            <DialogContent dividers>
                <Box sx={{ p: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.title}>
                        <FormLabel required>Title</FormLabel>
                        <TextField
                            fullWidth
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            error={!!errors.title}
                            helperText={errors.title}
                            placeholder="Enter project title"
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.shortDescription}>
                        <FormLabel required>Short Description</FormLabel>
                        <TextField
                            fullWidth
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            error={!!errors.shortDescription}
                            helperText={errors.shortDescription}
                            placeholder="Enter a short description"
                            multiline
                            rows={2}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.date}>
                        <FormLabel required>Date</FormLabel>
                        <TextField
                            fullWidth
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            error={!!errors.date}
                            helperText={errors.date}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.images}>
                        <FormLabel required>Images</FormLabel>
                        <Box {...getRootProps()} sx={{ border: "2px dashed #aaa", p: 3, textAlign: "center", cursor: "pointer" }}>
                            <input {...getInputProps()} />
                            <Typography>Drag and drop files here or click to select</Typography>
                        </Box>
                        {errors.images && <FormHelperText error>{errors.images}</FormHelperText>}
                    </FormControl>

                    {formData.images.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {formData.images.map((image, index) => (
                                <Card key={index} sx={{ mb: 2, border: formData.thumbnail === image.url ? "3px solid blue" : "1px solid #ccc" }}>
                                    <CardMedia component="img" height="250" image={image.url} alt={`Image ${index}`} />
                                    <CardContent>
                                        <TextField
                                            fullWidth
                                            label="Image Description"
                                            multiline
                                            rows={2}
                                            value={image.description}
                                            onChange={(e) => updateImageDescription(index, e.target.value)}
                                            placeholder="Enter image description"
                                        />
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "space-between" }}>
                                        <Button
                                            variant={formData.thumbnail === image.url ? "contained" : "outlined"}
                                            color="primary"
                                            onClick={() => setThumbnail(image)}
                                        >
                                            {formData.thumbnail === image.url ? "Thumbnail selected" : "Set as thumbnail"}
                                        </Button>
                                        <IconButton onClick={() => handleDeleteImage(index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    )}

                    {formData.thumbnail && (
                        <Box sx={{ textAlign: "center", mb: 2 }}>
                            <Typography variant="subtitle1">Selected Thumbnail:</Typography>
                            <img src={formData.thumbnail} alt="Thumbnail" style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 8 }} />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={!isFormValid}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectEditorModal;