import { Box, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { RouterLink } from 'src/components/router-link';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

export const blueprintBackdropSx = {
    position: 'relative',
    backgroundImage: `
        radial-gradient(90% 60% at 0% 0%, rgba(9,133,221,0.13) 0%, rgba(9,133,221,0) 60%),
        radial-gradient(90% 60% at 100% 85%, rgba(0,174,128,0.13) 0%, rgba(0,174,128,0) 60%)
    `,
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
            linear-gradient(${alpha(BRAND.navy, 0.06)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(BRAND.navy, 0.06)} 1px, transparent 1px),
            linear-gradient(${alpha(BRAND.navy, 0.025)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(BRAND.navy, 0.025)} 1px, transparent 1px)
        `,
        backgroundSize: '96px 96px, 96px 96px, 24px 24px, 24px 24px',
        WebkitMaskImage: 'radial-gradient(120% 90% at 50% 10%, #000 30%, transparent 85%)',
        maskImage: 'radial-gradient(120% 90% at 50% 10%, #000 30%, transparent 85%)'
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '1px',
        pointerEvents: 'none',
        background: `linear-gradient(90deg, transparent, ${alpha(BRAND.navy, 0.12)}, transparent)`
    }
};

export const navyPanelSx = {
    position: 'relative',
    overflow: 'hidden',
    color: '#FFFFFF',
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
};

export const surfaceSx = {
    position: 'relative',
    bgcolor: '#FFFFFF',
    borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
    boxShadow: SHADOW.sm
};

export const focusRingSx = {
    '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
};

export const fieldSx = {
    '& .MuiOutlinedInput-root, & .MuiFilledInput-root': {
        borderRadius: RADIUS.tile,
        backgroundColor: '#FFFFFF',
        transition: 'box-shadow .2s ease, background-color .2s ease'
    },
    '& .MuiFilledInput-root': {
        borderColor: alpha(BRAND.navy, 0.14)
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(BRAND.navy, 0.14)
    },
    '& .MuiOutlinedInput-root:hover, & .MuiFilledInput-root:hover': {
        backgroundColor: BRAND.mist
    },
    '& .MuiOutlinedInput-root.Mui-focused, & .MuiFilledInput-root.Mui-focused': {
        backgroundColor: '#FFFFFF',
        boxShadow: `0 0 0 4px ${alpha(BRAND.green, 0.14)}`
    },
    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.navy }
};

export const formScopeSx = {
    ...fieldSx,
    '& .MuiButton-root': {
        minHeight: 46,
        borderRadius: RADIUS.tile,
        fontWeight: 700,
        textTransform: 'none',
        '&:active': { transform: 'scale(0.98)' }
    },
    '& .MuiButton-sizeSmall': { minHeight: 38, borderRadius: '12px' },
    '& .MuiButton-containedPrimary:not(.Mui-disabled), & .MuiButton-containedSuccess:not(.Mui-disabled)': {
        backgroundColor: BRAND.green,
        boxShadow: `0 10px 22px ${alpha(BRAND.greenDeep, 0.26)}`,
        '&:hover': { backgroundColor: '#119A55' }
    },
    '& .MuiButton-outlinedPrimary, & .MuiButton-outlinedSuccess': {
        borderColor: alpha(BRAND.green, 0.5),
        '&:hover': { borderColor: BRAND.green, backgroundColor: alpha(BRAND.green, 0.08) }
    },
    '& .MuiAlert-root': { borderRadius: RADIUS.inner },
    '& .ql-toolbar.ql-snow': { borderRadius: `${RADIUS.tile} ${RADIUS.tile} 0 0`, borderColor: alpha(BRAND.navy, 0.14), backgroundColor: BRAND.mist },
    '& .ql-container.ql-snow': { borderRadius: `0 0 ${RADIUS.tile} ${RADIUS.tile}`, borderColor: alpha(BRAND.navy, 0.14), backgroundColor: '#FFFFFF' },
    '& .MuiToggleButtonGroup-root .MuiToggleButton-root': {
        minHeight: 44,
        fontWeight: 600,
        textTransform: 'none',
        '&.Mui-selected': { backgroundColor: BRAND.navy, color: '#FFFFFF', '&:hover': { backgroundColor: BRAND.navyHover } }
    },
    '& .MuiTypography-h6': {
        fontFamily: FONT.display,
        fontWeight: 700,
        letterSpacing: '-0.015em',
        color: BRAND.navy
    }
};

const buttonBase = {
    minHeight: 46,
    px: 2.5,
    borderRadius: RADIUS.tile,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    textTransform: 'none',
    transition: 'background-color .2s ease, color .2s ease, box-shadow .2s ease, border-color .2s ease',
    '&:active': { transform: 'scale(0.98)' },
    ...focusRingSx
};

export const btn = {
    green: {
        ...buttonBase,
        bgcolor: BRAND.green,
        color: '#FFFFFF',
        boxShadow: `0 10px 22px ${alpha(BRAND.greenDeep, 0.26)}`,
        '&:hover': { bgcolor: '#119A55', boxShadow: `0 12px 26px ${alpha(BRAND.greenDeep, 0.34)}` },
        '&.Mui-disabled': { bgcolor: alpha(BRAND.navy, 0.1), color: alpha(BRAND.ink, 0.4), boxShadow: 'none' }
    },
    navy: {
        ...buttonBase,
        bgcolor: BRAND.navy,
        color: '#FFFFFF',
        boxShadow: `0 10px 22px ${alpha(BRAND.navy, 0.22)}`,
        '&:hover': { bgcolor: BRAND.navyHover },
        '&.Mui-disabled': { bgcolor: alpha(BRAND.navy, 0.1), color: alpha(BRAND.ink, 0.4), boxShadow: 'none' }
    },
    soft: {
        ...buttonBase,
        bgcolor: alpha(BRAND.navy, 0.06),
        color: BRAND.navy,
        '&:hover': { bgcolor: alpha(BRAND.navy, 0.12) }
    },
    outline: {
        ...buttonBase,
        bgcolor: '#FFFFFF',
        color: BRAND.navy,
        border: `1px solid ${alpha(BRAND.navy, 0.18)}`,
        '&:hover': { bgcolor: BRAND.mist, borderColor: BRAND.navy }
    },
    text: {
        ...buttonBase,
        px: 1.5,
        color: BRAND.navy,
        '&:hover': { bgcolor: alpha(BRAND.navy, 0.06) }
    }
};

export const cardTitleSx = {
    fontFamily: FONT.display,
    fontWeight: 700,
    fontSize: { xs: 18, md: 20 },
    letterSpacing: '-0.015em',
    lineHeight: 1.25,
    color: BRAND.navy
};

export const IconTile = ({ children, size = 40, tone = 'green', sx }) => {
    const color = tone === 'navy' ? BRAND.navy : tone === 'lavender' ? BRAND.lavender : BRAND.green;

    return (
        <Box
            aria-hidden
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: `${Math.round(size * 0.32)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(color, 0.12),
                color,
                '& svg': { fontSize: Math.round(size * 0.52) },
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

export const Surface = ({ children, sx, padded = true, ...other }) => (
    <Box sx={{ ...surfaceSx, ...(padded && { p: { xs: 2.5, md: 4 } }), ...sx }} {...other}>
        {children}
    </Box>
);

export const SurfaceHeader = ({ icon, title, subtitle, action, sx }) => (
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        sx={{ gap: 1.5, mb: { xs: 2.5, md: 3 }, ...sx }}
    >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            {icon && <IconTile>{icon}</IconTile>}
            <Box sx={{ minWidth: 0 }}>
                <Typography component="h2" sx={cardTitleSx}>{title}</Typography>
                {subtitle && (
                    <Typography sx={{ mt: 0.25, color: BRAND.muted, fontSize: 14, lineHeight: 1.5 }}>{subtitle}</Typography>
                )}
            </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
);

export const BackLink = ({ href, onClick, children }) => (
    <Box
        component={href ? RouterLink : 'button'}
        href={href}
        onClick={onClick}
        type={href ? undefined : 'button'}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            mb: 1.5,
            p: 0,
            border: 0,
            bgcolor: 'transparent',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            color: BRAND.muted,
            textDecoration: 'none',
            transition: 'color .2s ease',
            '& svg': { fontSize: 18, transition: 'transform .2s ease' },
            '&:hover': { color: BRAND.navy },
            '&:hover svg': { transform: 'translateX(-3px)' },
            ...focusRingSx
        }}
    >
        <ArrowBackRoundedIcon />
        {children}
    </Box>
);

export const PageHero = ({
    title,
    subtitle,
    action,
    back,
    badge,
    children,
    offsetTop = true,
    maxWidth = 'lg',
    disableGutters = false,
    sx
}) => (
    <Box
        sx={{
            ...blueprintBackdropSx,
            pt: offsetTop ? { xs: 16, md: 19 } : { xs: 3, md: 5 },
            pb: { xs: 4, md: 6 },
            ...sx
        }}
    >
        <Container maxWidth={maxWidth} disableGutters={disableGutters} sx={{ position: 'relative' }}>
            {back}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                justifyContent="space-between"
                sx={{ gap: { xs: 2.5, md: 4 } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ columnGap: 1.5, rowGap: 1 }}>
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 30, sm: 38, md: 46 }, overflowWrap: 'anywhere' }}>
                            {title}
                        </Typography>
                        {badge}
                    </Stack>
                    {subtitle && (
                        <Typography sx={{ mt: { xs: 1, md: 1.5 }, maxWidth: 620, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, fontWeight: 500, lineHeight: 1.55, textWrap: 'pretty' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>{action}</Box>}
            </Stack>
            {children}
        </Container>
    </Box>
);

export const EmptyState = ({ icon, title, text, action, sx }) => (
    <Stack
        alignItems="center"
        sx={{
            textAlign: 'center',
            px: 3,
            py: { xs: 6, md: 9 },
            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
            border: `1.5px dashed ${alpha(BRAND.navy, 0.18)}`,
            bgcolor: alpha('#FFFFFF', 0.7),
            ...sx
        }}
    >
        {icon && <IconTile size={64} tone="navy">{icon}</IconTile>}
        <Typography component="h3" sx={{ ...cardTitleSx, fontSize: { xs: 20, md: 24 }, mt: icon ? 2.5 : 0 }}>
            {title}
        </Typography>
        {text && (
            <Typography sx={{ mt: 1, maxWidth: 440, color: BRAND.muted, fontSize: 15, lineHeight: 1.6 }}>
                {text}
            </Typography>
        )}
        {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Stack>
);

export const StatusPill = ({ children, tone = 'green', icon, sx }) => {
    const color = tone === 'navy' ? BRAND.navy : tone === 'muted' ? BRAND.muted : tone === 'danger' ? BRAND.danger : tone === 'amber' ? '#B54708' : BRAND.green;

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                height: 26,
                borderRadius: RADIUS.pill,
                bgcolor: alpha(color, 0.12),
                color,
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                '& svg': { fontSize: 15 },
                ...sx
            }}
        >
            {icon}
            {children}
        </Box>
    );
};

