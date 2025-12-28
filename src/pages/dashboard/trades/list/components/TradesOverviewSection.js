import { useMemo } from 'react';
import { Grid, Skeleton } from '@mui/material';
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
        <Grid container spacing={3}>
            {cards.map((card) => (
                <Grid item xs={12} md={4} key={card.id}>
                    {loading ? (
                        <Skeleton
                            variant="rounded"
                            animation="wave"
                            height={134}
                            sx={{ borderRadius: 2 }}
                        />
                    ) : (
                        <TradeStatCard
                            icon={card.icon}
                            label={card.label}
                            value={card.value}
                        />
                    )}
                </Grid>
            ))}
        </Grid>
    );
}

export default TradesOverviewSection;