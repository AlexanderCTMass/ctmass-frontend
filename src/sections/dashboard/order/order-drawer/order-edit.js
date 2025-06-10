import PropTypes from 'prop-types';
import {format} from 'date-fns';
import {Button, Stack, TextField, Typography} from '@mui/material';
import {useMounted} from "../../../../hooks/use-mounted";
import {useCallback, useEffect, useState} from "react";
import {customersApi} from "../../../../api/customers";

const statusOptions = [
    {
        label: 'New',
        value: 'new'
    },
    {
        label: 'Complete',
        value: 'complete'
    },
    {
        label: 'Pending',
        value: 'pending'
    },
    {
        label: 'Rejected',
        value: 'rejected'
    }
];

const useCustomer = (customerId) => {
    const isMounted = useMounted();
    const [customer, setCustomer] = useState(null);

    const handleCustomerGet = useCallback(async () => {
        try {
            const response = await customersApi.getCustomer(customerId);

            if (isMounted()) {
                setCustomer(response);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
            handleCustomerGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return customer;
};
export const OrderEdit = (props) => {
    const {onCancel, onSave, order} = props;
    const customer = useCustomer(order.userId);

    const createdAt = format(new Date(order.createDate.seconds * 1000), 'dd/MM/yyyy HH:mm');
    const startDate = format(new Date(order.start.seconds * 1000), 'dd/MM/yyyy');
    const endDate = format(new Date(order.end.seconds * 1000), 'dd/MM/yyyy');

    return (
        <Stack spacing={6}>
            <Stack spacing={3}>
                <Typography variant="h6">
                    Details
                </Typography>
                <Stack spacing={3}>
                    <TextField
                        disabled
                        fullWidth
                        label="ID"
                        name="id"
                        value={order.id}
                    />
                    <TextField
                        disabled
                        fullWidth
                        label="Number"
                        name="number"
                        value={order.number}
                    />
                    <TextField
                        disabled
                        fullWidth
                        label="Customer name"
                        name="customer_name"
                        value={customer && customer.name}
                    />
                    <TextField
                        fullWidth
                        label="Total Amount"
                        name="amount"
                        value={order.totalAmount}
                    />
                    <TextField
                        fullWidth
                        label="Status"
                        name="status"
                        select
                        SelectProps={{native: true}}
                        value={order.status}
                    >
                        {statusOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </TextField>
                </Stack>
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    spacing={2}
                >
                    <Button
                        color="primary"
                        onClick={onSave}
                        size="small"
                        variant="contained"
                    >
                        Save changes
                    </Button>
                    <Button
                        color="inherit"
                        onClick={onCancel}
                        size="small"
                    >
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
};

OrderEdit.propTypes = {
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    order: PropTypes.object
};
