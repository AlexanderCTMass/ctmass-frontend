import { useCallback } from 'react';
import { Box, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useUserTrades } from 'src/hooks/use-user-trades';
import { paths } from 'src/paths';
import { tradesApi } from 'src/api/trades';
import { profileApi } from 'src/api/profile';
import TradesPageHeader from './components/TradesPageHeader';
import TradesOverviewSection from './components/TradesOverviewSection';
import TradesGrid from './components/TradesGrid';

const normalizeStatus = (status = '') => {
    const normalized = status.toString().trim().toLowerCase();

    if (normalized.includes('on') && normalized.includes('review')) {
        return 'on_review';
    }

    if (normalized.includes('fix')) {
        return 'fix_it';
    }

    if (normalized.includes('not') && normalized.includes('active')) {
        return 'not_active';
    }

    if (normalized.includes('hidden')) {
        return 'hidden';
    }

    if (normalized.includes('reject') || normalized.includes('ban')) {
        return 'rejected';
    }

    return 'active';
};

function TradesListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { trades, loading, stats } = useUserTrades(user?.id);

    const handleCreateTrade = useCallback(() => {
        navigate(paths.dashboard.trades.create);
    }, [navigate]);

    const handleViewTrade = useCallback((trade) => {
        if (!trade?.id) return;
        navigate(paths.dashboard.trades.view.replace(':tradeId', trade.id));
    }, [navigate]);

    const handleEditTrade = useCallback((trade) => {
        if (!trade?.id) return;
        navigate(paths.dashboard.trades.edit.replace(':tradeId', trade.id));
    }, [navigate]);

    const handleToggleVisibility = useCallback(async (trade) => {
        if (!trade?.id) return;

        const statusKey = normalizeStatus(trade.status);
        if (statusKey === 'rejected') {
            return;
        }

        const nextStatus = statusKey === 'hidden' ? 'active' : 'hidden';
        await tradesApi.updateTrade(trade.id, { status: nextStatus });
    }, []);

    const handleActivateTrade = useCallback(async (trade) => {
        if (!trade?.id) return;
        await tradesApi.updateTrade(trade.id, { status: 'active' });
    }, []);

    const handleRemoveTrade = useCallback(async (trade) => {
        if (!trade?.id) return;

        const confirmed = window.confirm('Remove this trade permanently?');
        if (!confirmed) {
            return;
        }

        await tradesApi.removeTrade(trade.id);
        if (user?.id) {
            await profileApi.removeServiceByTradeId(user.id, trade.id).catch(() => {});
        }
    }, [user?.id]);

    return (
        <>
            <Seo title="My Trades" />
            <Box component="main" sx={{
                px: { xs: 2, sm: 3, lg: 6 },
                py: { xs: 7, sm: 8 },
                pb: { xs: 14, md: 18 },
            }}>
                <Container maxWidth={false}>
                    <Stack spacing={{ xs: 4, md: 6 }}>
                        <TradesPageHeader onCreateTrade={handleCreateTrade} />
                        <TradesOverviewSection stats={stats} loading={loading} />
                        <TradesGrid
                            trades={trades}
                            loading={loading}
                            onCreateTrade={handleCreateTrade}
                            onViewTrade={handleViewTrade}
                            onEditTrade={handleEditTrade}
                            onToggleTradeVisibility={handleToggleVisibility}
                            onActivateTrade={handleActivateTrade}
                            onRemoveTrade={handleRemoveTrade}
                        />
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

export default TradesListPage;