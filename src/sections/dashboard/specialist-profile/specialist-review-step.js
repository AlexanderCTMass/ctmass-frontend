import PropTypes from 'prop-types';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    SvgIcon,
    TextField, Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import {useState} from "react";
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Trash01';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import EditIcon from '@untitled-ui/icons-react/build/esm/Pencil01';
import toast from "react-hot-toast";
import SmartTextArea from "src/components/smart-text-ares";
import * as React from "react";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {HomePageFeatureToggles} from "src/featureToggles/HomePageFeatureToggles";

const generateReviewRequestTemplate = (profile) => {
    const templates = [
        `Hello there,\n\nI hope this message finds you well! This is ${profile.businessName} (${profile.name}) reaching out to kindly ask if you would be willing to share your feedback about our recent work together. Your review would mean a lot to us and help others discover our services.\n\nYou can simply reply to this email or leave your review at ${profile.email}.\n\nThank you for your time and consideration!\n\nBest regards,\n${profile.name}`,

        `Dear Valued Client,\n\nI'm ${profile.name} from ${profile.businessName}, and I wanted to personally thank you for giving us the opportunity to serve you. If you have a moment, we'd greatly appreciate your honest feedback about your experience with us.\n\nYour review helps us grow and improve our services. Please feel free to share your thoughts at ${profile.email}.\n\nWarm regards,\n${profile.name}`,

        `Hi [Client's Name],\n\nThis is ${profile.name} from ${profile.businessName}. I truly enjoyed working with you and would be grateful if you could take a moment to share your experience with others. Your honest feedback is incredibly valuable to us.\n\nYou can send your review directly to ${profile.email}.\n\nThank you for your support!\n\nSincerely,\n${profile.name}`,

        `Good day!\n\nI'm ${profile.name}, the owner of ${profile.businessName} (${profile.name}). We strive to provide excellent service to all our clients, and your feedback would help us maintain our standards. Would you be willing to share your experience working with us?\n\nPlease send your review to ${profile.email} at your earliest convenience.\n\nWith appreciation,\n${profile.name}`,

        `Hello!\n\n${profile.businessName} (${profile.name}) here. I wanted to follow up and see if you'd be comfortable sharing your thoughts about our services. Your honest review would help us serve you and others even better in the future.\n\nYou can reply directly to this message or email us at ${profile.email}.\n\nMany thanks in advance!\n\nKind regards,\n${profile.name}`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
};

export const SpecialistReviewsStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [submitting, setSubmitting] = useState(false);
    const [reviewRequests, setReviewRequests] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentRequest, setCurrentRequest] = useState({
        email: '',
        message: generateReviewRequestTemplate(profile)
    });
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === 'email') {
            if (value && !validateEmail(value)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        }

        setCurrentRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddRequest = () => {
        if (!currentRequest.email) {
            toast.error('Please fill the email field');
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(currentRequest.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        if (reviewRequests.length >= 4) {
            toast.error('You can add maximum 4 review requests');
            return;
        }

        setReviewRequests(prev => [...prev, currentRequest]);
        setCurrentRequest({
            email: '',
            message: generateReviewRequestTemplate(profile)
        });
        setEmailError('');
        setIsDialogOpen(false);
    };

    const handleEditRequest = () => {
        if (!currentRequest.email) {
            toast.error('Please fill the email field');
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(currentRequest.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setReviewRequests(prev => {
            const newRequests = [...prev];
            newRequests[editingIndex] = currentRequest;
            return newRequests;
        });

        setCurrentRequest({
            email: '',
            message: generateReviewRequestTemplate(profile)
        });
        setEmailError('');
        setIsEditDialogOpen(false);
        setEditingIndex(null);
    };

    const handleRemoveRequest = (index) => {
        setReviewRequests(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditClick = (index) => {
        setCurrentRequest(reviewRequests[index]);
        setEditingIndex(index);
        setIsEditDialogOpen(true);
    };

    const handleOnNext = () => {
        setSubmitting(true);

        if (reviewRequests.length === 0) {

        }


        onNext({
            profileDataProgress: 2,
            reviewRequests
        });
    };

    const isValid = () => {
        return true;
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    Almost There!
                </Typography>
                <Typography variant="body2">
                    For better reputation, request reviews from your past clients (maximum 4).
                </Typography>
            </div>

            {/* Review requests list */}
            {reviewRequests.length > 0 && (
                <Stack spacing={2}>
                    <Typography variant="subtitle1">
                        Review Requests ({reviewRequests.length}/4)
                    </Typography>
                    {reviewRequests.map((request, index) => (
                        <Box
                            key={index}
                            sx={{
                                p: 2,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}
                        >
                            <div>
                                <Typography variant="h6">
                                    {request.email}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        mt: 2,
                                        whiteSpace: 'pre-line',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 5,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {request.message}
                                </Typography>
                            </div>
                            <Stack direction="row">
                                <IconButton onClick={() => handleEditClick(index)}>
                                    <Tooltip title="Edit Request">
                                        <SvgIcon fontSize="small">
                                            <EditIcon/>
                                        </SvgIcon>
                                    </Tooltip>
                                </IconButton>
                                <IconButton onClick={() => handleRemoveRequest(index)}>
                                    <Tooltip title="Remove Request">
                                        <SvgIcon fontSize="small">
                                            <DeleteIcon/>
                                        </SvgIcon>
                                    </Tooltip>
                                </IconButton>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}

            {/* Add Review Button */}
            <Button
                startIcon={(
                    <SvgIcon>
                        <PlusIcon/>
                    </SvgIcon>
                )}
                onClick={() => setIsDialogOpen(true)}
                variant="outlined"
                disabled={reviewRequests.length >= 4}
                fullWidth
                sx={{mt: 2}}
            >
                Add Review Request
            </Button>

            {/* Add Review Dialog */}
            <Dialog
                open={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEmailError('');
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Review Request</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 2}}>
                        <TextField
                            fullWidth
                            label="Client Email"
                            name="email"
                            type="email"
                            value={currentRequest.email}
                            onChange={handleInputChange}
                            error={!!emailError}
                            helperText={emailError}
                            required
                        />
                        <Alert severity="info">
                            {`The link to your profile and the review form will be added automatically to the footer of the letter, so you don't have to specify it here.`}
                        </Alert>
                        <SmartTextArea
                            label="Message"
                            initialValue={currentRequest.message}
                            name="message"
                            onTextChange={(value) => {
                                handleInputChange({target: {name: 'message', value}})
                            }}
                            generate={() => generateReviewRequestTemplate(profile)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsDialogOpen(false);
                        setEmailError('');
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddRequest}
                        variant="contained"
                        disabled={!currentRequest.email || !!emailError}
                    >
                        Add Request
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Review Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setEmailError('');
                    setEditingIndex(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit Review Request</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 2}}>
                        <TextField
                            fullWidth
                            label="Client Email"
                            name="email"
                            type="email"
                            value={currentRequest.email}
                            onChange={handleInputChange}
                            error={!!emailError}
                            helperText={emailError}
                            required
                        />
                        <Alert severity="info">
                            {`The link to your profile and the review form will be added automatically to the footer of the letter, so you don't have to specify it here.`}
                        </Alert>
                        <SmartTextArea
                            label="Message"
                            initialValue={currentRequest.message}
                            name="message"
                            onTextChange={(value) => {
                                handleInputChange({target: {name: 'message', value}})
                            }}
                            generate={() => generateReviewRequestTemplate(profile)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsEditDialogOpen(false);
                        setEmailError('');
                        setEditingIndex(null);
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditRequest}
                        variant="contained"
                        disabled={!currentRequest.email || !!emailError}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Navigation buttons */}
            <Stack alignItems="center" direction="row" spacing={2} sx={{mt: 2}}>
                <Button
                    endIcon={(
                        <SvgIcon>
                            <CheckIcon/>
                        </SvgIcon>
                    )}
                    startIcon={submitting && <CircularProgress color="inherit" size={20}/>}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!isValid() || submitting}
                >
                    {reviewRequests.length > 0 ? 'Send requests & complete' : 'Complete'}
                </Button>
            </Stack>
        </Stack>
    );
};

SpecialistReviewsStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    profile: PropTypes.object
};