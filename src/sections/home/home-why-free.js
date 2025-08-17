import { Box, Button, Container, Stack, Typography, useMediaQuery, Popover } from '@mui/material';
import { paths } from 'src/paths';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import HomeIcon from '@mui/icons-material/Home';
import ConstructionIcon from '@mui/icons-material/Construction';
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
        <Box
            sx={{
                backgroundColor: 'neutral.800',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                color: 'neutral.100',
                py: '120px'
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={2}>
                    <Typography
                        align="center"
                        color="inherit"
                        variant="h3"
                    >
                        100% Free!
                    </Typography>
                    <Typography
                        align="center"
                        color="inherit"
                        variant="subtitle2"
                    >
                        To make construction and home improvement more affordable, transparent, and efficient for everyone in our region.
                    </Typography>
                </Stack>
                <Stack
                    alignItems="center"
                    direction={downSm ? "column" : "row"}
                    justifyContent="center"
                    spacing={2}
                    sx={{ mt: 3 }}
                >
                    <Button
                        component="a"
                        href={paths.whyFree}
                        variant="contained"
                        startIcon={<FeedbackIcon />}
                    >
                        Read why we're 100% free
                    </Button>
                    <Button
                        aria-describedby={id}
                        variant="contained"
                        size="large"
                        color={"warning"}
                        startIcon={<ThumbUpIcon />}
                        onClick={handleClick}
                    >
                        Get Started - Free
                    </Button>

                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        sx={{
                            mt: 1,
                            w: "100%",
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Stack direction={downXSm ? "column" : "row"} spacing={1}>
                                <Button
                                    component="a"
                                    href={user ? paths.cabinet.projects.create : paths.login.createProject}
                                    variant="outlined"
                                    startIcon={<HomeIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{
                                        whiteSpace: 'nowrap', // Запрещаем перенос текста
                                        minWidth: 'max-content' // Минимальная ширина по содержимому
                                    }}
                                >
                                    {user ? "Find Specialist" : "I'm a Homeowner"}
                                </Button>
                                <Button
                                    component="a"
                                    href={user ? (user.role === roles.WORKER ? paths.cabinet.projects.find.index : paths.cabinet.profiles.specialistCreateWizard) : paths.register.serviceProvider}
                                    variant="outlined"
                                    startIcon={<ConstructionIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{
                                        whiteSpace: 'nowrap', // Запрещаем перенос текста
                                        minWidth: 'max-content' // Минимальная ширина по содержимому
                                    }}
                                >
                                    {user ? (user.role === roles.WORKER ? "Find Projects" : "Start providing services") : "I'm a Contractor"}
                                </Button>
                            </Stack>
                        </Box>
                    </Popover>
                </Stack>
            </Container>
        </Box>
    );
}