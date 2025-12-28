import { Box, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useUserTrades } from 'src/hooks/use-user-trades';
import { paths } from 'src/paths';
import TradesPageHeader from './components/TradesPageHeader';
import TradesOverviewSection from './components/TradesOverviewSection';
import TradesGrid from './components/TradesGrid';

function TradesListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { trades, loading, stats } = useUserTrades(user?.id);

    const handleCreateTrade = () => {
        navigate(paths.dashboard.trades.create);
    };

    return (
        <>
            <Seo title="My Trades" />
            <Box component="main" sx={{
                px: { xs: 2, sm: 3, lg: 6 },
                py: { xs: 7, sm: 8 },
                pb: { xs: 14, md: 18 },
                maxWidth: 1280,
            }}>
                <Container maxWidth="lg">
                    <Stack spacing={{ xs: 4, md: 6 }}>
                        <TradesPageHeader onCreateTrade={handleCreateTrade} />
                        <TradesOverviewSection stats={stats} loading={loading} />
                        <TradesGrid
                            trades={trades}
                            loading={loading}
                            onCreateTrade={handleCreateTrade}
                        />
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

export default TradesListPage;