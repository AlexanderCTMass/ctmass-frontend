import {
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, SvgIcon
} from '@mui/material';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';

export const EmailTemplatesTable = ({ items, onEdit }) => (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Trigger</TableCell>
                <TableCell>Active version</TableCell>
                <TableCell>Updated at</TableCell>
                <TableCell align="right">Actions</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {items.map((row) => {
                const active = Object.values(row.versions || {})
                    .find(v => v.isActive);

                const updated = active?.createdAt?.toDate
                    ? active.createdAt.toDate().toLocaleString()
                    : '';
                return (
                    <TableRow key={row.name} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.trigger}</TableCell>
                        <TableCell>
                            {active?.version}
                            {row.latestActive && (
                                <span style={{ color: '#16a34a', marginLeft: 4 }}>●</span>
                            )}
                        </TableCell>
                        <TableCell>{updated}</TableCell>
                        <TableCell align="right">
                            <IconButton onClick={() => onEdit(row)}>
                                <SvgIcon><Edit02Icon /></SvgIcon>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
);