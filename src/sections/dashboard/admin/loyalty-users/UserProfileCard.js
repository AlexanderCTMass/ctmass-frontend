import { memo, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BugReportIcon from '@mui/icons-material/BugReport';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { getRoleColor, getRoleLabel } from './constants';

const StatBlock = memo(({ label, value, color }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h5" fontWeight={700} color={color || 'text.primary'}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
));

StatBlock.displayName = 'StatBlock';

const formatDate = (value) => {
  if (!value) return '—';
  const d = value?.toDate ? value.toDate() : new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const UserProfileCard = memo(({ user, onAward, onDeduct, onConsistency, onFrozenToggle }) => {
  const isFrozen = user.loyaltyBalanceFrozen || false;

  const handleFrozenChange = useCallback(
    (e) => {
      onFrozenToggle(e.target.checked);
    },
    [onFrozenToggle]
  );

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Avatar
                src={user.photoURL || undefined}
                sx={{ width: 80, height: 80, fontSize: 32 }}
              >
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user.displayName || '—'}
                </Typography>
                <Tooltip title={user.email || ''}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {user.email || '—'}
                  </Typography>
                </Tooltip>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {user.role && (
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                )}
                {isFrozen && (
                  <Chip
                    icon={<AcUnitIcon fontSize="small" />}
                    label="Frozen"
                    color="info"
                    size="small"
                  />
                )}
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Registered: {formatDate(user.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  ID: {user.id}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Balance
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h3" fontWeight={800} color="warning.main">
                  {(user.loyaltyBalance || 0).toLocaleString()}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  coins
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StatBlock
                    label="Total Earned"
                    value={user.loyaltyTotalEarned || 0}
                    color="success.main"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatBlock
                    label="Total Spent"
                    value={user.loyaltyTotalSpent || 0}
                    color="error.main"
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary">
                Last updated: {formatDate(user.loyaltyLastUpdated)}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddCircleOutlineIcon />}
                onClick={onAward}
                fullWidth
                disabled={isFrozen}
              >
                Award Coins
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RemoveCircleOutlineIcon />}
                onClick={onDeduct}
                fullWidth
                disabled={isFrozen}
              >
                Deduct Coins
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<BugReportIcon />}
                onClick={onConsistency}
                fullWidth
              >
                Check Consistency
              </Button>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={isFrozen}
                    onChange={handleFrozenChange}
                    color="info"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerifiedUserIcon fontSize="small" color={isFrozen ? 'info' : 'disabled'} />
                    <Typography variant="body2">Freeze Balance</Typography>
                  </Box>
                }
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

UserProfileCard.displayName = 'UserProfileCard';

export default UserProfileCard;
