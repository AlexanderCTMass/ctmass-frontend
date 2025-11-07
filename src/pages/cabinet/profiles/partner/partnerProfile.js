import { useAuth } from 'src/hooks/use-auth';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { Card, CardContent, Container, Grid, Typography, Button, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';

export default function PartnerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ campaigns: 0, banners: 0, impr: 0, click: 0 });

    useEffect(() => {
        if (!user?.uid) return;

        const qCamp = query(collection(firestore, 'campaigns'), where('partnerId', '==', user.uid));
        const qBanner = query(collection(firestore, 'banners'), where('partnerId', '==', user.uid));

        const unsub1 = onSnapshot(qCamp, s => setStats(prev => ({
            ...prev, campaigns: s.size, last: s.docs
                .sort((a, b) => b.get('createdAt') - a.get('createdAt'))
                .slice(0, 5).map(d => ({ id: d.id, ...d.data() }))
        })));
        const unsub2 = onSnapshot(qBanner, s => {
            let impr = 0, click = 0;
            s.forEach(d => { impr += d.get('impressions') ?? 0; click += d.get('clicks') ?? 0; });
            setStats(prev => ({ ...prev, banners: s.size, impr, click }));
        });

        return () => { unsub1(); unsub2(); };
    }, [user?.uid]);

    return (
        <>
            <Seo title="Partner dashboard" />
            <Container sx={{ py: 6 }}>
                <Stack direction="row" justifyContent="space-between" mb={4}>
                    <Typography variant="h4">
                        {stats.company || user?.displayName}
                    </Typography>
                    <Button variant="outlined"
                        onClick={() => window.location = '/cabinet/profiles/partner/campaigns'}>
                        Manage campaigns
                    </Button>
                </Stack>
                <Grid container spacing={3}>
                    {Object.entries({
                        'Active campaigns': stats.campaigns,
                        'Total banners': stats.banners,
                        'Monthly impressions': stats.impr,
                        'Monthly clicks': stats.click
                    }).map(([k, v]) => (
                        <Grid key={k} xs={12} sm={6} md={3}>
                            <Card><CardContent>
                                <Typography color="text.secondary" gutterBottom>{k}</Typography>
                                <Typography variant="h5">{v}</Typography>
                            </CardContent></Card>
                        </Grid>
                    ))}
                </Grid>

                <Typography variant="h5" mt={5} mb={2}>Latest campaigns</Typography>
                <Grid container spacing={2}>
                    {stats.last?.map(c => (
                        <Grid key={c.id} xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1">{c.name}</Typography>
                                    <Typography color="text.secondary">Status: {c.status}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}