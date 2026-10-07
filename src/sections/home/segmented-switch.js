import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BRAND, SHADOW, reducedMotion } from 'src/theme/ctmass-tokens';

const EASE = 'cubic-bezier(.2,.8,.2,1)';

export const SegmentedSwitch = ({ options, value, onChange, ariaLabel, sx }) => {
    const index = Math.max(0, options.findIndex((option) => option.value === value));
    const count = options.length;

    return (
        <Box
            role="tablist"
            aria-label={ariaLabel}
            sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                p: 0.5,
                borderRadius: 999,
                bgcolor: alpha(BRAND.navy, 0.07),
                ...sx
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: `calc((100% - 8px) / ${count})`,
                    borderRadius: 999,
                    bgcolor: BRAND.navy,
                    boxShadow: SHADOW.md,
                    transform: `translateX(${index * 100}%)`,
                    transition: `transform .45s ${EASE}`,
                    [reducedMotion]: { transition: 'none' }
                }}
            />
            {options.map((option) => {
                const active = option.value === value;

                return (
                    <Box
                        key={option.value}
                        component="button"
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.value)}
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            minHeight: 44,
                            px: 1.5,
                            border: 0,
                            borderRadius: 999,
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            font: 'inherit',
                            fontSize: { xs: 13, sm: 14 },
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            color: active ? '#FFFFFF' : BRAND.navy,
                            transition: `color .3s ${EASE}`,
                            '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                        }}
                    >
                        {option.label}
                    </Box>
                );
            })}
        </Box>
    );
};

export const FadeStack = ({ activeKey, items, sx }) => (
    <Box sx={{ display: 'grid', ...sx }}>
        {items.map((item) => {
            const active = item.key === activeKey;

            return (
                <Box
                    key={item.key}
                    role="tabpanel"
                    aria-hidden={!active}
                    sx={{
                        gridArea: '1 / 1',
                        minWidth: 0,
                        opacity: active ? 1 : 0,
                        transform: active ? 'none' : 'translateY(10px)',
                        visibility: active ? 'visible' : 'hidden',
                        pointerEvents: active ? 'auto' : 'none',
                        transition: active
                            ? `opacity .45s ${EASE} .08s, transform .45s ${EASE} .08s, visibility 0s`
                            : `opacity .25s ease, transform .25s ease, visibility 0s .25s`,
                        [reducedMotion]: { transition: 'none', transform: 'none' }
                    }}
                >
                    {item.content}
                </Box>
            );
        })}
    </Box>
);
