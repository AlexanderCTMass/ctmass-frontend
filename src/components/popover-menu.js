import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import {IconButton, ListItemIcon, ListItemText, Menu, MenuItem, SvgIcon, Tooltip} from '@mui/material';
import {usePopover} from 'src/hooks/use-popover';
import * as React from "react";

export const PopoverMenu = (props) => {
    const {tooltip, icon, items} = props;
    const popover = usePopover();

    return (
        <>
            <Tooltip title={tooltip || "More options"}>
                <IconButton
                    onClick={popover.handleOpen}
                    ref={popover.anchorRef}
                    {...props}>
                    <SvgIcon>
                        {icon || (<DotsHorizontalIcon/>)}
                    </SvgIcon>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={popover.anchorRef.current}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                }}
                onClose={popover.handleClose}
                open={popover.open}
                PaperProps={{
                    sx: {
                        maxWidth: '100%',
                        width: 200
                    }
                }}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
            >
                {items.map((item) => (
                    <MenuItem onClick={async () => {
                        popover.handleClose();
                        await item.onClick();
                    }}>
                        <ListItemIcon>
                            <SvgIcon>
                                {item.icon}
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary={item.title}/>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
