import { memo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const VerificationBanner = () => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <VerifiedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
            This document has been verified by CTMASS Compliance Team
        </Typography>
    </Paper>
);

export default memo(VerificationBanner);
