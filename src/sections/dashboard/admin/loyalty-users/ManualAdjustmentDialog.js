import { memo, useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const REASON_MIN_LENGTH = 5;
const REASON_MAX_LENGTH = 500;

const ManualAdjustmentDialog = memo(({ open, mode, user, onClose, onSubmit, submitting }) => {
  const [step, setStep] = useState('form');
  const [operationType, setOperationType] = useState(mode === 'deduct' ? 'deduct' : 'award');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [reasonError, setReasonError] = useState('');

  const currentBalance = user?.loyaltyBalance || 0;
  const numAmount = parseInt(amount, 10) || 0;
  const finalAmount = operationType === 'award' ? numAmount : -numAmount;
  const newBalance = currentBalance + finalAmount;

  const handleTypeChange = useCallback((_, val) => {
    if (val) setOperationType(val);
  }, []);

  const validateAndProceed = useCallback(() => {
    let valid = true;
    if (!numAmount || numAmount <= 0) {
      setAmountError('Amount must be a positive number');
      valid = false;
    } else {
      setAmountError('');
    }

    if (reason.trim().length < REASON_MIN_LENGTH) {
      setReasonError(`Reason must be at least ${REASON_MIN_LENGTH} characters`);
      valid = false;
    } else if (reason.trim().length > REASON_MAX_LENGTH) {
      setReasonError(`Reason must be at most ${REASON_MAX_LENGTH} characters`);
      valid = false;
    } else {
      setReasonError('');
    }

    if (operationType === 'deduct' && numAmount > currentBalance) {
      setAmountError(`Cannot deduct more than current balance (${currentBalance.toLocaleString()} coins)`);
      valid = false;
    }

    if (valid) setStep('confirm');
  }, [numAmount, reason, operationType, currentBalance]);

  const handleConfirm = useCallback(async () => {
    await onSubmit({ amount: finalAmount, reason: reason.trim(), notifyUser: notify });
    setStep('form');
    setAmount('');
    setReason('');
    setNotify(false);
  }, [onSubmit, finalAmount, reason, notify]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setStep('form');
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
    setNotify(false);
    onClose();
  }, [onClose, submitting]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {step === 'form' && (
        <>
          <DialogTitle>
            {operationType === 'award' ? 'Award Coins' : 'Deduct Coins'}
            {user && (
              <Typography variant="body2" color="text.secondary">
                {user.displayName || user.email} — current balance:{' '}
                <strong>{currentBalance.toLocaleString()} coins</strong>
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <ToggleButtonGroup
                value={operationType}
                exclusive
                onChange={handleTypeChange}
                fullWidth
                size="small"
              >
                <ToggleButton value="award" color="success">
                  <AddCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                  Award
                </ToggleButton>
                <ToggleButton value="deduct" color="error">
                  <RemoveCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                  Deduct
                </ToggleButton>
              </ToggleButtonGroup>

              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={!!amountError}
                helperText={amountError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color={operationType === 'award' ? 'success.main' : 'error.main'} fontWeight={700}>
                        {operationType === 'award' ? '+' : '−'}
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">coins</InputAdornment>,
                  inputProps: { min: 1 },
                }}
                fullWidth
              />

              <TextField
                label="Reason"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                error={!!reasonError}
                helperText={reasonError || `${reason.length}/${REASON_MAX_LENGTH} characters (min ${REASON_MIN_LENGTH})`}
                fullWidth
              />

              <FormControlLabel
                control={<Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} />}
                label="Notify user via email"
              />

              {numAmount > 0 && (
                <Alert severity={operationType === 'award' ? 'success' : 'warning'}>
                  New balance will be:{' '}
                  <strong>{newBalance.toLocaleString()} coins</strong>
                  {' '}({operationType === 'award' ? '+' : '−'}{numAmount.toLocaleString()})
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              color={operationType === 'award' ? 'success' : 'error'}
              onClick={validateAndProceed}
            >
              Review
            </Button>
          </DialogActions>
        </>
      )}

      {step === 'confirm' && (
        <>
          <DialogTitle>Confirm Operation</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>User</Typography>
                <Typography fontWeight={600}>{user?.displayName || user?.email}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Operation</Typography>
                <Typography fontWeight={600} color={operationType === 'award' ? 'success.main' : 'error.main'}>
                  {operationType === 'award' ? 'Award' : 'Deduct'} {numAmount.toLocaleString()} coins
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Current Balance</Typography>
                <Typography fontWeight={600}>{currentBalance.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">New Balance</Typography>
                <Typography fontWeight={700} color={operationType === 'award' ? 'success.main' : 'error.main'}>
                  {newBalance.toLocaleString()}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>Reason</Typography>
                <Typography variant="body2">{reason}</Typography>
              </Box>
              {notify && (
                <Alert severity="info" icon={false}>
                  User will be notified via email.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStep('form')} disabled={submitting}>
              Back
            </Button>
            <Button
              variant="contained"
              color={operationType === 'award' ? 'success' : 'error'}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
});

ManualAdjustmentDialog.displayName = 'ManualAdjustmentDialog';

export default ManualAdjustmentDialog;
