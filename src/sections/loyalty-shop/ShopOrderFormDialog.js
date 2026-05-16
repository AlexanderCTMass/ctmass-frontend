import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from 'src/libs/firebase';
import { profileApi } from 'src/api/profile';
import { emailService } from 'src/service/email-service';
import { sendNotificationToUser } from 'src/notificationApi';
import { SHOP_CATEGORIES } from 'src/api/paid-features';
import { isValidUSPhone } from 'src/utils/validation/phone';

const STEP = { FORM: 'form', SUBMITTING: 'submitting', DONE: 'done' };

const US_SIZES_APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const getSizeOptions = (feature) => {
  const raw = feature?.metadata?.sizeOptions;
  if (Array.isArray(raw)) return raw;
  return US_SIZES_APPAREL;
};

const generateTicketNumber = () => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${y}${m}${day}-${rand}`;
};

const getCategoryConfig = (category) => {
  switch (category) {
    case SHOP_CATEGORIES.SPECIAL_OFFER:
      return {
        subjectPrefix: 'New Deal',
        showAddress: true,
        showItems: false,
        title: 'Submit Your Offer',
        intro:
          'Tell us about the deal you want to post. Our team will reach out to confirm details and publish it.',
        submitLabel: 'Submit Offer',
        messageLabel: 'Your Offer / Message',
        messagePlaceholder:
          'Describe your service, product, or quick deal — pricing, terms, availability...',
        messageRequired: true,
      };
    case SHOP_CATEGORIES.MERCHANDISE:
      return {
        subjectPrefix: 'New Order',
        showAddress: true,
        showItems: true,
        title: 'Place Your Order',
        intro:
          'Choose sizes and quantities for your order. Our team will confirm shipping details with you.',
        submitLabel: 'Confirm Order',
        messageLabel: 'Additional Notes (optional)',
        messagePlaceholder: 'Anything you want us to know about your order?',
        messageRequired: false,
      };
    case SHOP_CATEGORIES.CONSTRUCTION:
      return {
        subjectPrefix: 'New Order',
        showAddress: true,
        showItems: false,
        title: 'Request This Construction Deal',
        intro:
          'Tell us a bit about your project — preferred dates, site details, any photos. We will reach out shortly.',
        submitLabel: 'Confirm Order',
        messageLabel: 'Project Details / Message',
        messagePlaceholder: 'Describe your project, preferred dates, address details...',
        messageRequired: true,
      };
    case SHOP_CATEGORIES.IT_SERVICES:
      return {
        subjectPrefix: 'New Order',
        showAddress: false,
        showItems: false,
        title: 'Request This Service',
        intro:
          'Share your idea — goals, scope, reference links. Our team will get back to you to scope it out.',
        submitLabel: 'Confirm Order',
        messageLabel: 'Project Brief / Message',
        messagePlaceholder: 'Goals, scope, deadlines, reference links...',
        messageRequired: true,
      };
    default:
      return {
        subjectPrefix: 'New Order',
        showAddress: true,
        showItems: false,
        title: 'Confirm Purchase',
        intro: 'Please review your order details.',
        submitLabel: 'Confirm Order',
        messageLabel: 'Message (optional)',
        messagePlaceholder: 'Anything we should know?',
        messageRequired: false,
      };
  }
};

const formatAddress = (profile) => {
  if (!profile) return '';
  if (typeof profile.address === 'string' && profile.address.trim()) return profile.address.trim();
  if (profile.location?.place_name) return profile.location.place_name;
  if (profile.address && typeof profile.address === 'object') {
    const parts = [
      profile.address.street,
      profile.address.city,
      profile.address.state,
      profile.address.zip,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

const ShopOrderFormDialog = memo(
  ({ open, onClose, feature, userBalance, userId, userRole, user, onPurchased }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const config = useMemo(() => getCategoryConfig(feature?.category), [feature]);
    const sizeOptions = useMemo(() => getSizeOptions(feature), [feature]);
    const hasSizes = sizeOptions.length > 0;

    const packages = feature?.pricing?.packages || [];
    const hasPackages = packages.length > 0;

    const [step, setStep] = useState(STEP.FORM);
    const [error, setError] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [ticketNumber, setTicketNumber] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [items, setItems] = useState([{ size: hasSizes ? sizeOptions[0] : '', quantity: 1 }]);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const clearFieldError = useCallback((field) => {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }, []);

    useEffect(() => {
      if (!open) return;
      setItems([{ size: hasSizes ? sizeOptions[0] : '', quantity: 1 }]);
    }, [open, hasSizes, sizeOptions]);

    useEffect(() => {
      if (!open || !hasPackages || selectedPackageId) return;
      const recommended = packages.find((p) => p.isRecommended);
      setSelectedPackageId(recommended?.id || packages[0]?.id || null);
    }, [open, hasPackages, packages, selectedPackageId]);

    const selectedPackage = hasPackages
      ? packages.find((p) => p.id === selectedPackageId) || null
      : null;

    const unitPrice = selectedPackage ? selectedPackage.price : feature?.pricing?.basePrice ?? 0;
    const totalQuantity = config.showItems
      ? items.reduce((sum, it) => sum + Math.max(1, Number(it.quantity) || 0), 0)
      : 1;
    const price = unitPrice * totalQuantity;
    const isFree = price === 0;
    const balanceAfter = userBalance - price;
    const canAfford = isFree || userBalance >= price;

    useEffect(() => {
      if (!open || !userId) return;
      let cancelled = false;
      setProfileLoading(true);
      (async () => {
        try {
          const snap = await profileApi.getSnap(userId);
          if (cancelled) return;
          const data = snap.exists() ? snap.data() : {};
          setPhone((prev) => prev || data.phone || user?.phone || '');
          setEmail((prev) => prev || data.email || user?.email || '');
          setAddress((prev) => prev || formatAddress(data) || formatAddress(user) || '');
        } catch (e) {
          if (!cancelled) {
            setPhone((prev) => prev || user?.phone || '');
            setEmail((prev) => prev || user?.email || '');
            setAddress((prev) => prev || formatAddress(user) || '');
          }
        } finally {
          if (!cancelled) setProfileLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [open, userId, user]);

    const resetState = useCallback(() => {
      setStep(STEP.FORM);
      setError('');
      setSelectedPackageId(null);
      setMessage('');
      setPhone('');
      setEmail('');
      setAddress('');
      setItems([{ size: hasSizes ? sizeOptions[0] : '', quantity: 1 }]);
      setFiles([]);
      setTicketNumber(null);
      setFieldErrors({});
    }, [hasSizes, sizeOptions]);

    const handleClose = useCallback(() => {
      if (step === STEP.SUBMITTING) return;
      resetState();
      onClose?.();
    }, [step, onClose, resetState]);

    const handleFilesPicked = useCallback(async (e) => {
      const picked = Array.from(e.target.files || []);
      if (!picked.length) return;
      setUploading(true);
      setError('');
      try {
        const uploads = picked.map(async (file) => {
          const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const path = `shop-orders/${userId || 'anon'}/${Date.now()}_${safeName}`;
          const sRef = storageRef(storage, path);
          await uploadBytes(sRef, file, { contentType: file.type });
          const url = await getDownloadURL(sRef);
          return { name: file.name, url, size: file.size, type: file.type };
        });
        const uploaded = await Promise.all(uploads);
        setFiles((prev) => [...prev, ...uploaded]);
      } catch (err) {
        setError('Failed to upload file: ' + (err.message || err));
      } finally {
        setUploading(false);
        if (e.target) e.target.value = '';
      }
    }, [userId]);

    const handleRemoveFile = useCallback((url) => {
      setFiles((prev) => prev.filter((f) => f.url !== url));
    }, []);

    const handleItemSizeChange = (idx, value) => {
      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, size: value } : it)));
    };

    const handleItemQuantityChange = (idx, delta) => {
      setItems((prev) =>
        prev.map((it, i) =>
          i === idx ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it,
        ),
      );
    };

    const handleAddItem = () => {
      setItems((prev) => [...prev, { size: hasSizes ? sizeOptions[0] : '', quantity: 1 }]);
    };

    const handleRemoveItem = (idx) => {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    };

    const validate = () => {
      const errors = {};
      const trimmedEmail = email?.trim() || '';
      const trimmedPhone = phone?.trim() || '';

      if (!trimmedEmail) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = 'Enter a valid email address';
      }

      if (!trimmedPhone) {
        errors.phone = 'Phone is required';
      } else if (!isValidUSPhone(trimmedPhone)) {
        errors.phone = 'Enter a valid US phone number (+1 and 10 digits)';
      }

      if (config.showAddress && !address?.trim()) {
        errors.address = 'Address is required';
      }
      if (config.messageRequired && !message?.trim()) {
        errors.message = 'Message is required';
      }

      let topLevelError = null;
      if (config.showItems && items.length === 0) {
        topLevelError = 'Please add at least one item';
      } else if (!canAfford) {
        topLevelError = 'Not enough coins to complete this purchase';
      }

      return { errors, topLevelError };
    };

    const handleSubmit = useCallback(async () => {
      const { errors, topLevelError } = validate();
      if (Object.keys(errors).length > 0 || topLevelError) {
        setFieldErrors(errors);
        setError(topLevelError || 'Please fix the highlighted fields and try again.');
        return;
      }
      setFieldErrors({});
      setStep(STEP.SUBMITTING);
      setError('');

      const ticket = generateTicketNumber();
      setTicketNumber(ticket);

      const formData = {
        message: message?.trim() || '',
        phone: phone?.trim() || '',
        email: email?.trim() || '',
        ...(config.showAddress ? { address: address?.trim() || '' } : {}),
        ...(config.showItems ? { items } : {}),
        attachments: files,
        ticketNumber: ticket,
        submittedAt: new Date().toISOString(),
      };

      try {
        const { paidFeaturesApi } = await import('src/api/paid-features');
        await paidFeaturesApi.purchaseFeature(userId, userRole, feature, selectedPackage, {
          formData,
          ticketNumber: ticket,
          totalPrice: price,
          totalQuantity,
        });

        try {
          await emailService.sendShopOrderToAdmin({
            ticketNumber: ticket,
            feature,
            formData,
            user: { ...user, id: userId },
            packageInfo: selectedPackage,
            price,
            subjectPrefix: config.subjectPrefix,
          });
        } catch (e) {
          console.error('[ShopOrder] admin email failed:', e);
        }

        try {
          await emailService.sendShopOrderToUser({
            ticketNumber: ticket,
            feature,
            formData,
            items: config.showItems ? items : null,
            price,
            packageInfo: selectedPackage,
            isFree,
          });
        } catch (e) {
          console.error('[ShopOrder] user email failed:', e);
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
        setError(err.message || 'Something went wrong, please try again.');
        setStep(STEP.FORM);
      }
    }, [
      message,
      phone,
      email,
      address,
      items,
      files,
      feature,
      userId,
      userRole,
      selectedPackage,
      price,
      isFree,
      config,
      user,
      onPurchased,
      canAfford,
    ]);

    if (!feature) return null;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        disableScrollLock
        PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {step === STEP.DONE ? 'Order Placed!' : config.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.displayName} · {feature.category}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" disabled={step === STEP.SUBMITTING}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {step === STEP.DONE ? (
            <Stack spacing={2} alignItems="center" py={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
              <Typography variant="h6" textAlign="center">
                Your order <strong>{feature.displayName}</strong> has been placed!
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Ticket <strong>#{ticketNumber}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                We've sent a confirmation to <strong>{email}</strong> and our team is on it.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <Typography variant="body2" color="text.secondary">
                {config.intro}
              </Typography>

              {hasPackages && (
                <FormControl>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Select package
                  </Typography>
                  <RadioGroup
                    value={selectedPackageId || ''}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                  >
                    {packages.map((pkg) => (
                      <FormControlLabel
                        key={pkg.id}
                        value={pkg.id}
                        control={<Radio size="small" />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">
                              {pkg.displayName} — {pkg.price.toLocaleString()} coins
                            </Typography>
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

              {config.showItems && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {hasSizes ? 'Items' : 'Quantity'}
                  </Typography>
                  <Stack spacing={1.5}>
                    {items.map((it, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="center">
                        {hasSizes && (
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Size (US)</InputLabel>
                            <Select
                              label="Size (US)"
                              value={it.size}
                              onChange={(e) => handleItemSizeChange(idx, e.target.value)}
                            >
                              {sizeOptions.map((s) => (
                                <MenuItem key={s} value={s}>
                                  {s}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                        >
                          <IconButton size="small" onClick={() => handleItemQuantityChange(idx, -1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
                            {it.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleItemQuantityChange(idx, 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        {hasSizes && items.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    {hasSizes && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddItem}
                        size="small"
                        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                      >
                        Add another size
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}

              <TextField
                label={config.messageLabel}
                placeholder={config.messagePlaceholder}
                multiline
                minRows={3}
                maxRows={8}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearFieldError('message');
                }}
                required={config.messageRequired}
                fullWidth
                error={Boolean(fieldErrors.message)}
                helperText={fieldErrors.message || ''}
              />

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    component="label"
                    startIcon={uploading ? <CircularProgress size={16} /> : <AttachFileIcon />}
                    variant="outlined"
                    size="small"
                    disabled={uploading}
                    sx={{ textTransform: 'none' }}
                  >
                    Attach files
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFilesPicked}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Photos, PDFs or any reference files
                  </Typography>
                </Stack>
                {files.length > 0 && (
                  <Stack spacing={0.75}>
                    {files.map((f) => (
                      <Stack
                        key={f.url}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 'action.hover',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          📎 {f.name}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveFile(f.url)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              <Typography variant="subtitle2">Contact details</Typography>
              {profileLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Loading your profile…
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Pre-filled from your profile — feel free to update for this order.
                </Typography>
              )}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                required
                fullWidth
                size="small"
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || ''}
              />
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                required
                fullWidth
                size="small"
                placeholder="+1 (555) 123-4567"
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone || 'US number: +1 followed by 10 digits'}
              />
              {config.showAddress && (
                <TextField
                  label="Address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  required
                  fullWidth
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={3}
                  error={Boolean(fieldErrors.address)}
                  helperText={fieldErrors.address || ''}
                />
              )}

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {isFree ? (
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        Free
                      </Typography>
                    ) : (
                      <>
                        <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 16 }} />
                        <Typography variant="body2" fontWeight={700}>
                          {price.toLocaleString()} coins
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Stack>
                {!isFree && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Your balance
                      </Typography>
                      <Typography variant="body2">{userBalance.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Balance after
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={canAfford ? 'text.primary' : 'error.main'}
                      >
                        {balanceAfter.toLocaleString()}
                      </Typography>
                    </Stack>
                  </>
                )}
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
            <Button onClick={handleClose} variant="contained">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={handleClose} disabled={step === STEP.SUBMITTING}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={step === STEP.SUBMITTING || uploading}
                sx={{
                  backgroundColor: '#FFC107',
                  color: '#1a237e',
                  '&:hover': { backgroundColor: '#FFB300' },
                  '&.Mui-disabled': { backgroundColor: 'rgba(255,193,7,0.4)', color: 'rgba(26,35,126,0.5)' },
                }}
              >
                {step === STEP.SUBMITTING ? 'Submitting…' : config.submitLabel}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  },
);

ShopOrderFormDialog.displayName = 'ShopOrderFormDialog';

export default ShopOrderFormDialog;
