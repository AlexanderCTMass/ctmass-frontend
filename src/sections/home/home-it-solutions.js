import {Box, Button, Container, Stack, Typography, useMediaQuery, Popover} from '@mui/material';
import {paths} from 'src/paths';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CloudIcon from '@mui/icons-material/Cloud';
import { useState } from 'react';
import {useAuth} from "src/hooks/use-auth";
import {RouterLink} from "src/components/router-link";

export const HomeTechSolutions = () => {
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const downXSm = useMediaQuery((theme) => theme.breakpoints.down('425'));
    const [anchorEl, setAnchorEl] = useState(null);
    const {user} = useAuth();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'tech-solutions-popover' : undefined;

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
                        Professional IT Solutions
                    </Typography>
                    <Typography
                        align="center"
                        color="inherit"
                        variant="subtitle2"
                    >
                        Custom software development to automate and grow your business
                    </Typography>
                </Stack>
                <Stack
                    alignItems="center"
                    direction={downSm ? "column" : "row"}
                    justifyContent="center"
                    spacing={2}
                    sx={{mt: 3}}
                >
                    <Button
                        component={RouterLink}
                        href={paths.itSolutions}
                        variant="contained"
                        startIcon={<DesignServicesIcon/>}
                    >
                        Explore Our IT Services
                    </Button>
                    <Button
                        aria-describedby={id}
                        variant="contained"
                        size="large"
                        color={"warning"}
                        startIcon={<CodeIcon/>}
                        onClick={handleClick}
                    >
                        Get a Free Consultation
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
                                    component={RouterLink}
                                    href={paths.contact}
                                    variant="outlined"
                                    startIcon={<CloudIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        minWidth: 'max-content'
                                    }}
                                >
                                    Business Automation
                                </Button>
                                <Button
                                    component={RouterLink}
                                    href={paths.contact}
                                    variant="outlined"
                                    startIcon={<DesignServicesIcon />}
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        minWidth: 'max-content'
                                    }}
                                >
                                    Custom Development
                                </Button>
                            </Stack>
                        </Box>
                    </Popover>
                </Stack>
            </Container>
        </Box>
    );
}