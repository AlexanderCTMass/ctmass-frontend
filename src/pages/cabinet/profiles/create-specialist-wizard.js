import { Box, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Scrollbar } from "src/components/scrollbar";
import { SpecialistCreateForm } from "src/sections/dashboard/specialist-profile/specialist-create-form";
import { useCallback, useState } from "react";
import { paths } from "src/paths";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";


const Page = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { width, height } = useWindowSize();

    usePageView();

    const handleComplete = useCallback(() => {
        setShowConfetti(true);

        // Скрываем конфетти через 3 секунды и делаем переход
        setTimeout(() => {
            setShowConfetti(false);
            navigate(paths.dashboard.overview.index, { replace: true });
        }, 4000);
    }, [navigate]);

    return (
        <>
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={900}
                    gravity={0.9}
                />
            )}

            <Seo title="Cabinet: Specialist profile create wizard" />
            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexGrow: 1
                }}
            >
                <Grid
                    container
                    sx={{ flexGrow: 1 }}
                >
                    <Grid
                        xs={12}
                        sm={4}
                        sx={{
                            backgroundImage: 'url(/assets/create-profile-bg.jpg)',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            borderRadius: "12px",
                            display: {
                                xs: 'none',
                                md: 'block'
                            }
                        }}
                    />
                    <Grid
                        xs={12}
                        md={8}
                        sx={{
                            p: {
                                xs: 4,
                                sm: 6,
                                md: 8
                            }
                        }}
                    >
                        <Scrollbar sx={{ maxHeight: "100%" }}>
                            <Stack
                                maxWidth="sm"
                                spacing={3}
                            >
                                <Typography variant="h4">
                                    Create Specialist profile
                                </Typography>
                                <SpecialistCreateForm onComplete={handleComplete} />

                            </Stack>
                        </Scrollbar>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default Page;