export const dashScopeSx = {
    ...formScopeSx,
    '& .MuiPaper-root, & .MuiCard-root': {
        borderRadius: RADIUS.card,
        border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
        boxShadow: SHADOW.sm,
        backgroundImage: 'none'
    },
    '& .MuiPaper-root .MuiPaper-root, & .MuiCard-root .MuiCard-root, & .MuiPaper-root .MuiCard-root, & .MuiCard-root .MuiPaper-root': {
        borderRadius: RADIUS.inner,
        boxShadow: 'none'
    },
    '& .MuiTypography-h4, & .MuiTypography-h5': {
        fontFamily: FONT.display,
        letterSpacing: '-0.02em',
        color: BRAND.navy
    },
    '& .MuiChip-root': { fontWeight: 600 },
    '& .MuiTypography-overline': { textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.5, color: BRAND.muted },
    '& .MuiDivider-root': { borderColor: alpha(BRAND.navy, 0.08) }
};

export const DashPage = ({ title, subtitle, action, back, badge, children, maxWidth = 'xl', scoped = true, sx }) => (
    <Box
        component="main"
        sx={{
            position: 'relative',
            flexGrow: 1,
            bgcolor: BRAND.mist,
            pb: { xs: 12, md: 10 },
            ...sx
        }}
    >
        <Box
            aria-hidden
            sx={{
                ...blueprintBackdropSx,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: { xs: 260, md: 320 },
                bgcolor: '#FFFFFF',
                '&::after': { display: 'none' },
                WebkitMaskImage: 'linear-gradient(180deg, #000 45%, transparent 100%)',
                maskImage: 'linear-gradient(180deg, #000 45%, transparent 100%)'
            }}
        />
        <Container maxWidth={maxWidth} sx={{ position: 'relative', pt: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, lg: 5 } }}>
            {(title || back) && (
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    {back}
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        alignItems={{ xs: 'stretch', md: 'flex-end' }}
                        justifyContent="space-between"
                        sx={{ gap: { xs: 2, md: 4 } }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ columnGap: 1.5, rowGap: 1 }}>
                                <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 28, sm: 34, md: 40 }, overflowWrap: 'anywhere' }}>
                                    {title}
                                </Typography>
                                {badge}
                            </Stack>
                            {subtitle && (
                                <Typography sx={{ mt: 1, maxWidth: 620, color: BRAND.muted, fontSize: { xs: 15, md: 16 }, fontWeight: 500, lineHeight: 1.55 }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
                    </Stack>
                </Box>
            )}
            <Box sx={scoped ? dashScopeSx : undefined}>
                {children}
            </Box>
        </Container>
    </Box>
);

