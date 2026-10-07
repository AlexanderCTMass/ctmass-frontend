import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import useDictionary from 'src/hooks/use-dictionaries';
import { useWorkerShowcase } from 'src/queries/use-worker-profiles';
import { SpecialistCardLink, SpecialistGridSkeleton } from 'src/sections/home/home-specialist-gallery';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { FadeStack, SegmentedSwitch } from 'src/sections/home/segmented-switch';

const TABS = [
    { value: 'best', label: 'Best reviews', subtitle: 'The pros homeowners rated highest.' },
    { value: 'recent', label: 'Recently added', subtitle: 'New pros who just joined CTMASS.' }
];

const railSx = {
    display: 'grid',
    gap: { xs: 1.5, sm: 2.5, md: 3 },
    gridAutoFlow: { xs: 'column', md: 'row' },
    gridAutoColumns: { xs: 'calc((100% - 12px) / 2.15)', sm: 'calc((100% - 40px) / 2.3)' },
    gridTemplateColumns: { md: 'repeat(4, minmax(0, 1fr))' },
    overflowX: { xs: 'auto', md: 'visible' },
    scrollSnapType: { xs: 'x mandatory', md: 'none' },
    mx: { xs: -2, sm: -3, md: 0 },
    px: { xs: 2, sm: 3, md: 0 },
    pt: 1,
    pb: 2,
    scrollPaddingLeft: { xs: 16, sm: 24 },
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    '& > *': { scrollSnapAlign: 'start' }
};

const Rail = ({ workers }) => {
    const theme = useTheme();

    return (
        <Box sx={railSx}>
            {workers.map((worker) => (
                <SpecialistCardLink key={worker.id} worker={worker} theme={theme} />
            ))}
        </Box>
    );
};

export const HomeBests = () => {
    const { specialties } = useDictionary();
    const { data: workers = [], isLoading: loading } = useWorkerShowcase(12);
    const [tab, setTab] = useState(TABS[0].value);

    const mappedWorkers = useMemo(
        () => workers.map((w) => ({
            ...w,
            specialties: w.specialties ? w.specialties.map((id) => specialties.byId[id]) : w.specialties
        })),
        [workers, specialties]
    );

    const lists = useMemo(() => ({
        best: [...mappedWorkers]
            .filter((w) => w.reviewCount > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0))
            .slice(0, 4),
        recent: [...mappedWorkers]
            .sort((a, b) => {
                const aDate = a.registrationAt?.toDate?.() || new Date(0);
                const bDate = b.registrationAt?.toDate?.() || new Date(0);
                return bDate - aDate;
            })
            .slice(0, 4)
    }), [mappedWorkers]);

    const tabs = TABS.filter((item) => lists[item.value].length > 0);
    const active = tabs.find((item) => item.value === tab) || tabs[0];

    if (!loading && !tabs.length) return null;

    return (
        <HomeSection bg="white" sx={{ overflow: 'hidden' }}>
            <SectionHeading
                title="Pros worth a look"
                subtitle={active?.subtitle}
                action={
                    tabs.length > 1 && (
                        <SegmentedSwitch
                            ariaLabel="Choose a list of pros"
                            options={tabs}
                            value={active.value}
                            onChange={setTab}
                            sx={{ display: { xs: 'none', sm: 'grid' }, width: 340 }}
                        />
                    )
                }
            />

            {tabs.length > 1 && (
                <SegmentedSwitch
                    ariaLabel="Choose a list of pros"
                    options={tabs}
                    value={active.value}
                    onChange={setTab}
                    sx={{ display: { xs: 'grid', sm: 'none' }, mb: 2.5 }}
                />
            )}

            {loading ? (
                <SpecialistGridSkeleton count={4} />
            ) : (
                <FadeStack
                    activeKey={active.value}
                    items={tabs.map((item) => ({ key: item.value, content: <Rail workers={lists[item.value]} /> }))}
                />
            )}
        </HomeSection>
    );
};
