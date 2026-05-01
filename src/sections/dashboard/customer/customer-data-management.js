import { memo, useCallback, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { paths } from 'src/paths';
import DeleteAccountDialog from './DeleteAccountDialog';

export const CustomerDataManagement = memo(({ customer, isAdmin }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = useCallback(() => setDialogOpen(true), []);
  const handleClose = useCallback(() => setDialogOpen(false), []);

  const handleDeleted = useCallback(() => {
    setDialogOpen(false);
    navigate(paths.dashboard.customers.index);
  }, [navigate]);

  return (
    <Card>
      <CardHeader title="Data Management" />
      <CardContent sx={{ pt: 0 }}>
        {isAdmin ? (
          <Button color="error" variant="outlined" onClick={handleOpen}>
            Delete Account
          </Button>
        ) : (
          <Button color="error" variant="outlined" disabled>
            Delete Account
          </Button>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Remove this customer&apos;s account if requested. This action is irreversible and all data will be permanently deleted.
          </Typography>
        </Box>

        <DeleteAccountDialog
          open={dialogOpen}
          onClose={handleClose}
          customer={customer}
          onDeleted={handleDeleted}
        />
      </CardContent>
    </Card>
  );
});

CustomerDataManagement.displayName = 'CustomerDataManagement';
