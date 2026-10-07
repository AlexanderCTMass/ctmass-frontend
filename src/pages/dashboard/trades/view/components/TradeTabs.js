import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Tab,
    Tabs
} from '@mui/material';
import { Surface, pillTabsSx } from 'src/components/ctmass-ui';
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

const VALID_TAB_VALUES = TABS.map((t) => t.value);

function TradeTabs({ trade }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (() => {
        const fromUrl = searchParams.get('tab');
        return VALID_TAB_VALUES.includes(fromUrl) ? fromUrl : 'overview';
    })();
    const [currentTab, setCurrentTab] = useState(initialTab);

    useEffect(() => {
        const fromUrl = searchParams.get('tab');
        if (VALID_TAB_VALUES.includes(fromUrl) && fromUrl !== currentTab) {
            setCurrentTab(fromUrl);
        }
    }, [searchParams, currentTab]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        const next = new URLSearchParams(searchParams);
        if (newValue === 'overview') {
            next.delete('tab');
        } else {
            next.set('tab', newValue);
        }
        setSearchParams(next, { replace: true });
    };

    return (
        <Box>
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                aria-label="Trade sections"
                sx={{ ...pillTabsSx, display: { sm: 'inline-flex' }, maxWidth: '100%' }}
            >
                {TABS.map((tab) => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                        disableRipple
                    />
                ))}
            </Tabs>

            <Surface sx={{ mt: { xs: 2, md: 3 }, borderRadius: '22px !important' }}>
                {currentTab === 'overview' && <OverviewTab trade={trade} />}
                {currentTab === 'requests' && <RequestsTab trade={trade} />}
                {currentTab === 'portfolio' && <PortfolioTab trade={trade} />}
                {currentTab === 'reviews' && <ReviewsTab trade={trade} />}
            </Surface>
        </Box>
    );
}

export default TradeTabs;
