import { memo } from 'react';
import { Button } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RequestsTab from 'src/pages/dashboard/trades/view/tabs/RequestsTab';
import { useAuth } from 'src/hooks/use-auth';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn, DashPage } from 'src/components/ctmass-ui';

const RequestsContent = () => {
    const { user } = useAuth();

    return (
        <DashPage
            title="My requests"
            subtitle="Service requests you sent to specialists, and where each one stands."
            action={(
                <Button component={RouterLink} href={paths.services.index} startIcon={<SearchRoundedIcon />} sx={{ ...btn.green, minHeight: 50, px: 3, width: { xs: '100%', md: 'auto' } }}>
                    Find a specialist
                </Button>
            )}
        >
            <RequestsTab trade={{}} isHomeowner user={user} />
        </DashPage>
    );
};

export default memo(RequestsContent);
