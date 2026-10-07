import { alpha } from '@mui/material/styles';

export const BRAND = {
    navy: '#1F2D77',
    navyHover: '#16337F',
    navyDeep: '#121B4D',
    green: '#16B364',
    greenDeep: '#00AE7C',
    lavender: '#7C83E5',
    mist: '#F5F8FB',
    ink: '#111927',
    muted: '#6C737F',
    cardDark: '#1E252E',
    danger: '#F04438'
};

export const FONT = {
    display: '"Plus Jakarta Sans", "Inter", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
};

export const RADIUS = {
    tile: '14px',
    inner: '16px',
    card: '22px',
    panel: '28px',
    pill: 999
};

export const SHADOW = {
    sm: `0 6px 18px ${alpha(BRAND.navy, 0.06)}`,
    md: `0 14px 34px ${alpha(BRAND.navy, 0.12)}`,
    lg: `0 24px 48px ${alpha(BRAND.navy, 0.2)}`,
    green: `0 18px 40px ${alpha(BRAND.greenDeep, 0.28)}`
};

export const SECTION_PY = { xs: 7, md: 12 };

export const SECTION_BG = {
    white: '#FFFFFF',
    mist: BRAND.mist,
    tint: `radial-gradient(60% 50% at 0% 100%, #D5ECF7 0%, ${alpha(BRAND.mist, 0)} 100%), radial-gradient(45% 50% at 100% 0%, #E4E6FA 0%, ${alpha(BRAND.mist, 0)} 100%), ${BRAND.mist}`
};

export const displayTitleSx = {
    fontFamily: FONT.display,
    fontWeight: 800,
    color: BRAND.navy,
    letterSpacing: '-0.025em',
    lineHeight: 1.08,
    textWrap: 'balance'
};

export const sectionTitleSx = {
    ...displayTitleSx,
    fontSize: { xs: 28, sm: 36, md: 48 }
};

export const reducedMotion = '@media (prefers-reduced-motion: reduce)';
