import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { loyaltyAdminApi } from 'src/api/loyalty-admin';
import { useAuth } from 'src/hooks/use-auth';
import LoyaltyFiltersBar from 'src/sections/dashboard/admin/loyalty/LoyaltyFiltersBar';
import LoyaltyRulesTable from 'src/sections/dashboard/admin/loyalty/LoyaltyRulesTable';
import LoyaltyRuleFormDrawer from 'src/sections/dashboard/admin/loyalty/LoyaltyRuleFormDrawer';
import LoyaltyHistoryModal from 'src/sections/dashboard/admin/loyalty/LoyaltyHistoryModal';

const DEFAULT_FILTERS = {
  category: 'all',
  status: 'all',
  query: '',
};

const filterRules = (rules, filters) => {
  return rules.filter((rule) => {
    if (filters.category !== 'all' && rule.category !== filters.category) return false;
    if (filters.status === 'active' && !rule.enabled) return false;
    if (filters.status === 'inactive' && rule.enabled) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const nameMatch = (rule.displayName || '').toLowerCase().includes(q);
      const keyMatch = (rule.actionType || '').toLowerCase().includes(q);
      if (!nameMatch && !keyMatch) return false;
    }
    return true;
  });
};

const LoyaltyAdminPage = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRule, setHistoryRule] = useState(null);

  const [archiveConfirm, setArchiveConfirm] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      let data = await loyaltyAdminApi.getRules();

      if (data.length === 0) {
        await loyaltyAdminApi.seedDefaultRules(user?.email, user?.id);
        data = await loyaltyAdminApi.getRules();
        showSnackbar('Default loyalty rules initialized');
      } else {
        const oldFormatRules = data.filter((r) => !r.roleRules);
        if (oldFormatRules.length > 0) {
          await loyaltyAdminApi.migrateOldRules(oldFormatRules);
          data = await loyaltyAdminApi.getRules();
          showSnackbar(`Migrated ${oldFormatRules.length} rules to new format`);
        }
      }

      setRules(data);
    } catch (err) {
      showSnackbar('Failed to load rules: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, user]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const filteredRules = useMemo(() => filterRules(rules, filters), [rules, filters]);

  const handleToggle = useCallback(
    async (id, enabled) => {
      const rule = rules.find((r) => r.id === id);
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
      try {
        await loyaltyAdminApi.toggleRule(id, enabled, rule, user?.email, user?.id);
        showSnackbar(`Rule ${enabled ? 'enabled' : 'disabled'}`);
      } catch (err) {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)));
        showSnackbar('Error: ' + (err.message || err), 'error');
      }
    },
    [rules, user, showSnackbar]
  );

  const handleEdit = useCallback((rule) => {
    setEditingRule(rule);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingRule(null);
  }, []);

  const handleFormSaved = useCallback(() => {
    showSnackbar(editingRule ? 'Rule updated' : 'Rule created');
    loadRules();
  }, [editingRule, loadRules, showSnackbar]);

  const handleDuplicate = useCallback(
    async (rule) => {
      try {
        await loyaltyAdminApi.duplicateRule(rule, user?.email, user?.id);
        showSnackbar('Rule duplicated');
        loadRules();
      } catch (err) {
        showSnackbar('Duplicate error: ' + (err.message || err), 'error');
      }
    },
    [user, loadRules, showSnackbar]
  );

  const handleHistory = useCallback((rule) => {
    setHistoryRule(rule);
    setHistoryOpen(true);
  }, []);

  const handleHistoryClose = useCallback(() => {
    setHistoryOpen(false);
    setHistoryRule(null);
  }, []);

  const handleArchiveRequest = useCallback((rule) => {
    setArchiveConfirm(rule);
  }, []);

  const handleArchiveConfirm = useCallback(async () => {
    if (!archiveConfirm) return;
    const rule = archiveConfirm;
    setArchiveConfirm(null);
    try {
      await loyaltyAdminApi.archiveRule(rule.id, rule, user?.email, user?.id);
      showSnackbar('Rule archived');
      loadRules();
    } catch (err) {
      showSnackbar('Archive error: ' + (err.message || err), 'error');
    }
  }, [archiveConfirm, user, loadRules, showSnackbar]);

  const handleReorder = useCallback(
    async (sourceIndex, destIndex) => {
      const reordered = Array.from(rules);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destIndex, 0, removed);
      const updated = reordered.map((r, idx) => ({ ...r, sortOrder: idx + 1 }));
      setRules(updated);
      try {
        const updates = updated.map((r) => ({ id: r.id, sortOrder: r.sortOrder }));
        await loyaltyAdminApi.updateSortOrder(updates);
        showSnackbar('Order saved');
      } catch (err) {
        showSnackbar('Failed to save order: ' + (err.message || err), 'error');
        loadRules();
      }
    },
    [rules, loadRules, showSnackbar]
  );

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Loyalty Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Coin accrual rules
            </Typography>
          </Box>

          <LoyaltyFiltersBar filters={filters} onFiltersChange={setFilters} />

          {loading ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Loading...
            </Typography>
          ) : (
            <LoyaltyRulesTable
              rules={filteredRules}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onHistory={handleHistory}
              onArchive={handleArchiveRequest}
              onReorder={handleReorder}
            />
          )}
        </Stack>
      </Container>

      <LoyaltyRuleFormDrawer
        open={formOpen}
        rule={editingRule}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
        adminEmail={user?.email}
        adminId={user?.id}
      />

      <LoyaltyHistoryModal open={historyOpen} rule={historyRule} onClose={handleHistoryClose} />

      <Dialog
        open={!!archiveConfirm}
        onClose={() => setArchiveConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Archive rule</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive{' '}
            <strong>{archiveConfirm?.displayName || archiveConfirm?.actionType}</strong>? It will
            be hidden from the list.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleArchiveConfirm}>
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoyaltyAdminPage;
