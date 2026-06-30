import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useUserTrades } from 'src/hooks/use-user-trades';
import { paths } from 'src/paths';
import { tradesApi } from 'src/api/trades';
import { profileApi } from 'src/api/profile';
import {
    RegistrationRewardModal,
    REGISTRATION_REWARD_KEY,
    LOGIN_TRADE_PROMPT_KEY
} from 'src/components/registration-reward-modal';
import {
    OnboardingUpsellModal,
    WORKER_UPSELL_KEY
} from 'src/components/onboarding-upsell-modal';
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
    const [searchParams, setSearchParams] = useSearchParams();

    const { trades, loading, stats } = useUserTrades(user?.id);

    const [showReward, setShowReward] = useState(false);
    const [showLoginTradePrompt, setShowLoginTradePrompt] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showPortfolioGuide, setShowPortfolioGuide] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem(REGISTRATION_REWARD_KEY)) {
            window.localStorage.removeItem(REGISTRATION_REWARD_KEY);
            setShowReward(true);
        } else if (window.localStorage.getItem(LOGIN_TRADE_PROMPT_KEY)) {
            window.localStorage.removeItem(LOGIN_TRADE_PROMPT_KEY);
            setShowLoginTradePrompt(true);
        }

        if (window.localStorage.getItem(WORKER_UPSELL_KEY)) {
            window.localStorage.removeItem(WORKER_UPSELL_KEY);
            setShowUpsell(true);
        }
    }, []);

    useEffect(() => {
        if (searchParams.get('portfolioGuide')) {
            setShowPortfolioGuide(true);
        }
    }, [searchParams]);

    const handleClosePortfolioGuide = useCallback(() => {
        setShowPortfolioGuide(false);
        if (searchParams.get('portfolioGuide')) {
            const next = new URLSearchParams(searchParams);
            next.delete('portfolioGuide');
            setSearchParams(next, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const hasNoTrades = !loading && trades.length === 0;

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

        if (statusKey === 'hidden') {
            const restoredStatus = trade.previousStatus && trade.previousStatus !== 'hidden'
                ? trade.previousStatus
                : 'active';
            await tradesApi.updateTrade(trade.id, { status: restoredStatus, previousStatus: null });
            return;
        }

        await tradesApi.updateTrade(trade.id, { status: 'hidden', previousStatus: statusKey });
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
            <RegistrationRewardModal
                open={showReward}
                onClose={() => setShowReward(false)}
                onCreateTrade={() => {
                    setShowReward(false);
                    handleCreateTrade();
                }}
            />
            <RegistrationRewardModal
                open={showLoginTradePrompt}
                showSignupReward={false}
                onClose={() => setShowLoginTradePrompt(false)}
                onCreateTrade={() => {
                    setShowLoginTradePrompt(false);
                    handleCreateTrade();
                }}
            />
            <OnboardingUpsellModal
                open={showUpsell}
                variant="worker"
                profileId={user?.id}
                onClose={() => setShowUpsell(false)}
            />
            <Dialog
                open={showPortfolioGuide}
                onClose={handleClosePortfolioGuide}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        textAlign: 'center',
                        boxShadow: (theme) => `0 24px 64px ${alpha(theme.palette.common.black, 0.22)}`
                    }
                }}
            >
                <Box
                    sx={{
                        pt: 4.5,
                        px: 4,
                        pb: 2,
                        background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`
                    }}
                >
                    <Box
                        sx={{
                            width: 76,
                            height: 76,
                            mx: 'auto',
                            mb: 2,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                            boxShadow: (theme) => `0 0 0 8px ${alpha(theme.palette.primary.main, 0.06)}`
                        }}
                    >
                        <PhotoLibraryRoundedIcon sx={{ fontSize: 38 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Editing your portfolio
                    </Typography>
                </Box>

                <DialogContent sx={{ px: 4, pt: 1, pb: 1 }}>
                    {hasNoTrades ? (
                        <Stack spacing={2.5} alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                You’ll be able to edit your portfolio once you create your first
                                trade. Each trade has its own{' '}
                                <Box component="strong" sx={{ color: 'text.primary' }}>Portfolio</Box>{' '}
                                tab where you can showcase your projects.
                            </Typography>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'success.main',
                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.14)
                                }}
                            >
                                <RocketLaunchOutlinedIcon />
                            </Box>
                        </Stack>
                    ) : (
                        <Stack spacing={2.5}>
                            <Typography variant="body1" color="text.secondary">
                                Your portfolio lives inside each of your trades — just follow two
                                quick steps:
                            </Typography>
                            <Stack spacing={1.5}>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{
                                        textAlign: 'left',
                                        p: 1.75,
                                        borderRadius: 3,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flexShrink: 0,
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.main',
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14)
                                        }}
                                    >
                                        <VisibilityOutlinedIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="body2">
                                        Open a specific trade with the{' '}
                                        <Box component="strong" sx={{ color: 'text.primary' }}>View</Box> button.
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{
                                        textAlign: 'left',
                                        p: 1.75,
                                        borderRadius: 3,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flexShrink: 0,
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.main',
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14)
                                        }}
                                    >
                                        <CollectionsOutlinedIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="body2">
                                        Switch to the{' '}
                                        <Box component="strong" sx={{ color: 'text.primary' }}>Portfolio</Box>{' '}
                                        tab to add or update your projects.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', px: 4, pb: 3.5, pt: 2 }}>
                    {hasNoTrades ? (
                        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }} justifyContent="center">
                            <Button color="inherit" onClick={handleClosePortfolioGuide}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleClosePortfolioGuide();
                                    handleCreateTrade();
                                }}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                Create trade
                            </Button>
                        </Stack>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleClosePortfolioGuide}
                            sx={{ borderRadius: 2, py: 1.1 }}
                        >
                            Got it
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default TradesListPage;