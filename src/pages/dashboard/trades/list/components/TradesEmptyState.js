import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { BRAND, RADIUS, displayTitleSx } from 'src/theme/ctmass-tokens';
import { btn, surfaceSx } from 'src/components/ctmass-ui';

const POINTS = [
    'Pick a specialty from the catalogue',
    'Add your service area and price',
    'Show past work in the portfolio'
];

function TradesEmptyState({ onCreateTrade }) {
    return (
        <Box
            sx={{
                ...surfaceSx,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 0.8fr)' },
                alignItems: 'center'
            }}
        >
            <Box sx={{ p: { xs: 3, sm: 5, md: 7 } }}>
                <Typography component="h2" sx={{ ...displayTitleSx, fontSize: { xs: 26, md: 36 } }}>
                    Create your first trade
                </Typography>
                <Typography sx={{ mt: 1.5, maxWidth: 440, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, lineHeight: 1.6 }}>
                    A trade puts you in search results and lets homeowners send you requests. It is free.
                </Typography>
                <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0, mt: 3 }}>
                    {POINTS.map((point) => (
                        <Stack component="li" key={point} direction="row" spacing={1.25} alignItems="center">
                            <Box sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(BRAND.green, 0.12), color: BRAND.green }}>
                                <CheckRoundedIcon sx={{ fontSize: 17 }} />
                            </Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: BRAND.ink }}>{point}</Typography>
                        </Stack>
                    ))}
                </Stack>
                <Button startIcon={<AddRoundedIcon />} onClick={onCreateTrade} sx={{ ...btn.green, mt: 4, minHeight: 52, px: 3.5, width: { xs: '100%', sm: 'auto' } }}>
                    Create trade
                </Button>
            </Box>
            <Box
                sx={{
                    alignSelf: 'stretch',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, md: 5 },
                    pt: { xs: 0, md: 5 },
                    bgcolor: { md: alpha(BRAND.navy, 0.03) },
                    borderLeft: { md: `1px solid ${alpha(BRAND.navy, 0.08)}` }
                }}
            >
                <Box
                    component="img"
                    src="/assets/gallery/plumbers/19191.jpg"
                    alt="Illustrated tradespeople at work"
                    loading="lazy"
                    sx={{ width: '100%', maxWidth: { xs: 240, md: 340 }, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: RADIUS.card, mixBlendMode: 'multiply' }}
                />
            </Box>
        </Box>
    );
}

export default TradesEmptyState;
