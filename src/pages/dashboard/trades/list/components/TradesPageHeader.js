import { Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function TradesPageHeader({ onCreateTrade }) {
    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
        >
            <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700}>
                    My Trades
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Stay on top of your trades, metrics, and opportunities.
                </Typography>
            </Stack>

            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onCreateTrade}
                sx={{ minWidth: 200 }}
            >
                Create new trade
            </Button>
        </Stack>
    );
}

export default TradesPageHeader;