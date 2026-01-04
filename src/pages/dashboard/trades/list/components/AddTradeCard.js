import { Card, CardActionArea, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddTradeCard({ onClick }) {
    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                borderRadius: 4,
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                bgcolor: 'background.paper'
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    height: '100%',
                    p: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <AddIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Add New Trade
                    </Typography>
                </Stack>
            </CardActionArea>
        </Card>
    );
}

export default AddTradeCard;