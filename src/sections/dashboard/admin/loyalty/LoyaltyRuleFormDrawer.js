import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { loyaltyAdminApi } from 'src/api/loyalty-admin';
import { LOYALTY_CATEGORIES, LOYALTY_ROLE_TABS } from './constants';

const DEFAULT_ROLE_RULE = { coins: 0, enabled: false };
const DEFAULT_FORM = {
  actionType: '',
  displayNameRu: '',
  displayName: '',
  descriptionRu: '',
  description: '',
  category: '',
  enabled: true,
  maxPerUser: '',
  cooldownDays: '',
  roleRules: {
    homeowner: { ...DEFAULT_ROLE_RULE },
    contractor: { ...DEFAULT_ROLE_RULE },
    partner: { ...DEFAULT_ROLE_RULE },
    default: { coins: 0 },
  },
};

const normalizeFormData = (rule) => {
  if (!rule) return DEFAULT_FORM;
  return {
    actionType: rule.actionType || rule.id || '',
    displayNameRu: rule.displayNameRu || '',
    displayName: rule.displayName || '',
    descriptionRu: rule.descriptionRu || '',
    description: rule.description || '',
    category: rule.category || '',
    enabled: rule.enabled !== false,
    maxPerUser: rule.maxPerUser != null ? String(rule.maxPerUser) : '',
    cooldownDays: rule.cooldownDays != null ? String(rule.cooldownDays) : '',
    roleRules: {
      homeowner: rule.roleRules?.homeowner || { ...DEFAULT_ROLE_RULE },
      contractor: rule.roleRules?.contractor || { ...DEFAULT_ROLE_RULE },
      partner: rule.roleRules?.partner || { ...DEFAULT_ROLE_RULE },
      default: rule.roleRules?.default || { coins: rule.coinsAwarded ?? 0 },
    },
  };
};

const RoleRuleTab = memo(({ roleKey, value, onChange, isDefault }) => {
  const handleEnabledChange = useCallback(
    (e) => {
      onChange(roleKey, { ...value, enabled: e.target.checked });
    },
    [onChange, roleKey, value]
  );

  const handleCoinsChange = useCallback(
    (e) => {
      const num = parseInt(e.target.value, 10);
      onChange(roleKey, { ...value, coins: isNaN(num) ? 0 : Math.max(0, num) });
    },
    [onChange, roleKey, value]
  );

  return (
    <Stack spacing={2} sx={{ pt: 2 }}>
      {!isDefault && (
        <FormControlLabel
          control={<Switch checked={!!value?.enabled} onChange={handleEnabledChange} />}
          label="Available for this role"
        />
      )}
      <TextField
        label="Coins"
        type="number"
        value={value?.coins ?? 0}
        onChange={handleCoinsChange}
        disabled={!isDefault && !value?.enabled}
        inputProps={{ min: 0, step: 1 }}
        size="small"
        fullWidth
      />
    </Stack>
  );
});

RoleRuleTab.displayName = 'RoleRuleTab';

