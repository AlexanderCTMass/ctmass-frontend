import { memo, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { loyaltyAdminApi } from 'src/api/loyalty-admin';
import { AUDIT_ACTION_LABELS } from './constants';

const ACTION_COLORS = {
  create: 'success',
  update: 'info',
  delete: 'error',
  toggle: 'warning',
};

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatValue = (val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const HistoryEntry = memo(({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const label = AUDIT_ACTION_LABELS[entry.action] || entry.action;
  const color = ACTION_COLORS[entry.action] || 'default';

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const displayChanges =
    entry.action === 'toggle'
      ? (entry.changes || []).filter((c) => c.field === 'enabled')
      : entry.changes || [];

  return (
    <Box sx={{ mb: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ cursor: 'pointer', py: 1 }}
        onClick={toggleExpanded}
      >
        <Chip label={label} color={color} size="small" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {entry.changedBy}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTimestamp(entry.timestamp)}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>
      <Collapse in={expanded}>
        {displayChanges.length > 0 ? (
          <Table size="small" sx={{ mb: 1 }}>
            <TableBody>
              {displayChanges.map((change, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ py: 0.5, color: 'text.secondary', width: '40%' }}>
                    <Typography variant="caption">{change.field}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{ textDecoration: 'line-through', color: 'error.main' }}
                      >
                        {formatValue(change.oldValue)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        →
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        {formatValue(change.newValue)}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pl: 1, pb: 1, display: 'block' }}
          >
            No details available
          </Typography>
        )}
      </Collapse>
      <Divider />
    </Box>
  );
});

HistoryEntry.displayName = 'HistoryEntry';

const LoyaltyHistoryModal = ({ open, rule, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !rule) return;
    setLoading(true);
    loyaltyAdminApi
      .getAuditHistory(rule.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [open, rule]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Change history</Typography>
            <Typography variant="caption" color="text.secondary">
              {rule?.actionType}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No change history found
          </Typography>
        ) : (
          history.map((entry) => <HistoryEntry key={entry.id} entry={entry} />)
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(LoyaltyHistoryModal);
