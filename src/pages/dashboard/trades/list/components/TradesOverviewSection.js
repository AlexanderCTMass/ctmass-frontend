import { useMemo } from 'react';
import { Box, Skeleton } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TradeStatCard from './TradeStatCard';

function TradesOverviewSection({ stats, loading }) {
    const cards = useMemo(() => [
        {
            id: 'totalTrades',
            label: 'Total trades',
            value: stats?.totalTrades ?? 0,
            icon: <Inventory2OutlinedIcon />
        },
        {
            id: 'totalViewsThisWeek',
            label: 'Total views this week',
            value: stats?.totalViewsThisWeek ?? 0,
            icon: <VisibilityOutlinedIcon />
        },
        {
            id: 'newOrders',
            label: 'New orders across trades',
            value: stats?.newOrders ?? 0,
            icon: <ShoppingCartOutlinedIcon />
        }
    ], [stats]);

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }
            }}
        >
            {cards.map((card) => (
                loading ? (
                    <Skeleton
                        key={card.id}
                        variant="rounded"
                        animation="wave"
                        height={134}
                        sx={{ borderRadius: 2 }}
                    />
                ) : (
                    <TradeStatCard
                        key={card.id}
                        icon={card.icon}
                        label={card.label}
                        value={card.value}
                    />
                )
            ))}
        </Box>
    );
}

export default TradesOverviewSection;