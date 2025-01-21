import {Box, Button, Grid, IconButton, Paper, TextField, Typography} from "@mui/material";
import {CloudUpload, Delete} from "@mui/icons-material";
import * as PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";
import {DateTimePicker} from "@mui/x-date-pickers";

Typography.propTypes = {
    variant: PropTypes.string,
    sx: PropTypes.shape({mt: PropTypes.number}),
    children: PropTypes.node
};
const CertificateAddForm = ({initialData = {}, onSave}) => {

    const [form, setForm] = useState({
        title: initialData?.title || "",
        series: initialData?.series || "",
        number: initialData?.number || "",
        place: initialData?.place || "",
        additional: initialData?.additional || "",
        date: initialData?.date,
        images: initialData.images || [],
        id: initialData?.id || null
    });

    const imagesEndRef = useRef(null);
    const prevImagesCountRef = useRef(form.images.length);

    // Прокрутка вниз при добавлении нового изображения
    useEffect(() => {
        if (form.images.length > prevImagesCountRef.current) {
            scrollToBottom();
        }
        prevImagesCountRef.current = form.images.length; // Обновляем количество изображений
    }, [form.images]);

    const scrollToBottom = () => {
        imagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form); // Передаем данные формы в родителя
    };

    const deleteImage = (image) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== image), // Удаляем изображение
        }));
    };

    const [dragging, setDragging] = useState(false);

    const handleDragIn = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);

        const files = Array.from(e.dataTransfer.files); // Получаем файлы из события
        const newImages = files.map((file) => URL.createObjectURL(file)); // Создаем временные URL
        setForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...newImages], // Добавляем новые изображения в состояние
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files); // Получаем список файлов
        const newImages = files.map((file) => URL.createObjectURL(file)); // Создаем временные URL
        setForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...newImages], // Добавляем новые изображения в состояние
        }));
    };

    return (
        <Box
            sx={{
                mx: 'auto',
                backgroundColor: '#fff',
            }}
        >
            <>
                <Typography variant="h6" align="center" sx={{mb: 2}}>
                    Adding a document, certificate, license
                </Typography>
                <Typography variant="body2" align="center" sx={{mb: 3}}>
                    By adding a document, you confirm its authenticity and are responsible for deceiving
                    the end user and the administration of the platform.
                </Typography>
                <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <TextField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        label="Series"
                        name="series"
                        value={form.series}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        label="Number"
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        label="Place of receipt"
                        name="place"
                        value={form.place}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        label="Additional information"
                        name="additional"
                        value={form.additional}
                        onChange={handleChange}
                        multiline
                        minRows={3}
                        maxRows={5}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <Typography variant="body2" sx={{mt: 2, mb: 1}}>
                        Date of receipt
                    </Typography>
                    <DateTimePicker views={['month', 'day', 'year']}
                                    label=""
                                    name="date"
                                    value={form.date || null}
                                    onChange={(newValue) => {
                                        setForm((prev) => ({...prev, date: newValue}));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                        />
                                    )}
                    />
                    <Paper
                        sx={{
                            mt: 3,
                            p: 3,
                            border: dragging ? '2px dashed #4caf50' : '2px dashed #ccc',
                            borderRadius: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: dragging ? '#f0f8f0' : '#f9f9f9',
                        }}
                        onDragOver={handleDragIn}
                        onDragLeave={handleDragOut}
                        onDrop={handleDrop}
                    >
                        <IconButton
                            sx={{backgroundColor: '#4caf50', color: '#fff', p: 2}}
                            onClick={() => document.getElementById('image-upload').click()}
                        >
                            <CloudUpload/>
                        </IconButton>
                        <input
                            type="file"
                            id="image-upload"
                            multiple
                            style={{display: 'none'}}
                            onChange={handleFileSelect}
                        />
                        <Typography variant="body2" sx={{mt: 1}}>
                            You can upload multiple images of a document
                            Click or drag to upload images
                        </Typography>
                    </Paper>

                    {/* Превью изображений */}
                    <Grid container spacing={1} sx={{mt: 3}}>
                        {form.images.map((image, index) => (
                            <Grid item xs={4} key={index}>
                                <Box sx={{position: "relative"}}>
                                    <Paper
                                        sx={{
                                            height: 100,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            backgroundImage: `url(${image})`,
                                            borderRadius: 1,
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => deleteImage(image)}
                                        sx={{
                                            position: "absolute",
                                            top: 5,
                                            right: 5,
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            "&:hover": {
                                                backgroundColor: "rgba(255, 255, 255, 1)",
                                            },
                                        }}
                                    >
                                        <Delete/>
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                        {/* Скрытый элемент для прокрутки */}
                        <div ref={imagesEndRef} />
                    </Grid>
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        sx={{marginTop: '20px'}}
                    >
                        Submit
                    </Button>
                </Box>
            </>
        </Box>)
}
export default CertificateAddForm;