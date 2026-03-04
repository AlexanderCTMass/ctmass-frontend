import { memo } from 'react';
import { Box } from '@mui/material';
import { Seo } from 'src/components/seo';
import RequestsContent from './components';

const RequestsPage = () => (
    <>
        <Seo title="My Requests" />
        <Box component="main" sx={{ flexGrow: 1 }}>
            <RequestsContent />
        </Box>
    </>
);

export default memo(RequestsPage);
