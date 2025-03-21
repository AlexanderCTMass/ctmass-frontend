import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    IconButton, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {useAuth} from 'src/hooks/use-auth';
import {emailSender} from "src/libs/email-sender";
import {storage} from "src/libs/firebase";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage"; // Предполагается, что useAuth предоставляет данные пользователя
import {v4 as uuidv4} from 'uuid';
import {emailService} from "src/service/email-service";

const FeedbackDialog = ({open, onClose}) => {
    const {user} = useAuth(); // Получаем данные авторизованного пользователя

    // Схема валидации с использованием Yup
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        description: Yup.string().required('Description is required'),
        screenshot: Yup.mixed(), // Скриншот не обязателен
    });

    // Инициализация Formik
    const formik = useFormik({
        initialValues: {
            name: user?.name || '', // Автоподстановка имени, если пользователь авторизован
            email: user?.email || '', // Автоподстановка email, если пользователь авторизован
            description: '',
            screenshot: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                let screenshotUrl = null;

                // Загрузка скриншота в Firebase Storage
                if (values.screenshot) {
                    const storageRef = ref(storage, `bug-reports/${uuidv4()}/${values.screenshot.name}`);
                    await uploadBytes(storageRef, values.screenshot);
                    screenshotUrl = await getDownloadURL(storageRef);
                }
                const templateParams = {
                    name: values.name,
                    email: values.email,
                    description: values.description,
                    location: window.location.href,
                    screenshot: screenshotUrl,
                };

                await emailSender.sendBugFeedback(values.name, values.email, emailService.createBagFeedbackEmailHtml(templateParams))

                toast.success('Thank you for your feedback!');
                onClose();
            } catch (error) {
                toast.error('An error occurred. Please try again.');
                console.error(error);
            } finally {
                formik.resetForm();
            }
        },
    });

    // Обработчик загрузки скриншота
    const handleScreenshotUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            formik.setFieldValue('screenshot', file);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Report a Bug or Suggestion
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        margin="normal"
                        disabled={!!user} // Поле отключено, если пользователь авторизован
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        margin="normal"
                        disabled={!!user} // Поле отключено, если пользователь авторизован
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        placeholder="Describe the issue or suggestion..."
                        variant="outlined"
                        margin="normal"
                    />

                    <Typography variant="body1" gutterBottom>
                        Upload a screenshot (optional):
                    </Typography>
                    <input
                        accept="image/*"
                        style={{display: 'none'}}
                        id="screenshot-upload"
                        type="file"
                        onChange={handleScreenshotUpload}
                    />
                    <label htmlFor="screenshot-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CameraAltIcon/>}
                        >
                            Upload Screenshot
                        </Button>
                    </label>
                    {formik.values.screenshot && (
                        <Typography variant="body2" sx={{mt: 1}}>
                            File: {formik.values.screenshot.name}
                        </Typography>
                    )}

                    <DialogActions>
                        <Button onClick={onClose} color="error" disabled={formik.isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" color="primary" variant="contained" disabled={formik.isSubmitting}
                                startIcon={
                                    formik.isSubmitting ? (
                                        <CircularProgress size={24} color="inherit"/>
                                    ) : null
                                }
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackDialog;