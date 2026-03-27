import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import ShopHeader from './components/ShopHeader';
import EarnCoinsSection from './components/EarnCoinsSection';
import ShopItems from './components/ShopItems';

const LoyaltyShopPage = () => {
    usePageView();
    const [earnDialogOpen, setEarnDialogOpen] = useState(false);

    const handleOpenEarnDialog = useCallback(() => {
        setEarnDialogOpen(true);
    }, []);

    const handleCloseEarnDialog = useCallback(() => {
        setEarnDialogOpen(false);
    }, []);

    return (
        <>
            <Seo title="CTMASS Coins Shop" />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <ShopHeader onEarnCoinsClick={handleOpenEarnDialog} />
                <ShopItems />
                <EarnCoinsSection open={earnDialogOpen} onClose={handleCloseEarnDialog} />
            </Box>
        </>
    );
};

export default LoyaltyShopPage;
