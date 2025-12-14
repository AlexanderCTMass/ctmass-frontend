import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import { alpha } from '@mui/material/styles';
import {
    Box,
    IconButton,
    Stack,
    SvgIcon,
    useMediaQuery
} from '@mui/material';
import { NotificationsButton } from '../notifications-button';
import { AccountButton } from '../account-button';

const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
    const { onMobileNavOpen } = props;
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                height: TOP_NAV_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                px: { xs: 2, sm: 3 },
                backdropFilter: 'blur(8px)',
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
                borderBottom: 1,
                borderColor: 'divider'
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                spacing={2}
            >
                {!lgUp && (
                    <IconButton
                        color="inherit"
                        onClick={onMobileNavOpen}
                    >
                        <SvgIcon fontSize="small">
                            <Menu01Icon />
                        </SvgIcon>
                    </IconButton>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <NotificationsButton />
                    <AccountButton />
                </Stack>
            </Stack>
        </Box>
    );
};

TopNav.propTypes = {
    onMobileNavOpen: PropTypes.func
};