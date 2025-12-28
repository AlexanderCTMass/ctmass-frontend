import { Card, CardContent, Divider, Skeleton, Stack } from '@mui/material';

function TradeCardSkeleton() {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                height: '100%',
                borderColor: 'divider'
            }}
        >
            <CardContent sx={{ pt: 3.5, px: 3.5, pb: 2.5 }}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Skeleton variant="circular" width={80} height={80} />
                        <Skeleton variant="rounded" width={72} height={28} />
                    </Stack>

                    <Stack spacing={1}>
                        <Skeleton variant="text" width="80%" height={28} />
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="100%" />
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={`stat-${index}`}
                                variant="rounded"
                                height={28}
                            />
                        ))}
                    </Stack>
                </Stack>
            </CardContent>

            <Stack
                direction="row"
                spacing={2}
                sx={{ px: 2.5, py: 2 }}
                justifyContent="space-between"
            >
                <Skeleton variant="rounded" width={78} height={32} />
                <Stack direction="row" spacing={1.5}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Stack>
            </Stack>
        </Card>
    );
}

export default TradeCardSkeleton;