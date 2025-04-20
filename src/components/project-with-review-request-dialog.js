import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    CircularProgress,
    useMediaQuery,
    DialogTitle,
    DialogContent, Tooltip
} from "@mui/material";
import SmartTextArea from "src/components/smart-text-ares";
import PropTypes from "prop-types";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {FileUploadSection} from "src/components/file-upload-with-view";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import useUserSpecialties from "src/hooks/use-userSpecialties";
import {useFormik} from "formik";
import * as Yup from "yup";
import {INFO} from "src/libs/log";
import {ReviewRequestMessageArea} from "src/components/review-request-message-edit-area";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const validationSchema = Yup.object().shape({
    projectName: Yup.string().required('Project title is required'),
    specialty: Yup.string().required('Specialty is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    message: Yup.string().required('Message is required')
});

export const ProjectWithReviewRequestDialog = ({
                                                   profile,
                                                   open,
                                                   onClose,
                                                   onSubmit,
                                                   currentRequest,
                                                   isEditMode,
                                                   existingRequests
                                               }) => {
    const {userSpecialties, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile.id);
    const [activeStep, setActiveStep] = useState(0);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const formik = useFormik({
        initialValues: {
            projectName: currentRequest.projectName || '',
            date: currentRequest.date || null,
            specialty: currentRequest.specialty || '',
            projectDescription: currentRequest.projectDescription || '',
            files: currentRequest.files || [],
            email: currentRequest.email || '',
            message: currentRequest.message || ''
        },
        validationSchema,
        onSubmit: (values) => {
            INFO('Submitting review request', values);
            onSubmit(values);
            onClose();
            formik.resetForm();
            setActiveStep(0);
        },
        enableReinitialize: true
    });

    const handlePublishOnly = () => {
        const values = {
            ...formik.values,
            email: null,
            message: null
        };
        onSubmit(values);
        onClose();
        formik.resetForm();
        setActiveStep(0);
    };

    const handleDrop = (newFiles) => {
        const formattedFiles = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        formik.setFieldValue('files', [...formik.values.files, ...formattedFiles]);
    };

    const handleRemove = (index) => {
        const newFiles = [...formik.values.files];
        newFiles.splice(index, 1);

        formik.setFieldValue('files', newFiles);
    };

    const handleRemoveAll = () => {
        formik.setFieldValue('files', []);
    };

    const handleUpdateFiles = useCallback((newFile) => {
        if (newFile) {
            formik.setFieldValue('files',
                formik.values.files.map((file, index) => {
                    if (file.preview === newFile.preview) {
                        return newFile;
                    }
                    return file;
                })
            );
        }
    }, [formik.values.files]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            return 'Please enter a valid email address';
        }
        if (existingRequests?.some((request) => request.email === email)) {
            return 'Only one review request per email address is allowed';
        }
        return undefined;
    };

    const renderSpecialtySelect = () => {
        if (!isFetchingUserSpecialties) {
            return (
                <TextField
                    fullWidth
                    label="Specialty from your list of services"
                    disabled
                    InputProps={{
                        endAdornment: <CircularProgress size={20}/>
                    }}
                    helperText="Loading specialties..."
                    error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                />
            );
        }

        if (!userSpecialties?.length) {
            return (
                <TextField
                    fullWidth
                    label="Specialty from your list of services"
                    disabled
                    helperText="You haven't added any specialties yet"
                    error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                />
            );
        }

        return (
            <TextField
                select
                fullWidth
                label="Specialty from your list of services"
                name="specialty"
                required
                value={formik.values.specialty}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                helperText={formik.touched.specialty && formik.errors.specialty}
            >
                {userSpecialties.map((specialty) => (
                    <MenuItem key={specialty.id} value={specialty.id}>
                        {specialty.label}
                    </MenuItem>
                ))}
            </TextField>
        );
    };

    const isContinueDisabled = () => {
        if (activeStep === 0) {
            return !formik.values.projectName || !formik.values.specialty;
        }
        return false;
    };

    const isPublishDisabled = () => {
        if (activeStep === 0) {
            return !formik.values.projectName || !formik.values.specialty || !formik.values.date || !formik.values.projectDescription;
        }
        return false;
    };

    const steps = [
        {
            label: 'Project Details',
            description: 'Add information about the project',
            content: (
                <Stack spacing={2} sx={{mt: 2}}>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="projectName"
                            required
                            placeholder="ex. Door Installation"
                            value={formik.values.projectName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.projectName && Boolean(formik.errors.projectName)}
                            helperText={formik.touched.projectName && formik.errors.projectName}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date *"
                                required

                                value={formik.values.date}
                                onChange={(date) => formik.setFieldValue('date', date)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={formik.touched.date && Boolean(formik.errors.date)}
                                        helperText={formik.touched.date && formik.errors.date}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>
                    {renderSpecialtySelect()}
                    <TextField
                        fullWidth
                        label="Project Description"
                        name="projectDescription"
                        placeholder="ex. Customer needs a door installed in their home."
                        multiline
                        minRows={2}
                        maxRows={10}
                        required
                        value={formik.values.projectDescription}
                        onChange={formik.handleChange}
                    />
                    <FileUploadSection
                        files={formik.values.files}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        onRemoveAll={handleRemoveAll}
                        accept={{'image/*,video/*': []}}
                        caption="Attach photos or videos"
                        onUpdate={handleUpdateFiles}
                        updateFields={[{
                            placeholder: 'Describe what\'s shown in this image...',
                            label: 'Description',
                            name: 'description',
                            multiline: true,
                            minRows: 3,
                            maxRows: 4
                        }]}
                    />
                    <Alert
                        severity="info"
                        variant="standard"
                        sx={{ fontSize: '12px' }}
                        icon={<ArrowDownwardIcon fontSize="small" />}
                    >
                        You can also send a request to your client for this project to leave a review on the CTMASS platform.
                    </Alert>
                </Stack>
            )
        },
        {
            label: 'Client Information',
            description: 'Add client details and message',
            content: (
                <Stack spacing={2} sx={{mt: 2}}>
                    <Alert severity="info" variant={"standard"} sx={{fontSize: '12px'}}>
                        The link to your profile and the review form will be added automatically to the footer of
                        the
                        letter.
                    </Alert>
                    <TextField
                        fullWidth
                        label="Client Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={(e) => {
                            formik.handleChange(e);
                            const error = validateEmail(e.target.value);
                            formik.setFieldError('email', error);
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        required
                    />

                    <ReviewRequestMessageArea
                        profile={profile}
                        label="Message"
                        initialValue={formik.values.message}
                        name="message"
                        onTextChange={(value) => formik.setFieldValue('message', value)}
                        error={formik.touched.message && Boolean(formik.errors.message)}
                        helperText={formik.touched.message && formik.errors.message}
                    />
                </Stack>
            )
        }
    ];

    const handleClose = () => {
        formik.resetForm();
        setActiveStep(0);
        onClose();
    }

    const handleNext = () => {
        // Validate current step before proceeding
        let isValid = true;
        if (activeStep === 0) {
            formik.setTouched({
                projectName: true,
                date: true,
                specialty: true
            });
            isValid = !formik.errors.projectName && !formik.errors.date && !formik.errors.specialty;
        }

        if (isValid) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        formik.setFieldValue("email", null);
        formik.setFieldValue("message", null);
        setActiveStep((prev) => prev - 1);
    }

    const handleStepClick = (index) => {
        if (index < activeStep) {
            setActiveStep(index);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            fullScreen={!mdUp}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Publish Project to portfolio</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                </Box>

                <Alert severity="info">
                    You need to fill in the information about the completed project by marking the required fields with an asterisk (*). You can also provide information about the client (step 2) to request their feedback on this project.
                </Alert>
            </DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{mt: 2}}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                optional={index < steps.length - 1 ? (
                                    <Typography variant="caption">{step.description}</Typography>
                                ) : null}
                                onClick={() => handleStepClick(index)}
                                sx={{cursor: index < activeStep ? 'pointer' : 'default'}}
                            >
                                {step.label}
                            </StepLabel>
                            <StepContent>
                                {step.content}
                                <Box sx={{mb: 2, mt: 2}}>
                                    <Stack direction="row" spacing={2}>
                                        <Tooltip
                                            title={"Publish the project in your portfolio and send a request for feedback to your former client."}
                                        >
                                            <Button
                                                onClick={index === steps.length - 1 ? handleBack : handleNext}
                                                disabled={isContinueDisabled()}
                                            >
                                                {index === steps.length - 1 ? 'Cancel review request' : 'Create Review Request'}
                                            </Button>
                                        </Tooltip>
                                        <Box sx={{flexGrow: 1}}/>
                                        <Button
                                            onClick={handleClose}
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                                        <Tooltip
                                            title={"Publish the project in your portfolio and send a request for feedback to your former client."}>
                                            <Button
                                                variant="contained"
                                                color="info"
                                                onClick={formik.handleSubmit}
                                                disabled={!formik.isValid || formik.isSubmitting}
                                                sx={{...(index === 0 && {display: 'none'})}}
                                            >
                                                {'Publish & Send Review Request'}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip
                                            title={"Only publish the project in your portfolio without sending a review request."}>
                                            <Button
                                                variant="contained"
                                                onClick={handlePublishOnly}
                                                disabled={isPublishDisabled() || formik.isSubmitting}
                                                sx={{...(index === 1 && {display: 'none'})}}
                                            >
                                                {'Publish project'}
                                            </Button>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </DialogContent>
        </Dialog>
    );
};

ProjectWithReviewRequestDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    currentRequest: PropTypes.object.isRequired,
    isEditMode: PropTypes.bool,
    existingRequests: PropTypes.array
};