import { Box, Button, Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { stickyActionBarSx } from 'src/components/ctmass-ui';

function TradeFormActions({ onCancel, onSubmit, submitting, disabled, submitLabel = 'Create Trade' }) {
    return (
        <Box
            sx={stickyActionBarSx()}
        >
            <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                justifyContent="flex-end"
                alignItems="center"
            >
                <Button variant="text" onClick={onCancel}>
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmit}
                    loading={submitting}
                    disabled={disabled}
                    sx={{ flexGrow: { xs: 1, sm: 0 }, px: 3 }}
                >
                    {submitLabel}
                </LoadingButton>
            </Stack>
        </Box>
    );
}

export default TradeFormActions;