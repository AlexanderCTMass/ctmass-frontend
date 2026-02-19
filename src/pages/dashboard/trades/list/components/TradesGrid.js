import { Grid } from '@mui/material';
import TradeCard from './TradeCard';
import TradeCardSkeleton from './TradeCardSkeleton';
import TradesEmptyState from './TradesEmptyState';
import AddTradeCard from './AddTradeCard';

function TradesGrid({
    trades,
    loading,
    onCreateTrade,
    onViewTrade,
    onEditTrade,
    onToggleTradeVisibility,
    onActivateTrade,
    onRemoveTrade
}) {
    if (!loading && (!trades || trades.length === 0)) {
        return (
            <Grid paddingLeft={3} paddingRight={0}>
                <TradesEmptyState onCreateTrade={onCreateTrade} />
            </Grid>
        );
    }

    return (
        <Grid container spacing={3}>
            {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Grid item xs={12} md={4} key={`skeleton-${index}`}>
                        <TradeCardSkeleton />
                    </Grid>
                ))
                : trades.map((trade) => (
                    <Grid item xs={12} md={4} key={trade.id}>
                        <TradeCard
                            trade={trade}
                            onView={onViewTrade}
                            onEdit={onEditTrade}
                            onToggleVisibility={onToggleTradeVisibility}
                            onActivate={onActivateTrade}
                            onRemove={onRemoveTrade}
                        />
                    </Grid>
                ))}

            {!loading && trades && trades.length > 0 && (
                <Grid item xs={12} md={4}>
                    <AddTradeCard onClick={onCreateTrade} />
                </Grid>
            )}
        </Grid>
    );
}

export default TradesGrid;