import { Box, Button, Stack, Typography, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function TradesEmptyState({ onCreateTrade }) {
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    return (
        <Box
            sx={{
                borderRadius: 4,
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                py: { xs: 8, md: 10 },
                px: { xs: 2, md: 4 },
                textAlign: 'center',
                bgcolor: 'background.paper',
            }}
        >
            <Stack spacing={3} alignItems="center">
                <Box
                    component="img"
                    src="/assets/gallery/plumbers/19191.jpg"
                    alt="Create your first trade"
                    sx={{
                        width: smUp ? 300 : 200,
                        height: smUp ? 300 : 200,
                        objectFit: 'cover',
                    }}
                />

                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        You have no trade yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create your first trade to start getting jobs.
                    </Typography>
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateTrade}
                    sx={{ minWidth: 180 }}
                >
                    Create trade
                </Button>

                <Typography variant="caption" color="text.secondary">
                    Start with any specialties from our catalogue.
                </Typography>
            </Stack>
        </Box>
    );
}

export default TradesEmptyState;