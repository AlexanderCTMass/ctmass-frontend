import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { AD_ASPECT_RATIO } from 'src/constants/partner-ads';

const THEMES = {
    light: {
        card: '#FFFFFF',
        border: 'rgba(10,46,28,0.12)',
        title: '#0B1F14',
        subtitle: '#3F5448',
        cta: '#087443',
        ctaText: '#FFFFFF',
        fade: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.82) 45%, rgba(255,255,255,0) 85%)',
        badge: 'rgba(255,255,255,0.85)',
        badgeText: '#5E7166',
        empty: '#EEF5F1'
    },
    dark: {
        card: '#0C1420',
        border: 'rgba(255,255,255,0.10)',
        title: '#F6F9FC',
        subtitle: '#9AA7B8',
        cta: '#16B364',
        ctaText: '#04170D',
        fade: 'linear-gradient(90deg, #0C1420 0%, rgba(12,20,32,0.82) 45%, rgba(12,20,32,0) 85%)',
        badge: 'rgba(5,7,12,0.6)',
        badgeText: '#66738A',
        empty: '#121C2B'
    }
};

export const BannerPreview = ({ banner, mode = 'light', width = '100%', scale = 1 }) => {
    const t = THEMES[mode];
    const layout = banner.layout || 'split';
    const image = mode === 'dark' && banner.imageDarkUrl ? banner.imageDarkUrl : banner.imageUrl;
    const hasText = layout !== 'image' && (banner.title || banner.subtitle);
    const hasCta = layout !== 'image' && Boolean(banner.ctaLabel);
    const s = (value) => `${value * scale}px`;

    return (
        <Box
            sx={{
                position: 'relative',
                width,
                aspectRatio: `${AD_ASPECT_RATIO}`,
                borderRadius: s(20),
                overflow: 'hidden',
                bgcolor: t.card,
                border: `1px solid ${t.border}`,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            {image ? (
                layout === 'split' ? (
                    <Box
                        component="img"
                        src={image}
                        alt=""
                        sx={{
                            position: 'absolute',
                            top: s(12),
                            bottom: s(12),
                            right: s(12),
                            width: '38%',
                            height: `calc(100% - ${s(24)})`,
                            objectFit: 'contain'
                        }}
                    />
                ) : (
                    <Box
                        component="img"
                        src={image}
                        alt=""
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )
            ) : (
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: t.empty }} />
            )}
            {layout === 'cover' && hasText ? (
                <Box sx={{ position: 'absolute', inset: 0, background: t.fade }} />
            ) : null}
            {hasText || hasCta ? (
                <Box
                    sx={{
                        position: 'relative',
                        width: '60%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        px: s(16),
                        py: s(12),
                        gap: s(3),
                        boxSizing: 'border-box'
                    }}
                >
                    {banner.title ? (
                        <Typography
                            sx={{
                                color: t.title,
                                fontSize: s(18),
                                fontWeight: 800,
                                letterSpacing: '-0.3px',
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: hasCta ? 1 : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {banner.title}
                        </Typography>
                    ) : null}
                    {banner.subtitle ? (
                        <Typography
                            sx={{
                                color: t.subtitle,
                                fontSize: s(13),
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: hasCta ? 1 : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {banner.subtitle}
                        </Typography>
                    ) : null}
                    {hasCta ? (
                        <Box
                            sx={{
                                alignSelf: 'flex-start',
                                mt: s(8),
                                px: s(16),
                                height: s(30),
                                borderRadius: s(8),
                                bgcolor: t.cta,
                                color: t.ctaText,
                                fontSize: s(13),
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {banner.ctaLabel}
                        </Box>
                    ) : null}
                </Box>
            ) : null}
            <Box
                sx={{
                    position: 'absolute',
                    top: s(6),
                    right: s(8),
                    px: s(6),
                    py: s(2),
                    borderRadius: 999,
                    bgcolor: t.badge,
                    color: t.badgeText,
                    fontSize: s(9.5),
                    fontWeight: 700,
                    letterSpacing: '0.3px'
                }}
            >
                Sponsored
            </Box>
        </Box>
    );
};

BannerPreview.propTypes = {
    banner: PropTypes.object.isRequired,
    mode: PropTypes.oneOf(['light', 'dark']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    scale: PropTypes.number
};
