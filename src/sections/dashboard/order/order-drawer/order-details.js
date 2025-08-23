import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
    Button,
    Stack,
    SvgIcon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery
} from '@mui/material';
import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import { SeverityPill } from 'src/components/severity-pill';
import { Scrollbar } from 'src/components/scrollbar';
import { useMounted } from "../../../../hooks/use-mounted";
import { useCallback, useEffect, useState } from "react";
import { customersApi } from "../../../../api/customers";
import { jobApi } from "../../jobs/jobApi";
import { useAuth } from "../../../../hooks/use-auth";
import { roles } from "../../../../roles";

const statusMap = {
    new: 'warning',
    complete: 'success',
    pending: 'info',
    close: 'success',
    rejected: 'error'
};


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

export const OrderDetails = (props) => {
    const { onApprove, onComplete, onEdit, onReject, order } = props;
    const customer = useCustomer(order.userId);
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

    const { user } = useAuth();
    const isCustomer = user.role === roles.CUSTOMER;
    const align = lgUp ? 'horizontal' : 'vertical';
    const items = order.items || [];
    const createdAt = format(new Date(order.createDate.seconds * 1000), 'dd/MM/yyyy HH:mm');
    const startDate = format(new Date(order.start.seconds * 1000), 'dd/MM/yyyy');
    const endDate = format(new Date(order.end.seconds * 1000), 'dd/MM/yyyy');
    const statusColor = statusMap[order.status];
    const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);

    const onApproved = async () => {
        try {
            await jobApi.update(order.id, { status: "pending" });

            order.status = "pending";
            onApprove();
        } catch (err) {
            console.error(err);
        }
    }

    const onCompleted = async () => {
        try {
            await jobApi.update(order.id, { status: "complete" });

            order.status = "complete";
            onComplete();
        } catch (err) {
            console.error(err);
        }
    }

    const onClose = async () => {
        try {
            await jobApi.update(order.id, { status: "close" });

            order.status = "close";
            onComplete();
        } catch (err) {
            console.error(err);
        }
    }

    const onRej = async () => {
        try {
            await jobApi.update(order.id, { status: "reject" });

            order.status = "reject";
            onReject();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Stack spacing={6}>
            <Stack spacing={3}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}
                >
                    <Typography variant="h6">
                        Details
                    </Typography>
                    <Button
                        color="inherit"
                        // onClick={onEdit}
                        size="small"
                        startIcon={(
                            <SvgIcon>
                                <Edit02Icon />
                            </SvgIcon>
                        )}
                    >
                        Edit
                    </Button>
                </Stack>
                <PropertyList>
                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="ID"
                        value={order.id}
                    />
                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="Number"
                        value={order.number}
                    />
                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="Create date"
                        value={createdAt}
                    />
                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="Customer"
                    >
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {customer && customer.name}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {customer && customer.address1}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {customer && customer.city}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {customer && customer.country}
                        </Typography>
                    </PropertyListItem>


                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="Status"
                    >
                        <SeverityPill color={statusColor}>
                            {order.status}
                        </SeverityPill>
                    </PropertyListItem>

                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="Start date"
                        value={startDate}
                    />
                    <PropertyListItem
                        align={align}
                        disableGutters
                        divider
                        label="End date"
                        value={endDate}
                    />
                </PropertyList>

                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="flex-end"
                    spacing={2}
                >
                    {order.status === "new" && !isCustomer &&
                        (<Button
                            onClick={onApproved}
                            size="small"
                            variant="contained"
                        >
                            Approve
                        </Button>)}
                    {order.status === "pending" && isCustomer &&
                        (<Button
                            onClick={onCompleted}
                            size="small"
                            variant="contained"
                        >
                            Complete
                        </Button>)}
                    {order.status === "complete" && !isCustomer &&
                        (<Button
                            onClick={onClose}
                            size="small"
                            variant="contained"
                        >
                            Close
                        </Button>)}
                    {order.status !== "close" &&
                        (<Button
                            color="error"
                            onClick={onRej}
                            size="small"
                            variant="outlined"
                        >
                            Reject
                        </Button>)}
                </Stack>
            </Stack>
        </Stack>
    );
};

OrderDetails.propTypes = {
    onApprove: PropTypes.func,
    onComplete: PropTypes.func,
    onEdit: PropTypes.func,
    onReject: PropTypes.func,
    order: PropTypes.object
};
