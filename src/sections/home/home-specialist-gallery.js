import { Box, Button, Skeleton, Stack, useMediaQuery } from '@mui/material';
import { RADIUS } from 'src/theme/ctmass-tokens';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useMemo } from 'react';
import { paths } from 'src/paths';
import { RouterLink } from 'src/components/router-link';
import useDictionary from 'src/hooks/use-dictionaries';
import { useWorkerShowcase } from 'src/queries/use-worker-profiles';
import VerticalPreviewCard from 'src/components/profiles/previewCards/vertical-preview-card';
import { mapWorkerToPreviewData } from 'src/utils/preview-card-utils';

export const specialistGridSx = {
    display: 'grid',
    gridTemplateColumns: {
        xs: 'repeat(2, minmax(0, 1fr))',
        md: 'repeat(3, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))'
    },
    gap: { xs: 1.5, sm: 2.5, md: 3 }
};

export const SpecialistCardLink = ({ worker, theme }) => (
    <Box
        component={RouterLink}
        href={paths.specialist.publicPage.replace(':profileId', worker.id)}
        sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
        <VerticalPreviewCard data={mapWorkerToPreviewData(worker, theme)} theme={theme} />
    </Box>
);

export const SpecialistGridSkeleton = ({ count }) => (
    <Box sx={specialistGridSx}>
        {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant="rounded" sx={{ borderRadius: '22px', height: { xs: 300, sm: 420 } }} />
        ))}
    </Box>
);

export const HomeSpecialistGallery = () => {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const { specialties } = useDictionary();
    const { data: workers = [], isLoading: loading } = useWorkerShowcase(12);
    const visibleCount = downSm ? 6 : 8;

    const currentWorkers = useMemo(
        () => workers.slice(0, visibleCount).map((worker) => ({
            ...worker,
            specialties: worker.specialties
                ? worker.specialties.map((specialty) => specialties.byId[specialty])
                : worker.specialties
        })),
        [workers, specialties, visibleCount]
    );

    return (
        <HomeSection bg="tint">
            <SectionHeading
                title="PRO specialists"
                subtitle={
                    <Stack direction="row" spacing={0.75} alignItems="center" component="span">
                        <TrendingUpRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <span>Verified experts in CT & MA</span>
                    </Stack>
                }
                action={
                    <Button
                        component={RouterLink}
                        href={paths.services.index}
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<SearchIcon />}
                        sx={{
                            display: { xs: 'none', sm: 'inline-flex' },
                            px: 5,
                            py: 1.5,
                            borderRadius: RADIUS.tile,
                            fontSize: 18,
                            fontWeight: 700,
                            boxShadow: '0 12px 24px rgba(22, 179, 100, 0.28)'
                        }}
                    >
                        Find
                    </Button>
                }
            />

            {loading ? (
                <SpecialistGridSkeleton count={visibleCount} />
            ) : (
                <Box sx={specialistGridSx}>
                    {currentWorkers.map((worker) => (
                        <SpecialistCardLink key={worker.id} worker={worker} theme={theme} />
                    ))}
                </Box>
            )}

            <Box sx={{ mt: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'center' }}>
                <Button
                    component={RouterLink}
                    href={paths.services.index}
                    variant="outlined"
                    color="success"
                    size="large"
                    endIcon={<ChevronRightRoundedIcon />}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        px: 5,
                        py: 1.5,
                        borderRadius: RADIUS.tile,
                        borderWidth: 1.5,
                        fontWeight: 700,
                        bgcolor: 'common.white',
                        '&:hover': { borderWidth: 1.5 }
                    }}
                >
                    View all PRO specialists
                </Button>
            </Box>
        </HomeSection>
    );
};
