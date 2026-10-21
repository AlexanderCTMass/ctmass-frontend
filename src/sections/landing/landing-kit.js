import { useEffect, useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import { RouterLink } from 'src/components/router-link';
import { blueprintBackdropSx, btn, IconTile, navyPanelSx } from 'src/components/ctmass-ui';

export { navyPanelSx };
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx, reducedMotion } from 'src/theme/ctmass-tokens';

const rise = keyframes`
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
`;

const enter = (delay) => ({
    animation: `${rise} .7s cubic-bezier(.2,.8,.2,1) ${delay}s both`,
    [reducedMotion]: { animation: 'none' }
});

const linkComponent = (href) => (href ? (/^(mailto:|tel:|https?:)/.test(href) ? 'a' : RouterLink) : 'button');

const pickVideo = (videos) => (videos?.length ? videos[Math.floor(Math.random() * videos.length)] : null);

export const LandingHero = ({ title, subtitle, primary, secondary, videos, poster, fact, children }) => {
    const [video, setVideo] = useState(null);

    useEffect(() => {
        setVideo(pickVideo(videos));
    }, [videos]);

    return (
        <Box component="section" sx={{ ...blueprintBackdropSx, pt: { xs: 15, md: 19 }, pb: { xs: 6, md: 10 }, overflow: 'hidden' }}>
            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
                        alignItems: 'center',
                        gap: { xs: 5, md: 7 }
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            component="h1"
                            sx={{ ...displayTitleSx, fontSize: { xs: 36, sm: 46, md: 58 }, lineHeight: 1.04, ...enter(0) }}
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography
                                sx={{
                                    mt: { xs: 2, md: 2.5 },
                                    maxWidth: 520,
                                    color: BRAND.muted,
                                    fontSize: { xs: 16, md: 18 },
                                    fontWeight: 500,
                                    lineHeight: 1.6,
                                    textWrap: 'pretty',
                                    ...enter(0.12)
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            sx={{ mt: { xs: 3.5, md: 4 }, ...enter(0.24) }}
                        >
                            {primary && (
                                <Button
                                    component={linkComponent(primary.href)}
                                    href={primary.href}
                                    onClick={primary.onClick}
                                    startIcon={primary.icon}
                                    sx={{ ...btn.green, minHeight: 54, px: 3.5, fontSize: 16 }}
                                >
                                    {primary.label}
                                </Button>
                            )}
                            {secondary && (
                                <Button
                                    component={linkComponent(secondary.href)}
                                    href={secondary.href}
                                    onClick={secondary.onClick}
                                    startIcon={secondary.icon}
                                    sx={{ ...btn.outline, minHeight: 54, px: 3, fontSize: 16 }}
                                >
                                    {secondary.label}
                                </Button>
                            )}
                        </Stack>
                        {children && <Box sx={{ mt: { xs: 3.5, md: 4.5 }, ...enter(0.36) }}>{children}</Box>}
                    </Box>

                    <Box sx={{ position: 'relative', minWidth: 0, pb: fact ? { xs: 4, md: 0 } : 0, ...enter(0.18) }}>
                        <Box
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                aspectRatio: { xs: '4 / 3', md: '4 / 4.4' },
                                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                                bgcolor: BRAND.navyDeep,
                                boxShadow: SHADOW.lg,
                                backgroundImage: poster ? `url(${poster})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(180deg, ${alpha(BRAND.navyDeep, 0)} 55%, ${alpha(BRAND.navyDeep, 0.45)} 100%)`
                                }
                            }}
                        >
                            {video && (
                                <Box
                                    component="video"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    poster={poster}
                                    aria-hidden
                                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                >
                                    <source src={`/assets/video/${video}.mp4`} type="video/mp4" />
                                </Box>
                            )}
                        </Box>
                        {fact && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: { xs: 16, md: -32 },
                                    bottom: { xs: 0, md: 36 },
                                    maxWidth: { xs: 'calc(100% - 32px)', md: 300 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.75,
                                    p: { xs: 1.75, md: 2.25 },
                                    pr: { xs: 2.25, md: 3 },
                                    bgcolor: '#FFFFFF',
                                    borderRadius: RADIUS.card,
                                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                                    boxShadow: SHADOW.lg
                                }}
                            >
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        fontFamily: FONT.display,
                                        fontWeight: 800,
                                        fontSize: { xs: 30, md: 36 },
                                        lineHeight: 1,
                                        letterSpacing: '-0.03em',
                                        color: BRAND.green
                                    }}
                                >
                                    {fact.value}
                                </Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: BRAND.ink }}>
                                    {fact.label}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export const FeatureRow = ({ items, columns = 3 }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: `repeat(${columns}, minmax(0, 1fr))` },
            columnGap: { sm: 4, md: 5 },
            rowGap: { xs: 3.5, md: 5 }
        }}
    >
        {items.map((item) => (
            <Box
                key={item.title}
                sx={{
                    minWidth: 0,
                    pt: 3,
                    borderTop: `2px solid ${alpha(BRAND.navy, 0.1)}`,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: 0,
                        width: 48,
                        height: 2,
                        bgcolor: BRAND.green
                    }
                }}
            >
                <IconTile size={48} tone={item.tone || 'green'}>{item.icon}</IconTile>
                <Typography
                    component="h3"
                    sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 700, fontSize: { xs: 19, md: 21 }, letterSpacing: '-0.015em', lineHeight: 1.25, color: BRAND.navy }}
                >
                    {item.title}
                </Typography>
                <Typography sx={{ mt: 1, color: BRAND.muted, fontSize: 15, lineHeight: 1.6, textWrap: 'pretty' }}>
                    {item.text}
                </Typography>
                {item.action && <Box sx={{ mt: 1.5 }}>{item.action}</Box>}
            </Box>
        ))}
    </Box>
);

