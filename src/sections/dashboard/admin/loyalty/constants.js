export const LOYALTY_CATEGORIES = [
  { value: 'onboarding', label: 'Onboarding', color: 'primary' },
  { value: 'project', label: 'Projects', color: 'success' },
  { value: 'review', label: 'Reviews', color: 'warning' },
  { value: 'referral', label: 'Referrals', color: 'secondary' },
  { value: 'engagement', label: 'Engagement', color: 'info' },
  { value: 'admin', label: 'Administrative', color: 'error' },
];

export const LOYALTY_ROLE_TABS = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'partner', label: 'Partner' },
  { value: 'default', label: 'Default' },
];

export const AUDIT_ACTION_LABELS = {
  create: 'Created',
  update: 'Updated',
  delete: 'Archived',
  toggle: 'Toggled',
};

export const getCategoryOption = (value) =>
  LOYALTY_CATEGORIES.find((c) => c.value === value) || { label: value, color: 'default' };
