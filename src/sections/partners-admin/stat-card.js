import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import { cardSx, pa } from './tokens';

export const StatCard = ({ label, value, caption, icon: Icon }) => (
    <Stack sx={{ ...cardSx, p: 2.5, minWidth: 0 }} spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, color: pa.textSecondary, fontWeight: 600 }}>{label}</Typography>
                <Typography
                    sx={{ fontSize: 30, fontWeight: 800, color: pa.text, letterSpacing: '-0.5px', lineHeight: 1.2, mt: 0.5 }}
                >
                    {value}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: '12px',
                    bgcolor: pa.primarySoft,
                    color: pa.primaryHover,
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <Icon sx={{ fontSize: 22 }} />
            </Box>
        </Stack>
        {caption ? <Typography sx={{ fontSize: 12.5, color: pa.textMuted }}>{caption}</Typography> : null}
    </Stack>
);

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    caption: PropTypes.node,
    icon: PropTypes.elementType.isRequired
};
