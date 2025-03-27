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
    DialogContent
} from "@mui/material";
import SmartTextArea from "src/components/smart-text-ares";
import PropTypes from "prop-types";
import * as React from "react";
import {useEffect} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {FileUploadSection} from "src/components/file-upload-with-view";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import useUserSpecialties from "src/hooks/use-userSpecialties";
import {useFormik} from "formik";
import * as Yup from "yup";
import {INFO} from "src/libs/log";

export const generateReviewRequestTemplate = (profile) => {
    const templates = [
        `Hello there,\n\nI hope this message finds you well! This is ${profile.businessName} (${profile.name}) reaching out to kindly ask if you would be willing to share your feedback about our recent work together. I've recently joined CTMASS, a trusted platform connecting professionals with clients, and your review would help establish my reputation there.\n\nYou can leave your review directly on my CTMASS profile - it only takes a minute but would mean a lot to my business.\n\nThank you for your time and consideration!\n\nBest regards,\n${profile.name}`,

        `Dear Valued Client,\n\nI'm ${profile.name} from ${profile.businessName}, and I wanted to personally thank you for giving us the opportunity to serve you. I've recently registered on CTMASS, a professional platform that verifies service providers, and I'd greatly appreciate your honest feedback about your experience with us.\n\nYour review on CTMASS helps me build credibility on this new platform while helping future clients make informed decisions.\n\nWarm regards,\n${profile.name}`,

        `Hi [Client's Name],\n\nThis is ${profile.name} from ${profile.businessName}. I truly enjoyed working with you and would be grateful if you could take a moment to share your experience on CTMASS, the new platform I've joined that connects professionals with clients.\n\nYour honest feedback is incredibly valuable as I establish my presence on this verified professional network.\n\nThank you for your support!\n\nSincerely,\n${profile.name}`,

        `Good day!\n\nI'm ${profile.name}, the owner of ${profile.businessName}. I've recently joined CTMASS, a platform that helps clients find trusted professionals, and I'm reaching out to ask if you'd be willing to share your experience working with us.\n\nYour review on my CTMASS profile would help me tremendously as I build my presence on this new platform.\n\nWith appreciation,\n${profile.name}`,

        `Hello!\n\n${profile.businessName} here. I'm excited to share that I've joined CTMASS, a professional services platform, and I wanted to ask if you'd be comfortable sharing your thoughts about our work together on my profile there.\n\nYour feedback helps establish my reputation on this new platform and assists future clients in finding quality services.\n\nMany thanks in advance!\n\nKind regards,\n${profile.name}`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

const validationSchema = Yup.object().shape({
    projectName: Yup.string().required('Project title is required'),
    specialty: Yup.string().required('Specialty is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    message: Yup.string().required('Message is required')
});

export const ReviewRequestDialog = ({
                                        profile,
                                        open,
                                        onClose,
                                        onSubmit,
                                        currentRequest,
                                        isEditMode,
                                        existingRequests
                                    }) => {
    const {userSpecialties, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile.id);
    const [activeStep, setActiveStep] = React.useState(0);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const formik = useFormik({
        initialValues: {
            addToPortfolio: currentRequest.addToPortfolio || false,
            projectName: currentRequest.projectName || '',
            date: currentRequest.date || null,
            specialty: currentRequest.specialty || '',
            projectDescription: currentRequest.projectDescription || '',
            files: currentRequest.files || [],
            email: profile.email || '',//todo
            message: currentRequest.message || ''
        },
        validationSchema,
        onSubmit: (values) => {
            INFO('Submitting review request', values);
            onSubmit(values);
            onClose();
        },
        enableReinitialize: true
    });


    const handleDrop = (newFiles) => {
        const formattedFiles = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        formik.setFieldValue('files', [...formik.values.files, ...formattedFiles]);
    };

    const handleRemove = (file) => {
        formik.setFieldValue(
            'files',
            formik.values.files.filter((_file) => _file.path !== file.path)
        );
    };

    const handleRemoveAll = () => {
        formik.setFieldValue('files', []);
    };

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
                    label="Specialty"
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
                    label="Specialty"
                    disabled
                    helperText="No specialties available"
                    error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                />
            );
        }

        return (
            <TextField
                select
                fullWidth
                label="Specialty"
                name="specialty"
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

    const steps = [
        {
            label: 'Project Details',
            description: 'Add information about the project',
            content: (
                <Stack spacing={2} sx={{mt: 2}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formik.values.addToPortfolio}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                name="addToPortfolio"
                                color="primary"
                            />
                        }
                        label="Add to portfolio in public profile"
                    />

                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="projectName"
                            placeholder="ex. Door Installation"
                            value={formik.values.projectName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.projectName && Boolean(formik.errors.projectName)}
                            helperText={formik.touched.projectName && formik.errors.projectName}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
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
                    />
                </Stack>
            )
        },
        {
            label: 'Client Information',
            description: 'Add client details and message',
            content: (
                <Stack spacing={2} sx={{mt: 2}}>
                    <Alert severity="info" variant={"standard"} sx={{fontSize: '12px'}}>
                        The link to your profile and the review form will be added automatically to the footer of the
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
                        disabled
                    />

                    <SmartTextArea
                        label="Message"
                        initialValue={formik.values.message}
                        name="message"
                        onTextChange={(value) => formik.setFieldValue('message', value)}
                        generate={() => generateReviewRequestTemplate(profile)}
                        error={formik.touched.message && Boolean(formik.errors.message)}
                        helperText={formik.touched.message && formik.errors.message}
                    />
                </Stack>
            )
        }
    ];

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

    const handleBack = () => setActiveStep((prev) => prev - 1);

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
            maxWidth="sm"
            fullScreen={!mdUp}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{isEditMode ? 'Edit' : 'Add'} Review Request</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
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
                                        <Button
                                            onClick={index === steps.length - 1 ? handleBack : handleNext}
                                        >
                                            {index === steps.length - 1 ? 'Back' : 'Continue'}
                                        </Button>
                                        <Box sx={{flexGrow: 1}}/>
                                        <Button
                                            onClick={onClose}
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={formik.handleSubmit}
                                            disabled={!formik.isValid || formik.isSubmitting}
                                            sx={{...(index === 0 && {display: 'none'})}}
                                        >
                                            {isEditMode ? 'Save Changes' : 'Add Request'}
                                        </Button>
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

ReviewRequestDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    currentRequest: PropTypes.object.isRequired,
    isEditMode: PropTypes.bool,
    existingRequests: PropTypes.array
};