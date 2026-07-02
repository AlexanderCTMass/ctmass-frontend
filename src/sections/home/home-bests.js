import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    useMediaQuery,
    Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';

import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import useDictionary from 'src/hooks/use-dictionaries';
import { useWorkerShowcase } from 'src/queries/use-worker-profiles';
import { mapWorkerToPreviewData } from "src/utils/preview-card-utils";
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
                <Grid container spacing={{ sm: 2, md: 3 }} justifyContent="center">
                    {workers.map((w) => (
                        <Grid item key={w.id} xs={12} sm={4} md={4}>
                            <Box
                                component={RouterLink}
                                href={paths.specialist.publicPage.replace(':profileId', w.id)}
                                sx={{ textDecoration: 'none', display: 'block' }}
                            >
                                <VerticalPreviewCard
                                    data={mapWorkerToPreviewData(w, theme)}
                                    theme={theme}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            {downSm && (
                <>
                    <SwipeableViews enableMouseEvents index={slide} onChangeIndex={setSlide}>
                        {workers.map((w) => (
                            <Box key={w.id} sx={{ px: 1 }}>
                                <Box
                                    component={RouterLink}
                                    href={paths.specialist.publicPage.replace(':profileId', w.id)}
                                    sx={{ textDecoration: 'none', display: 'block', mx: 'auto', '@media (max-width:420px)': { maxWidth: 220 } }}
                                >
                                    <VerticalPreviewCard
                                        data={mapWorkerToPreviewData(w, theme)}
                                        theme={theme}
                                    />
                                </Box>
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
    const { data: workers = [], isLoading: loading } = useWorkerShowcase(12);

    const mappedWorkers = useMemo(
        () => workers.map((w) => ({
            ...w,
            specialties: w.specialties ? w.specialties.map((id) => specialties.byId[id]) : w.specialties
        })),
        [workers, specialties]
    );

    const bestReviews = useMemo(
        () => [...mappedWorkers]
            .filter((w) => w.reviewCount > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3),
        [mappedWorkers]
    );

    const recent = useMemo(
        () => [...mappedWorkers]
            .sort((a, b) => {
                const aDate = a.registrationAt?.toDate?.() || new Date(0);
                const bDate = b.registrationAt?.toDate?.() || new Date(0);
                return bDate - aDate;
            })
            .slice(0, 3),
        [mappedWorkers]
    );

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