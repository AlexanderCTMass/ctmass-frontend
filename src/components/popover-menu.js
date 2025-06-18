import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import {
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    SvgIcon,
    Tooltip,
    useMediaQuery,
    Box,
    Typography
} from '@mui/material';
import {usePopover} from 'src/hooks/use-popover';
import * as React from "react";

export const PopoverMenu = (props) => {
    const {tooltip, icon, items, title, description} = props;
    const popover = usePopover();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    return (
        <>
            {tooltip ? (
                <Tooltip title={tooltip || "More options"}>
                    <IconButton
                        onClick={popover.handleOpen}
                        ref={popover.anchorRef}
                        {...props}
                    >
                        <SvgIcon>
                            {icon || <DotsHorizontalIcon/>}
                        </SvgIcon>
                    </IconButton>
                </Tooltip>
            ) : (
                <Button
                    onClick={popover.handleOpen}
                    ref={popover.anchorRef}
                    startIcon={icon}
                    {...props}
                >
                    {title}
                </Button>
            )}

            <Menu
                anchorEl={popover.anchorRef.current}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                }}
                onClose={popover.handleClose}
                open={popover.open}
                PaperProps={{
                    sx: smUp ? {
                        maxWidth: '100%',
                        padding: description ? '8px 0' : 0
                    } : {
                        maxWidth: '100%',
                        width: '100%',
                        overflowX: 'auto',
                        display: 'flex',
                        flexDirection: 'row',
                        whiteSpace: 'nowrap',
                        padding: description ? '8px 0' : 0
                    }
                }}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
            >
                {description && (
                    <Box sx={{
                        padding: '8px 16px',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                )}

                {items.map((item) => (
                    <MenuItem
                        key={item.title}
                        onClick={async () => {
                            popover.handleClose();
                            await item.onClick();
                        }}
                        sx={{
                            minHeight: 48,
                            padding: '6px 12px',
                        }}
                    >
                        {item.icon && (
                            <ListItemIcon sx={{minWidth: 36}}>
                                <SvgIcon>
                                    {item.icon}
                                </SvgIcon>
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={item.title}
                            secondary={item.subtitle}
                            primaryTypographyProps={{
                                variant: 'body2',
                            }}
                            secondaryTypographyProps={{
                                variant: 'caption',
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};