import {Box, Button, Container, Divider, Grid, Stack, Tab, Tabs, Typography, useTheme} from '@mui/material';
import React, {useEffect, useState} from 'react';
import toast from "react-hot-toast";
import {projectsApi} from "src/api/projects";
import {Seo} from "src/components/seo";
import {ProjectStatus} from "src/enums/project-state";
import {useAuth} from "src/hooks/use-auth";
import {SpecialistMiniPreview} from "src/sections/components/specialist/specialist-mini-preview";
import {ProjectCreateForm} from "src/sections/dashboard/project/project-create-form";
import {FindSpecialistChatForm} from "src/sections/services/find-specialist-chat-form";

const useDraft = () => {
    const {user} = useAuth();
    const [draft, setDraft] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
            setLoading(true);
            if (user) {
                projectsApi.getUserDraftProject(user.id)
                    .then(r => {
                        if (r) {
                            setDraft(r);
                            toast.custom("Draft project loaded");
                        } else {
                            projectsApi.createProject({userId: user.id, state: ProjectStatus.DRAFT})
                                .then(r => setDraft(r));
                            toast.custom("Draft project created");
                        }
                    })
                    .catch(reason => setError(reason))
                    .finally(() => setLoading(false));
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user]);

    return {draft, loading, error};
};

const specialists = [{
    name: "Marun Maran",
    link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
    specName: "Electrician",
    rating: "5,0",
    reviewsCount: 541,
    location: "Amherst, Mass",
    avatar: "https://picsum.photos/200/300"
},
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://picsum.photos/200/300"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://picsum.photos/200"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }, {
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Fenandes Muchini",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Samokatchik",
        rating: "5,0",
        reviewsCount: 16,
        location: "Philadelphia, Pennsylvania",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
    {
        name: "Sidney Crosby",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Hockey player",
        rating: "3,4",
        reviewsCount: 643,
        location: "Boston, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    }];


function SpecialistListScrollable(props: { theme: any, callbackfn: (specialist, index) => any }) {
    return <Grid item xs={12} lg={4} sx={{height: "calc(100vh - 150px)"}}>
        <Typography sx={{fontSize: "22px", fontWeight: 400, mt: 1}}>
            <Typography
                component="span"
                sx={{
                    mr: 1,
                    background: "#DCDEE0",
                    padding: "10px",
                    borderRadius: "12px"
                }}
                variant="inherit"
            >259</Typography>
            specialists
        </Typography>
        <Box sx={{
            pt: 4,
            maxHeight: "100%",
            overflowY: "hidden",
            scrollbarWidth: "none",
            "&:hover": {
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: `${props.theme.palette.primary.main} #f1f1f1`,
            },
            "&::-webkit-scrollbar": {
                width: "8px"
            },
            "&:hover::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "10px"
            },
            "&:hover::-webkit-scrollbar-thumb": {
                background: props.theme.palette.primary.main,
                borderRadius: "10px"
            },
            "&:hover::-webkit-scrollbar-thumb:hover": {
                background: props.theme.palette.primary.dark
            }
        }}>
            {specialists.map(props.callbackfn)}
        </Box>
    </Grid>;
}

function SpecialistList(props: { theme: any, callbackfn: (specialist, index) => any }) {
    return <Grid item xs={12} lg={4}>
        <Typography sx={{fontSize: "22px", fontWeight: 400, mt: 1}}>
            <Typography
                component="span"
                sx={{
                    mr: 1,
                    background: "#DCDEE0",
                    padding: "10px",
                    borderRadius: "12px"
                }}
                variant="inherit"
            >259</Typography>
            specialists
        </Typography>
        <Box sx={{
            pt: 4
        }}>
            {specialists.map(props.callbackfn)}
        </Box>
    </Grid>;
}

const Page = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0); // Состояние для активной вкладки
    const {draft, loading, error} = useDraft();

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };


    return (
        <>
            <Seo title="Services"/>
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                    pb: '40px',
                    pt: '100px'
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={1}>
                        <Typography variant="h2">
                            Find a specialist
                            <Typography
                                component="span"
                                color="primary.main"
                                variant="inherit"
                            > for your project</Typography>
                        </Typography>
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography sx={{fontSize: "22px", fontWeight: 600}}>Electrical</Typography>
                            <Typography sx={{fontSize: "22px", fontWeight: 600}}>·</Typography>
                            <Typography sx={{fontSize: "22px", fontWeight: 300}}>Renovation & Construction</Typography>
                            <Button variant={"text"} color={"inherit"} sx={{fontWeight: 300, ml: 3}}>Choose another
                                service</Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {/* Левая колонка с прокруткой */}
                        <SpecialistList theme={theme} callbackfn={(specialist, index) => (
                            <Box key={index} sx={{pb: 2}}>
                                <SpecialistMiniPreview specialist={{
                                    ...specialist,
                                    avatar: "https://robohash.org/user" + index + ".png?set=set2"
                                }}/>
                                <Divider sx={{pt: 2}}/>
                            </Box>
                        )}/>

                        {/* Правая колонка без прокрутки */}
                        <Grid item xs={12} lg={8}>
                            <Box>
                                {Boolean(activeTab === 0 && draft) && (
                                    <ProjectCreateForm project={draft}/>
                                )}
                                {activeTab === 1 && (
                                    <Typography variant="body1">Content for Page Two</Typography>
                                )}
                                {activeTab === 2 && (
                                    <Typography variant="body1">Content for Page Three</Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Page;
