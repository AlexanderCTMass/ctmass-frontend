import { memo, useCallback } from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from 'src/hooks/use-auth';

const ShopHeader = memo(({ onEarnCoinsClick }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, isAuthenticated } = useAuth();

    const balance = user?.loyaltyBalance ?? 0;

    const handleEarnClick = useCallback(() => {
        onEarnCoinsClick?.();
    }, [onEarnCoinsClick]);

    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                background: isDark
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                    : 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)',
                pt: { xs: 14, sm: 16 },
                pb: { xs: 6, sm: 8 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255, 193, 7, 0.08)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -60,
                    left: -60,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255, 193, 7, 0.06)',
                    pointerEvents: 'none',
                }}
            />
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    spacing={4}
                >
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 36 }} />
                            <Typography
                                variant="overline"
                                sx={{
                                    color: '#FFC107',
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    fontSize: '0.8rem',
                                }}
                            >
                                CTMASS Rewards
                            </Typography>
                        </Stack>
                        <Typography
                            variant={isMobile ? 'h4' : 'h3'}
                            sx={{
                                fontWeight: 800,
                                color: '#fff',
                                mb: 2,
                                lineHeight: 1.2,
                            }}
                        >
                            CTMASS Coins Shop
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255,255,255,0.75)',
                                mb: 3,
                                maxWidth: 520,
                                lineHeight: 1.7,
                            }}
                        >
                            Earn CTMASS Coins by completing actions on the platform — registering,
                            posting projects, building your profile, and referring friends.
                            Redeem your coins for exclusive merchandise and premium platform benefits.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<EmojiEventsIcon />}
                                onClick={handleEarnClick}
                                sx={{
                                    backgroundColor: '#FFC107',
                                    color: '#1a237e',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        backgroundColor: '#FFB300',
                                    },
                                }}
                            >
                                How to Earn Coins
                            </Button>
                        </Stack>
                    </Box>

                    {isAuthenticated && (
                        <Box
                            sx={{
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,193,7,0.3)',
                                borderRadius: 3,
                                p: 3,
                                minWidth: { xs: '100%', md: 240 },
                                textAlign: 'center',
                            }}
                        >
                            <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 48, mb: 1 }} />
                            <Typography
                                variant="h3"
                                sx={{ color: '#FFC107', fontWeight: 800, lineHeight: 1 }}
                            >
                                {balance.toLocaleString()}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}
                            >
                                Your CTMASS Coins
                            </Typography>
                            <Chip
                                label="Available to spend"
                                size="small"
                                sx={{
                                    mt: 1.5,
                                    backgroundColor: 'rgba(255,193,7,0.15)',
                                    color: '#FFC107',
                                    border: '1px solid rgba(255,193,7,0.3)',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
});

ShopHeader.displayName = 'ShopHeader';

export default ShopHeader;
