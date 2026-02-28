import { useCallback } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { storage } from 'src/libs/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from 'src/service/email-service';
import { getNextBugNumber } from 'src/api/bug-reports';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    description: Yup.string().required('Description is required'),
    screenshot: Yup.mixed(),
});

const FeedbackDialog = ({ open, onClose }) => {
    const { user } = useAuth();

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            description: '',
            screenshot: null,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const bugNumber = await getNextBugNumber();

                let screenshotUrl = null;
                if (values.screenshot) {
                    const storageRef = ref(storage, `bug-reports/${uuidv4()}/${values.screenshot.name}`);
                    await uploadBytes(storageRef, values.screenshot);
                    screenshotUrl = await getDownloadURL(storageRef);
                }

                const params = {
                    bugNumber,
                    name: values.name,
                    email: values.email,
                    description: values.description,
                    location: window.location.href,
                    screenshot: screenshotUrl,
                };

                await emailService.sendBugReportToAdmin(params);
                await emailService.sendBugReportConfirmationToUser(params);

                toast.success('Thank you for your feedback!');
                formik.resetForm();
                onClose();
            } catch (error) {
                toast.error('An error occurred. Please try again.');
                console.error(error);
            }
        },
    });

    const handleScreenshotUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            formik.setFieldValue('screenshot', file);
        }
        event.target.value = '';
    }, [formik]);

    const handleRemoveScreenshot = useCallback(() => {
        formik.setFieldValue('screenshot', null);
    }, [formik]);

    const previewUrl = formik.values.screenshot
        ? URL.createObjectURL(formik.values.screenshot)
        : null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Report a Bug or Suggestion
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
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

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                        Upload a screenshot (optional)
                    </Typography>

                    {previewUrl ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Screenshot preview"
                                sx={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    maxHeight: 200,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={handleRemoveScreenshot}
                                sx={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    bgcolor: 'rgba(0,0,0,0.55)',
                                    color: '#fff',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="screenshot-upload"
                                type="file"
                                onChange={handleScreenshotUpload}
                            />
                            <label htmlFor="screenshot-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CameraAltIcon />}
                                >
                                    Upload Screenshot
                                </Button>
                            </label>
                        </>
                    )}

                    <DialogActions sx={{ px: 0, pt: 3 }}>
                        <Button onClick={onClose} color="error" disabled={formik.isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={formik.isSubmitting}
                            startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
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
