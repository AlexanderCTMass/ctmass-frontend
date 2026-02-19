import {
    Box,
    Button,
    Chip,
    Stack,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

const STATUS_CONFIG = {
    active: {
        label: 'Active',
        color: 'success'
    },
    hidden: {
        label: 'Hidden',
        color: 'default'
    },
    on_review: {
        label: 'On Review',
        color: 'warning'
    },
    fix_it: {
        label: 'Fix It',
        color: 'warning'
    },
    not_active: {
        label: 'Not Active',
        color: 'info'
    },
    rejected: {
        label: 'Rejected',
        color: 'error'
    }
};

const normalizeStatus = (status) => {
    if (!status) return 'on_review';
    const normalized = status.toString().trim().toLowerCase().replace(/\s+/g, '_');
    return normalized;
};

function TradeHeader({ title, status, onShare }) {
    const theme = useTheme();
    const statusKey = normalizeStatus(status);
    const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.on_review;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h4" fontWeight={700}>
                    {title || 'Untitled Resume'}
                </Typography>
                <Chip
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                />
            </Stack>

            <Button
                variant="outlined"
                startIcon={<ShareOutlinedIcon />}
                onClick={onShare}
                disabled
            >
                Share
            </Button>
        </Box>
    );
}

export default TradeHeader;
