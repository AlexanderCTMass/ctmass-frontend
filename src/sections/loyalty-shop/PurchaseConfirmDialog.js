import { memo, useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const STEP = { CONFIRM: 'confirm', BUYING: 'buying', DONE: 'done' };

const PurchaseConfirmDialog = memo(({ open, onClose, feature, userBalance, userId, userRole, onPurchased }) => {
  const [step, setStep] = useState(STEP.CONFIRM);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [error, setError] = useState('');

  const packages = feature?.pricing?.packages || [];
  const hasPackages = packages.length > 0;

  const selectedPackage = hasPackages
    ? packages.find((p) => p.id === selectedPackageId) || null
    : null;

  const price = selectedPackage ? selectedPackage.price : (feature?.pricing?.basePrice ?? 0);
  const balanceAfter = userBalance - price;
  const canAfford = userBalance >= price;

  const handleBuy = useCallback(async () => {
    if (!feature || !canAfford) return;
    setStep(STEP.BUYING);
    setError('');
    try {
      const { paidFeaturesApi } = await import('src/api/paid-features');
      await paidFeaturesApi.purchaseFeature(userId, userRole, feature, selectedPackage);
      setStep(STEP.DONE);
      onPurchased?.();
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.');
      setStep(STEP.CONFIRM);
    }
  }, [feature, canAfford, userId, userRole, selectedPackage, onPurchased]);

  const handleClose = useCallback(() => {
    setStep(STEP.CONFIRM);
    setSelectedPackageId(null);
    setError('');
    onClose();
  }, [onClose]);

  if (!feature) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth disableScrollLock>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <MonetizationOnIcon sx={{ color: '#FFC107' }} />
          <Typography variant="h6">Confirm Purchase</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {step === STEP.DONE ? (
          <Stack spacing={2} alignItems="center" py={2}>
            <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'success.main' }} />
            <Typography variant="h6">Purchase Successful!</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              <strong>{feature.displayName}</strong> has been added to your account.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{feature.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
            </Box>

            {hasPackages && (
              <FormControl>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Select package</Typography>
                <RadioGroup
                  value={selectedPackageId || ''}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                >
                  <FormControlLabel
                    value=""
                    control={<Radio size="small" />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          Single generation — {feature.pricing.basePrice} coins
                        </Typography>
                      </Stack>
                    }
                  />
                  {packages.map((pkg) => (
                    <FormControlLabel
                      key={pkg.id}
                      value={pkg.id}
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">
                            {pkg.displayName} — {pkg.price} coins
                          </Typography>
                          {pkg.savingsPercent && (
                            <Chip label={`-${pkg.savingsPercent}%`} size="small" color="success" />
                          )}
                          {pkg.isRecommended && (
                            <Chip label="Recommended" size="small" color="primary" />
                          )}
                        </Stack>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Total price</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 16 }} />
                  <Typography variant="body2" fontWeight={700}>{price.toLocaleString()}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Your balance</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 16 }} />
                  <Typography variant="body2">{userBalance.toLocaleString()}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Balance after purchase</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MonetizationOnIcon sx={{ color: canAfford ? '#FFC107' : 'error.main', fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={canAfford ? 'text.primary' : 'error.main'}
                  >
                    {balanceAfter.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {!canAfford && (
              <Alert severity="error">Not enough coins to complete this purchase.</Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        {step === STEP.DONE ? (
          <Button onClick={handleClose} variant="contained">Close</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={step === STEP.BUYING}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBuy}
              disabled={!canAfford || step === STEP.BUYING}
              sx={{ backgroundColor: '#FFC107', color: '#1a237e', '&:hover': { backgroundColor: '#FFB300' } }}
            >
              {step === STEP.BUYING ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
});

PurchaseConfirmDialog.displayName = 'PurchaseConfirmDialog';

export default PurchaseConfirmDialog;
