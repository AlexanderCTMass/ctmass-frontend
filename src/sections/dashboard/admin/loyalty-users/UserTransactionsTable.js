import { memo, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import { getActionLabel, ACTION_TYPE_LABELS } from './constants';

const formatDate = (d) => {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AmountCell = memo(({ amount }) => {
  const isPositive = amount > 0;
  return (
    <Typography
      variant="body2"
      fontWeight={700}
      color={isPositive ? 'success.main' : 'error.main'}
    >
      {isPositive ? '+' : ''}{amount?.toLocaleString() ?? '—'}
    </Typography>
  );
});

AmountCell.displayName = 'AmountCell';

const StatusCell = memo(({ processed }) => {
  if (processed === true) return <CheckCircleIcon color="success" fontSize="small" />;
  if (processed === false) return <CancelIcon color="error" fontSize="small" />;
  return <HourglassEmptyIcon color="warning" fontSize="small" />;
});

StatusCell.displayName = 'StatusCell';

const MetadataCell = memo(({ metadata }) => {
  if (!metadata) return <Typography variant="body2" color="text.disabled">—</Typography>;
  const text = typeof metadata === 'object' ? JSON.stringify(metadata, null, 2) : String(metadata);
  return (
    <Tooltip title={<pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap', maxWidth: 300 }}>{text}</pre>} arrow>
      <IconButton size="small">
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
});

MetadataCell.displayName = 'MetadataCell';

const fmtDateCsv = (d) => {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmtAmount = (amount) => {
  if (amount == null) return '';
  return amount > 0 ? `+${amount}` : String(amount);
};

const fmtStatus = (processed) => {
  if (processed === true) return 'Processed';
  if (processed === false) return 'Failed';
  return 'Pending';
};

const exportCsv = (transactions, userId) => {
  const headers = [
    'Date & Time',
    'Action',
    'Amount (coins)',
    'Balance Before',
    'Balance After',
    'Status',
    'Reference Type',
    'Reference ID',
    'Reason',
    'Admin',
    'User Role',
  ];

  const rows = transactions.map((tx) => {
    const meta = tx.metadata || {};
    return [
      fmtDateCsv(tx.createdAt),
      getActionLabel(tx.actionType),
      fmtAmount(tx.amount),
      tx.balanceBefore != null ? tx.balanceBefore : '',
      tx.balanceAfter != null ? tx.balanceAfter : '',
      fmtStatus(tx.processed),
      tx.referenceType || '',
      tx.referenceId || '',
      meta.reason || '',
      meta.adminEmail || '',
      tx.userRole || '',
    ];
  });

  const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csvRows = [headers, ...rows].map((row) => row.map(escape).join(','));
  const csv = '﻿' + 'sep=,\r\n' + csvRows.join('\r\n');

  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${userId}_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const UserTransactionsTable = memo(({ transactions, userId, loading, onRowClick }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filterActionType, setFilterActionType] = useState('');
  const [filterAmountType, setFilterAmountType] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);

  const actionTypeOptions = useMemo(
    () => Object.entries(ACTION_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v })),
    []
  );

  const filtered = useMemo(() => {
    let res = transactions;
    if (filterActionType) res = res.filter((t) => t.actionType === filterActionType);
    if (filterAmountType === 'positive') res = res.filter((t) => (t.amount || 0) > 0);
    if (filterAmountType === 'negative') res = res.filter((t) => (t.amount || 0) < 0);
    if (filterDateFrom) res = res.filter((t) => t.createdAt && new Date(t.createdAt) >= filterDateFrom);
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      res = res.filter((t) => t.createdAt && new Date(t.createdAt) <= to);
    }
    return res;
  }, [transactions, filterActionType, filterAmountType, filterDateFrom, filterDateTo]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const handleExport = useCallback(() => {
    exportCsv(filtered, userId);
  }, [filtered, userId]);

  const handleResetFilters = useCallback(() => {
    setFilterActionType('');
    setFilterAmountType('all');
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setPage(0);
  }, []);

  return (
    <Card>
      <CardHeader
        title="Transaction History"
        subheader={`${filtered.length} of ${transactions.length} transactions`}
        action={
          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
        }
      />

      <Box sx={{ px: 2, pb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Action Type</InputLabel>
              <Select
                label="Action Type"
                value={filterActionType}
                onChange={(e) => { setFilterActionType(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                {actionTypeOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Amount Type</InputLabel>
              <Select
                label="Amount Type"
                value={filterAmountType}
                onChange={(e) => { setFilterAmountType(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="positive">Credits (+)</MenuItem>
                <MenuItem value="negative">Debits (−)</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="From"
              value={filterDateFrom}
              onChange={(v) => { setFilterDateFrom(v); setPage(0); }}
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />
            <DatePicker
              label="To"
              value={filterDateTo}
              onChange={(v) => { setFilterDateTo(v); setPage(0); }}
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />

            <Button size="small" onClick={handleResetFilters} sx={{ alignSelf: 'center' }}>
              Reset
            </Button>
          </Stack>
        </LocalizationProvider>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Action Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Balance Before</TableCell>
              <TableCell align="right">Balance After</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="center">Info</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No transactions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((tx) => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onRowClick(tx)}
                >
                  <TableCell>
                    <Typography variant="caption" noWrap>
                      {formatDate(tx.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getActionLabel(tx.actionType)}
                      size="small"
                      color={tx.actionType === 'ADMIN_MANUAL_ADJUSTMENT' ? 'warning' : tx.actionType === 'SYSTEM_BALANCE_CORRECTION' ? 'error' : 'default'}
                      sx={{ maxWidth: 200, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <AmountCell amount={tx.amount} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {tx.balanceBefore != null ? tx.balanceBefore.toLocaleString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {tx.balanceAfter != null ? tx.balanceAfter.toLocaleString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {tx.referenceId ? (
                      <Tooltip title={`${tx.referenceType || 'reference'}: ${tx.referenceId}`}>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}
                        >
                          {tx.referenceId}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <MetadataCell metadata={tx.metadata} />
                  </TableCell>
                  <TableCell align="center">
                    <StatusCell processed={tx.processed} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
      />
    </Card>
  );
});

UserTransactionsTable.displayName = 'UserTransactionsTable';

export default UserTransactionsTable;
