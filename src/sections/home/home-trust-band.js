import { Box, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import { RouterLink } from 'src/components/router-link';
import useDictionary from 'src/hooks/use-dictionaries';
import { paths } from 'src/paths';
import { useWorkerShowcase } from 'src/queries/use-worker-profiles';
import { BRAND, FONT } from 'src/theme/ctmass-tokens';

const FALLBACK = '/assets/avatars/defaultUser.jpg';

const Fact = ({ value, label }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography
            sx={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: { xs: 20, md: 30 },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: BRAND.navy,
                fontVariantNumeric: 'tabular-nums'
            }}
        >
            {value}
        </Typography>
        <Typography sx={{ mt: 0.25, fontSize: { xs: 12, md: 14 }, color: BRAND.muted, fontWeight: 500 }}>{label}</Typography>
    </Box>
);

export const HomeTrustBand = () => {
    const { specialties } = useDictionary();
    const { data: workers = [] } = useWorkerShowcase(12);
    const tradesCount = specialties?.allIds?.length || 0;

    const faces = useMemo(
        () => workers.filter((worker) => worker.avatar && worker.avatar !== FALLBACK).slice(0, 5),
        [workers]
    );

    const facts = [
        tradesCount ? { value: tradesCount, label: 'trades covered' } : null,
        { value: '$0', label: 'fees for homeowners' },
        { value: 'CT & MA', label: 'local pros only' }
    ].filter(Boolean);

    return (
        <Box component="section" aria-label="Why homeowners use CTMASS" sx={{ py: { xs: 4, md: 5 }, bgcolor: '#FFFFFF' }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                        alignItems: 'center',
                        gap: { xs: 3, md: 6 }
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                        {faces.length > 0 && (
                            <Stack direction="row" sx={{ flexShrink: 0, pl: 1 }}>
                                {faces.map((worker, index) => (
                                    <Box
                                        key={worker.id}
                                        component="img"
                                        src={worker.avatar}
                                        alt={worker.businessName || worker.name || 'CTMASS pro'}
                                        loading="lazy"
                                        sx={{
                                            width: { xs: 38, md: 48 },
                                            height: { xs: 38, md: 48 },
                                            ml: -1,
                                            display: { xs: index > 3 ? 'none' : 'block', sm: 'block' },
                                            borderRadius: '14px',
                                            objectFit: 'cover',
                                            border: '3px solid #FFFFFF',
                                            boxShadow: `0 6px 14px ${alpha(BRAND.navy, 0.16)}`
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, color: BRAND.ink, fontSize: { xs: 14, md: 17 }, lineHeight: 1.3 }}>
                                Local pros are already here
                            </Typography>
                            <Box
                                component={RouterLink}
                                href={paths.services.index}
                                sx={{
                                    fontSize: { xs: 13, md: 14 },
                                    fontWeight: 600,
                                    color: BRAND.green,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline', textUnderlineOffset: 3 }
                                }}
                            >
                                See their profiles and reviews
                            </Box>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: `repeat(${facts.length}, minmax(0, 1fr))`, md: `repeat(${facts.length}, auto)` },
                            justifyContent: { md: 'end' },
                            columnGap: { xs: 1.5, md: 6 },
                            pt: { xs: 3, md: 0 },
                            borderTop: { xs: `1px solid ${alpha(BRAND.navy, 0.08)}`, md: 'none' }
                        }}
                    >
                        {facts.map((fact) => (
                            <Fact key={fact.label} value={fact.value} label={fact.label} />
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};
