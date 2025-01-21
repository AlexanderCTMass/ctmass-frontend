import React, {useState} from 'react';
import {Box, Container, Grid, Stack, Tab, Tabs, Typography, useTheme} from '@mui/material';
import {Seo} from "src/components/seo";

const Page = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0); // Состояние для активной вкладки

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue); // Обновляем активную вкладку
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
                        <Typography variant="h1">
                            Services
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body1"
                        >
                            Catalog of services from specialists
                        </Typography>
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
                        {/* Левый блок с вкладками */}
                        <Grid item xs={12} lg={3}>
                            <Tabs
                                orientation="vertical"
                                value={activeTab} // Управляемая активная вкладка
                                onChange={handleTabChange} // Обработчик переключения
                                aria-label="nav tabs example"
                                role="navigation"
                                sx={{
                                    textAlign: "left",
                                    alignItems: "flex-start" // Выравнивание по левому краю
                                }}
                            >
                                <Tab label="Create project add"/>
                                <Tab label="Support"/>
                                <Tab label="Specialties list"/>
                            </Tabs>
                        </Grid>

                        {/* Правый блок с контентом */}
                        <Grid item xs={12} lg={9}>
                            <Box>
                                {activeTab === 0 && (
                                    <Typography variant="body1">Content for Page One</Typography>
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