export const CheckList = ({ items, dark = false, sx }) => (
    <Stack component="ul" spacing={1.25} sx={{ m: 0, p: 0, listStyle: 'none', ...sx }}>
        {items.map((item) => (
            <Stack key={item} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                    aria-hidden
                    sx={{
                        mt: '2px',
                        width: 22,
                        height: 22,
                        flexShrink: 0,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: dark ? alpha(BRAND.green, 0.22) : alpha(BRAND.green, 0.12),
                        color: dark ? '#7EE2AE' : BRAND.green,
                        '& svg': { fontSize: 16 }
                    }}
                >
                    <CheckRoundedIcon />
                </Box>
                <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: dark ? alpha('#FFFFFF', 0.86) : BRAND.ink }}>
                    {item}
                </Typography>
            </Stack>
        ))}
    </Stack>
);

export const FounderStory = ({ quote, intro, title, paragraphs, bullets, footnote }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
            gap: { xs: 4, md: 8 },
            alignItems: 'start'
        }}
    >
        <Box sx={{ position: { md: 'sticky' }, top: { md: 110 }, minWidth: 0 }}>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                    aspectRatio: { xs: '16 / 11', md: '4 / 4.6' },
                    boxShadow: SHADOW.md,
                    backgroundImage: 'url(/assets/jacob-with-son.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: '22% center'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        p: { xs: 2.5, md: 3.5 },
                        pt: 10,
                        color: '#FFFFFF',
                        background: `linear-gradient(180deg, ${alpha(BRAND.navyDeep, 0)} 0%, ${alpha(BRAND.navyDeep, 0.88)} 70%)`
                    }}
                >
                    <FormatQuoteRoundedIcon sx={{ fontSize: 34, color: '#7EE2AE', mb: 0.5 }} />
                    <Typography sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: { xs: 18, md: 22 }, lineHeight: 1.3, letterSpacing: '-0.015em', textWrap: 'balance' }}>
                        {quote}
                    </Typography>
                    <Typography sx={{ mt: 1.25, fontSize: 13, fontWeight: 600, color: alpha('#FFFFFF', 0.72) }}>
                        Yakov, founder of CTMASS
                    </Typography>
                </Box>
            </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ ...displayTitleSx, fontSize: { xs: 28, sm: 34, md: 42 } }}>
                {title}
            </Typography>
            {intro && (
                <Typography sx={{ mt: 2.5, fontSize: { xs: 16, md: 17 }, lineHeight: 1.7, color: BRAND.ink }}>
                    {intro}
                </Typography>
            )}
            {paragraphs?.map((text) => (
                <Typography key={text.slice(0, 32)} sx={{ mt: 2, fontSize: { xs: 15, md: 16 }, lineHeight: 1.7, color: BRAND.muted }}>
                    {text}
                </Typography>
            ))}
            {bullets && <CheckList items={bullets} sx={{ mt: 3 }} />}
            {footnote && (
                <Box
                    sx={{
                        mt: 3.5,
                        p: { xs: 2.25, md: 2.75 },
                        borderRadius: RADIUS.inner,
                        bgcolor: alpha(BRAND.green, 0.08),
                        borderLeft: `3px solid ${BRAND.green}`,
                        color: BRAND.ink,
                        fontSize: 15,
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}
                >
                    {footnote}
                </Box>
            )}
            <Button
                component={RouterLink}
                href="/contractors/first1000/I2snJZ2WOXc8MoTfqQ5f4IjVtLw1"
                sx={{ ...btn.outline, mt: 3.5 }}
            >
                View Yakov&apos;s profile
            </Button>
        </Box>
    </Box>
);

export const LandingCta = ({ title, text, action, note }) => (
    <Box
        sx={{
            ...navyPanelSx,
            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
            px: { xs: 3, sm: 5, md: 8 },
            py: { xs: 5, md: 8 },
            boxShadow: SHADOW.lg
        }}
    >
        <Box sx={{ position: 'relative', maxWidth: 640 }}>
            <Typography component="h2" sx={{ ...displayTitleSx, color: '#FFFFFF', fontSize: { xs: 30, sm: 38, md: 48 } }}>
                {title}
            </Typography>
            {text && (
                <Typography sx={{ mt: 2, color: alpha('#FFFFFF', 0.78), fontSize: { xs: 16, md: 18 }, lineHeight: 1.6 }}>
                    {text}
                </Typography>
            )}
            {action && <Box sx={{ mt: { xs: 3.5, md: 4 } }}>{action}</Box>}
            {note && (
                <Typography sx={{ mt: 2.5, color: alpha('#FFFFFF', 0.6), fontSize: 14, fontWeight: 500 }}>
                    {note}
                </Typography>
            )}
        </Box>
    </Box>
);
