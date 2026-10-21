import { memo } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useAuth } from 'src/hooks/use-auth';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { blueprintBackdropSx, btn, navyPanelSx } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

export const COIN_GOLD = '#FFC83D';

const ShopHeader = memo(({ onEarnCoinsClick }) => {
    const { user, isAuthenticated } = useAuth();
    const balance = user?.loyaltyBalance ?? 0;

    return (
        <Box component="section" sx={{ ...blueprintBackdropSx, pt: { xs: 15, md: 19 }, pb: { xs: 5, md: 8 } }}>
            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 380px' },
                        alignItems: 'center',
                        gap: { xs: 4, md: 7 }
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 36, sm: 46, md: 56 } }}>
                            CTMASS coins shop
                        </Typography>
                        <Typography sx={{ mt: 2, maxWidth: 540, color: BRAND.muted, fontSize: { xs: 16, md: 18 }, fontWeight: 500, lineHeight: 1.6 }}>
                            Earn coins for useful actions on CTMASS: signing up, posting projects, building your profile and inviting friends. Spend them on merch and platform perks.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
                            <Button
                                onClick={onEarnCoinsClick}
                                startIcon={<EmojiEventsOutlinedIcon />}
                                sx={{ ...btn.navy, minHeight: 52, px: 3, fontSize: 16 }}
                            >
                                How to earn coins
                            </Button>
                            {!isAuthenticated && (
                                <Button component={RouterLink} href={paths.register.index} sx={{ ...btn.green, minHeight: 52, px: 3, fontSize: 16 }}>
                                    Sign up and get coins
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            ...navyPanelSx,
                            p: { xs: 3, md: 3.5 },
                            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                            boxShadow: SHADOW.lg
                        }}
                    >
                        <Box sx={{ position: 'relative' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <MonetizationOnRoundedIcon sx={{ color: COIN_GOLD, fontSize: 26 }} />
                                <Typography sx={{ fontSize: 15, fontWeight: 600, color: alpha('#FFFFFF', 0.8) }}>
                                    {isAuthenticated ? 'Your balance' : 'Coins you can earn'}
                                </Typography>
                            </Stack>
                            <Typography
                                sx={{
                                    mt: 1.5,
                                    fontFamily: FONT.display,
                                    fontWeight: 800,
                                    fontSize: { xs: 56, md: 72 },
                                    lineHeight: 1,
                                    letterSpacing: '-0.04em',
                                    color: COIN_GOLD,
                                    fontVariantNumeric: 'tabular-nums'
                                }}
                            >
                                {isAuthenticated ? balance.toLocaleString('en-US') : 'Free'}
                            </Typography>
                            <Typography sx={{ mt: 1, fontSize: 14, color: alpha('#FFFFFF', 0.66) }}>
                                {isAuthenticated
                                    ? 'Coins available to spend in the shop.'
                                    : 'Create an account to start collecting coins.'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
});

ShopHeader.displayName = 'ShopHeader';

export default ShopHeader;
