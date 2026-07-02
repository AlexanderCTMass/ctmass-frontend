import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Container,
    Stack
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { useTrade } from 'src/queries/use-trades';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';
import TradeHeader from './components/TradeHeader';
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

    const handleShare = useCallback(() => {
    }, []);

    if (loading) {
        return (
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!trade) {
        return null;
    }

    return (
        <>
            <Seo title={`View Trade - ${trade.title || 'Trade'}`} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: { xs: 7, sm: 8 },
                    px: { xs: 2, sm: 3, lg: 6 }
                }}
            >
                <Container
                    maxWidth={false}
                    disableGutters
                >
                    <Stack spacing={4}>
                        <TradeHeader
                            title={trade.title}
                            status={trade.status}
                            onShare={handleShare}
                        />

                        <TradeMainInfo
                            trade={trade}
                            onEdit={handleEditTrade}
                        />

                        <TradeTabs trade={trade} />
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default ViewTradePage;
