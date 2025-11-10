import {
    Box,
    Button,
    Container,
    Paper,
    Popover,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { paths } from 'src/paths';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import HomeIcon from '@mui/icons-material/Home';
import ConstructionIcon from '@mui/icons-material/Construction';
import MoneyHandIcon from 'src/icons/untitled-ui/duocolor/money-hand'
import { useCallback, useState } from 'react';
import { roles } from "src/roles";
import { useAuth } from "src/hooks/use-auth";

export const HomeWhyFree = () => {
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const downXSm = useMediaQuery((theme) => theme.breakpoints.down('425'));
    const [anchorEl, setAnchorEl] = useState(null);
    const { user } = useAuth();

    const handleClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const open = Boolean(anchorEl);
    const id = open ? 'role-selection-popover' : undefined;

    return (
        <Box sx={{ py: { xs: 6, md: 10 } }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        px: { xs: 3, sm: 6, md: 10 },
                        py: { xs: 6, md: 8 },
                        borderRadius: 3,
                        backgroundImage: 'linear-gradient(90deg,#00AE7C 0%,#02C267 100%)',
                        color: 'common.white'
                    }}
                >
                    <Stack
                        direction={downSm ? 'column' : 'row'}
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={{ xs: 4, md: 6 }}
                    >
                        <Stack
                            spacing={3}
                            alignItems={downSm ? 'center' : 'flex-start'}
                            textAlign={downSm ? 'center' : 'left'}
                            flex={1}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontFamily: '"Montserrat", "Helvetica", sans-serif',
                                    fontStyle: 'italic',
                                    fontWeight: 600,
                                    lineHeight: 0.9,
                                    fontSize: { xs: 64, sm: 80, md: 96 }
                                }}
                            >
                                100% <Box component="span" sx={{ fontSize: '0.5em' }}>free!</Box>
                            </Typography>

                            <Typography variant="subtitle1" sx={{ maxWidth: 380 }}>
                                To make construction and home improvement more affordable,
                                transparent, and efficient for everyone in our region.
                            </Typography>

                            <Button
                                component="a"
                                href={paths.whyFree}
                                variant="outlined"
                                size="large"
                                color="inherit"
                                startIcon={<FeedbackIcon />}
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    ':hover': { borderColor: 'common.white', background: 'rgba(255,255,255,0.1)' },
                                    px: 4,
                                    textTransform: 'none'
                                }}
                            >
                                Read why we’re 100% free
                            </Button>
                        </Stack>

                        <Stack
                            spacing={3}
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                            sx={{ width: { xs: '100%', sm: 260, md: 300 }, pt: downSm ? 10 : 0 }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 300,
                                    objectFit: 'contain',
                                    filter: 'brightness(0) invert(1)',
                                    position: 'absolute',
                                    right: '12vw',
                                }}
                            >
                                <MoneyHandIcon />
                            </Box>

                            <Button
                                aria-describedby={id}
                                variant="contained"
                                size="large"
                                onClick={handleClick}
                                color="common"
                                sx={{
                                    backgroundColor: 'common.white',
                                    color: 'grey.900',
                                    px: 6,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    ':hover': { backgroundColor: 'grey.50' }
                                }}
                            >
                                Get Started – Free
                            </Button>
                        </Stack>
                    </Stack>

                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        sx={{ mt: 1 }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Stack direction={downXSm ? 'column' : 'row'} spacing={1} width={365}>
                                <Button
                                    component="a"
                                    href={user ? paths.cabinet.projects.create : paths.login.createProject}
                                    variant="outlined"
                                    startIcon={<HomeIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{ whiteSpace: 'nowrap', minWidth: 'max-content' }}
                                >
                                    {user ? 'Find Specialist' : "I'm a Homeowner"}
                                </Button>

                                <Button
                                    component="a"
                                    href={
                                        user
                                            ? user.role === roles.WORKER
                                                ? paths.cabinet.projects.find.index
                                                : paths.cabinet.profiles.specialistCreateWizard
                                            : paths.register.serviceProvider
                                    }
                                    variant="outlined"
                                    startIcon={<ConstructionIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{ whiteSpace: 'nowrap', minWidth: 'max-content' }}
                                >
                                    {user
                                        ? user.role === roles.WORKER
                                            ? 'Find Projects'
                                            : 'Start providing services'
                                        : "I'm a Contractor"}
                                </Button>
                            </Stack>
                        </Box>
                    </Popover>
                </Paper>
            </Container>
        </Box>
    );
}