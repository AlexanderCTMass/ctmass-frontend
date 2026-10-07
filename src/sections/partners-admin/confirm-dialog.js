import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Dialog, Stack, Typography } from '@mui/material';
import { pa } from './tokens';

export const ConfirmDialog = ({ open, title, message, confirmLabel, danger = false, onConfirm, onClose }) => {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} PaperProps={{ sx: { borderRadius: '18px', maxWidth: 440 } }}>
            <Stack spacing={1.5} sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 19, fontWeight: 800, color: pa.text }}>{title}</Typography>
                <Typography sx={{ fontSize: 14.5, color: pa.textSecondary }}>{message}</Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 1.5 }}>
                    <Button onClick={onClose} disabled={busy} sx={{ textTransform: 'none', color: pa.textSecondary, fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={busy}
                        onClick={handleConfirm}
                        startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '10px',
                            boxShadow: 'none',
                            bgcolor: danger ? pa.danger : pa.primary,
                            '&:hover': { bgcolor: danger ? '#B42318' : pa.primaryHover, boxShadow: 'none' }
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.node,
    confirmLabel: PropTypes.string.isRequired,
    danger: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};
