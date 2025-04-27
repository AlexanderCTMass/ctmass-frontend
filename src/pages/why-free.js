import React from 'react';
import {
    Avatar,
    Box,
    Container,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography, useMediaQuery,
    useTheme, Button, Grid, Modal
} from '@mui/material';
import {Engineering, Group, Handshake, Message, Store, Home, Construction} from '@mui/icons-material';
import {Seo} from "src/components/seo";
import {usePageView} from "src/hooks/use-page-view";
import {paths} from 'src/paths';
import {useAuth} from "src/hooks/use-auth";
import {roles} from "src/roles";

const Page = () => {
    usePageView();
    const theme = useTheme();
    const {user} = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <>
            <Seo title="Why CTMASS Is Free"/>
            <Box
                component="main"
                sx={{flexGrow: 1}}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'neutral.800'
                            : 'neutral.50',
                        pb: '40px',
                        pt: '120px'
                    }}
                >
                    <Container maxWidth="lg" sx={{py: 4}}>
                        <Paper elevation={3} sx={{p: 4, borderRadius: 2}}>
                            {/* Header Section */}
                            <Box sx={{textAlign: 'center', mb: 4}}>
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.primary.main,
                                        mb: 2
                                    }}
                                >
                                    Why CTMASS Is Free
                                </Typography>
                                <Divider sx={{my: 2}}/>
                            </Box>

                            {/* Founder Introduction with Photo */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 4,
                                flexDirection: {xs: 'column', md: 'row'}
                            }}>
                                <Box
                                    component="img"
                                    src={'/assets/jacob-with-son.jpg'}
                                    alt="Jacob with his son"
                                    sx={{
                                        width: {xs: '100%', md: 300},
                                        height: {xs: 'auto', md: 169}, // Сохраняем пропорции 1280x720 (300x169)
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        mb: {xs: 3, md: 0},
                                        mr: {md: 4},
                                        boxShadow: 3,
                                        border: `3px solid ${theme.palette.primary.light}`
                                    }}
                                />
                                <Box sx={{flex: 1}}>
                                    <Typography variant="h6" component="p" sx={{fontWeight: 600}}>
                                        I'm Jacob, the founder of CTMASS.com
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        A local, free platform built with one simple goal: to help homeowners in
                                        Massachusetts and Connecticut connect directly with trusted, verified
                                        contractors—without hidden fees or paid leads.
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Mission Statement */}
                            <Box sx={{
                                backgroundColor: theme.palette.primary.light,
                                p: 3,
                                borderRadius: 1,
                                mb: 4,
                                borderLeft: `4px solid ${theme.palette.primary.main}`
                            }}>
                                <Typography variant="h5" component="h2" sx={{mb: 1}}>
                                    Our Mission
                                </Typography>
                                <Typography>
                                    To make construction and home improvement more affordable, transparent,
                                    and efficient for everyone in our region.
                                </Typography>
                            </Box>

                            {/* Differentiator Section */}
                            <Box sx={{mb: 4}}>
                                <Typography variant="h5" component="h2" sx={{mb: 2}}>
                                    What Sets Us Apart
                                </Typography>
                                <Typography paragraph>
                                    We're not trying to reinvent the wheel. There are many platforms out there.
                                    But what sets us apart is that we are free and we are local—we know this
                                    community because we live and work here.
                                </Typography>
                                <Typography paragraph>
                                    I'm a licensed Construction Supervisor and HVAC technician in Massachusetts,
                                    with over 15 years of experience in construction. I work at Cooley Dickinson
                                    Hospital in Northampton, where my son was born, and where I speak with
                                    contractors every day. I see their dedication, their skill, and their
                                    challenges—and I wanted to build something to support them and the homeowners
                                    they serve.
                                </Typography>
                            </Box>

                            {/* Why Free Section */}
                            <Box sx={{
                                backgroundColor: theme.palette.primary.light,
                                p: 3,
                                borderRadius: 1,
                                mb: 4,
                                borderLeft: `4px solid ${theme.palette.primary.main}`
                            }}>
                                <Typography variant="h5" component="h2" sx={{mb: 2}}>
                                    So why is CTMASS.com free?
                                </Typography>
                                <Typography>
                                    Because it can be. I hold a Master of Science in Control Systems Engineering,
                                    and I'm deeply connected with talented IT specialists. We build and support
                                    this platform using our own skills and resources, which means we're not tied
                                    to expensive software development costs. We're not here to charge contractors
                                    for leads. Our focus is on quality connections, meaningful reviews, and
                                    creating tools people actually want to use—without the price tag.
                                </Typography>
                            </Box>

                            {/* Upcoming Features */}
                            <Box sx={{mb: 4}}>
                                <Typography variant="h5" component="h2" sx={{mb: 2}}>
                                    We are working to introduce:
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Message color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText primary="Direct messaging between contractors"/>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Group color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="A professional social media network for the construction community"/>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Store color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="A marketplace for tools, leftover materials, and local services"/>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Handshake color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="A hiring platform for construction companies to hire skilled specialists"/>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Engineering color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="And more tools to help build trust and grow your presence"/>
                                    </ListItem>
                                </List>
                            </Box>

                            {/* Call to Action */}
                            <Box sx={{
                                textAlign: 'center',
                                p: 3,
                                backgroundColor: theme.palette.grey[100],
                                borderRadius: 1
                            }}>
                                <Typography variant="h6" component="p" sx={{mb: 2}}>
                                    Whether you're a homeowner, contractor, local supply store, or service provider—
                                    there's a place for you here.
                                </Typography>
                                <Typography variant="h5" component="p" sx={{fontWeight: 600}}>
                                    We invite you to add your favorite contractors, share your feedback,
                                    and help us grow this community.
                                </Typography>
                            </Box>

                            {/* Новый CTA блок */}
                            <Box sx={{
                                mt: 6,
                                textAlign: 'center',
                                p: 4,
                                backgroundColor: theme.palette.primary.light,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.primary.main}`
                            }}>
                                <Typography variant="h4" component="h2" sx={{mb: 2, fontWeight: 700}}>
                                    Ready to Get Started?
                                </Typography>
                                <Typography variant="h6" sx={{mb: 4}}>
                                    Join our growing community today - it's completely free!
                                </Typography>

                                <Stack
                                    direction={isMobile ? "column" : "row"}
                                    spacing={2}
                                    justifyContent="center"
                                >
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        size="large"
                                        startIcon={<Home/>}
                                        href={user ? paths.cabinet.projects.create : paths.login.createProject}// Замените на ваш путь
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            minWidth: isMobile ? '100%' : 200
                                        }}
                                    >
                                        {user ? "Find Specialist" : "I'm a Homeowner"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        startIcon={<Construction/>}
                                        href={user ? (user.role === roles.WORKER ? paths.cabinet.projects.find.index : paths.cabinet.profiles.specialistCreateWizard) : paths.register.serviceProvider}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            minWidth: isMobile ? '100%' : 200
                                        }}
                                    >
                                        {user ? (user.role === roles.WORKER ? "Find Projects" : "Start providing services") : "I'm a Contractor"}
                                    </Button>
                                </Stack>

                                <Typography variant="body2" sx={{mt: 3, color: 'text.secondary'}}>
                                    No credit card required. Sign up in less than 2 minutes.
                                </Typography>
                            </Box>
                        </Paper>
                    </Container>
                </Box></Box>
        </>
    );
};

export default Page;