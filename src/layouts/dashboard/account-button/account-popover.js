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
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover,
    SvgIcon,
    Typography
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {useAuth} from 'src/hooks/use-auth';
import {useMockedUser} from 'src/hooks/use-mocked-user';
import {useRouter} from 'src/hooks/use-router';
import {paths} from 'src/paths';
import {Issuer} from 'src/utils/auth';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import EngineeringIcon from "@mui/icons-material/Engineering";
import {roles} from "src/roles";

export const AccountPopover = (props) => {
    const {anchorEl, onClose, open, ...other} = props;
    const router = useRouter();
    const auth = useAuth();
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
            {...other}>
            <Box sx={{p: 1}}>
                <ListItemButton
                    component={RouterLink}
                    href={paths.cabinet.profiles.my.index}
                    onClick={onClose}
                    sx={{
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                    }}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <User03Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText
                        primary={(
                            <Typography variant="body1">
                                Profile
                            </Typography>
                        )}
                    />
                </ListItemButton>
            </Box>
            <Box sx={{p: 1}}>
                <ListItemButton
                    component={RouterLink}
                    href={paths.cabinet.projects.index}
                    onClick={onClose}
                    sx={{
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                    }}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <ViewListIcon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText
                        primary={(
                            <Typography variant="body1">
                                My projects
                            </Typography>
                        )}
                    />
                </ListItemButton>
            </Box>
            {user.role === roles.WORKER &&
                <Box sx={{p: 1}}>
                    <ListItemButton
                        component={RouterLink}
                        href={paths.cabinet.projects.find.index}
                        onClick={onClose}
                        sx={{
                            borderRadius: 1,
                            px: 1,
                            py: 0.5
                        }}
                    >
                        <ListItemIcon>
                            <SvgIcon fontSize="small">
                                <ViewListIcon/>
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText
                            primary={(
                                <Typography variant="body1">
                                    Find projects
                                </Typography>
                            )}
                        />
                    </ListItemButton>
                </Box>}
            <Box sx={{p: 1}}>
                <ListItemButton
                    component={RouterLink}
                    href={paths.cabinet.profiles.my.settings}
                    onClick={onClose}
                    sx={{
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                    }}
                >
                    <ListItemIcon>
                        <SvgIcon fontSize="small">
                            <EngineeringIcon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText
                        primary={(
                            <Typography variant="body1">
                                Settings
                            </Typography>
                        )}
                    />
                </ListItemButton>
            </Box>
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
