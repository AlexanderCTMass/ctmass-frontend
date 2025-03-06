import {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import {useDropzone} from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

const ProjectEditorModal = ({open, onClose, initialProject, setSelectedProject, userId, onSave}) => {
    const emptyProject = {
        id: Date.now().toString(),
        title: "",
        shortDescription: "",
        date: "",
        images: [],
        thumbnail: "",
    };

    const [initialProjects, setInitialProjects] = useState([]);
    const [formData, setFormData] = useState(emptyProject);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialProject || emptyProject);
        setInitialProjects(JSON.parse(JSON.stringify(initialProject || [])))
        setErrors({});
    }, [initialProject]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const onDrop = (acceptedFiles) => {
        const validFiles = acceptedFiles.filter((file) => {
            const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            return validTypes.includes(file.type);
        });

        const newImages = validFiles.map((file) => ({
            id: Date.now().toString(),
            url: URL.createObjectURL(file),
            description: "",
        }));

        setFormData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...newImages],
            thumbnail: prevData.thumbnail || newImages[0]?.url,
        }));
    };

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpeg", ".jpg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/webp": [".webp"],
        },
        multiple: true,
    });

    const updateImageDescription = (index, newDescription) => {
        const updatedImages = [...formData.images];
        updatedImages[index].description = newDescription;
        setFormData({...formData, images: updatedImages});
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

        const projectToSave = {...formData};
        onSave(projectToSave); // Передаем обновленный проект в onSave
        onClose();
    };

    const isFormValid = formData.title.trim() && formData.shortDescription.trim() && formData.date && formData.images.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <Alert severity="info">All fields marked with * are required</Alert>
            <DialogContent dividers>
                <Box sx={{p: 2}}>
                    <FormControl fullWidth sx={{mb: 2}} error={!!errors.title}>
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

                    <FormControl fullWidth sx={{mb: 2}} error={!!errors.shortDescription}>
                        <FormLabel required>Short Description</FormLabel>
                        <TextField
                            onChange={handleChange}
                            value={formData.shortDescription}
                            fullWidth
                            name="shortDescription"
                            error={!!errors.shortDescription}
                            helperText={errors.shortDescription}
                            placeholder="Enter a short description"
                            multiline
                            rows={2}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{mb: 2}} error={!!errors.date}>
                        <FormLabel required>Date</FormLabel>
                        <TextField
                            fullWidth
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            error={!!errors.date}
                            helperText={errors.date}
                            InputLabelProps={{shrink: true}}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{mb: 2}} error={!!errors.images}>
                        <FormLabel required>Images</FormLabel>
                        <Box {...getRootProps()}
                             sx={{border: "2px dashed #aaa", p: 3, textAlign: "center", cursor: "pointer"}}>
                            <input {...getInputProps()} />
                            <Typography>Drag and drop files here or click to select</Typography>
                        </Box>
                        {errors.images && <FormHelperText error>{errors.images}</FormHelperText>}
                    </FormControl>

                    {formData.images.length > 0 && (
                        <Box sx={{mb: 2}}>
                            {formData.images.map((image, index) => (
                                <Card key={index} sx={{
                                    mb: 2,
                                    border: formData.thumbnail === image.url ? "3px solid blue" : "1px solid #ccc",
                                    position: "relative",
                                }}>
                                    {formData.thumbnail === image.url && (
                                        <Box sx={{
                                            position: "absolute",
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "rgba(53,53,53,0.8)",
                                            borderRadius: "4px",
                                            padding: "4px 8px",
                                        }}>
                                            <CheckIcon color="action" sx={{mr: 1}}/>
                                            <Typography variant="body2" color="whitesmoke">
                                                Selected as cover
                                            </Typography>
                                        </Box>
                                    )}
                                    <CardMedia component="img" height="250" image={image.url} alt={`Image ${index}`}/>
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
                                    <CardActions sx={{justifyContent: "space-between"}}>
                                        {formData.thumbnail !== image.url && (
                                            <Button
                                                variant={"outlined"}
                                                color="primary"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        thumbnail: image.url, // Обновляем thumbnail
                                                    }));
                                                }}
                                            >
                                                Set as cover
                                            </Button>
                                        )}
                                        <IconButton onClick={() => handleDeleteImage(index)} color="error">
                                            <DeleteIcon/>
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={!isFormValid}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectEditorModal;