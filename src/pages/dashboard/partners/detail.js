import { useParams } from 'react-router-dom';
import { doc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useEffect, useState } from 'react';

export default function PartnerDetailPage() {
    const { partnerId } = useParams();
    const [partner, setPartner] = useState(null);
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(doc(firestore, 'partners', partnerId), d => setPartner(d.data()));
        const unsubB = onSnapshot(
            query(collection(firestore, 'banners'), where('partnerId', '==', partnerId)),
            s => setBanners(s.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => { unsub(); unsubB(); };
    }, [partnerId]);

    if (!partner) return null;

    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h4" mb={3}>{partner.companyName}</Typography>

            <Typography variant="subtitle1" gutterBottom>Industry: {partner.industry}</Typography>
            <Typography gutterBottom>Website: {partner.website}</Typography>
            <Typography gutterBottom>Status: {partner.status}</Typography>

            <Typography variant="h5" mt={4} mb={2}>Banners</Typography>
            <Grid container spacing={2}>
                {banners.map(b => (
                    <Grid key={b.id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardMedia component="img" height="120" image={b.imagePath} />
                            <CardContent>
                                <Typography variant="subtitle1">{b.name}</Typography>
                                <Typography variant="body2">Impr: {b.impressions}   Clicks: {b.clicks}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}