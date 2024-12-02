import PropTypes from 'prop-types';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
    Box,
    IconButton,
    SvgIcon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow
} from '@mui/material';
import {Scrollbar} from 'src/components/scrollbar';

export const MailTemplateListTable = (props) => {
    const {
        count = 0,
        items = [],
        onDeselectAll,
        onDeselectOne,
        onPageChange = () => {
        },
        onRowsPerPageChange,
        onSelectAll,
        onSelectOne,
        page = 0,
        rowsPerPage = 0,
        selected = []
    } = props;

    return (
        <Box sx={{position: 'relative'}}>
            <Scrollbar>
                <Table sx={{minWidth: 700}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Name
                            </TableCell>
                            <TableCell align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((mailTemplate) => {
                            return (
                                <TableRow
                                    hover
                                    key={mailTemplate.id}
                                >
                                    <TableCell>
                                        {mailTemplate.name}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton>
                                            <SvgIcon>
                                                <Edit02Icon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Box>
    );
};

MailTemplateListTable.propTypes = {
    count: PropTypes.number,
    items: PropTypes.array,
    onDeselectAll: PropTypes.func,
    onDeselectOne: PropTypes.func,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    onSelectAll: PropTypes.func,
    onSelectOne: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number,
    selected: PropTypes.array
};
