import {
    Box,
    Button,
    Container,
    TextField,
    OutlinedInput,
    IconButton,
    InputAdornment,
    Paper,
    Link,
    SvgIcon,
    Unstable_Grid2 as Grid,
    Stack,
    Typography,
    Divider,
    CardActions,
    Card,
    Avatar,
    Drawer,
    useMediaQuery,
    ButtonBase
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {useKindOfServices, useKindOfServicesMap} from "../../hooks/use-kind-of-services";
import {RouterLink} from "../../components/router-link";
import {SeverityPill} from "../../components/severity-pill";
import RefreshCcw02Icon from "@untitled-ui/icons-react/build/esm/RefreshCcw02";
import CottageIcon from '@mui/icons-material/Cottage';
import ConstructionIcon from '@mui/icons-material/Construction';
import * as React from "react";
import {useEffect, useState} from "react";
import FeedbackIcon from "@mui/icons-material/Feedback";
import {useDispatch, useSelector} from 'src/store';
import {thunks} from 'src/thunks/dictionary';
import {useAuth} from "../../hooks/use-auth";
import {paths} from 'src/paths';

const useSpecialtiesForMainPage = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getDictionary());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return specialties.allIds
        .map((id) => {
            const specialty = specialties.byId[id];
            let category = categories.byId[specialty.parent];
            return {...specialty, parentName: category ? category.label : ''};
        })
        .filter(specialty => specialty.img && specialty.accepted);
};

export const HomeFind = () => {
    const theme = useTheme();
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const smToMd = useMediaQuery((theme) => theme.breakpoints.between('sm', 'md'));
    const upMd = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const specialties = useSpecialtiesForMainPage();

    // const specialties = useKindOfServices().find(category => category.label === "Renovation and construction").childs;

    const sliderSettings = {
        arrows: true,
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: (!downSm ? 3 : 2),
        slidesToScroll: 2,
        adaptiveHeight: true,
        autoplay: true,
        lazyLoad: true,
        swipe: downSm
    };


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
                pb: '40px'
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
            <Container maxWidth="lg" sx={{py: 6}}>
                <Slider {...sliderSettings}>
                    {specialties.map((spec) => (
                        <div key={"1"}>
                            <Link
                                component={RouterLink}
                                href={paths.services.service.replace(":specialtyId", spec.id)}
                                underline="none"
                            >
                                <Card
                                    sx={{ml: 2}}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction={{
                                            xs: 'column',
                                            sm: 'row'
                                        }}
                                        spacing={3}
                                        sx={{
                                            px: (downSm ? 1 : 4),
                                            py: 3,
                                            minHeight: 117,
                                            backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 56%, rgba(255,255,255,0)), url(${spec.img})`,
                                            backgroundPosition: 'right',
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            ':hover': {
                                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                                cursor: 'pointer'
                                            },
                                        }}
                                    >
                                        <Box sx={{flexGrow: 1}}>
                                            <Typography
                                                color="text.primary"
                                                variant={up1024 ? "h5" : "h6"}
                                                gutterBottom
                                            >
                                                {spec.label}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {spec.parentName}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </Slider>
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
                        <li>Using our web-site service you can find for your project reliable
                            contractors or construction people
                        </li>
                        <li>Use other resident`s feedback and reviews.</li>
                        <li>We help you to find that meet your financial requirements.</li>
                        <li>Best price for new and used supplies and equipment (in future).</li>
                        <li>Place your project – find contractors today.</li>
                        <li>Find local contractors ( 30 miles radius area )</li>
                        <li>For registered on our web site residents we offer free project
                            placement, quick support and individual approach
                        </li>
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
                        <li>Enclose your evidences of significant projects.</li>
                        <li>Create your own portfolio.</li>
                        <li>Stay connect with other contractors.</li>
                        <li>Find new reliable and qualified staff.</li>
                        <li>Find job.</li>
                        <li>Enclose your professional certificate and licenses.</li>
                        <li>Make your account public or private.</li>
                        <li>Share your page with.</li>
                        <li>Best price for new and used supplies and equipment (in future).</li>
                        <li>Choose your geographic areas you are willing to work (30 miles radius).</li>
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
