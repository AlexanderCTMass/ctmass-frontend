import { Box, Container, Stack, Typography } from '@mui/material';
import { BRAND, SECTION_BG, SECTION_PY, sectionTitleSx } from 'src/theme/ctmass-tokens';

export const SectionHeading = ({ title, subtitle, action, align = 'left', sx }) => (
    <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent={align === 'center' ? 'center' : 'space-between'}
        spacing={2}
        sx={{ mb: { xs: 3, md: 5 }, textAlign: align, ...sx }}
    >
        <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={sectionTitleSx}>
                {title}
            </Typography>
            {subtitle && (
                <Box
                    sx={{
                        mt: { xs: 0.75, md: 1.25 },
                        color: BRAND.muted,
                        fontSize: { xs: 14, md: 17 },
                        fontWeight: 500,
                        lineHeight: 1.5,
                        maxWidth: 560,
                        textWrap: 'balance',
                        mx: align === 'center' ? 'auto' : 0
                    }}
                >
                    {subtitle}
                </Box>
            )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
);

export const HomeSection = ({ bg = 'white', children, containerSx, sx, id }) => (
    <Box
        component="section"
        id={id}
        sx={{
            position: 'relative',
            py: SECTION_PY,
            background: SECTION_BG[bg] || bg,
            ...sx
        }}
    >
        <Container maxWidth="lg" sx={{ position: 'relative', ...containerSx }}>
            {children}
        </Container>
    </Box>
);
