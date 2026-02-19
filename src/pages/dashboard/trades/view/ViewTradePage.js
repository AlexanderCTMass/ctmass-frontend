import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Container,
    Stack
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { tradesApi } from 'src/api/trades';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';
import TradeHeader from './components/TradeHeader';
import TradeMainInfo from './components/TradeMainInfo';
import TradeTabs from './components/TradeTabs';

const ViewTradePage = () => {
    const { tradeId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trade, setTrade] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTrade = async () => {
            if (!tradeId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const tradeData = await tradesApi.getTrade(tradeId);

                if (!tradeData) {
                    navigate(paths.dashboard.trades.index);
                    return;
                }

                if (tradeData.ownerId !== user?.id) {
                    navigate(paths.dashboard.trades.index);
                    return;
                }

                setTrade(tradeData);
            } catch (error) {
                console.error('Failed to load trade:', error);
                navigate(paths.dashboard.trades.index);
            } finally {
                setLoading(false);
            }
        };

        loadTrade();
    }, [tradeId, user?.id, navigate]);

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
            <Seo title={`View Trade - ${trade.title || 'Resume'}`} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                    px: 6
                }}
            >
                <Container
                    maxWidth={false}
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
