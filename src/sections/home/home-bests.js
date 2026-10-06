import { Box, Stack, Typography } from '@mui/material';
import { displayTitleSx } from 'src/theme/ctmass-tokens';
import { HomeSection } from 'src/sections/home/home-section';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import useDictionary from 'src/hooks/use-dictionaries';
import { useWorkerShowcase } from 'src/queries/use-worker-profiles';
import { SpecialistCardLink, SpecialistGridSkeleton } from 'src/sections/home/home-specialist-gallery';

const rowSx = {
    display: 'grid',
    gap: { xs: 1.5, sm: 2.5, md: 3 },
    gridAutoFlow: { xs: 'column', md: 'row' },
    gridAutoColumns: { xs: 'calc((100% - 12px) / 2.15)', sm: 'calc((100% - 40px) / 2.3)' },
    gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))' },
    overflowX: { xs: 'auto', md: 'visible' },
    scrollSnapType: { xs: 'x mandatory', md: 'none' },
    mx: { xs: -2, sm: -3, md: 0 },
    px: { xs: 2, sm: 3, md: 0 },
    pt: 1,
    pb: 3,
    scrollPaddingLeft: { xs: 16, sm: 24 },
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    '& > *': { scrollSnapAlign: 'start' }
};

const Section = ({ title, caption, icon, workers }) => {
    const theme = useTheme();

    if (!workers?.length) return null;

    return (
        <Box sx={{ mb: { xs: 4, md: 8 }, '&:last-of-type': { mb: 0 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2, md: 3 } }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(31, 45, 119, 0.08)',
                        color: '#1F2D77'
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography component="h3" sx={{ ...displayTitleSx, fontSize: { xs: 22, md: 30 } }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {caption}
                    </Typography>
                </Box>
            </Stack>

            <Box sx={rowSx}>
                {workers.map((worker) => (
                    <SpecialistCardLink key={worker.id} worker={worker} theme={theme} />
                ))}
            </Box>
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
        <HomeSection bg="white" sx={{ overflow: 'hidden', pb: { xs: 3, md: 4 } }}>
            {loading ? (
                <SpecialistGridSkeleton count={3} />
            ) : (
                <>
                    <Section
                        title="Best reviews"
                        caption="Top-rated by homeowners"
                        icon={<StarRoundedIcon />}
                        workers={bestReviews}
                    />
                    <Section
                        title="Recently added"
                        caption="New pros who just joined"
                        icon={<FiberNewRoundedIcon />}
                        workers={recent}
                    />
                </>
            )}
        </HomeSection>
    );
};
