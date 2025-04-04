import PropTypes from 'prop-types';
import {Box, Button, CircularProgress, Divider, IconButton, Stack, SvgIcon, Tooltip, Typography} from '@mui/material';
import * as React from "react";
import {useCallback, useState} from "react";
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Trash01';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import EditIcon from '@untitled-ui/icons-react/build/esm/Pencil01';
import toast from "react-hot-toast";
import {generateReviewRequestTemplate, ReviewRequestDialog} from "src/components/review-request-dialog";
import {ERROR, INFO} from "src/libs/log";
import {projectFlow} from "src/flows/project/project-flow";


export const SpecialistReviewsStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;

    const [submitting, setSubmitting] = useState(false);
    const [reviewRequests, setReviewRequests] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentRequest, setCurrentRequest] = useState({
        email: '',
        message: ''
    });

    const handleSubmitRequest = useCallback((request) => {
        INFO("handleSubmitRequest", request)
        if (reviewRequests.length >= 4 && !editingIndex) {
            toast.error('You can add maximum 4 review requests');
            return;
        }
        setCurrentRequest(request);
        setReviewRequests(prev => {
            if (editingIndex !== null) {
                const newRequests = [...prev];
                newRequests[editingIndex] = request;
                return newRequests;
            } else {
                return [...prev, request];
            }
        });

        resetDialogState();
    }, [currentRequest, editingIndex, reviewRequests]);

    const resetDialogState = () => {
        INFO("resetDialogState")
        setCurrentRequest({
            email: '',
            message: ''
        });
        setDialogOpen(false);
        setEditingIndex(null);
    };

    const handleRemoveRequest = (index) => {
        setReviewRequests(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditClick = (index) => {
        setCurrentRequest(reviewRequests[index]);
        INFO("handleEditClick", reviewRequests[index]);
        setEditingIndex(index);
        setDialogOpen(true);
    };

    const handleOnNext = async () => {
        setSubmitting(true);

        if (reviewRequests.length > 0) {
            for (let i = 0; i < reviewRequests.length; i++) {
                try {
                    const request = reviewRequests[i];
                    const project = {
                        addToPortfolio: request.addToPortfolio,
                        projectName: request.projectName,
                        projectDate: request.date,
                        projectDescription: request.projectDescription,
                        specialtyId: request.specialty,
                        files: request.files?.map(f => ({url: f.preview})) || []
                    };
                    INFO("handleOnNext", request, project);
                    await projectFlow.sendReviewRequestPastClients(profile.id, profile.name, profile.email, project, request.email, request.message);
                } catch (e) {
                    ERROR(e);
                    toast.error(e.message);
                }
            }

        }

        onNext({
            profileDataProgress: 6
        });
    };

    const isValid = () => true;

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
                            <Stack direction="column" spacing={2}>
                                <Stack direction="row" spacing={2} divider={<span>•</span>}>
                                    <Typography variant="subtitle2">
                                        {request.projectName}
                                    </Typography>
                                    {request.date &&
                                        <Typography variant="subtitle2">
                                            {request.date.toLocaleDateString('default', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Typography>}
                                </Stack>
                                <Divider/>
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
                            </Stack>
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
                onClick={() => setDialogOpen(true)}
                variant="outlined"
                disabled={reviewRequests.length >= 4}
                fullWidth
                sx={{mt: 2}}
            >
                Add Review Request
            </Button>

            <ReviewRequestDialog
                open={dialogOpen}
                onClose={resetDialogState}
                onSubmit={handleSubmitRequest}
                currentRequest={currentRequest}
                setCurrentRequest={setCurrentRequest}
                isEditMode={editingIndex !== null}
                profile={profile}
                existingRequests={reviewRequests}
            />

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
                    {reviewRequests.length > 0 ? 'Send requests & complete' : 'Complete without requests'}
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