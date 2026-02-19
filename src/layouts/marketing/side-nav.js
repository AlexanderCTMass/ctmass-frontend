import PropTypes from 'prop-types';
import { Box, IconButton, Button, Drawer, Stack, SvgIcon } from '@mui/material';
import UserIcon from '@mui/icons-material/PersonOutline';
import StartIcon from '@mui/icons-material/PlayArrow';
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import ForHomeownersIcon from 'src/icons/untitled-ui/duocolor/for-homeowners'
import ForContractorsIcon from 'src/icons/untitled-ui/duocolor/for-contractors'
import HowIsWorksIcon from 'src/icons/untitled-ui/duocolor/how-it-works'
import BecomeAPartnerIcon from 'src/icons/untitled-ui/duocolor/become-a-partner'
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
import { useAuth } from "src/hooks/use-auth";
import { paths } from 'src/paths';

const items = [
    { title: 'For Homeowners', path: paths.forHomeowners, icon: <ForHomeownersIcon /> },
    { title: 'For Contractors', path: paths.forContractors, icon: <ForContractorsIcon /> },
    { title: 'How it works', path: paths.itSolutions, icon: <HowIsWorksIcon /> },
    { title: 'Become a partner', path: paths.forPartners, icon: <BecomeAPartnerIcon /> },
];

export const SideNav = (props) => {
    const { onClose, open = false } = props;
    const pathname = usePathname();
    const { user } = useAuth()

    return (
        <Drawer
            anchor="right"
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: '100%',
                    p: 3.75,
                }
            }}
            variant="temporary"
        >
            <Box
                sx={{
                    pt: 2,
                    px: 2
                }}
            >
                <Stack
                    component={RouterLink}
                    direction="row"
                    display="inline-flex"
                    href={paths.index}
                    spacing={1}
                    sx={{ textDecoration: 'none' }}
                >
                    <div className="hamburger" onClick={onClose} style={{ marginRight: '15px' }}>
                        <SvgIcon fontSize="small" sx={{
                            bgcolor: '#1F2D77', '&:hover': { backgroundColor: '#162fb5' }, color: '#fff', borderRadius: 1, p: 1.75, transition: (theme) => theme.transitions.create('background-color', {
                                easing: theme.transitions.easing.easeInOut,
                                duration: 200
                            }),
                        }} style={{ width: '60px', height: '50px' }}>
                            <Menu01Icon />
                        </SvgIcon>
                    </div>
                    {!user && (
                        <IconButton component={RouterLink} href={paths.login.index} sx={{ bgcolor: '#16B364', color: '#fff', '&:hover': { backgroundColor: '#EFF4F9' }, }} style={{ width: '50px', height: '50px' }}>
                            <UserIcon />
                        </IconButton>
                    )}
                </Stack>
            </Box>
            <Box
                component="nav"
                sx={{ p: 2 }}
            >
                <Stack spacing={2} sx={{ mb: 2 }}>
                </Stack>
                <Stack spacing={2}>
                    {items.map(({ title, path, icon }) => (
                        <Button
                            key={title}
                            component={RouterLink}
                            href={path}
                            onClick={onClose}
                            startIcon={icon}
                            variant="text"
                            color={pathname === path ? 'primary' : 'inherit'}
                            sx={{ justifyContent: 'center', textTransform: 'none' }}
                        >
                            {title}
                        </Button>
                    ))}
                </Stack>
            </Box>
            <Button
                variant="soft"
                startIcon={<StartIcon fontSize="small" color='#828CA8' />}
                component={RouterLink}
                href={paths.register.serviceProvider}
                sx={{
                    backgroundColor: '#EFF4F9',
                    color: '#111927',
                    borderRadius: 4,
                    textTransform: 'none',
                }}
                style={{ height: '50px' }}
            >
                Start providing services
            </Button>
        </Drawer>
    );
};

SideNav.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
};
