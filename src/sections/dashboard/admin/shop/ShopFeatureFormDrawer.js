import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const CATEGORIES = [
  { value: 'merch', label: 'Merch' },
  { value: 'service', label: 'IT Service' },
  { value: 'groupon', label: 'Groupon' },
  { value: 'construction', label: 'Construction' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'profile', label: 'Profile' },
  { value: 'ai', label: 'AI' },
  { value: 'analytics', label: 'Analytics' },
];

const ROLES = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'partner', label: 'Partner' },
];

const DEFAULT_FORM = {
  featureKey: '',
  displayName: '',
  description: '',
  category: 'merch',
  enabled: true,
  isOneTime: false,
  imageUrl: '',
  sortOrder: 99,
  pricing: { basePrice: 0, currency: 'COINS', discount: null, packages: null },
  availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 0 },
  metadata: {},
};

const ImageUploadField = memo(({ imageUrl, onUrlChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    setUploadError('');
    try {
      const { storage } = await import('src/libs/firebase');
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const fileRef = storageRef(storage, `shop-images/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onUrlChange(url);
    } catch (err) {
      setUploadError('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }, [onUrlChange]);

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={handleFileChange}
      />
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt="preview"
          sx={{ width: '100%', height: 140, objectFit: 'contain', borderRadius: 1, mb: 1, display: 'block', backgroundColor: 'action.hover' }}
        />
      )}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        disabled={uploading}
        startIcon={uploading ? <CircularProgress size={14} /> : null}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
      </Button>
      {uploadError && (
        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
          {uploadError}
        </Typography>
      )}
    </Box>
  );
});

ImageUploadField.displayName = 'ImageUploadField';

const ShopFeatureFormDrawer = memo(({ open, feature, onClose, onSaved, adminEmail }) => {
  const isEdit = !!feature;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (feature) {
      setForm({
        ...DEFAULT_FORM,
        ...feature,
        pricing: { ...DEFAULT_FORM.pricing, ...feature.pricing },
        availability: { ...DEFAULT_FORM.availability, ...feature.availability },
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError('');
  }, [feature, open]);

  const set = useCallback((path, value) => {
    setForm((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [path]: value };
      const [section, key] = parts;
      return { ...prev, [section]: { ...prev[section], [key]: value } };
    });
  }, []);

  const handleRoleToggle = useCallback((role, checked) => {
    setForm((prev) => {
      const roles = checked
        ? [...(prev.availability.roles || []), role]
        : (prev.availability.roles || []).filter((r) => r !== role);
      return { ...prev, availability: { ...prev.availability, roles } };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.displayName.trim()) { setError('Display name is required'); return; }
    if (!form.featureKey.trim()) { setError('Feature key is required'); return; }
    if (form.pricing.basePrice < 0) { setError('Price must be non-negative'); return; }

    setSaving(true);
    setError('');
    try {
      const { paidFeaturesApi } = await import('src/api/paid-features');
      const data = {
        ...form,
        featureKey: form.featureKey.toUpperCase().replace(/\s+/g, '_'),
        pricing: {
          ...form.pricing,
          basePrice: Number(form.pricing.basePrice),
        },
        availability: {
          ...form.availability,
          minBalance: Number(form.pricing.basePrice),
        },
      };

      if (isEdit) {
        await paidFeaturesApi.update(feature.id, data, adminEmail);
      } else {
        await paidFeaturesApi.create(data, adminEmail);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, feature, adminEmail, onSaved, onClose]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2 }}>
        <Typography variant="h6">{isEdit ? 'Edit Shop Item' : 'New Shop Item'}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
        <Stack spacing={3}>
          {error && (
            <Typography color="error" variant="body2">{error}</Typography>
          )}

          <Typography variant="subtitle2" color="text.secondary">BASIC INFO</Typography>

          <TextField
            label="Feature Key"
            value={form.featureKey}
            onChange={(e) => set('featureKey', e.target.value)}
            disabled={isEdit}
            helperText="Unique identifier, e.g. CTMASS_HOODIE"
            size="small"
            fullWidth
          />

          <TextField
            label="Display Name"
            value={form.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            required
            size="small"
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Image</Typography>
            <ImageUploadField
              imageUrl={form.imageUrl}
              onUrlChange={(url) => set('imageUrl', url)}
            />
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              label="Category"
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
            size="small"
            fullWidth
          />

          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => set('enabled', e.target.checked)}
                />
              }
              label="Enabled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isOneTime}
                  onChange={(e) => set('isOneTime', e.target.checked)}
                />
              }
              label="One-time purchase"
            />
          </Stack>

          <Divider />
          <Typography variant="subtitle2" color="text.secondary">PRICING</Typography>

          <TextField
            label="Base Price"
            type="number"
            value={form.pricing.basePrice}
            onChange={(e) => set('pricing.basePrice', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">coins</InputAdornment>,
            }}
            size="small"
            fullWidth
          />

          <Divider />
          <Typography variant="subtitle2" color="text.secondary">AVAILABILITY</Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">
              <Typography variant="body2">Available roles</Typography>
            </FormLabel>
            <FormGroup row>
              {ROLES.map((role) => (
                <FormControlLabel
                  key={role.value}
                  control={
                    <Checkbox
                      checked={(form.availability.roles || []).includes(role.value)}
                      onChange={(e) => handleRoleToggle(role.value, e.target.checked)}
                      size="small"
                    />
                  }
                  label={role.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={form.availability.requireVerified}
                onChange={(e) => set('availability.requireVerified', e.target.checked)}
                size="small"
              />
            }
            label="Require verified profile"
          />
        </Stack>
      </Box>

      <Divider />
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
        </Button>
      </Stack>
    </Drawer>
  );
});

ShopFeatureFormDrawer.displayName = 'ShopFeatureFormDrawer';

export default ShopFeatureFormDrawer;
