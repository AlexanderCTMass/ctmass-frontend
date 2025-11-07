import { Menu, MenuItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import { useState } from 'react';

export const VariablePicker = ({ variables, onSelect, disabled }) => {
    const [anchor, setAnchor] = useState(null);
    return (
        <>
            <Tooltip title="Insert variable">
                <IconButton size="small" disabled={disabled} onClick={e => setAnchor(e.currentTarget)}>
                    <TagIcon fontSize="inherit" />
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                {variables.map(v => (
                    <MenuItem
                        key={v.key}
                        onClick={() => {
                            onSelect(v.template);
                            setAnchor(null);
                        }}
                    >
                        <ListItemText
                            primary={v.display}
                            secondary={v.template}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};