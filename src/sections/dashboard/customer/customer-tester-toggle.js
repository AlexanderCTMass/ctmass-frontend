import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {
    Card,
    CardContent,
    CardHeader,
    FormControlLabel,
    Switch,
    Typography
} from '@mui/material';
import { customersApi } from 'src/api/customers';

export const CustomerTesterToggle = ({ customer, onChange }) => {
    const [saving, setSaving] = useState(false);
    const isTester = Boolean(customer.isTester);

    const handleToggle = useCallback(async (event) => {
        const next = event.target.checked;
        setSaving(true);
        try {
            await customersApi.setTester(customer.id, next);
            onChange?.(next);
            toast.success(next ? 'User marked as tester' : 'Tester mark removed');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update tester status');
        } finally {
            setSaving(false);
        }
    }, [customer.id, onChange]);

    return (
        <Card>
            <CardHeader title="Tester" />
            <CardContent sx={{ pt: 0 }}>
                <FormControlLabel
                    control={(
                        <Switch
                            checked={isTester}
                            color="success"
                            disabled={saving}
                            onChange={handleToggle}
                        />
                    )}
                    label={isTester ? 'Marked as tester' : 'Mark as tester'}
                />
                <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                    variant="body2"
                >
                    Testers are highlighted in green in the customers list. Nothing changes for the user.
                </Typography>
            </CardContent>
        </Card>
    );
};

CustomerTesterToggle.propTypes = {
    customer: PropTypes.object.isRequired,
    onChange: PropTypes.func
};
