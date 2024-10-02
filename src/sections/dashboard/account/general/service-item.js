import {
    Box,
    Button, Card, Divider,
    IconButton,
    Input,
    LinearProgress,
    linearProgressClasses,
    Stack,
    SvgIcon,
    Typography
} from "@mui/material";
import Trash02Icon from "@untitled-ui/icons-react/build/esm/Trash02";
import {TaskCheckItem} from "../../kanban/task-modal/task-check-item";
import {TaskCheckItemAdd} from "../../kanban/task-modal/task-check-item-add";
import {useCallback, useEffect, useState} from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import * as React from "react";

export const ServiceItem = (props) => {
    const {
        service, onDelete,
        onRename, onCost, onCostType, ...other
    } = props;
    const [nameCopy, setNameCopy] = useState(service.name);
    const [isRenaming, setIsRenaming] = useState(false);

    const handleNameReset = useCallback(() => {
        setNameCopy(service.name);
    }, [service]);

    useEffect(() => {
            handleNameReset();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [service]);

    const handleNameChange = useCallback((event) => {
        setNameCopy(event.target.value);
    }, []);

    const handleRenameInit = useCallback(() => {
        setIsRenaming(true);
    }, []);

    const handleRenameCancel = useCallback(() => {
        setIsRenaming(false);
        setNameCopy(service.name);
    }, [service]);

    const handleRenameComplete = useCallback(async () => {
        if (!nameCopy || nameCopy === service.name) {
            setIsRenaming(false);
            setNameCopy(service.name);
            return;
        }

        setIsRenaming(false);
        onRename?.(nameCopy);
    }, [service, nameCopy, onRename]);

    return (<Card
        variant="outlined"
        {...other}>
        <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{p: 1}}
        >
            <Input
                disableUnderline
                fullWidth
                label={"Service name"}
                placeholder={"for example: installation of doors "}
                onChange={handleNameChange}
                onClick={handleRenameInit}
                sx={{
                    '& .MuiInputBase-input': {
                        borderRadius: 1.5,
                        fontWeight: 500,
                        overflow: 'hidden',
                        px: 2,
                        py: 1,
                        textOverflow: 'ellipsis',
                        wordWrap: 'break-word',
                        '&:hover, &:focus': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                ? 'neutral.800'
                                : 'neutral.100',
                            borderRadius: 1
                        }
                    }
                }}
                value={nameCopy}
            />
            {isRenaming
                ? (
                    <>
                        <Button
                            onClick={handleRenameComplete}
                            size="small"
                            variant="contained"
                        >
                            Save
                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleRenameCancel}
                            size="small"
                        >
                            Cancel
                        </Button>
                    </>
                )
                : (
                    <IconButton onClick={onDelete}>
                        <SvgIcon fontSize="small">
                            <Trash02Icon/>
                        </SvgIcon>
                    </IconButton>
                )}
        </Stack>
    </Card>)
}