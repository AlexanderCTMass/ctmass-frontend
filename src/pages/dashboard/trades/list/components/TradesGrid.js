import { Box } from '@mui/material';
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
        return <TradesEmptyState onCreateTrade={onCreateTrade} />;
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }
            }}
        >
            {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TradeCardSkeleton key={`skeleton-${index}`} />
                ))
                : trades.map((trade) => (
                    <TradeCard
                        key={trade.id}
                        trade={trade}
                        onView={onViewTrade}
                        onEdit={onEditTrade}
                        onToggleVisibility={onToggleTradeVisibility}
                        onActivate={onActivateTrade}
                        onRemove={onRemoveTrade}
                    />
                ))}

            {!loading && trades && trades.length > 0 && (
                <AddTradeCard onClick={onCreateTrade} />
            )}
        </Box>
    );
}

export default TradesGrid;