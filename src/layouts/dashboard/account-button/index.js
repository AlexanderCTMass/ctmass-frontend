import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import { Box, Button, ButtonBase, SvgIcon } from '@mui/material';
import { usePopover } from 'src/hooks/use-popover';
import { AccountPopover } from './account-popover';
import { useAuth } from 'src/hooks/use-auth';
import { Ava } from "src/components/ava";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { roles } from "src/roles";
import HomeIcon from '@mui/icons-material/Home';

export const AccountButton = () => {
    const { user } = useAuth();
    const popover = usePopover();

    return (
        <>
            <Button
                onClick={popover.handleOpen}
                ref={popover.anchorRef}
                sx={{
                    alignItems: 'center',
                    display: 'flex'
                }}
                variant={"text"}
                color={"inherit"}
                endIcon={<KeyboardArrowDownIcon />}
            >
                <Ava
                    avatar={user.avatar}
                    badge={user.role === roles.WORKER ? { content: "🛠", color: "success" } : { content: "🏠︎", color: "warning" }}
                >
                    <SvgIcon>
                        <User01Icon />
                    </SvgIcon>
                </Ava>
            </Button>
            <AccountPopover
                anchorEl={popover.anchorRef.current}
                onClose={popover.handleClose}
                open={popover.open}
            />
        </>
    );
};
