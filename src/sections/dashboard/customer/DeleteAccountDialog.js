import { memo, useCallback, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { deleteUserApi } from 'src/api/delete-user';
import { getInitials } from 'src/utils/get-initials';

const DELETION_REASONS = [
  { value: 'SPAM_OR_ABUSE', label: 'Spam or violations' },
  { value: 'FAKE_ACCOUNT', label: 'Fake account' },
  { value: 'USER_REQUEST_GDPR', label: 'User request (GDPR)' },
  { value: 'TEST_ACCOUNT_CLEANUP', label: 'Test account cleanup' },
  { value: 'DUPLICATE_ACCOUNT', label: 'Duplicate account' },
  { value: 'OTHER', label: 'Other (please specify)' },
];

const STEP = {
  CONFIRM: 'confirm',
  DELETING: 'deleting',
  DONE: 'done',
};

const ConfirmStep = memo(({ customer, reason, reasonDetails, confirmed, onReasonChange, onDetailsChange, onConfirmChange }) => (
  <Stack spacing={3}>
    <Alert severity="error" icon={<WarningAmberIcon />} sx={{ fontWeight: 600 }}>
      This action is irreversible! All user data will be permanently deleted.
    </Alert>

    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar src={customer.avatar} sx={{ width: 56, height: 56 }}>
        {getInitials(customer.name)}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {customer.name || '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {customer.email}
        </Typography>
        {customer.role && (
          <Chip label={customer.role} size="small" sx={{ mt: 0.5 }} />
        )}
      </Box>
    </Stack>

    <FormControl fullWidth required>
      <InputLabel>Deletion reason</InputLabel>
      <Select
        value={reason}
        label="Deletion reason"
        onChange={(e) => onReasonChange(e.target.value)}
      >
        {DELETION_REASONS.map((r) => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {reason === 'OTHER' && (
      <TextField
        fullWidth
        label="Please specify"
        multiline
        minRows={2}
        value={reasonDetails}
        onChange={(e) => onDetailsChange(e.target.value)}
        required
      />
    )}

    <FormControlLabel
      control={
        <Checkbox
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          color="error"
        />
      }
      label="I understand that all user data will be permanently deleted and this cannot be undone"
    />
  </Stack>
));

ConfirmStep.displayName = 'ConfirmStep';

const DeletingStep = memo(() => (
  <Stack spacing={3} alignItems="center" py={4}>
    <CircularProgress size={56} />
    <Box textAlign="center">
      <Typography variant="h6">Deleting account...</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        This may take up to 30 seconds. Please do not close this window.
      </Typography>
    </Box>
  </Stack>
));

DeletingStep.displayName = 'DeletingStep';

const DoneStep = memo(({ result, customerEmail, onViewErrors }) => {
  if (result.cleanupStatus === 'success') {
    return (
      <Stack spacing={2} alignItems="center" py={3}>
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
        <Typography variant="h6">Account deleted successfully</Typography>
        <Typography variant="body2" color="text.secondary">
          User account <strong>{customerEmail}</strong> has been completely removed.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} py={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <ErrorOutlineIcon sx={{ color: 'warning.main', fontSize: 32 }} />
        <Typography variant="h6">Deletion completed with errors</Typography>
      </Stack>
      <Alert severity="warning">
        The account was deleted but {result.errors?.length || 0} cleanup step(s) failed.
        Some data may not have been removed.
      </Alert>
      {onViewErrors && (
        <Button variant="outlined" size="small" onClick={onViewErrors}>
          View errors ({result.errors?.length})
        </Button>
      )}
    </Stack>
  );
});

DoneStep.displayName = 'DoneStep';

const ErrorsDialog = memo(({ open, errors, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Cleanup errors</DialogTitle>
    <DialogContent>
      <Stack spacing={1.5}>
        {(errors || []).map((e, i) => (
          <Alert key={i} severity="error">
            <Typography variant="subtitle2">{e.step}</Typography>
            <Typography variant="body2">{e.error}</Typography>
          </Alert>
        ))}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
));

ErrorsDialog.displayName = 'ErrorsDialog';

const DeleteAccountDialog = ({ open, onClose, customer, onDeleted }) => {
  const [step, setStep] = useState(STEP.CONFIRM);
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState(null);
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [apiError, setApiError] = useState('');

  const canDelete =
    confirmed &&
    reason &&
    (reason !== 'OTHER' || reasonDetails.trim().length > 0);

  const handleDelete = useCallback(async () => {
    setStep(STEP.DELETING);
    setApiError('');
    try {
      const data = await deleteUserApi.deleteAccount(
        customer.id,
        reason,
        reason === 'OTHER' ? reasonDetails : undefined,
      );
      setResult(data);
      setStep(STEP.DONE);
      if (data.cleanupStatus === 'success') {
        setTimeout(() => {
          onDeleted?.();
        }, 2000);
      }
    } catch (err) {
      const msg = err?.message || 'An unexpected error occurred. Please contact support.';
      setApiError(msg);
      setStep(STEP.CONFIRM);
    }
  }, [customer, reason, reasonDetails, onDeleted]);

  const handleClose = useCallback(() => {
    if (step === STEP.DELETING) return;
    setStep(STEP.CONFIRM);
    setReason('');
    setReasonDetails('');
    setConfirmed(false);
    setResult(null);
    setApiError('');
    onClose();
  }, [step, onClose]);

  if (!customer) return null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon color="error" />
            <Typography variant="h6">Delete Account</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {step === STEP.CONFIRM && (
            <ConfirmStep
              customer={customer}
              reason={reason}
              reasonDetails={reasonDetails}
              confirmed={confirmed}
              onReasonChange={setReason}
              onDetailsChange={setReasonDetails}
              onConfirmChange={setConfirmed}
            />
          )}

          {step === STEP.DELETING && <DeletingStep />}

          {step === STEP.DONE && (
            <DoneStep
              result={result}
              customerEmail={customer.email}
              onViewErrors={result?.errors?.length ? () => setErrorsOpen(true) : null}
            />
          )}
        </DialogContent>

        {step !== STEP.DELETING && (
          <>
            <Divider />
            <DialogActions>
              {step === STEP.CONFIRM && (
                <>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={!canDelete}
                  >
                    Delete account permanently
                  </Button>
                </>
              )}
              {step === STEP.DONE && (
                <Button onClick={handleClose}>Close</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <ErrorsDialog
        open={errorsOpen}
        errors={result?.errors}
        onClose={() => setErrorsOpen(false)}
      />
    </>
  );
};

export default DeleteAccountDialog;
