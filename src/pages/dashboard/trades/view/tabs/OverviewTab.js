import { useMemo } from 'react';
import { Stack } from '@mui/material';
import TradeStatistics from '../components/TradeStatistics';
import ViewsSparklineChart from '../components/ViewsSparklineChart';

function OverviewTab({ trade }) {
    const viewToday = useMemo(() => Math.floor(Math.random() * 5) + 1, []);
    const viewsThisWeek = useMemo(() => Math.floor(Math.random() * 6) + 10, []);
    const requests = trade?.newOrders || 0;
    const ratingRank = 'No rank';

    return (
        <Stack spacing={4}>
            <TradeStatistics
                requests={requests}
                viewToday={viewToday}
                viewsThisWeek={viewsThisWeek}
                ratingRank={ratingRank}
            />

            <ViewsSparklineChart
                totalViews={viewsThisWeek}
            />
        </Stack>
    );
}

export default OverviewTab;
