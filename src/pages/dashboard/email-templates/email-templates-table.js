import {
    Table, TableBody, Tooltip, TableCell, TableHead, TableRow, IconButton, SvgIcon
} from '@mui/material';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';

export const EmailTemplatesTable = ({ items, onEdit }) => (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Trigger</TableCell>
                <TableCell>Active version</TableCell>
                <TableCell>Updated at</TableCell>
                <TableCell align="right">Actions</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {items.map((row) => {
                const versions = Object.values(row.versions || {});
                const activeVer = versions.find(v => v.isActive);

                const latestVer = activeVer
                    || versions.sort((a, b) =>
                        (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
                    )[0];

                const updated =
                    latestVer?.createdAt?.toDate?.()
                        ? latestVer.createdAt.toDate().toLocaleString()
                        : '';
                return (
                    <TableRow key={row.name} hover>
                        {/* <TableCell>
                            <Tooltip title={row.name}>
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {row.name.length > 10 ? row.name.slice(0, 10) + '…' : row.name}
                                </span>
                            </Tooltip>
                        </TableCell> */}
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.trigger}</TableCell>
                        <TableCell>
                            {latestVer?.version}
                            {activeVer && (
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