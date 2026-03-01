import { memo } from 'react';
import { Box, Container } from '@mui/material';
import RequestsTab from 'src/pages/dashboard/trades/view/tabs/RequestsTab';
import { useAuth } from 'src/hooks/use-auth';

const RequestsContent = () => {
    const { user } = useAuth();

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth={false}>
                <RequestsTab trade={{}} isHomeowner user={user} />
            </Container>
        </Box>
    );
};

export default memo(RequestsContent);
