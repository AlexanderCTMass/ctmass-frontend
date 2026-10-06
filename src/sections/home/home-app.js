import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import { trackClick } from 'src/libs/analytics/behavior';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from 'src/constants/mobile-apps';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
import { HomeSection } from 'src/sections/home/home-section';

const STORES = [
    { key: 'app_store', label: 'App Store', caption: 'Download on the', href: APP_STORE_URL, Icon: AppleIcon },
    { key: 'google_play', label: 'Google Play', caption: 'Get it on', href: GOOGLE_PLAY_URL, Icon: ShopIcon }
];

const StoreButton = ({ store }) => (
    <Button
        href={store.href}
        target="_blank"
        rel="noopener"
        data-track={`home_app_${store.key}`}
        onClick={() => trackClick(`home_app_${store.key}`)}
        startIcon={<store.Icon sx={{ fontSize: '30px !important' }} />}
        sx={{
            justifyContent: 'flex-start',
            minWidth: 190,
            px: 2.5,
            py: 1.1,
            borderRadius: RADIUS.tile,
            bgcolor: '#FFFFFF',
            color: BRAND.ink,
            textAlign: 'left',
            boxShadow: `0 10px 24px ${alpha(BRAND.navyDeep, 0.35)}`,
            outline: '2px solid transparent',
            outlineOffset: 3,
            transition: 'background-color .2s ease, color .2s ease, outline-color .2s ease, box-shadow .2s ease',
            '& .MuiButton-startIcon': { transition: 'color .2s ease' },
            '&:hover': {
                bgcolor: BRAND.mist,
                color: BRAND.navy,
                outlineColor: BRAND.green,
                boxShadow: `0 14px 30px ${alpha(BRAND.navyDeep, 0.5)}`,
                '& .MuiButton-startIcon': { color: BRAND.green }
            },
            '&:focus-visible': { outlineColor: BRAND.green },
            '&:active': { transform: 'scale(0.98)' }
        }}
    >
        <Box>
            <Box component="span" sx={{ display: 'block', fontSize: 11, fontWeight: 500, lineHeight: 1.2, color: BRAND.muted }}>
                {store.caption}
            </Box>
            <Box component="span" sx={{ display: 'block', fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>
                {store.label}
            </Box>
        </Box>
    </Button>
);

export const HomeApp = () => (
    <HomeSection bg="white">
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: RADIUS.panel,
                px: { xs: 3, sm: 5, md: 8 },
                py: { xs: 4, md: 7 },
                color: '#FFFFFF',
                boxShadow: SHADOW.lg,
                background: `radial-gradient(70% 90% at 100% 100%, ${alpha(BRAND.green, 0.28)} 0%, ${alpha(BRAND.green, 0)} 60%), linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.06)} 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 60%)',
                    maskImage: 'linear-gradient(90deg, transparent 0%, #000 60%)'
                }
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
                    gridTemplateAreas: { xs: '"icon" "copy"', md: '"copy icon"' },
                    alignItems: 'center',
                    gap: { xs: 3, md: 4 }
                }}
            >
                <Box sx={{ gridArea: 'copy' }}>
                    <Typography component="h2" sx={{ ...displayTitleSx, color: '#FFFFFF', fontSize: { xs: 30, sm: 38, md: 48 } }}>
                        Take CTMASS with you
                    </Typography>
                    <Typography sx={{ mt: 1.5, maxWidth: 460, fontSize: { xs: 15, md: 18 }, lineHeight: 1.6, color: alpha('#FFFFFF', 0.78) }}>
                        Post projects, chat with pros and get notified about new offers. Free on iPhone and Android.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: { xs: 3, md: 4 } }}>
                        {STORES.map((store) => (
                            <StoreButton key={store.key} store={store} />
                        ))}
                    </Stack>
                </Box>

                <Box
                    sx={{
                        gridArea: 'icon',
                        justifySelf: { xs: 'start', md: 'center' },
                        ml: { xs: 1, md: 0 },
                        width: { xs: 112, md: 200 },
                        height: { xs: 112, md: 200 },
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: { xs: '28px', md: '48px' },
                        bgcolor: '#FFFFFF',
                        transform: 'rotate(-6deg)',
                        boxShadow: `0 30px 60px ${alpha(BRAND.navyDeep, 0.55)}`,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                            boxShadow: `inset 0 -6px 0 ${alpha(BRAND.navy, 0.08)}`
                        }
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/home/app-icon.jpg"
                        alt="CTMASS app icon"
                        loading="lazy"
                        sx={{ display: 'block', width: '100%', height: '100%', p: '9%', boxSizing: 'border-box', objectFit: 'contain' }}
                    />
                </Box>
            </Box>
        </Box>
    </HomeSection>
);
