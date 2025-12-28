import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

function TradeStatCard({ icon, label, value }) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                height: '100%',
                borderColor: 'divider'
            }}
        >
            <CardContent sx={{ py: 3, px: 3.5 }}>
                <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            width: 48,
                            height: 48
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Stack spacing={0.5}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {value}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradeStatCard;