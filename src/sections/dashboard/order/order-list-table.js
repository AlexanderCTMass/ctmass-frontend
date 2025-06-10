import PropTypes from 'prop-types';
import {format} from 'date-fns';
import numeral from 'numeral';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TablePagination,
    TableRow,
    Typography
} from '@mui/material';
import {SeverityPill} from 'src/components/severity-pill';
import {RouterLink} from "../../../components/router-link";
import {paths} from "../../../paths";
import {OrderTableUserCell} from "./order-table-userCell";

const statusMap = {
    complete: 'success',
    pending: 'info',
    close: 'success',
    new: 'warning',
    rejected: 'error'
};

export const OrderListTable = (props) => {
    const {
        count = 0,
        items = [],
        onPageChange = () => {
        },
        onRowsPerPageChange,
        onSelect,
        page = 0,
        rowsPerPage = 0
    } = props;

    return (
        <div>
            <Table>
                <TableBody>
                    {items.map((order) => {


                        const createAt = new Date(order.createDate.seconds * 1000);
                        const createdAtMonth = format(createAt, 'LLL').toUpperCase();
                        const createdAtDay = format(createAt, 'd');
                        const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);
                        const statusColor = statusMap[order.status] || 'warning';
                        const startDate = order.start && format(new Date(order.start.seconds * 1000), 'dd/MM/yyyy');
                        const endDate = order.end && format(new Date(order.end.seconds * 1000), 'dd/MM/yyyy');

                        return (
                            <TableRow
                                hover
                                key={order.id}
                                onClick={() => onSelect?.(order.id)}
                                sx={{cursor: 'pointer'}}
                            >
                                <TableCell
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                                ? 'neutral.800'
                                                : 'neutral.200',
                                            borderRadius: 2,
                                            maxWidth: 'fit-content',
                                            ml: 3,
                                            p: 1
                                        }}
                                    >
                                        <Typography
                                            align="center"
                                            variant="subtitle2"
                                        >
                                            {createdAtMonth}
                                        </Typography>
                                        <Typography
                                            align="center"
                                            variant="h6"
                                        >
                                            {createdAtDay}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ml: 2}}>
                                        <Typography variant="h6">
                                            {order.title}
                                        </Typography>
                                        <Typography variant="caption">
                                            {startDate} - {endDate}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <OrderTableUserCell userId={order.userId}/>
                                <TableCell align="right">
                                    <SeverityPill color={statusColor}>
                                        {order.status}
                                    </SeverityPill>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

OrderListTable.propTypes = {
    count: PropTypes.number,
    items: PropTypes.array,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    onSelect: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number
};
