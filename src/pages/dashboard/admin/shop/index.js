import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { paidFeaturesApi } from 'src/api/paid-features';
import { useAuth } from 'src/hooks/use-auth';
import ShopFeaturesTable from 'src/sections/dashboard/admin/shop/ShopFeaturesTable';
import ShopFeatureFormDrawer from 'src/sections/dashboard/admin/shop/ShopFeatureFormDrawer';

const ShopAdminPage = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    try {
      let data = await paidFeaturesApi.getAll();
      if (data.length === 0) {
        await paidFeaturesApi.seedDefaults(user?.email, user?.id);
        data = await paidFeaturesApi.getAll();
        showSnackbar('Default shop items initialized');
      }
      setFeatures(data);
    } catch (err) {
      showSnackbar('Failed to load items: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showSnackbar]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggle = useCallback(async (id, enabled) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled } : f)));
    try {
      await paidFeaturesApi.toggle(id, enabled, user?.email);
      showSnackbar(`Item ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !enabled } : f)));
      showSnackbar('Error: ' + (err.message || err), 'error');
    }
  }, [user, showSnackbar]);

  const handleEdit = useCallback((feature) => {
    setEditingFeature(feature);
    setFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingFeature(null);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingFeature(null);
  }, []);

  const handleFormSaved = useCallback(() => {
    showSnackbar(editingFeature ? 'Item updated' : 'Item created');
    loadFeatures();
  }, [editingFeature, loadFeatures, showSnackbar]);

  const handleDuplicate = useCallback(async (feature) => {
    try {
      const newKey = `${feature.featureKey}_COPY_${Date.now()}`;
      await paidFeaturesApi.create(
        { ...feature, featureKey: newKey, displayName: `${feature.displayName} (copy)`, enabled: false, sortOrder: 99 },
        user?.email
      );
      showSnackbar('Item duplicated');
      loadFeatures();
    } catch (err) {
      showSnackbar('Duplicate error: ' + (err.message || err), 'error');
    }
  }, [user, loadFeatures, showSnackbar]);

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4">Shop Management</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage items available in the CTMASS Coins shop
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Add Item
            </Button>
          </Stack>

          {loading ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Loading...
            </Typography>
          ) : (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
              <ShopFeaturesTable
                features={features}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
              />
            </Box>
          )}
        </Stack>
      </Container>

      <ShopFeatureFormDrawer
        open={formOpen}
        feature={editingFeature}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
        adminEmail={user?.email}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShopAdminPage;
