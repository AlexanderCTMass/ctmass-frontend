import { memo, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
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
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import ArchiveIcon from '@mui/icons-material/Archive';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { getCategoryOption } from './constants';

const RoleCoinsCell = memo(({ rule }) => {
  const roles = ['homeowner', 'contractor', 'partner'];
  return (
    <Stack direction="row" spacing={1}>
      {roles.map((role) => {
        const roleRule = rule.roleRules?.[role];
        const isEnabled = roleRule?.enabled;
        const coins = roleRule?.coins;
        return (
          <Tooltip key={role} title={role}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isEnabled ? 'success.main' : 'text.disabled',
                }}
              />
              <Typography variant="caption" color={isEnabled ? 'text.primary' : 'text.disabled'}>
                {coins ?? (rule.coinsAwarded ?? '—')}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
});

RoleCoinsCell.displayName = 'RoleCoinsCell';

const RuleRow = memo(({ rule, index, onToggle, onEdit, onDuplicate, onHistory, onArchive }) => {
  const categoryOpt = getCategoryOption(rule.category);

  const handleToggle = useCallback(() => {
    onToggle(rule.id, !rule.enabled);
  }, [onToggle, rule.id, rule.enabled]);

  const handleEdit = useCallback(() => onEdit(rule), [onEdit, rule]);
  const handleDuplicate = useCallback(() => onDuplicate(rule), [onDuplicate, rule]);
  const handleHistory = useCallback(() => onHistory(rule), [onHistory, rule]);
  const handleArchive = useCallback(() => onArchive(rule), [onArchive, rule]);

  return (
    <Draggable draggableId={rule.id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            bgcolor: snapshot.isDragging ? 'action.hover' : 'inherit',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <TableCell sx={{ width: 40, cursor: 'grab', p: 1 }} {...provided.dragHandleProps}>
            <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </TableCell>
          <TableCell>
            <Chip
              label={categoryOpt.label}
              color={categoryOpt.color}
              size="small"
              variant="outlined"
            />
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight={500}>
              {rule.displayNameRu || rule.displayName || rule.actionType}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rule.actionType}
            </Typography>
          </TableCell>
          <TableCell>
            <RoleCoinsCell rule={rule} />
          </TableCell>
          <TableCell>
            {rule.maxPerUser != null ? (
              <Typography variant="body2">{rule.maxPerUser}</Typography>
            ) : (
              <AllInclusiveIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            )}
          </TableCell>
          <TableCell>
            {rule.cooldownDays != null ? (
              <Typography variant="body2">{rule.cooldownDays}</Typography>
            ) : (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            )}
          </TableCell>
          <TableCell>
            <Switch checked={!!rule.enabled} onChange={handleToggle} size="small" />
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title="Edit">
                <IconButton size="small" onClick={handleEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={handleDuplicate}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Change history">
                <IconButton size="small" onClick={handleHistory}>
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Archive">
                <IconButton size="small" color="error" onClick={handleArchive}>
                  <ArchiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
});

RuleRow.displayName = 'RuleRow';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const LoyaltyRulesTable = ({
  rules,
  onToggle,
  onEdit,
  onDuplicate,
  onHistory,
  onArchive,
  onReorder,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const paginatedRules = useMemo(
    () => rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rules, page, rowsPerPage]
  );

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const sourceIndex = page * rowsPerPage + result.source.index;
      const destIndex = page * rowsPerPage + result.destination.index;
      if (sourceIndex === destIndex) return;
      onReorder(sourceIndex, destIndex);
    },
    [onReorder, page, rowsPerPage]
  );

  return (
    <Paper variant="outlined">
      <TableContainer>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell>Category</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Homeowner"><Typography variant="caption" color="text.secondary">H</Typography></Tooltip>
                    <Tooltip title="Contractor"><Typography variant="caption" color="text.secondary">C</Typography></Tooltip>
                    <Tooltip title="Partner"><Typography variant="caption" color="text.secondary">P</Typography></Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>Limit</TableCell>
                <TableCell>Cooldown</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <Droppable droppableId="loyalty-rules">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {paginatedRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No rules found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRules.map((rule, idx) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        index={idx}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onHistory={onHistory}
                        onArchive={onArchive}
                      />
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </TableContainer>
      <TablePagination
        component="div"
        count={rules.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      />
    </Paper>
  );
};

export default memo(LoyaltyRulesTable);