export const SectionAnchors = ({ items, sx }) => (
    <Box
        component="nav"
        aria-label="Sections"
        sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 },
            pb: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            ...sx
        }}
    >
        {items.map((item) => (
            <Box
                key={item.id}
                component="button"
                type="button"
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                sx={{
                    flexShrink: 0,
                    height: 40,
                    px: 2,
                    border: `1px solid ${alpha(BRAND.navy, 0.12)}`,
                    borderRadius: RADIUS.pill,
                    bgcolor: '#FFFFFF',
                    color: BRAND.navy,
                    font: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
                    '&:hover': { bgcolor: BRAND.navy, borderColor: BRAND.navy, color: '#FFFFFF' },
                    ...focusRingSx
                }}
            >
                {item.label}
            </Box>
        ))}
    </Box>
);

export const stickyActionBarSx = (layoutIsHorizontal = false) => ({
    position: 'fixed',
    bottom: { xs: 0, sm: 16 },
    left: { xs: 0, sm: 16, lg: layoutIsHorizontal ? 16 : 296 },
    right: { xs: 0, sm: 16 },
    zIndex: (t) => t.zIndex.appBar,
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.25, sm: 1.5 },
    borderRadius: { xs: 0, sm: RADIUS.card },
    border: { xs: 0, sm: `1px solid ${alpha(BRAND.navy, 0.1)}` },
    borderTop: `1px solid ${alpha(BRAND.navy, 0.1)}`,
    bgcolor: alpha('#FFFFFF', 0.9),
    backdropFilter: 'saturate(160%) blur(14px)',
    boxShadow: SHADOW.lg,
    ...formScopeSx
});

export const pillTabsSx = {
    minHeight: 52,
    p: 0.5,
    mx: { xs: -2, sm: 0 },
    px: { xs: 2, sm: 0.5 },
    borderRadius: { xs: 0, sm: 999 },
    bgcolor: { xs: 'transparent', sm: alpha(BRAND.navy, 0.07) },
    '& .MuiTabs-flexContainer': { gap: { xs: 1, sm: 0 } },
    '& .MuiTabs-indicator': {
        top: 0,
        bottom: 0,
        height: 'auto',
        borderRadius: 999,
        backgroundColor: BRAND.navy,
        boxShadow: SHADOW.md,
        zIndex: 0,
        transition: 'left .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)'
    },
    '& .MuiTab-root': {
        position: 'relative',
        zIndex: 1,
        minHeight: 44,
        minWidth: { xs: 'auto', sm: 90 },
        px: 2.25,
        ml: '0 !important',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        textTransform: 'none',
        color: BRAND.navy,
        bgcolor: { xs: alpha(BRAND.navy, 0.07), sm: 'transparent' },
        transition: 'color .3s ease',
        '&.Mui-selected': { color: '#FFFFFF' },
        '&.Mui-focusVisible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
    }
};
