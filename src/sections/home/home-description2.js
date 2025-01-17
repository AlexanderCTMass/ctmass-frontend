import {Diversity1} from "@mui/icons-material";
import ConstructionIcon from "@mui/icons-material/Construction";
import CottageIcon from "@mui/icons-material/Cottage";
import {
    Avatar,
    Box,
    Button,
    Container,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import * as React from "react";
import {useState} from "react";
import {RouterLink} from "src/components/router-link";
import {useAuth} from "src/hooks/use-auth";
import {paths} from "src/paths";

export const HomeDescription2 = () => {
    const theme = useTheme();
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const smToMd = useMediaQuery((theme) => theme.breakpoints.between('sm', 'md'));
    const upMd = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    return (
        <>
            <Box
                sx={{
                    backgroundColor: 'neutral.800',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'top center',
                    backgroundImage: 'url("/assets/gradient-bg.svg")',
                    color: 'neutral.100',
                    py: downSm ? '35px' : '60px',
                    position: "relative",
                    overflow: "hidden" // чтобы градиент оставался в пределах Box
                }}
            >
                {/*<video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        position: "absolute",
                        zIndex: 0,
                        width: "750px",height: "300px",
                        left: "calc(50% - 375px)",
                        top: 0,
                        transition: "opacity, 2s ease-in-out",
                    }}
                >
                    <source src="/assets/video/for-homeowners.mp4" type="video/mp4" />
                </video>
                 Градиентный прозрачный эффект
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        width: "750px",
                        left: "calc(50% - 375px)",
                        height: "300px", // Высота градиента
                        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)",
                        pointerEvents: "none", // Чтобы градиент не мешал кликам
                        zIndex: 1 // Поверх видео
                    }}
                />*/}
                <Container maxWidth="lg">
                    <Stack spacing={2} sx={{pb: "30px"}}>
                        <Typography
                            align="center"
                            color="inherit"
                            variant="h3"
                        >
                            Who Is Our <Typography
                            component="span"
                            color="primary.main"
                            variant="inherit"
                        >Platform For?</Typography>
                        </Typography>
                    </Stack>
                    <Grid container alignItems={"center"}>
                        <Grid
                            xs={12}
                            sm={4}
                            style={{
                                borderRadius: "20px 0 0 20px",
                                border: "1px solid #fff",
                                borderRight: "none",
                                padding: "20px",
                                textAlign: "center",
                                transition: "transform 0.3s ease-in-out", // Плавный переход
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)"; // Увеличиваем элемент
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)"; // Возвращаем к оригиналу
                            }}
                        >
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction={"column"}
                                spacing={up1024 ? 3 : 1}
                                sx={{
                                    p: downSm ? 0 : 3, pb: 4,
                                    // ':hover': {
                                    //     color: (theme) => `${theme.palette.primary.main}`
                                    // },
                                }}
                            >
                                <Stack direction={downSm ? "column" : "row"} alignItems="center"
                                       justifyContent={"center"} spacing={downSm ? 2 : 1}>
                                    <Avatar>
                                        <SvgIcon>
                                            <CottageIcon/>
                                        </SvgIcon>
                                    </Avatar>
                                    <Typography sx={{fontSize: downSm ? 16 : 18, textTransform: 'uppercase'}}>
                                        For homeowners
                                    </Typography>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography variant={upMd ? "h5" : "h6"} sx={{textAlign: 'center'}}
                                                color="primary.main">
                                        Need help?
                                    </Typography>
                                    <Typography variant="h6" component="div" sx={{textAlign: 'justify'}}>
                                        Are you looking for construction services to do your residential projects?
                                    </Typography>
                                </Stack>
                                <Box style={{zIndex: 2, marginBottom: "20px", textAlign: "left"}}>
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
                                    <Button component={RouterLink} href={paths.auth.firebase.registerCustomer}
                                            size={downSm ? "medium" : "large"}
                                            variant="contained">Become
                                        a site resident</Button>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid
                            xs={12}
                            sm={4}
                            style={{
                                background: 'linear-gradient(to top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.8))',
                                backdropFilter: 'blur(10px)', // добавляет эффект размытия под градиентом
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // тень для объёмности
                                borderRadius: "20px",
                                color: '#000',
                                padding: "20px",
                                paddingTop: "5px",
                                textAlign: "center",
                                transition: "transform 0.3s ease-in-out", // Плавный переход
                                cursor: "pointer",
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)"; // Увеличиваем элемент
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)"; // Возвращаем к оригиналу
                            }}
                        >
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction={"column"}
                                spacing={up1024 ? 3 : 1}
                                sx={{
                                    p: downSm ? 0 : 3, pb: 4,
                                    // cursor: "pointer",
                                    // ':hover': {
                                    //     color: (theme) => `${theme.palette.primary.main}`
                                    // },
                                }}
                            >
                                <Stack direction={downSm ? "column" : "row"} alignItems="center"
                                       justifyContent={"center"} spacing={downSm ? 2 : 1}>
                                    <Avatar>
                                        <SvgIcon>
                                            <ConstructionIcon/>
                                        </SvgIcon>
                                    </Avatar>
                                    <Typography sx={{fontSize: downSm ? 16 : 18, textTransform: 'uppercase'}}>
                                        For contractors
                                    </Typography>
                                </Stack>
                                {/*<SeverityPill color="info" sx={{fontSize: 18}}>
                                    <Stack direction={"row"} alignItems="center" justifyContent={"center"} spacing={1}>
                                        <SvgIcon>
                                            <ConstructionIcon/>
                                        </SvgIcon>
                                        <p>For contractors</p>
                                    </Stack>
                                </SeverityPill>*/}
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography variant={upMd ? "h5" : "h6"} sx={{textAlign: 'center'}}
                                                color="error.main">
                                        Service providers
                                    </Typography>
                                    <Typography variant="h6" component="div" sx={{textAlign: 'justify'}}>
                                        If you are offering professional services, you can advertise them on this
                                        site for free.
                                    </Typography>
                                    {/* <Typography variant="h6" component="div" sx={{pt: 1, pb: 3}}>
                                        We offer a professional web page showcasing the best examples of your work.
                                    </Typography>*/}
                                </Stack>
                                <Box style={{zIndex: 2, marginBottom: "10px", textAlign: "left"}}>
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
                                    <Button variant="contained" component="a" color="error"
                                            size={downSm ? "medium" : "large"}
                                            href={paths.auth.firebase.registerSpecialist}>Become a
                                        service provider</Button>
                                </Stack>
                            </Stack>
                        </Grid>


                        <Grid
                            xs={12}
                            sm={4}
                            style={{
                                padding: "20px",
                                borderRadius: "0 20px 20px 0",
                                border: "1px solid #fff",
                                borderLeft: "none",
                                textAlign: "center",
                                transition: "transform 0.3s ease-in-out", // Плавный переход
                                cursor: "pointer",
                                zIndex: 5
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)"; // Увеличиваем элемент
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)"; // Возвращаем к оригиналу
                            }}
                        >
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                direction={"column"}
                                spacing={up1024 ? 3 : 1}
                                sx={{
                                    p: downSm ? 0 : 3, pb: 4,
                                    // ':hover': {
                                    //     color: (theme) => `${theme.palette.primary.main}`
                                    // },
                                }}
                            >
                                <Stack direction={downSm ? "column" : "row"} alignItems="center"
                                       justifyContent={"center"} spacing={downSm ? 2 : 1}>
                                    <Avatar>
                                        <SvgIcon>
                                            <Diversity1/>
                                        </SvgIcon>
                                    </Avatar>
                                    <Typography sx={{fontSize: downSm ? 16 : 18, textTransform: 'uppercase'}}>
                                        For partners
                                    </Typography>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography variant={upMd ? "h5" : "h6"} sx={{textAlign: 'center'}}
                                                color="primary.main">
                                        Partner with Us
                                    </Typography>
                                    <Typography variant="h6" component="div" sx={{textAlign: 'justify'}}>
                                        Are you interested in collaborating to create value in the construction
                                        industry?
                                    </Typography>
                                </Stack>
                                <Box style={{zIndex: 2, marginBottom: "20px", textAlign: "left"}}>
                                    <ul>
                                        <li>Showcase Your Brand to the Right Audience</li>
                                        <li>Leverage Marketing Opportunities</li>
                                        <li>Share Insights and Resources</li>
                                        <li>Drive Mutual Growth and Success</li>
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
                                    <Button component={RouterLink} href={paths.auth.firebase.registerCustomer}
                                            size={downSm ? "medium" : "large"}
                                            variant="contained">Join us as a partner today</Button>
                                </Stack>
                            </Stack>
                        </Grid>

                    </Grid>
                </Container>
            </Box>

        </>
    );
};