import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

function TradesOverviewSection({ stats, loading }) {
    const cards = useMemo(() => [
        {
            id: 'totalTrades',
            label: 'Trades',
            value: stats?.totalTrades ?? 0,
            icon: <Inventory2OutlinedIcon />
        },
        {
            id: 'totalViewsThisWeek',
            label: 'Views this week',
            value: stats?.totalViewsThisWeek ?? 0,
            icon: <VisibilityOutlinedIcon />
        },
        {
            id: 'newOrders',
            label: 'New orders',
            value: stats?.newOrders ?? 0,
            icon: <ShoppingCartOutlinedIcon />
        }
    ], [stats]);

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                color: '#FFFFFF',
                boxShadow: SHADOW.lg,
                background: `radial-gradient(60% 120% at 100% 100%, ${alpha(BRAND.green, 0.3)} 0%, ${alpha(BRAND.green, 0)} 60%), linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`
            }}
        >
            {cards.map((card, index) => (
                <Stack
                    key={card.id}
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={{ xs: 1.25, md: 2.5 }}
                    sx={{
                        minWidth: 0,
                        px: { xs: 1.75, sm: 3, md: 4 },
                        py: { xs: 2.25, md: 3.5 },
                        borderLeft: index === 0 ? 0 : `1px solid ${alpha('#FFFFFF', 0.14)}`
                    }}
                >
                    <Box
                        aria-hidden
                        sx={{
                            width: { xs: 36, md: 52 },
                            height: { xs: 36, md: 52 },
                            flexShrink: 0,
                            borderRadius: { xs: '11px', md: '16px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha('#FFFFFF', 0.12),
                            '& svg': { fontSize: { xs: 19, md: 26 } }
                        }}
                    >
                        {card.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        {loading ? (
                            <Skeleton variant="rounded" width={56} height={36} sx={{ bgcolor: alpha('#FFFFFF', 0.16), borderRadius: '10px' }} />
                        ) : (
                            <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 28, md: 40 }, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                                {card.value}
                            </Typography>
                        )}
                        <Typography sx={{ mt: 0.5, fontSize: { xs: 12, md: 14 }, fontWeight: 600, lineHeight: 1.3, color: alpha('#FFFFFF', 0.72) }}>
                            {card.label}
                        </Typography>
                    </Box>
                </Stack>
            ))}
        </Box>
    );
}

export default TradesOverviewSection;
