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
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

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

    useEffect(() => {
        setFormData(initialProject || emptyProject);
        setInitialProjects(JSON.parse(JSON.stringify(initialProject || [])))
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

    const handleSave = async () => {
        const projectToSave = {...formData};
        let savedProject;
        try {
            if (!initialProject) {
                savedProject = await extendedProfileApi.addPortfolio(userId, projectToSave);
            } else {
                savedProject = await extendedProfileApi.updatePortfolio(
                    userId,
                    initialProject.id,
                    projectToSave,
                    initialProject.images
                );
            }
            onSave(savedProject);
            onClose();
        } catch (error) {
            console.error("Error saving portfolio:", error);
            // Обработка ошибки
        }
    }

    const isFormValid = formData.title.trim() && formData.shortDescription.trim() && formData.date && formData.images.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <Alert severity="info">All fields marked with * are required</Alert>
            <DialogContent dividers>
                <Box sx={{p: 2}}>
                        <FormLabel required>Title</FormLabel>
                        <TextField
                            fullWidth
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter project title"
                        />

                        <FormLabel required>Short Description</FormLabel>
                        <TextField
                            onChange={handleChange}
                            value={formData.shortDescription}
                            fullWidth
                            name="shortDescription"
                            placeholder="Enter a short description"
                            multiline
                            rows={2}
                        />

                        <FormLabel required>Date</FormLabel>
                        <TextField
                            fullWidth
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            InputLabelProps={{shrink: true}}
                        />

                        <FormLabel required>Images</FormLabel>
                        <Box {...getRootProps()}
                             sx={{border: "2px dashed #aaa", p: 3, textAlign: "center", cursor: "pointer"}}>
                            <input {...getInputProps()} />
                            <Typography>Drag and drop files here or click to select</Typography>
                        </Box>

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
                                    <CardMedia component="img" height="250" image={image.url}
                                               alt={`Image ${index}`}/>
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