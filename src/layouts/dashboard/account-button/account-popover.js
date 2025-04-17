import {useCallback} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import CreditCard01Icon from '@untitled-ui/icons-react/build/esm/CreditCard01';
import Settings04Icon from '@untitled-ui/icons-react/build/esm/Settings04';
import User03Icon from '@untitled-ui/icons-react/build/esm/User03';
import {
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText, ListSubheader,
    MenuItem,
    MenuList,
    Popover,
    SvgIcon,
    Typography
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {useAuth} from 'src/hooks/use-auth';
import {useRouter} from 'src/hooks/use-router';
import {paths} from 'src/paths';
import {Issuer} from 'src/utils/auth';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import EngineeringIcon from "@mui/icons-material/Engineering";
import {roles} from "src/roles";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AddIcon from "@mui/icons-material/Add";
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import Settings03Icon from '@untitled-ui/icons-react/build/esm/Settings03';
import {useSettings} from "src/hooks/use-settings";


export const AccountPopover = (props) => {
    const {anchorEl, onClose, open, ...other} = props;
    const router = useRouter();
    const auth = useAuth();
    const settings = useSettings();

    const user = auth.user;

    const handleLogout = useCallback(async () => {
        try {
            onClose?.();

            switch (auth.issuer) {
                case Issuer.Amplify: {
                    await auth.signOut();
                    break;
                }

                case Issuer.Auth0: {
                    await auth.logout();
                    break;
                }

                case Issuer.Firebase: {
                    await auth.signOut();
                    break;
                }

                case Issuer.JWT: {
                    await auth.signOut();
                    break;
                }

                default: {
                    console.warn('Using an unknown Auth Issuer, did not log out');
                }
            }

            router.push(paths.index);
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, [auth, router, onClose]);

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom'
            }}
            disableScrollLock
            onClose={onClose}
            open={!!open}
            PaperProps={{
                sx: {
                    borderRadius: 2, // Закругленные углы
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Тень
                }
            }}
            {...other}
        >
            <MenuList sx={{p: 1}}> {/* Используем MenuList для компактного меню */}
                <MenuItem
                    component={RouterLink}
                    href={paths.cabinet.profiles.my.index}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <User03Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1">
                            Profile page
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    component={RouterLink}
                    href={paths.cabinet.profiles.my.settings}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <EngineeringIcon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1">
                            Account Settings
                        </Typography>
                    </ListItemText>
                </MenuItem>
                {user.role === roles.WORKER ? (
                        <>
                            <Divider/>
                            {/* Contractor's account - пастельный зеленый (#10B981) */}
                            <Box sx={{backgroundColor: 'rgba(16, 185, 129, 0.08)'}}>
                                <ListSubheader sx={{
                                    backgroundColor: 'transparent',
                                    color: 'success.dark', // или 'rgba(16, 185, 129, 1)'
                                    fontWeight: 'medium',
                                    lineHeight: 'normal',
                                    py: 1
                                }}>
                                    Contractor's account
                                </ListSubheader>
                                <MenuItem
                                    component={RouterLink}
                                    href={paths.cabinet.projects.find.index}
                                    onClick={onClose}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(16, 185, 129, 0.12)'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon fontSize="small">
                                            <ManageSearchIcon/>
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">
                                            Find projects
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                                <MenuItem
                                    component={RouterLink}
                                    href={paths.cabinet.projects.contractor}
                                    onClick={onClose}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(16, 185, 129, 0.12)'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon fontSize="small">
                                            <ViewListIcon/>
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">
                                            My works
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </Box>
                            <Divider/>
                            {/* Customer's account - пастельный оранжевый */}
                            <Box sx={{backgroundColor: 'rgba(255, 152, 0, 0.08)'}}>
                                <ListSubheader sx={{
                                    backgroundColor: 'transparent',
                                    color: 'orange.700',
                                    fontWeight: 'medium',
                                    lineHeight: 'normal',
                                    py: 1
                                }}>
                                    Customer's account
                                </ListSubheader>
                                <MenuItem
                                    component={RouterLink}
                                    href={paths.cabinet.projects.create}
                                    onClick={onClose}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 152, 0, 0.12)'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon fontSize="small">
                                            <AddIcon/>
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">
                                            Find contractor
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                                <MenuItem
                                    component={RouterLink}
                                    href={paths.cabinet.projects.index}
                                    onClick={onClose}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 152, 0, 0.12)'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon fontSize="small">
                                            <ViewListIcon/>
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">
                                            My projects
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </Box>
                            <Divider/>
                        </>
                    ) :
                    (<>
                        <MenuItem
                            component={RouterLink}
                            href={paths.cabinet.projects.create}
                            onClick={onClose}
                        >
                            <ListItemIcon>
                                <SvgIcon fontSize="small">
                                    <AddIcon/>
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText>
                                <Typography variant="body1">
                                    Find contractor
                                </Typography>
                            </ListItemText>
                        </MenuItem>
                        <MenuItem
                            component={RouterLink}
                            href={paths.cabinet.projects.index}
                            onClick={onClose}
                        >
                            <ListItemIcon>
                                <SvgIcon fontSize="small">
                                    <ViewListIcon/>
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText>
                                <Typography variant="body1">
                                    My projects
                                </Typography>
                            </ListItemText>
                        </MenuItem>
                        <Divider/>
                    </>)}

                <ListSubheader size="small">System</ListSubheader>
                <MenuItem
                    onClick={settings.handleDrawerOpen}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <Settings03Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1">
                            Theme settings
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    component={RouterLink}
                    href={paths.contact}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <LiveHelpIcon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1">
                            Support
                        </Typography>
                    </ListItemText>
                </MenuItem>
            </MenuList>
            <Divider sx={{my: '0 !important'}}/>
            <Box
                sx={{
                    display: 'flex',
                    p: 1,
                    justifyContent: 'center'
                }}
            >
                <Button
                    color="inherit"
                    onClick={handleLogout}
                    size="small"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'error.main',
                        }
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Popover>
    );
};

AccountPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool
};