import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
} from '@mui/material';
import { SlotPicker } from './slot-picker';

export const DeclineProposalDialog = ({
    open,
    onClose,
    onSubmit,
    availability,
    maxSlots
}) => {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [proposeAlternative, setProposeAlternative] = useState(false);

    useEffect(() => {
        if (!open) {
            setReason('');
            setComment('');
            setSelectedIds([]);
            setProposeAlternative(false);
        }
    }, [open]);

    const handleToggleSlot = useCallback((slotId) => {
        setSelectedIds((prev) => {
            if (prev.includes(slotId)) {
                return prev.filter((id) => id !== slotId);
            }
            if (prev.length >= maxSlots) {
                toast.error(`You can propose no more than ${maxSlots} alternative slots.`);
                return prev;
            }
            return [...prev, slotId];
        });
    }, [maxSlots]);

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for declining.');
            return;
        }

        const slots = proposeAlternative
            ? availability.slots.filter((slot) => selectedIds.includes(slot.id))
            : [];

        if (proposeAlternative && slots.length === 0) {
            toast.error('Select at least one alternative slot or disable alternative proposal.');
            return;
        }

        onSubmit({
            reason,
            comment,
            slots
        });
    };

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
        >
            <DialogTitle>Decline proposal</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Reason"
                        multiline
                        minRows={2}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Comment for customer (optional)"
                        multiline
                        minRows={2}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        fullWidth
                    />
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={proposeAlternative}
                                onChange={(event) => {
                                    setProposeAlternative(event.target.checked);
                                    if (!event.target.checked) {
                                        setSelectedIds([]);
                                    }
                                }}
                            />
                        )}
                        label="Suggest alternative slots"
                    />
                    {proposeAlternative && (
                        <Stack spacing={2}>
                            <Alert severity="info">
                                Select up to {maxSlots} alternative slots to offer to the customer.
                            </Alert>
                            <SlotPicker
                                slots={availability.slots}
                                selectedIds={selectedIds}
                                onToggle={handleToggleSlot}
                                disabled={availability.loading}
                            />
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeclineProposalDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    availability: PropTypes.shape({
        slots: PropTypes.array,
        loading: PropTypes.bool
    }).isRequired,
    maxSlots: PropTypes.number
};