import { useState } from 'react';
import {
    Box,
    Card,
    Tab,
    Tabs
} from '@mui/material';
import OverviewTab from '../tabs/OverviewTab';
import RequestsTab from '../tabs/RequestsTab';
import PortfolioTab from '../tabs/PortfolioTab';
import ReviewsTab from '../tabs/ReviewsTab';

const TABS = [
    { value: 'overview', label: 'Overview' },
    { value: 'requests', label: 'Requests' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'reviews', label: 'Reviews' }
];

function TradeTabs({ trade }) {
    const [currentTab, setCurrentTab] = useState('overview');

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                    px: { xs: 2, md: 3 },
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                {TABS.map((tab) => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                        sx={{ fontWeight: 600 }}
                    />
                ))}
            </Tabs>

            <Box sx={{ p: { xs: 3, md: 4 } }}>
                {currentTab === 'overview' && <OverviewTab trade={trade} />}
                {currentTab === 'requests' && <RequestsTab trade={trade} />}
                {currentTab === 'portfolio' && <PortfolioTab trade={trade} />}
                {currentTab === 'reviews' && <ReviewsTab trade={trade} />}
            </Box>
        </Card>
    );
}

export default TradeTabs;
