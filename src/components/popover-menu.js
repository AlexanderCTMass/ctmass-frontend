import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import {IconButton, ListItemIcon, ListItemText, Menu, MenuItem, SvgIcon, Tooltip, useMediaQuery} from '@mui/material';
import {usePopover} from 'src/hooks/use-popover';
import * as React from "react";

export const PopoverMenu = (props) => {
    const {tooltip, icon, items} = props;
    const popover = usePopover();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

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
                    sx: smUp
                        ? { maxWidth: '100%' }
                        : {
                            maxWidth: '100%',
                            width: '100%',
                            overflowX: 'auto', // Горизонтальная прокрутка
                            display: 'flex', // Меню расположено горизонтально
                            flexDirection: 'row', // Горизонтальное направление
                            whiteSpace: 'nowrap', // Предотвращает перенос текста
                        }
                }}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.title}
                        onClick={async () => {
                            popover.handleClose();
                            await item.onClick();
                        }}
                        sx={{
                            minHeight: 48, // Уменьшаем высоту элементов
                            padding: '6px 12px', // Компактные отступы
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <SvgIcon>
                                {item.icon}
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary={item.title} secondary={item.subtitle} primaryTypographyProps={{
                            variant: 'body2', // Уменьшаем шрифт
                        }}
                                      secondaryTypographyProps={{
                                          variant: 'caption', // Подсказки меньше
                                      }}/>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