const LoyaltyRuleFormDrawer = ({ open, rule, onClose, onSaved, adminEmail, adminId }) => {
  const isEdit = !!rule;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(normalizeFormData(rule));
      setErrors({});
      setActiveTab(0);
    }
  }, [open, rule]);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleRoleRuleChange = useCallback((roleKey, roleValue) => {
    setForm((prev) => ({
      ...prev,
      roleRules: { ...prev.roleRules, [roleKey]: roleValue },
    }));
  }, []);

  const validate = useCallback(async () => {
    const errs = {};
    if (!form.actionType.trim()) {
      errs.actionType = 'Required';
    } else if (!/^[A-Z0-9_]+$/.test(form.actionType)) {
      errs.actionType = 'Only uppercase letters, digits, and underscores (e.g. POST_PROJECT)';
    } else if (!isEdit) {
      const isUnique = await loyaltyAdminApi.checkActionTypeUnique(form.actionType);
      if (!isUnique) errs.actionType = 'This action key already exists';
    }
    if (!form.displayNameRu.trim()) errs.displayNameRu = 'Required';
    if (form.displayNameRu.length > 100) errs.displayNameRu = 'Max 100 characters';
    if (form.descriptionRu.length > 500) errs.descriptionRu = 'Max 500 characters';
    if (!form.category) errs.category = 'Required';
    if (
      form.maxPerUser !== '' &&
      (isNaN(parseInt(form.maxPerUser)) || parseInt(form.maxPerUser) < 1)
    ) {
      errs.maxPerUser = 'Must be an integer >= 1 or empty';
    }
    if (
      form.cooldownDays !== '' &&
      (isNaN(parseInt(form.cooldownDays)) || parseInt(form.cooldownDays) < 1)
    ) {
      errs.cooldownDays = 'Must be an integer >= 1 or empty';
    }
    const anyRoleEnabled =
      form.roleRules.homeowner?.enabled ||
      form.roleRules.contractor?.enabled ||
      form.roleRules.partner?.enabled;
    if (!anyRoleEnabled) errs.roles = 'At least one role must be enabled';
    return errs;
  }, [form, isEdit]);

  const handleSave = useCallback(async () => {
    const errs = await validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const data = {
        actionType: form.actionType.trim().toUpperCase(),
        displayNameRu: form.displayNameRu.trim(),
        displayName: form.displayName.trim(),
        descriptionRu: form.descriptionRu.trim(),
        description: form.description.trim(),
        category: form.category,
        enabled: form.enabled,
        maxPerUser: form.maxPerUser !== '' ? parseInt(form.maxPerUser) : null,
        cooldownDays: form.cooldownDays !== '' ? parseInt(form.cooldownDays) : null,
        roleRules: form.roleRules,
        sortOrder: rule?.sortOrder ?? 999,
      };
      if (isEdit) {
        await loyaltyAdminApi.updateRule(rule.id, data, rule, adminEmail, adminId);
      } else {
        await loyaltyAdminApi.createRule(data, adminEmail, adminId);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors({ general: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, rule, validate, onSaved, onClose, adminEmail, adminId]);

  const actionTypeValue = useMemo(
    () => (isEdit ? form.actionType : form.actionType.toUpperCase()),
    [isEdit, form.actionType]
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            {isEdit ? 'Edit rule' : 'Add rule'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Action key (actionType)"
              value={actionTypeValue}
              onChange={(e) => handleFieldChange('actionType', e.target.value.toUpperCase())}
              disabled={isEdit}
              error={!!errors.actionType}
              helperText={errors.actionType || 'e.g. POST_PROJECT'}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Name"
              value={form.displayNameRu}
              onChange={(e) => handleFieldChange('displayNameRu', e.target.value)}
              error={!!errors.displayNameRu}
              helperText={errors.displayNameRu}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.descriptionRu}
              onChange={(e) => handleFieldChange('descriptionRu', e.target.value)}
              error={!!errors.descriptionRu}
              helperText={errors.descriptionRu}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
            <FormControl size="small" fullWidth error={!!errors.category} required>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                {LOYALTY_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                />
              }
              label="Rule is active"
            />

            <Divider />
            <Typography variant="subtitle2">Role settings</Typography>
            {errors.roles && (
              <Typography variant="caption" color="error">
                {errors.roles}
              </Typography>
            )}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable">
              {LOYALTY_ROLE_TABS.map((tab) => (
                <Tab key={tab.value} label={tab.label} />
              ))}
            </Tabs>
            {LOYALTY_ROLE_TABS.map((tab, idx) => (
              <Box key={tab.value} hidden={activeTab !== idx}>
                {activeTab === idx && (
                  <RoleRuleTab
                    roleKey={tab.value}
                    value={form.roleRules[tab.value]}
                    onChange={handleRoleRuleChange}
                    isDefault={tab.value === 'default'}
                  />
                )}
              </Box>
            ))}

            <Divider />
            <Typography variant="subtitle2">Limits</Typography>
            <TextField
              label="Max per user"
              value={form.maxPerUser}
              onChange={(e) => handleFieldChange('maxPerUser', e.target.value)}
              error={!!errors.maxPerUser}
              helperText={errors.maxPerUser || 'Leave empty for no limit'}
              type="number"
              size="small"
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />
            <TextField
              label="Cooldown (days)"
              value={form.cooldownDays}
              onChange={(e) => handleFieldChange('cooldownDays', e.target.value)}
              error={!!errors.cooldownDays}
              helperText={errors.cooldownDays || 'Leave empty for no cooldown'}
              type="number"
              size="small"
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />

            {errors.general && (
              <Typography variant="body2" color="error">
                {errors.general}
              </Typography>
            )}
          </Stack>
        </Box>

        <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default memo(LoyaltyRuleFormDrawer);
