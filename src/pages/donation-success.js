import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const DonationSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Перенаправляем обратно через 3 секунды
        const timer = setTimeout(() => {
            navigate(-1);
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={2}
        >
            <Typography variant="h4" color="success.main">
                Thank You! 🎉
            </Typography>
            <Typography>
                Your donation has been processed successfully.
            </Typography>
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
                Redirecting back...
            </Typography>
        </Box>
    );
};

export default DonationSuccess;