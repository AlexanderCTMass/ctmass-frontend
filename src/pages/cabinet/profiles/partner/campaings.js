import {
    collection, query, where, onSnapshot,
    addDoc, serverTimestamp
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { useAuth } from 'src/hooks/use-auth';
import { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Dialog, DialogContent, TextField, Stack,
    MenuItem, Grid, Card, CardContent
} from '@mui/material';
import dayjs from 'dayjs';

export default function PartnerCampaigns() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', start: '', end: '', budget: '' });

    useEffect(() => {
        const q = query(collection(firestore, 'campaigns'), where('partnerId', '==', user.uid));
        return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [user.uid]);

    const submit = async () => {
        await addDoc(collection(firestore, 'campaigns'), {
            partnerId: user.uid,
            name: form.name,
            status: 'draft',
            startDate: form.start ? dayjs(form.start).toDate() : null,
            endDate: form.end ? dayjs(form.end).toDate() : null,
            budget: form.budget ? Number(form.budget) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        setOpen(false);
    };

    return (
        <Container sx={{ py: 6 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4">My campaigns</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Create campaign</Button>
            </Stack>

            <Grid container spacing={2}>
                {items.map(c => (
                    <Grid key={c.id} xs={12} md={6}>
                        <Card onClick={() => window.location = `/cabinet/profiles/partner/campaigns/${c.id}/banners`}>
                            <CardContent>
                                <Typography variant="h6">{c.name}</Typography>
                                <Typography>Status: {c.status}</Typography>
                                <Typography variant="body2">
                                    {c.startDate?.toDate?.().toLocaleDateString()} – {c.endDate?.toDate?.().toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <Stack spacing={2} pt={1}>
                        <TextField label="Campaign name" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} />
                        <TextField type="date" label="Start date" InputLabelProps={{ shrink: true }}
                            value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
                        <TextField type="date" label="End date" InputLabelProps={{ shrink: true }}
                            value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
                        <TextField label="Budget" type="number"
                            value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                        <Button variant="contained" onClick={submit}>Save</Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Container>
    );
}