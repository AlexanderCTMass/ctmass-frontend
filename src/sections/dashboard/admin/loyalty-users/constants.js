export const ACTION_TYPE_LABELS = {
  REGISTER: 'Registration Bonus',
  COMPLETE_PROFILE: 'Profile Completion',
  POST_PROJECT: 'Post a Project',
  POST_PROJECT_WITH_PHOTOS: 'Post Project with Photos',
  ADD_PORTFOLIO: 'Portfolio Item Added',
  REFERRAL_SIGNUP: 'Referral — New Signup',
  REFERRAL_PROJECT: 'Referral — Project Posted',
  FIRST_REVIEW: 'First Review',
  RECEIVE_REVIEW: 'Received a Review',
  GIVE_REVIEW: 'Gave a Review',
  DEDUCTION: 'Deduction',
  ADMIN_MANUAL_ADJUSTMENT: 'Manual Adjustment',
  SYSTEM_BALANCE_CORRECTION: 'System Balance Correction',
};

export const ROLE_LABELS = {
  homeowner: 'Homeowner',
  contractor: 'Contractor',
  partner: 'Partner',
};

export const ROLE_COLORS = {
  homeowner: 'primary',
  contractor: 'success',
  partner: 'secondary',
};

export const getActionLabel = (actionType) =>
  ACTION_TYPE_LABELS[actionType] || actionType;

export const getRoleColor = (role) => ROLE_COLORS[role] || 'default';
export const getRoleLabel = (role) => ROLE_LABELS[role] || role;
