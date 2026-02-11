import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';

function TradeMainInfo({ trade, onEdit }) {
    const avatarInitial = (trade?.title || 'T').charAt(0).toUpperCase();
    const locationText = trade?.location?.address
        ? trade?.location?.address
        : 'Location not specified';

    const priceText = trade?.pricing?.amount
        ? `$${trade.pricing.amount}${trade?.pricing?.type ? `/${trade.pricing.type}` : '/hr'}`
        : 'Price not specified';

    const description = trade?.story?.about || trade?.story?.shortDescription || trade?.description || 'No description available';

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 3,
                        alignItems: { xs: 'center', md: 'flex-start' }
                    }}
                >
                    <Avatar
                        src={trade?.avatarUrl || undefined}
                        variant="circular"
                        sx={{
                            width: 120,
                            height: 120,
                            border: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            fontSize: '2.5rem',
                            fontWeight: 600
                        }}
                    >
                        {avatarInitial}
                    </Avatar>

                    <Stack spacing={2} sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {trade?.title || 'Untitled Resume'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {trade?.primarySpecialtyLabel || trade?.subtitle || 'Specialty not specified'}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Chip
                                icon={<LocationOnOutlinedIcon />}
                                label={locationText}
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<AttachMoneyOutlinedIcon />}
                                label={priceText}
                                variant="outlined"
                                size="medium"
                                color="primary"
                            />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {description}
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<EditOutlinedIcon />}
                        onClick={onEdit}
                        sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}
                    >
                        Edit
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default TradeMainInfo;
