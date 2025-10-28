import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Grid, Card, CardMedia, CardContent, Stack
} from '@mui/material';
import BannerForm from './components/BannerForm';

export default function PartnerBanners() {
    const { campaignId } = useParams();
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(firestore, 'banners'), where('campaignId', '==', campaignId));
        return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [campaignId]);

    return (
        <Container sx={{ py: 6 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Banners</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Add banner</Button>
            </Stack>

            <Grid container spacing={2}>
                {items.map(b => (
                    <Grid key={b.id} xs={12} md={4}>
                        <Card>
                            <CardMedia component="img" height="140" image={b.imagePath} />
                            <CardContent>
                                <Typography variant="subtitle1">{b.name}</Typography>
                                <Typography variant="body2">Impr: {b.impressions}  Clicks: {b.clicks}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <BannerForm open={open} onClose={() => setOpen(false)} campaignId={campaignId} />
        </Container>
    );
}