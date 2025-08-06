import {useEffect} from "react";
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
    IconButton,
    TextField,
    Typography, useMediaQuery,
} from "@mui/material";
import {useDropzone} from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {useFormik} from "formik";
import * as Yup from "yup";
import {INFO} from "src/libs/log";
import CloseIcon from "@mui/icons-material/Close";
import {getValidDate} from "src/utils/date-locale";

const ProjectEditorModal = ({open, onClose, initialProject, setSelectedProject, userId, onSave}) => {
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const emptyProject = {
        title: "",
        shortDescription: "",
        location: "",
        date: null,
        images: [],
        thumbnail: "",
    };

    const validationSchema = Yup.object({
        title: Yup.string()
            .required("Title is required")
            .max(100, "Title must be at most 100 characters"),
        location: Yup.string()
            .required("Location is required")
            .max(200, "Location must be at most 200 characters"),
        shortDescription: Yup.string()
            .required("Short description is required")
            .max(500, "Description must be at most 500 characters"),
        date: Yup.date()
            .required("Date is required")
            .max(new Date(), "Date cannot be in the future")
    });

    const formik = useFormik({
        initialValues: emptyProject,
        validationSchema,
        onSubmit: async (values) => {
            try {

                INFO("Portfolio is being saved...", initialProject, values);
                const projectToSave = {...values};
                let savedProject;

                if (!initialProject) {
                    savedProject = await extendedProfileApi.addPortfolio(userId, projectToSave);
                } else {
                    savedProject = await extendedProfileApi.updatePortfolio(
                        userId,
                        initialProject.id,
                        projectToSave,
                        initialProject.images?.map((img) => ({id: img.id, url: img.url, description: img.description}))
                    );
                }

                onSave(savedProject);
                onClose();
            } catch (error) {
                console.error("Error saving portfolio:", error);
                formik.setStatus({submitError: error.message});
            }
        }
    });

    useEffect(() => {
        if (initialProject) {
            INFO("Edit portfolio", initialProject);
            formik.setValues({
                ...initialProject,
                date: getValidDate(initialProject.date)
            });
        } else {
            formik.resetForm();
            formik.setValues(emptyProject);
        }
    }, [initialProject, open]);

    const onDrop = (acceptedFiles) => {
        const validFiles = acceptedFiles.filter((file) => {
            const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            return validTypes.includes(file.type);
        });

        const newImages = validFiles.map((file) => ({
            url: URL.createObjectURL(file),
            description: "",
            file // сохраняем оригинальный файл для загрузки
        }));

        const updatedImages = [...formik.values.images, ...newImages];

        formik.setValues({
            ...formik.values,
            images: updatedImages,
            thumbnail: formik.values.thumbnail || (newImages.length > 0 ? newImages[0].url : "")
        });

        // Помечаем поле images как "тронутое"
        formik.setFieldTouched('images', true, false);

        if (!formik.values.thumbnail && newImages.length > 0) {
            formik.setFieldValue('thumbnail', newImages[0].url);
        }
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
        const updatedImages = [...formik.values.images];
        updatedImages[index].description = newDescription;
        formik.setFieldValue('images', updatedImages);
    };

    const handleDeleteImage = (index) => {
        const updatedImages = formik.values.images.filter((_, i) => i !== index);
        let newThumbnail = formik.values.thumbnail;

        if (formik.values.thumbnail === formik.values.images[index].url) {
            newThumbnail = updatedImages[0]?.url || "";
        }

        formik.setValues({
            ...formik.values,
            images: updatedImages,
            thumbnail: newThumbnail,
        });

        // Помечаем поле images как "тронутое"
        formik.setFieldTouched('images', true, false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={!mdUp}
        >
            <DialogTitle sx={{m: 0, p: 2}}>
                {initialProject ? "Edit Portfolio Project" : "Create New Portfolio Project"}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            {formik.status?.submitError && (
                <Alert severity="error" sx={{mb: 2}}>
                    {formik.status.submitError}
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, p: 2}}>
                        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 3}}>
                            <TextField
                                label="Title"
                                fullWidth
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                                placeholder="Enter project title"
                                sx={{flex: 1}}
                            />

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date"
                                    value={formik.values.date}
                                    onChange={(date) => {
                                        formik.setFieldValue('date', date);
                                    }}
                                    sx={{flex: 1}}
                                />
                            </LocalizationProvider>
                        </Box>
                        <TextField
                            label="Location"
                            fullWidth
                            name="location"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && Boolean(formik.errors.location)}
                            helperText={formik.touched.location && formik.errors.location}
                            placeholder="Enter a location"
                        />

                        <TextField
                            label="Short Description"
                            fullWidth
                            name="shortDescription"
                            value={formik.values.shortDescription}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.shortDescription && Boolean(formik.errors.shortDescription)}
                            helperText={formik.touched.shortDescription && formik.errors.shortDescription}
                            placeholder="Enter a short description"
                            multiline
                            minRows={4}
                            maxRows={10}
                        />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Images *
                            </Typography>
                            <Box {...getRootProps()}
                                 sx={{
                                     border: "2px dashed #aaa",
                                     p: 3,
                                     textAlign: "center",
                                     cursor: "pointer",
                                     borderRadius: 1
                                 }}>
                                <input {...getInputProps()} />
                                <Typography>Drag and drop files here or click to select</Typography>
                            </Box>
                            {formik.touched.images && formik.errors.images && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.images}
                                </Typography>
                            )}
                        </Box>

                        {formik.values.images.length > 0 && (
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                {formik.values.images.map((image, index) => (
                                    <Card
                                        key={index}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 1,
                                            border: "1px solid #e0e0e0",
                                            position: "relative",
                                            overflow: 'visible',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                    >
                                        {formik.values.thumbnail === image.url && (
                                            <Box sx={{
                                                position: "absolute",
                                                top: -10,
                                                left: 16,
                                                display: "flex",
                                                alignItems: "center",
                                                backgroundColor: "#1976d2",
                                                color: "white",
                                                borderRadius: "4px",
                                                padding: "4px 12px",
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                zIndex: 1
                                            }}>
                                                <CheckIcon sx={{mr: 1, fontSize: '1rem'}}/>
                                                Cover image
                                            </Box>
                                        )}

                                        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}}}>
                                            <Box sx={{
                                                width: {xs: '100%', md: 300},
                                                height: 200,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}>
                                                <CardMedia
                                                    component="img"
                                                    image={image.url}
                                                    alt={`Image ${index}`}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: 1,

                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{flex: 1, p: 2}}>
                                                <TextField
                                                    fullWidth
                                                    label="Image description"
                                                    size="small"
                                                    multiline
                                                    minRows={3}
                                                    maxRows={6}
                                                    value={image.description}
                                                    onChange={(e) => updateImageDescription(index, e.target.value)}
                                                    placeholder="Describe what's shown in this image..."
                                                    sx={{
                                                        mb: 2,
                                                    }}
                                                />

                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    {formik.values.thumbnail !== image.url ? (
                                                        <Button
                                                            startIcon={<CheckIcon/>}
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => formik.setFieldValue('thumbnail', image.url)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                borderRadius: 1
                                                            }}
                                                        >
                                                            Make cover
                                                        </Button>
                                                    ) : (
                                                        <Box sx={{width: 120}}/>
                                                    )}

                                                    <IconButton
                                                        onClick={() => handleDeleteImage(index)}
                                                        color="error"
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!formik.isValid || formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectEditorModal;