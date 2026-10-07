import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { AD_STATUSES } from 'src/constants/partner-ads';

export const StatusChip = ({ status }) => {
    const meta = AD_STATUSES[status] || AD_STATUSES.draft;
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: 999,
                bgcolor: meta.bg,
                color: meta.color,
                fontSize: 12.5,
                fontWeight: 700,
                whiteSpace: 'nowrap'
            }}
        >
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.color }} />
            {meta.label}
        </Box>
    );
};

StatusChip.propTypes = {
    status: PropTypes.string
};
