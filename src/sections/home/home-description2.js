import { useState } from "react";

import CottageIcon from "@mui/icons-material/Cottage";
import ConstructionIcon from "@mui/icons-material/Construction";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import CheckIcon from "@mui/icons-material/Check";
import EmailIcon from "@mui/icons-material/Email";

import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
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
import { useTheme } from "@mui/material/styles";

import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import { paths } from "src/paths";
import { roles } from "src/roles";

const AutoPlayViews = autoPlay(SwipeableViews);

const CARDS = [
    {
        id: "homeowners",
        bg: "linear-gradient(180deg, rgba(245,246,249,1) 0%, rgba(245,246,249,1) 30%, rgba(228,230,250,1) 100%)",
        title: "For homeowners",
        subtitle: "Need help?",
        subtitleColor: "success.main",
        lead:
            "Are you looking for construction services to do your residential projects?",
        bullets: [
            "Find Reliable Contractors",
            "Read Genuine Reviews",
            "Get Budget-Friendly Options",
            "Access Local Services",
            "Enjoy Free Project Listings",
            "Receive Fast Support",
            "Start your project today!"
        ],
        learnMore: paths.forHomeowners,
        primaryBtn: {
            label: "Become a site resident",
            hrefCustomer: paths.register.customer,
            hrefLogged: paths.cabinet.projects.create
        }
    },
    {
        id: "contractors",
        central: true,
        bg: "linear-gradient(180deg,#1F2D77 0%,#15256f 40%,#1F2D77 100%)",
        shadow: "0px 16px 60px rgba(0,0,0,.25)",
        title: "For contractors",
        subtitle: "Service providers",
        subtitleColor: "success.main",
        lead:
            "If you are offering professional services, you can advertise them on this site for free.",
        bullets: [
            "Advertise Your Services for Free",
            "Promote Your Services",
            "Create a Professional Portfolio",
            "Showcase Significant Projects",
            "Connect with Other Contractors",
            "Find Reliable Staff",
            "Search for Job Opportunities",
            "Manage Account Privacy",
            "Start showcasing your expertise today!"
        ],
        learnMore: paths.forContractors,
        primaryBtn: {
            label: "Become a service provider",
            hrefWorker: paths.cabinet.profiles.specialistCreateWizard,
            hrefGuest: paths.register.serviceProvider,
            hrefLoggedWorker: paths.cabinet.projects.find.index
        },
        illustration: "/assets/Worker.png"
    },
    {
        id: "partners",
        bg: "linear-gradient(180deg, rgba(245,246,249,1) 0%, rgba(245,246,249,1) 30%, rgba(213,236,247,1) 100%)",
        title: "For partners",
        subtitle: "Partner with Us",
        subtitleColor: "success.main",
        lead:
            "Are you interested in collaborating to create value in the construction industry?",
        bullets: [
            "Showcase Your Brand to the Right Audience",
            "Leverage Marketing Opportunities",
            "Share Insights and Resources",
            "Drive Mutual Growth and Success"
        ],
        learnMore: paths.forPartners,
        primaryBtn: {
            label: "Become a partner",
            href: paths.partners.apply,
            icon: EmailIcon
        }
    }
];

