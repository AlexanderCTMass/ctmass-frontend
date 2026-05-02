import { memo, useCallback, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const CATEGORY_COLORS = {
  merch: '#E65100',
  promotion: '#1565c0',
  profile: '#2e7d32',
  ai: '#6a1b9a',
  analytics: '#00838f',
};

const ROLE_LABELS = { homeowner: 'Homeowner', contractor: 'Contractor', partner: 'Partner' };

const FeatureRow = memo(({ feature, onToggle, onEdit, onDuplicate }) => {
  const price = feature.pricing?.basePrice ?? 0;
  const roles = feature.availability?.roles || [];
  const categoryColor = CATEGORY_COLORS[feature.category] || '#607D8B';
  const hasPackages = (feature.pricing?.packages || []).length > 0;

  const typeLabel = feature.isOneTime ? 'One-time' : hasPackages ? 'Package' : 'Repeatable';

  return (
    <TableRow hover>
      <TableCell sx={{ width: 60 }}>
        <Switch
          checked={!!feature.enabled}
          size="small"
          onChange={(e) => onToggle(feature.id, e.target.checked)}
        />
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{feature.displayName}</Typography>
          <Typography variant="caption" color="text.secondary">{feature.featureKey}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={feature.category}
          size="small"
          sx={{
            backgroundColor: `${categoryColor}18`,
            color: categoryColor,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 16 }} />
          <Typography variant="body2" fontWeight={700}>{price.toLocaleString()}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {roles.length === 0 || roles.length === 3 ? (
            <Chip label="All roles" size="small" variant="outlined" />
          ) : (
            roles.map((r) => (
              <Chip key={r} label={ROLE_LABELS[r] || r} size="small" variant="outlined" />
            ))
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Chip label={typeLabel} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(feature)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={() => onDuplicate(feature)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});

FeatureRow.displayName = 'FeatureRow';

const ShopFeaturesTable = memo(({ features, onToggle, onEdit, onDuplicate }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = useCallback((_, newPage) => setPage(newPage), []);
  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const paginated = features.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Base Price</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No shop items found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((feature) => (
              <FeatureRow
                key={feature.id || feature.featureKey}
                feature={feature}
                onToggle={onToggle}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
              />
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={features.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  );
});

ShopFeaturesTable.displayName = 'ShopFeaturesTable';

export default ShopFeaturesTable;
