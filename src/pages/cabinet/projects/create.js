import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import debug from "debug";
import { useEffect, useState } from "react";
import { Seo } from 'src/components/seo';
import { ProjectStatus } from "src/enums/project-state";
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from "src/hooks/use-auth";
import { ProjectCreateForm } from "src/sections/dashboard/project/create/project-create-form";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { paths } from "src/paths";
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
import { BackLink, Surface } from 'src/components/ctmass-ui';

const logger = debug("ProjectsCreate")

const useDraft = () => {
    const { user } = useAuth();
    const [draft, setDraft] = useState();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
        setLoading(true);

        let localProject = projectsLocalApi.restoreProject();

        if (!localProject) {
            localProject = {
                state: ProjectStatus.DRAFT,
                createdAt: new Date()
            };
            // projectsLocalApi.storeProject(localProject);
            // toast.custom("Draft projects created");
        }
        setDraft(localProject);
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user]);

    return { draft, loading, error };
};

const NEXT_STEPS = [
    { title: 'You describe the job', text: 'What needs doing, when, and where. It takes about two minutes.' },
    { title: 'Local pros respond', text: 'Contractors who serve your area send their offers.' },
    { title: 'You pick who to hire', text: 'Compare profiles and reviews, then chat before you decide.' }
];

const Page = () => {
    usePageView();
    const { draft } = useDraft();

    return (
        <>
            <Seo title="Cabinet: Project Create" />
            <Box component="main" sx={{ px: { xs: 2, sm: 3 } }}>
                <BackLink href={paths.cabinet.projects.index}>All projects</BackLink>
                <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 30, sm: 38, md: 46 } }}>
                    Describe your project
                </Typography>
                <Typography sx={{ mt: { xs: 1, md: 1.5 }, maxWidth: 620, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, fontWeight: 500, lineHeight: 1.55 }}>
                    Tell contractors what you need. Posting is free and you only talk to the pros you choose.
                </Typography>

                <Box
                    sx={{
                        mt: { xs: 3, md: 5 },
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px', lg: 'minmax(0, 1fr) 380px' },
                        alignItems: 'start',
                        gap: { xs: 3, md: 4, lg: 6 }
                    }}
                >
                    <Surface sx={{ minWidth: 0, p: { xs: 2.5, sm: 4, md: 5 } }}>
                        {draft ? (
                            <ProjectCreateForm project={draft} />
                        ) : (
                            <Stack spacing={2}>
                                <Skeleton variant="rounded" height={8} sx={{ borderRadius: 999 }} />
                                <Skeleton variant="rounded" height={56} sx={{ borderRadius: RADIUS.tile }} />
                                <Skeleton variant="rounded" height={56} sx={{ borderRadius: RADIUS.tile }} />
                                <Skeleton variant="rounded" height={160} sx={{ borderRadius: RADIUS.tile }} />
                            </Stack>
                        )}
                    </Surface>

                    <Box
                        component="aside"
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: 118 },
                            overflow: 'hidden',
                            borderRadius: RADIUS.panel,
                            color: '#FFFFFF',
                            boxShadow: SHADOW.lg,
                            background: `linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`
                        }}
                    >
                        <Box sx={{ position: 'relative', aspectRatio: { xs: '16 / 9', md: '4 / 3' } }}>
                            <Box
                                component="img"
                                src="/assets/renovation-project-min.jpg"
                                alt="A couple planning a renovation with paint cans and drawings"
                                loading="lazy"
                                sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                            />
                            <Box
                                aria-hidden
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(180deg, ${alpha(BRAND.navyDeep, 0)} 45%, ${BRAND.navy} 100%)`
                                }}
                            />
                        </Box>
                        <Box sx={{ p: { xs: 3, md: 3.5 }, pt: { xs: 1, md: 1 } }}>
                            <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
                                What happens next
                            </Typography>
                            <Box component="ol" sx={{ listStyle: 'none', m: 0, mt: 2.5, p: 0, display: 'grid', gap: 2.25 }}>
                                {NEXT_STEPS.map((step, index) => (
                                    <Stack component="li" key={step.title} direction="row" spacing={1.75}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                flexShrink: 0,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: alpha('#FFFFFF', 0.12),
                                                fontFamily: FONT.display,
                                                fontWeight: 800,
                                                fontSize: 14
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>{step.title}</Typography>
                                            <Typography sx={{ mt: 0.25, fontSize: 14, lineHeight: 1.5, color: alpha('#FFFFFF', 0.72) }}>{step.text}</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Box>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${alpha('#FFFFFF', 0.14)}`, fontSize: 14, fontWeight: 600 }}
                            >
                                <CheckRoundedIcon sx={{ fontSize: 20, color: BRAND.green }} />
                                <span>$0 for homeowners. No fees, no commission.</span>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Page;
