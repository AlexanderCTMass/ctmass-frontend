import { memo, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getFeatureImages } from 'src/api/paid-features';
import { btn } from 'src/components/ctmass-ui';
import { BRAND } from 'src/theme/ctmass-tokens';
import { PackageOption, Receipt, ShopDialogHeader, shopDialogPaperSx, SuccessPanel } from './shop-dialog-kit';
import { emailService } from 'src/service/email-service';
import { sendNotificationToUser } from 'src/notificationApi';

const STEP = { CONFIRM: 'confirm', BUYING: 'buying', DONE: 'done' };

const generateTicketNumber = () => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${y}${m}${day}-${rand}`;
};

const PurchaseConfirmDialog = memo(({ open, onClose, feature, userBalance, userId, userRole, user, onPurchased }) => {
  const [step, setStep] = useState(STEP.CONFIRM);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [error, setError] = useState('');
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const packages = feature?.pricing?.packages || [];
  const hasPackages = packages.length > 0;

  useEffect(() => {
    if (!open || !hasPackages || selectedPackageId) return;
    const recommended = packages.find((p) => p.isRecommended);
    setSelectedPackageId(recommended?.id || packages[0]?.id || null);
  }, [open, hasPackages, packages, selectedPackageId]);

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
    const ticket = generateTicketNumber();
    try {
      const { paidFeaturesApi } = await import('src/api/paid-features');
      await paidFeaturesApi.purchaseFeature(userId, userRole, feature, selectedPackage, {
        ticketNumber: ticket,
      });

      try {
        await emailService.sendShopOrderToAdmin({
          ticketNumber: ticket,
          feature,
          formData: { email: user?.email || '', phone: user?.phone || '' },
          user: { ...user, id: userId },
          packageInfo: selectedPackage,
          price,
          subjectPrefix: 'New Order',
        });
      } catch (e) {
        console.error('[ShopOrder] admin email failed:', e);
      }

      if (user?.email) {
        try {
          await emailService.sendShopOrderToUser({
            ticketNumber: ticket,
            feature,
            formData: { email: user.email, phone: user.phone || '' },
            items: null,
            price,
            packageInfo: selectedPackage,
            isFree: price === 0,
          });
        } catch (e) {
          console.error('[ShopOrder] user email failed:', e);
        }
      }

      try {
        if (userId) {
          await sendNotificationToUser(
            userId,
            `Your order ${feature?.displayName || ''} placed`,
            `We've received your order (ticket #${ticket}). Our team is already on it and will follow up shortly.`,
            undefined,
            { type: 'shop_order', ticketNumber: ticket, featureKey: feature?.featureKey },
          );
        }
      } catch (e) {
        console.error('[ShopOrder] notification failed:', e);
      }

      setStep(STEP.DONE);
      onPurchased?.();
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.');
      setStep(STEP.CONFIRM);
    }
  }, [feature, canAfford, userId, userRole, selectedPackage, onPurchased, price, user]);

  const handleClose = useCallback(() => {
    setStep(STEP.CONFIRM);
    setSelectedPackageId(null);
    setError('');
    onClose();
  }, [onClose]);

  if (!feature) return null;

  return (
    <Dialog
      open={open}
      onClose={step === STEP.BUYING ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      disableScrollLock
      PaperProps={{ sx: shopDialogPaperSx }}
    >
      <ShopDialogHeader
        title={step === STEP.DONE ? 'Order placed' : 'Confirm your order'}
        subtitle={feature.displayName}
        image={getFeatureImages(feature)[0]}
        onClose={handleClose}
        disabled={step === STEP.BUYING}
      />
      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 3 }}>
        {step === STEP.DONE ? (
          <SuccessPanel title="Thank you">
            <strong>{feature.displayName}</strong> is on its way. We sent the details to your email and notifications.
          </SuccessPanel>
        ) : (
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            {feature.description && (
              <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: BRAND.muted }}>{feature.description}</Typography>
            )}

            {hasPackages && (
              <Box>
                <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 700, color: BRAND.ink }}>Choose a package</Typography>
                <Stack spacing={1} role="radiogroup" aria-label="Package">
                  {packages.map((pkg) => (
                    <PackageOption
                      key={pkg.id}
                      selected={pkg.id === selectedPackageId}
                      title={pkg.displayName}
                      price={pkg.price}
                      savingsPercent={pkg.savingsPercent}
                      recommended={pkg.isRecommended}
                      onSelect={() => setSelectedPackageId(pkg.id)}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Receipt
              rows={[
                { label: 'Your balance', value: userBalance },
                { label: 'Price', value: price },
                { label: 'Balance after', value: balanceAfter, strong: true, danger: !canAfford }
              ]}
            />

            {!canAfford && (
              <Alert severity="warning">
                You need {(price - userBalance).toLocaleString('en-US')} more coins for this reward.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="flex-end"
        spacing={1}
        sx={{
          px: { xs: 2.5, sm: 3 },
          pt: 2,
          pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 },
          borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}`
        }}
      >
        {step === STEP.DONE ? (
          <Button onClick={handleClose} sx={btn.navy}>Done</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={step === STEP.BUYING} sx={btn.text}>Cancel</Button>
            <Button
              onClick={handleBuy}
              disabled={!canAfford || step === STEP.BUYING}
              sx={{ ...btn.green, px: 3 }}
            >
              {step === STEP.BUYING ? 'Placing order...' : 'Spend coins'}
            </Button>
          </>
        )}
      </Stack>
    </Dialog>
  );
});

PurchaseConfirmDialog.displayName = 'PurchaseConfirmDialog';

export default PurchaseConfirmDialog;
