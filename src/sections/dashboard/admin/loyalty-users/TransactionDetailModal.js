import { memo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { getActionLabel } from './constants';

const Row = ({ label, value, valueColor }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} color={valueColor || 'text.primary'} sx={{ textAlign: 'right', wordBreak: 'break-all' }}>
      {value ?? '—'}
    </Typography>
  </Box>
);

const formatDate = (d) => {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const TransactionDetailModal = memo(({ open, transaction, onClose }) => {
  if (!transaction) return null;

  const isPositive = (transaction.amount || 0) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Transaction Details
        <Typography variant="body2" color="text.secondary">
          ID: {transaction.id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} divider={<Divider />}>
          <Stack spacing={1}>
            <Row label="Date" value={formatDate(transaction.createdAt)} />
            <Row label="Action Type" value={
              <Chip
                label={getActionLabel(transaction.actionType)}
                size="small"
                color={
                  transaction.actionType === 'ADMIN_MANUAL_ADJUSTMENT' ? 'warning' :
                  transaction.actionType === 'SYSTEM_BALANCE_CORRECTION' ? 'error' : 'default'
                }
              />
            } />
          </Stack>

          <Stack spacing={1}>
            <Row
              label="Amount"
              value={`${isPositive ? '+' : ''}${transaction.amount?.toLocaleString() ?? '—'} coins`}
              valueColor={isPositive ? 'success.main' : 'error.main'}
            />
            <Row label="Balance Before" value={transaction.balanceBefore != null ? `${transaction.balanceBefore.toLocaleString()} coins` : '—'} />
            <Row label="Balance After" value={transaction.balanceAfter != null ? `${transaction.balanceAfter.toLocaleString()} coins` : '—'} />
          </Stack>

          <Stack spacing={1}>
            <Row label="User ID" value={transaction.userId} />
            <Row label="User Role" value={transaction.userRole} />
            <Row
              label="Status"
              value={transaction.processed === true ? '✓ Processed' : transaction.processed === false ? '✗ Failed' : '⏳ Pending'}
              valueColor={transaction.processed === true ? 'success.main' : transaction.processed === false ? 'error.main' : 'warning.main'}
            />
          </Stack>

          {(transaction.referenceId || transaction.referenceType) && (
            <Stack spacing={1}>
              <Row label="Reference Type" value={transaction.referenceType} />
              <Row label="Reference ID" value={transaction.referenceId} />
            </Stack>
          )}

          {transaction.metadata && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Metadata
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'background.neutral',
                  borderRadius: 1,
                  p: 1.5,
                  fontSize: 12,
                  overflowX: 'auto',
                  m: 0,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(transaction.metadata, null, 2)}
              </Box>
            </Box>
          )}

          {transaction.idempotencyKey && (
            <Row label="Idempotency Key" value={transaction.idempotencyKey} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});

TransactionDetailModal.displayName = 'TransactionDetailModal';

export default TransactionDetailModal;