const Card = ({ item, user }) => {
    const theme = useTheme();
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const PrimaryButton = () => {
        if (item.id === "homeowners") {
            const href = user
                ? paths.cabinet.projects.create
                : item.primaryBtn.hrefCustomer;
            return (
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    href={href}
                    sx={{ mt: 4 }}
                >
                    {item.primaryBtn.label}
                </Button>
            );
        }

        if (item.id === "contractors") {
            let href;
            if (!user) href = item.primaryBtn.hrefGuest;
            else if (user.role !== roles.WORKER) href = item.primaryBtn.hrefWorker;
            else href = item.primaryBtn.hrefLoggedWorker;

            return (
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    size="large"
                    component={RouterLink}
                    href={href}
                    sx={{ mt: 4 }}
                >
                    {item.primaryBtn.label}
                </Button>
            );
        }

        if (item.id === "partners") {
            const Icon = item.primaryBtn.icon;
            return (
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    href={item.primaryBtn.href}
                    startIcon={<Icon />}
                    sx={{ mt: 4 }}
                >
                    {item.primaryBtn.label}
                </Button>
            );
        }
        return null;
    };

    return (
        <Box
            sx={{
                position: "relative",
                px: { xs: 3, md: 4 },
                py: { xs: 5, md: 7 },
                borderRadius: 3,
                background: item.bg,
                color: item.central ? "common.white" : "text.primary",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: item.central ? item.shadow : "0px 6px 18px rgba(16,24,40,0.06)",
                overflow: "visible",
                transition: "transform .25s",
                "&:hover": {
                    transform: "translateY(-6px) scale(1.03)"
                }
            }}
            style={{ marginTop: (downMd && (item.id !== 'homeowners')) ? '80px' : undefined }}
        >
            {item.illustration && (
                <Box
                    component="img"
                    src={item.illustration}
                    alt=""
                    sx={{
                        width: { xs: 120, md: 160 },
                        position: "absolute",
                        top: { xs: -70, md: -90 },
                        left: "50%",
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                        userSelect: "none"
                    }}
                />
            )}

            {(item.central || !item.central) && (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ mb: 2, mt: item.illustration ? { xs: 6, md: 8 } : 0 }}
                >
                    {item.central && (
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.common.white
                            }}
                        >
                            <SvgIcon
                                sx={{
                                    color: theme.palette.text.primary
                                }}
                            >
                                {item.id === "homeowners" && <CottageIcon />}
                                {item.id === "contractors" && <ConstructionIcon />}
                                {item.id === "partners" && <Diversity1Icon />}
                            </SvgIcon>
                        </Avatar>
                    )}

                    <Typography
                        variant="h6"
                        sx={{ textTransform: "uppercase", fontWeight: 600 }}
                    >
                        {item.title}
                    </Typography>
                </Stack>
            )}

            <Typography
                variant="h5"
                sx={{ color: item.subtitleColor, textAlign: "center", mb: 1 }}
            >
                {item.subtitle}
            </Typography>

            <Typography
                variant="body2"
                sx={{ textAlign: "center", maxWidth: 340, mx: "auto", mb: 3 }}
            >
                {item.lead}
            </Typography>

            <Stack
                component="ul"
                spacing={1}
                sx={{
                    listStyle: "none",
                    pl: 0,
                    mb: 4,
                    "& li": { display: "flex", alignItems: "flex-start", gap: 1 }
                }}
            >
                {item.bullets.map((txt) => (
                    <Box component="li" key={txt}>
                        <SvgIcon
                            sx={{
                                color: "success.main",
                                fontSize: 18,
                                mt: "2px"
                            }}
                        >
                            <CheckIcon />
                        </SvgIcon>
                        <Typography variant="body2">{txt}</Typography>
                    </Box>
                ))}
            </Stack>

            <PrimaryButton />

            <Typography
                component={RouterLink}
                href={item.learnMore}
                sx={{
                    textDecoration: "underline",
                    textAlign: "center",
                    color: item.central ? "common.white" : "primary.main",
                    mt: 3
                }}
            >
                Learn more
            </Typography>
        </Box>
    );
};

export const HomeDescription2 = () => {
    const theme = useTheme();
    const { user } = useAuth();

    const downSm = useMediaQuery(theme.breakpoints.down("sm"));

    const [index, setIndex] = useState(0);

    return (
        <Box sx={{ position: "relative", pb: 12 }}>
            <Container maxWidth="lg">
                <Typography
                    align="center"
                    variant="h3"
                    sx={{ mb: { xs: 4, md: 19 } }}
                    fontWeight={500}
                >
                    Use CTMASS
                </Typography>

                {downSm ? (
                    <>
                        <AutoPlayViews
                            index={index}
                            onChangeIndex={(i) => setIndex(i)}
                            enableMouseEvents
                            resistance
                            style={{
                                overflow: 'visible',
                                paddingTop: downSm ? '70px' : '50px'
                            }}
                            containerStyle={{
                                overflow: 'visible'
                            }}
                            slideStyle={{
                                overflow: 'visible'
                            }}
                        >
                            {CARDS.map((c) => (
                                <Box key={c.id} sx={{ px: 2 }}>
                                    <Card item={c} user={user} />
                                </Box>
                            ))}
                        </AutoPlayViews>

                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            sx={{ mt: 2 }}
                        >
                            {CARDS.map((_, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor:
                                            i === index
                                                ? theme.palette.primary.main
                                                : theme.palette.grey[400],
                                        transition: "all .3s"
                                    }}
                                />
                            ))}
                        </Stack>
                    </>
                ) : (
                    <Grid
                        container
                        spacing={4}
                        alignItems="stretch"
                        justifyContent="center"
                    >
                        {CARDS.map((c) => (
                            <Grid
                                key={c.id}
                                xs={12}
                                md={4}
                                sx={{
                                    transform: c.central ? "translateY(-24px)" : "none",
                                    zIndex: c.central ? 10 : 5
                                }}
                            >
                                <Card item={c} user={user} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box >
    );
};