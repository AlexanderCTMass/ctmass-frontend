import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';

export const CancelMeetingDialog = ({
    open,
    onClose,
    onSubmit
}) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!open) {
            setReason('');
        }
    }, [open]);

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error('Please specify the reason for cancellation.');
            return;
        }
        onSubmit(reason);
    };

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
        >
            <DialogTitle>Cancel meeting</DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Cancelling a meeting will return the project to the &ldquo;Awaiting schedule&rdquo; status.
                </Alert>
                <TextField
                    label="Cancellation reason"
                    multiline
                    minRows={3}
                    fullWidth
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
                <Button onClick={handleSubmit} color="error" variant="contained">
                    Cancel meeting
                </Button>
            </DialogActions>
        </Dialog>
    );
};

CancelMeetingDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};