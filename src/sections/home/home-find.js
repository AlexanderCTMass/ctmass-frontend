import CloseIcon from '@mui/icons-material/Close';
import ConstructionIcon from '@mui/icons-material/Construction';
import CottageIcon from '@mui/icons-material/Cottage';
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    Card,
    Container,
    Drawer,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import * as React from "react";
import {useState} from "react";
import {paths} from 'src/paths';
import {RouterLink} from "../../components/router-link";
import {SeverityPill} from "../../components/severity-pill";
import {useAuth} from "../../hooks/use-auth";


export const HomeFind = () => {
    const theme = useTheme();
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const smToMd = useMediaQuery((theme) => theme.breakpoints.between('sm', 'md'));
    const upMd = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleClickOpen2 = () => {
        setOpen2(true);
    };

    const handleClickClose2 = () => {
        setOpen2(false);
    };

    return (
        <Box
            sx={{
                pt: '40px',
            }}
        >
            {/* <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <OutlinedInput
                                fullWidth
                                placeholder="How can I help you?"
                                startAdornment={(
                                    <InputAdornment position="start">
                                        <SvgIcon>
                                            <SearchMdIcon/>
                                        </SvgIcon>
                                    </InputAdornment>
                                )}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button fullWidth variant="contained" size="large">
                                Find
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </form>*/}
            <Container maxWidth="lg" sx={{pb: '40px'}}>
                <Card>
                    <Grid
                        container
                        sx={{
                            '& > *:not(:last-of-type)': {
                                borderRight: (theme) => ({
                                    md: `1px solid ${theme.palette.divider}`
                                }),
                                borderBottom: (theme) => ({
                                    xs: `1px solid ${theme.palette.divider}`,
                                    md: 'none'
                                })
                            }
                        }}
                    >
                        <Grid
                            xs={12}
                            sm={6}
                        >
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction={up1024 ? "row" : "column"}
                                spacing={up1024 ? 3 : 1}
                                onClick={handleClickOpen}
                                sx={{
                                    p: 3, pb: 4,
                                    cursor: "pointer",
                                    ':hover': {
                                        color: (theme) => `${theme.palette.primary.main}`
                                    },
                                }}
                            >
                                <Avatar>
                                    <SvgIcon>
                                        <CottageIcon/>
                                    </SvgIcon>
                                </Avatar>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography variant={upMd ? "h5" : "h6"} sx={{textAlign: 'center'}}>
                                        The owners who need a project
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="overline" sx={{textAlign: 'center', lineHeight: 1.2}}
                                    >
                                        Click here
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid
                            xs={12}
                            sm={6}
                        >
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction={up1024 ? "row" : "column"}
                                spacing={up1024 ? 3 : 1}
                                onClick={handleClickOpen2}
                                sx={{
                                    p: 3, pb: 4,
                                    cursor: "pointer",
                                    ':hover': {
                                        color: (theme) => `${theme.palette.primary.main}`
                                    },
                                }}
                            >
                                <Avatar>
                                    <SvgIcon>
                                        <ConstructionIcon/>
                                    </SvgIcon>
                                </Avatar>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography variant={upMd ? "h5" : "h6"} sx={{textAlign: 'center'}}>
                                        Service providers
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="overline"
                                        sx={{textAlign: 'center', lineHeight: 1.2}}
                                    >
                                        Click here to be listed{downSm && (<br/>)} on our website
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>

                    </Grid>
                </Card>
            </Container>
            <Drawer
                // anchor="right"
                onClose={handleClickClose}
                open={open}
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: 500,
                        p: 3,
                        pt: 20,
                        position: "relative"
                    }
                }}>
                <video
                    autoPlay
                    muted
                    loop
                    style={{
                        position: "absolute",
                        zIndex: 0,
                        width: "100%",
                        left: 0,
                        top: 0,
                        transition: "opacity, 2s ease-in-out"
                    }}
                >
                    <source src="/assets/video/for-homeowners.mp4" type="video/mp4"/>
                </video>
                <div style={{
                    position: "absolute",
                    width: "100%",
                    left: "0px",
                    zIndex: 1,
                    top: "0px",
                    background: "linear-gradient(to top, white, transparent)",
                    height: "284px"
                }}>

                </div>
                <Box style={{zIndex: 2}}>
                    <SeverityPill color="primary" sx={{fontSize: 18}}>
                        For homeowners
                    </SeverityPill>
                    <Typography variant="h5" component="div" sx={{py: 5}}>
                        Are you looking for construction services to do your residential projects?
                    </Typography>
                </Box>
                <Box style={{zIndex: 2, marginBottom: "20px"}}>
                    <ul>
                        <li>Find Reliable Contractors</li>
                        <li>Read Genuine Reviews</li>
                        <li>Get Budget-Friendly Options</li>
                        <li>Access Local Services</li>
                        <li>Enjoy Free Project Listings</li>
                        <li>Receive Fast Support</li>
                        <li>Start your project today!</li>
                    </ul>
                </Box>
                <Stack direction={"row"} spacing={2} justifyContent={"end"}>
                    {/*<Button component={RouterLink} href={paths.services.index}>Find a performer</Button>
                    {user ? (
                            <Button component={RouterLink} href={paths.dashboard.jobs.create} variant="contained">Create
                                Project Ad</Button>
                        ) :
                        (<Button component={RouterLink} href={paths.auth.firebase.registerCustomer} variant="contained">Become
                            a site resident</Button>)}*/}
                    <Button component={RouterLink} href={paths.auth.firebase.registerCustomer} variant="contained">Become
                        a site resident</Button>
                </Stack>
                {downSm && (<Box
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '50%',
                        top: 0,
                        boxShadow: 16,
                        margin: (theme) => theme.spacing(4),
                        position: 'fixed',
                        right: 0,
                        zIndex: 100
                    }}>
                    <ButtonBase
                        sx={{
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            color: 'primary.contrastText',
                            p: '10px'
                        }}
                        onClick={handleClickClose}
                    >
                        <SvgIcon>
                            <CloseIcon/>
                        </SvgIcon>
                    </ButtonBase>
                </Box>)}
            </Drawer>
            <Drawer
                anchor="right"
                onClose={handleClickClose2}
                open={open2}
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: 600,
                        p: 3,
                        pt: 20,
                        // position: "relative"
                    }
                }}>
                <video
                    autoPlay
                    muted
                    loop
                    style={{
                        position: "absolute",
                        zIndex: 0,
                        width: "100%",
                        left: 0,
                        top: 0,
                        transition: "opacity, 2s ease-in-out"
                    }}
                >
                    <source src="/assets/video/for-providers.mp4" type="video/mp4"/>
                </video>
                <div style={{
                    position: "absolute",
                    width: "100%",
                    left: "0px",
                    zIndex: 1,
                    top: "0px",
                    background: "linear-gradient(to top, white, transparent)",
                    height: "338px"
                }}>

                </div>
                <Box style={{zIndex: 2}}>
                    <SeverityPill color="primary" sx={{fontSize: 18}}>
                        For contractors
                    </SeverityPill>
                    <Typography variant="h5" component="div" sx={{pt: 5, pb: 1}}>
                        If you are offering professional services you can advertise your services on
                        this site for free.
                    </Typography>
                    <Typography variant="h6" component="div" sx={{pt: 1, pb: 3}}>
                        We are offering professional web-page showing the best
                        examples of your work.
                    </Typography>
                </Box>
                <Box style={{zIndex: 2, marginBottom: "20px"}}>
                    <ul>
                        <li>Advertise Your Services for Free</li>
                        <li>Promote Your Services</li>
                        <li>Create a Professional Portfolio</li>
                        <li>Showcase Significant Projects</li>
                        <li>Connect with Other Contractors</li>
                        <li>Find Reliable Staff</li>
                        <li>Search for Job Opportunities</li>
                        <li>Manage Account Privacy</li>
                        <li>Start showcasing your expertise today!</li>
                    </ul>
                </Box>
                <Stack direction={"row"} spacing={2} justifyContent={"end"}>
                    <Button variant="contained" component="a" href={paths.auth.firebase.registerSpecialist}>Become a
                        service provider</Button>
                </Stack>
                {downSm && <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '50%',
                        top: 0,
                        boxShadow: 16,
                        margin: (theme) => theme.spacing(4),
                        position: 'fixed',
                        right: 0,
                        zIndex: 100
                    }}>
                    <ButtonBase
                        sx={{
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            color: 'primary.contrastText',
                            p: '10px'
                        }}
                        onClick={handleClickClose2}
                    >
                        <SvgIcon>
                            <CloseIcon/>
                        </SvgIcon>
                    </ButtonBase>
                </Box>}
            </Drawer>

        </Box>
    );
};
