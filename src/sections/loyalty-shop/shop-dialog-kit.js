import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { focusRingSx, formScopeSx, IconTile, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

export const COIN_GOLD = '#FFC83D';

export const shopDialogPaperSx = {
    borderRadius: { xs: 0, sm: RADIUS.card },
    boxShadow: SHADOW.lg,
    backgroundImage: 'none',
    ...formScopeSx
};

export const Coins = ({ value, size = 16, color = BRAND.ink, weight = 700 }) => (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ display: 'inline-flex' }}>
        <MonetizationOnRoundedIcon sx={{ color: COIN_GOLD, fontSize: size + 4 }} />
        <Box component="span" sx={{ fontSize: size, fontWeight: weight, color, fontVariantNumeric: 'tabular-nums' }}>
            {Number(value || 0).toLocaleString('en-US')}
        </Box>
    </Stack>
);

export const ShopDialogHeader = ({ title, subtitle, image, onClose, disabled }) => (
    <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
            position: 'relative',
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 'calc(env(safe-area-inset-top) + 18px)', sm: 3 },
            pb: 2.25,
            pr: 7,
            borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}`
        }}
    >
        {image ? (
            <Box
                component="img"
                src={image}
                alt=""
                sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: RADIUS.tile, objectFit: 'cover', bgcolor: BRAND.mist }}
            />
        ) : (
            <IconTile size={52}><MonetizationOnRoundedIcon /></IconTile>
        )}
        <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 19, sm: 21 }, letterSpacing: '-0.02em', lineHeight: 1.25, color: BRAND.navy }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography sx={{ mt: 0.25, fontSize: 13, color: BRAND.muted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        <IconButton
            aria-label="Close"
            onClick={onClose}
            disabled={disabled}
            sx={{ position: 'absolute', top: { xs: 'calc(env(safe-area-inset-top) + 14px)', sm: 16 }, right: 14, color: BRAND.navy }}
        >
            <CloseRoundedIcon />
        </IconButton>
    </Stack>
);

export const PackageOption = ({ selected, title, price, savingsPercent, recommended, onSelect }) => (
    <Box
        component="button"
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.75,
            border: `1.5px solid ${selected ? BRAND.green : alpha(BRAND.navy, 0.12)}`,
            borderRadius: RADIUS.inner,
            bgcolor: selected ? alpha(BRAND.green, 0.06) : '#FFFFFF',
            textAlign: 'left',
            font: 'inherit',
            cursor: 'pointer',
            transition: 'border-color .2s ease, background-color .2s ease',
            '&:hover': { borderColor: selected ? BRAND.green : alpha(BRAND.navy, 0.3) },
            ...focusRingSx
        }}
    >
        <Box
            aria-hidden
            sx={{
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${selected ? BRAND.green : alpha(BRAND.navy, 0.25)}`,
                bgcolor: selected ? BRAND.green : 'transparent',
                color: '#FFFFFF',
                '& svg': { fontSize: 14 }
            }}
        >
            {selected && <CheckRoundedIcon />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: BRAND.ink }}>{title}</Typography>
                {recommended && <StatusPill tone="navy" sx={{ height: 22 }}>Recommended</StatusPill>}
                {savingsPercent ? <StatusPill sx={{ height: 22 }}>Save {savingsPercent}%</StatusPill> : null}
            </Stack>
        </Box>
        <Coins value={price} size={15} />
    </Box>
);

export const Receipt = ({ rows }) => (
    <Box sx={{ p: 2, borderRadius: RADIUS.inner, bgcolor: BRAND.mist }}>
        {rows.map((row, index) => (
            <Stack
                key={row.label}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    py: 0.75,
                    ...(row.strong && index > 0 && { mt: 0.75, pt: 1.25, borderTop: `1px dashed ${alpha(BRAND.navy, 0.18)}` })
                }}
            >
                <Typography sx={{ fontSize: 14, fontWeight: row.strong ? 700 : 500, color: row.strong ? BRAND.ink : BRAND.muted }}>
                    {row.label}
                </Typography>
                <Coins value={row.value} size={row.strong ? 17 : 14} color={row.danger ? BRAND.danger : BRAND.ink} weight={row.strong ? 800 : 600} />
            </Stack>
        ))}
    </Box>
);

export const SuccessPanel = ({ title, children }) => (
    <Stack alignItems="center" sx={{ py: 3, px: 1, textAlign: 'center' }}>
        <Box
            sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(BRAND.green, 0.12),
                color: BRAND.green,
                '& svg': { fontSize: 40 }
            }}
        >
            <TaskAltRoundedIcon />
        </Box>
        <Typography sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: BRAND.navy }}>
            {title}
        </Typography>
        <Box sx={{ mt: 1, maxWidth: 360, fontSize: 15, lineHeight: 1.6, color: BRAND.muted }}>
            {children}
        </Box>
    </Stack>
);
