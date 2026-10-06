import {
    Box,
    Button,
    Container,
    Link,
    Paper,
    Popover,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { paths } from 'src/paths';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeIcon from '@mui/icons-material/Home';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useCallback, useState } from 'react';
import { roles } from "src/roles";
import { useAuth } from "src/hooks/use-auth";

export const HomeWhyFree = () => {
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
        <Box component="section" sx={{ py: { xs: 4, md: 8 } }}>
            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ md: 4, lg: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            flex: 1,
                            maxWidth: 760,
                            px: { xs: 3, sm: 5, md: 6 },
                            py: { xs: 3.5, md: 5 },
                            borderRadius: { xs: 4, md: 5 },
                            backgroundImage: 'linear-gradient(120deg,#00AE7C 0%,#02C267 100%)',
                            color: 'common.white',
                            boxShadow: '0 24px 48px rgba(0, 174, 124, 0.28)'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: { xs: -60, md: -80 },
                                right: { xs: -60, md: -80 },
                                width: { xs: 180, md: 240 },
                                height: { xs: 180, md: 240 },
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }}
                        />
                        <Box
                            component="img"
                            src="/assets/Worker.png"
                            alt=""
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                position: 'absolute',
                                right: { xs: -6, sm: 24 },
                                bottom: 0,
                                height: { xs: 150, sm: 190 },
                                pointerEvents: 'none'
                            }}
                        />
                        <Stack spacing={2.5} sx={{ position: 'relative', maxWidth: { xs: '68%', sm: '70%', md: '100%' } }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontFamily: '"Montserrat", "Helvetica", sans-serif',
                                    fontStyle: 'italic',
                                    fontWeight: 600,
                                    lineHeight: 0.9,
                                    whiteSpace: 'nowrap',
                                    fontSize: { xs: 52, sm: 72, md: 88 }
                                }}
                            >
                                100% <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 800 }}>free!</Box>
                            </Typography>

                            <Typography sx={{ maxWidth: 420, fontWeight: 600, fontSize: { xs: 15, md: 18 }, lineHeight: 1.4 }}>
                                Construction and home improvement made affordable for everyone.
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1.5, sm: 3 }}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                                <Button
                                    aria-describedby={id}
                                    variant="contained"
                                    size="large"
                                    onClick={handleClick}
                                    sx={{
                                        backgroundColor: 'common.white',
                                        color: 'grey.900',
                                        px: 4,
                                        borderRadius: 2.5,
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
                                        ':hover': { backgroundColor: 'grey.50' }
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Link
                                    href={paths.whyFree}
                                    underline="always"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        color: 'common.white',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecorationColor: 'rgba(255,255,255,0.6)'
                                    }}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: 17 }} />
                                    Read why we’re 100% free
                                </Link>
                            </Stack>
                        </Stack>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                            marginThreshold={16}
                            slotProps={{
                                paper: {
                                    sx: { maxWidth: 'calc(100vw - 32px)' }
                                }
                            }}
                            sx={{ mt: 1 }}
                        >
                            <Box sx={{ p: 2 }}>
                                <Stack
                                    direction={downXSm ? 'column' : 'row'}
                                    spacing={1}
                                    sx={{ width: downXSm ? 'min(280px, 100%)' : 'auto' }}
                                >
                                    <Button
                                        component="a"
                                        href={user ? paths.cabinet.projects.create : paths.login.createProject}
                                        variant="outlined"
                                        startIcon={<HomeIcon />}
                                        fullWidth={downXSm}
                                        onClick={handleClose}
                                        sx={{ whiteSpace: 'nowrap' }}
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
                                        fullWidth={downXSm}
                                        onClick={handleClose}
                                        sx={{ whiteSpace: 'nowrap' }}
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
                    <Box
                        component="img"
                        src="/assets/Worker.png"
                        alt="CTMASS specialist"
                        sx={{ display: { xs: 'none', md: 'block' }, height: { md: 260, lg: 300 }, flexShrink: 0 }}
                    />
                </Stack>
            </Container>
        </Box>
    );
}