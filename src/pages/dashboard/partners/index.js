import { collection, updateDoc, doc, onSnapshot, query, where, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { useState, useEffect } from 'react'
import { useAuth } from 'src/hooks/use-auth';
import { v4 as uuid } from 'uuid';
import {
    Container, Card, CardContent, Button, Typography, Stack, Grid
} from '@mui/material';
import { emailSender } from 'src/libs/email-sender';
import { emailService } from 'src/service/email-service';

export default function PartnerApplications() {
    const [apps, setApps] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const q = query(collection(firestore, 'partnerApplications'), where('status', '==', 'pending'));
        return onSnapshot(q, snap => {
            setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    const approve = async (id) => {
        const ref = doc(firestore, 'partnerApplications', id);
        const snap = await getDoc(ref)
        const app = snap.data();

        const tempId = uuid();
        await setDoc(doc(firestore, 'partners', tempId), {
            uid: null,
            tempId,
            companyName: app.companyName,
            legalName: app.companyName,
            logoUrl: '',
            partnershipEndDate: null,
            description: app.comments || '',
            industry: app.industry,
            website: app.website || '',
            contactPerson: {
                name: app.contactPerson,
                email: app.email,
                phone: app.phone
            },
            status: 'active',
            partnershipStartDate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await updateDoc(ref, {
            status: 'approved',
            reviewedAt: serverTimestamp(),
            reviewedBy: user?.uid || null,
            partnerTempId: tempId
        });

        const auth = getAuth();
        const actionCodeSettings = {
            url: `${window.location.origin}/login`,
            handleCodeInApp: true
        };
        await sendSignInLinkToEmail(auth, app.email, actionCodeSettings);

        await emailService.sendPartnerApproved(app, actionCodeSettings.url);
    };

    const rejectApp = async (id) => {
        const ref = doc(firestore, 'partnerApplications', id);
        await updateDoc(ref, {
            status: 'rejected',
            reviewedAt: serverTimestamp(),
            reviewedBy: user?.uid || null
        });
    };

    const [tab, setTab] = useState('pending');
    const qAll = query(collection(firestore, 'partnerApplications'),
        where('status', 'in', ['approved', 'rejected']));
    const [processed, setProcessed] = useState([]);
    useEffect(() => onSnapshot(qAll, s => {
        setProcessed(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }), []);

    const rows = tab === 'pending' ? apps : processed;

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" mb={3}>Partner applications</Typography>
            <Stack direction="row" spacing={2} mb={3}>
                <Button variant={tab === 'pending' ? 'contained' : 'text'}
                    onClick={() => setTab('pending')}>Pending</Button>
                <Button variant={tab !== 'pending' ? 'contained' : 'text'}
                    onClick={() => setTab('processed')}>Approved / Rejected</Button>
            </Stack>
            <Grid container spacing={2}>
                {rows.map(a => (
                    <Grid key={a.id} xs={12} md={6} mt={1} mb={1} pr={2}>
                        <Card>
                            <CardContent>
                                <Stack spacing={1}>
                                    <Typography variant="h6">{a.companyName}</Typography>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        {a.industry}
                                    </Typography>
                                    <Typography>Email: {a.email}</Typography>
                                    <Typography>Phone: {a.phone}</Typography>
                                    {a.website && <Typography>Website: {a.website}</Typography>}
                                    {a.comments && <Typography>Comment: {a.comments}</Typography>}
                                </Stack>
                                {tab === 'pending' && (
                                    <Stack direction="row" spacing={2} mt={2}>
                                        <Button fullWidth variant="contained" onClick={() => approve(a.id)}>
                                            Approve
                                        </Button>
                                        <Button fullWidth color="error"
                                            onClick={() => rejectApp(a.id)}>
                                            Reject
                                        </Button>
                                    </Stack>
                                )}

                                {tab !== 'pending' && (
                                    <Typography mt={2} color={a.status === 'approved' ? 'green' : 'error'}>
                                        {a.status.toUpperCase()}
                                    </Typography>
                                )}

                                {a.status === 'approved' && (
                                    <Button sx={{ mt: 2 }} onClick={() =>
                                        window.open(`/dashboard/partners/${a.partnerTempId || a.partnerId}`)}>
                                        View banners
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}