import { memo, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { loyaltyUserAdminApi } from 'src/api/loyalty-user-admin';

const ConsistencyCheckDialog = memo(({ open, user, adminEmail, onClose, onFixed }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setResult(null);
    setError(null);
    setFixed(false);
    setLoading(true);

    loyaltyUserAdminApi
      .checkConsistency(user.id)
      .then((res) => setResult(res))
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [open, user]);

  const handleFix = useCallback(async () => {
    if (!result || !user) return;
    setFixing(true);
    try {
      await loyaltyUserAdminApi.fixBalance(user.id, adminEmail, result);
      setFixed(true);
      onFixed();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setFixing(false);
    }
  }, [result, user, adminEmail, onFixed]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Balance Consistency Check</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {result && !loading && (
          <Stack spacing={3}>
            {result.isConsistent ? (
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ fontSize: 15 }}
              >
                Data is consistent. Balance matches the sum of all transactions.
              </Alert>
            ) : (
              <Alert severity="error" icon={<ErrorIcon />}>
                Discrepancy detected! Balance does not match transaction sum.
              </Alert>
            )}

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Stored Balance</Typography>
              <Typography fontWeight={700}>{result.storedBalance.toLocaleString()} coins</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Computed from Transactions</Typography>
              <Typography fontWeight={700}>{result.computedBalance.toLocaleString()} coins</Typography>
            </Box>

            {!result.isConsistent && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Discrepancy</Typography>
                <Typography fontWeight={700} color="error.main">
                  {result.discrepancy > 0 ? '+' : ''}{result.discrepancy.toLocaleString()} coins
                </Typography>
              </Box>
            )}

            {fixed && (
              <Alert severity="success">
                Balance successfully corrected to {result.computedBalance.toLocaleString()} coins.
                A system correction transaction has been created.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {result && !result.isConsistent && !fixed && (
          <Button
            variant="contained"
            color="error"
            onClick={handleFix}
            disabled={fixing}
          >
            {fixing ? 'Fixing...' : 'Recalculate & Fix'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

ConsistencyCheckDialog.displayName = 'ConsistencyCheckDialog';

export default ConsistencyCheckDialog;
