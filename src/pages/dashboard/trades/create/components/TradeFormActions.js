import { Box, Button, Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

function TradeFormActions({ onCancel, onSubmit, submitting, disabled }) {
    return (
        <Box
            sx={{
                position: 'fixed',
                left: { xs: 0, lg: 280 },
                bottom: 0,
                width: { xs: '100%', lg: 'calc(100% - 280px)' },
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: (theme) => theme.palette.background.paper,
                backdropFilter: 'blur(10px)',
                py: 2,
                px: { xs: 2, md: 5 },
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="flex-end"
                alignItems={{ xs: 'stretch', sm: 'center' }}
            >
                <Button variant="text" onClick={onCancel}>
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmit}
                    loading={submitting}
                    disabled={disabled}
                >
                    Create Trade
                </LoadingButton>
            </Stack>
        </Box>
    );
}

export default TradeFormActions;