import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { loyaltyUserAdminApi } from 'src/api/loyalty-user-admin';
import { emailService } from 'src/service/email-service';
import { useAuth } from 'src/hooks/use-auth';
import UserSearchBar from 'src/sections/dashboard/admin/loyalty-users/UserSearchBar';
import UserProfileCard from 'src/sections/dashboard/admin/loyalty-users/UserProfileCard';
import UserTransactionsTable from 'src/sections/dashboard/admin/loyalty-users/UserTransactionsTable';
import ManualAdjustmentDialog from 'src/sections/dashboard/admin/loyalty-users/ManualAdjustmentDialog';
import ConsistencyCheckDialog from 'src/sections/dashboard/admin/loyalty-users/ConsistencyCheckDialog';
import TransactionDetailModal from 'src/sections/dashboard/admin/loyalty-users/TransactionDetailModal';

const LoyaltyUsersPage = () => {
  const { user: adminUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState('award');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const [consistencyOpen, setConsistencyOpen] = useState(false);
  const [detailTx, setDetailTx] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadTransactions = useCallback(async (userId) => {
    setTxLoading(true);
    try {
      const all = await loyaltyUserAdminApi.getAllTransactionsForUser(userId);
      setTransactions(all);
    } catch (err) {
      showSnackbar('Failed to load transactions: ' + (err.message || err), 'error');
    } finally {
      setTxLoading(false);
    }
  }, [showSnackbar]);

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const profile = await loyaltyUserAdminApi.getUserProfile(userId);
      if (profile) {
        setSelectedUser(profile);
        await loadTransactions(userId);
      }
    } catch (err) {
      showSnackbar('Failed to load user: ' + (err.message || err), 'error');
    }
  }, [loadTransactions, showSnackbar]);

  useEffect(() => {
    const uid = searchParams.get('userId');
    if (uid && (!selectedUser || selectedUser.id !== uid)) {
      loadUserProfile(uid);
    }
  }, [searchParams, loadUserProfile, selectedUser]);

  const handleUserSelect = useCallback(async (user) => {
    setSelectedUser(user);
    setTransactions([]);
    setSearchParams({ userId: user.id });
    await loadTransactions(user.id);
  }, [setSearchParams, loadTransactions]);

  const handleBack = useCallback(() => {
    setSelectedUser(null);
    setTransactions([]);
    setSearchParams({});
  }, [setSearchParams]);

  const handleOpenAward = useCallback(() => {
    setAdjustMode('award');
    setAdjustDialogOpen(true);
  }, []);

  const handleOpenDeduct = useCallback(() => {
    setAdjustMode('deduct');
    setAdjustDialogOpen(true);
  }, []);

  const handleAdjustSubmit = useCallback(async ({ amount, reason, notifyUser }) => {
    setAdjustSubmitting(true);
    try {
      await loyaltyUserAdminApi.manualAdjustment({
        userId: selectedUser.id,
        userEmail: selectedUser.email,
        amount,
        reason,
        notifyUser,
        adminId: adminUser?.id || adminUser?.uid,
        adminEmail: adminUser?.email,
      });

      if (notifyUser && selectedUser.email) {
        const currentBalance = selectedUser.loyaltyBalance || 0;
        const newBalance = currentBalance + amount;
        try {
          await emailService.sendCoinAdjustmentEmail({
            userName: selectedUser.businessName || selectedUser.displayName || selectedUser.email,
            userEmail: selectedUser.email,
            amount,
            newBalance,
            reason,
          });
        } catch (emailErr) {
          console.error('[CoinAdjustment] email failed:', emailErr);
        }
      }

      showSnackbar(`Successfully ${amount > 0 ? 'awarded' : 'deducted'} ${Math.abs(amount).toLocaleString()} coins`);
      setAdjustDialogOpen(false);
      await loadUserProfile(selectedUser.id);
    } catch (err) {
      showSnackbar(err.message || 'Operation failed', 'error');
    } finally {
      setAdjustSubmitting(false);
    }
  }, [selectedUser, adminUser, showSnackbar, loadUserProfile]);

  const handleFrozenToggle = useCallback(async (frozen) => {
    try {
      await loyaltyUserAdminApi.toggleBalanceFrozen(selectedUser.id, frozen);
      setSelectedUser((prev) => ({ ...prev, loyaltyBalanceFrozen: frozen }));
      showSnackbar(`Balance ${frozen ? 'frozen' : 'unfrozen'} successfully`);
    } catch (err) {
      showSnackbar('Failed to update freeze status: ' + (err.message || err), 'error');
    }
  }, [selectedUser, showSnackbar]);

  const handleConsistencyFixed = useCallback(async () => {
    if (!selectedUser) return;
    await loadUserProfile(selectedUser.id);
    showSnackbar('Balance corrected successfully');
  }, [selectedUser, loadUserProfile, showSnackbar]);

  const adminEmail = useMemo(() => adminUser?.email || '', [adminUser]);

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">User Loyalty Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Search users, view balances and transaction history, manage coins manually
            </Typography>
          </Box>

          {!selectedUser ? (
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search by email, display name, or paste a user ID directly
              </Typography>
              <UserSearchBar onUserSelect={handleUserSelect} />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  Back to Search
                </Button>

                <UserProfileCard
                  user={selectedUser}
                  onAward={handleOpenAward}
                  onDeduct={handleOpenDeduct}
                  onConsistency={() => setConsistencyOpen(true)}
                  onFrozenToggle={handleFrozenToggle}
                />
              </Box>

              <UserTransactionsTable
                transactions={transactions}
                userId={selectedUser.id}
                loading={txLoading}
                onRowClick={setDetailTx}
              />
            </Stack>
          )}
        </Stack>
      </Container>

      <ManualAdjustmentDialog
        open={adjustDialogOpen}
        mode={adjustMode}
        user={selectedUser}
        onClose={() => setAdjustDialogOpen(false)}
        onSubmit={handleAdjustSubmit}
        submitting={adjustSubmitting}
      />

      <ConsistencyCheckDialog
        open={consistencyOpen}
        user={selectedUser}
        adminEmail={adminEmail}
        onClose={() => setConsistencyOpen(false)}
        onFixed={handleConsistencyFixed}
      />

      <TransactionDetailModal
        open={!!detailTx}
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoyaltyUsersPage;
