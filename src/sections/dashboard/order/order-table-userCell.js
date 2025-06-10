import PropTypes from 'prop-types';
import numeral from 'numeral';
import {
    Avatar,
    Box,
    Card,
    CardHeader, Link, Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from '@mui/material';
import {Scrollbar} from 'src/components/scrollbar';
import {getInitials} from "../../../utils/get-initials";
import {RouterLink} from "../../../components/router-link";
import {paths} from "../../../paths";
import {useMounted} from "../../../hooks/use-mounted";
import {useCallback, useEffect, useState} from "react";
import {ordersApi} from "../../../api/orders";
import {useParams} from "react-router";
import {customersApi} from "../../../api/customers";


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

export const OrderTableUserCell = (props) => {
    const {userId, ...other} = props;
    const customer = useCustomer(userId);

    if (!customer){
        return null;
    }
    return (
        <TableCell>
            <Stack
                alignItems="center"
                direction="row"
                spacing={1}
            >
                <Avatar
                    src={customer.avatar}
                    sx={{
                        height: 42,
                        width: 42
                    }}
                >
                    {getInitials(customer.name)}
                </Avatar>
                <div>
                    <Link
                        color="inherit"
                        // component={RouterLink}
                        // href={replaceWithId(paths.dashboard.customers.details)}
                        variant="subtitle2"
                    >
                        {customer.name}
                    </Link>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        {customer.email}
                    </Typography>
                </div>
            </Stack>
        </TableCell>
    );
};

OrderTableUserCell.propTypes = {
    userId: PropTypes.string.isRequired
};
