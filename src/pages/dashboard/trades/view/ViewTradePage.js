import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton, Stack } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { useTrade } from 'src/queries/use-trades';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';
import { BackLink, DashPage } from 'src/components/ctmass-ui';
import TradeMainInfo from './components/TradeMainInfo';
import TradeTabs from './components/TradeTabs';

const ViewTradePage = () => {
    const { tradeId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: trade, isLoading: loading, isError } = useTrade(tradeId);

    useEffect(() => {
        if (!tradeId || loading) {
            return;
        }
        if (isError || !trade || trade.ownerId !== user?.id) {
            navigate(paths.dashboard.trades.index);
        }
    }, [tradeId, loading, isError, trade, user?.id, navigate]);

    const handleEditTrade = useCallback(() => {
        if (!trade?.id) return;
        navigate(paths.dashboard.trades.edit.replace(':tradeId', trade.id));
    }, [navigate, trade]);

    if (loading) {
        return (
            <DashPage back={<BackLink href={paths.dashboard.trades.index}>My trades</BackLink>}>
                <Stack spacing={3}>
                    <Skeleton variant="rounded" height={260} sx={{ borderRadius: '28px' }} />
                    <Skeleton variant="rounded" height={360} sx={{ borderRadius: '22px' }} />
                </Stack>
            </DashPage>
        );
    }

    if (!trade) {
        return null;
    }

    return (
        <>
            <Seo title={`View Trade - ${trade.title || 'Trade'}`} />
            <DashPage back={<BackLink href={paths.dashboard.trades.index}>My trades</BackLink>}>
                    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
                        <TradeMainInfo
                            trade={trade}
                            onEdit={handleEditTrade}
                        />

                        <TradeTabs trade={trade} />
                    </Stack>
            </DashPage>
        </>
    );
};

export default ViewTradePage;
