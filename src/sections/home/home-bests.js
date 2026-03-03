import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Typography,
    Rating,
    Grid,
    CircularProgress,
    useMediaQuery,
    Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import { roles } from 'src/roles';
import { profileApi } from 'src/api/profile';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import useDictionary from 'src/hooks/use-dictionaries';
import { getSiteDuration } from 'src/utils/date-locale';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";


const Section = ({ title, workers }) => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const [slide, setSlide] = useState(0);

    if (!workers) return null;

    return (
        <Box sx={{ mb: { xs: 8, md: 14 } }}>
            <Typography variant="h4" align="center" sx={{ mb: 4 }}>
                {title}
            </Typography>

            {!downSm && (
                <Grid container spacing={{ sm: 2, md: 2, lg: 2, xl: 2}} justifyContent="center" sx={{ px: { lg: 2 } }}>
                    {workers.map((w) => (
                        <Grid item key={w.id} xs={12} sm={4} md={4}>
                            <HorizontalPreviewCard
                                data={mapWorkerToPreviewData(w, theme)}
                                theme={theme}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {downSm && (
                <>
                    <SwipeableViews enableMouseEvents index={slide} onChangeIndex={setSlide}>
                        {workers.map((w) => (
                            <Box key={w.id} sx={{ px: 1, width: '90%', mx: 'auto' }}>
                                <HorizontalPreviewCard
                                    data={mapWorkerToPreviewData(w, theme)}
                                    theme={theme}
                                />
                            </Box>
                        ))}
                    </SwipeableViews>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                        {workers.map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor:
                                        slide === i ? theme.palette.primary.main : theme.palette.grey[400]
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export const HomeBests = () => {
    const { specialties } = useDictionary();
    const [bestReviews, setBestReviews] = useState(null);
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 12);

                workers.forEach((w) => {
                    if (w.specialties) {
                        w.specialties = w.specialties.map((id) => specialties.byId[id]);
                    }
                });

                const best = [...workers]
                    .filter((w) => w.reviewCount > 0)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);

                const recentAdded = [...workers]
                    .sort((a, b) => {
                        const aDate = a.registrationAt?.toDate?.() || new Date(0);
                        const bDate = b.registrationAt?.toDate?.() || new Date(0);
                        return bDate - aDate;
                    })
                    .slice(0, 3);

                setBestReviews(best);
                setRecent(recentAdded);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (specialties) load();
    }, [specialties]);

    return (
        <Box sx={{ py: { xs: 4, md: 10 } }}>
            <Container maxWidth="lg">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Section title="Best reviews" workers={bestReviews} />
                        <Section title="Recently added" workers={recent} />
                    </>
                )}
            </Container>
        </Box>
    );
};