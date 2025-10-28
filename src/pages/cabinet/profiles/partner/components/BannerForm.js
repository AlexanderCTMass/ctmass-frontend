import { useState } from 'react';
import { storage, firestore } from 'src/libs/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { BANNER_SPECS } from 'src/constants/banners';
import {
    Button, Dialog, DialogTitle, DialogContent,
    MenuItem, TextField, Stack, Typography
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { v4 as uuid } from 'uuid';

export default function BannerForm({ open, onClose, campaignId }) {
    const { user } = useAuth();
    const [values, setValues] = useState({
        name: '', type: 'horizontal', targetUrl: '', file: null, displayLocation: 'homepage_top'
    });
    const [err, setErr] = useState(null);
    const handleChange = e => {
        const { name, value, files } = e.target;
        setValues(v => ({ ...v, [name]: files ? files[0] : value }));
    };

    const validateImage = (file, type) => {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => {
                const spec = BANNER_SPECS[type];
                if (img.width === spec.width && img.height === spec.height) res();
                else rej(`Image size must be ${spec.width}x${spec.height}px`);
            };
            img.onerror = () => rej('Invalid image');
            img.src = URL.createObjectURL(file);
        });
    };

    const submit = async () => {
        try {
            if (!values.file) throw 'Choose image';
            await validateImage(values.file, values.type);

            const bannerId = uuid();
            const path = `banners/${user.uid}/${bannerId}`;
            await uploadBytes(ref(storage, path), values.file);
            const url = await getDownloadURL(ref(storage, path));

            await addDoc(collection(firestore, 'banners'), {
                id: bannerId,
                campaignId,
                partnerId: user.uid,
                name: values.name,
                imagePath: url,
                targetUrl: values.targetUrl,
                displayLocation: values.displayLocation,
                status: 'draft',
                impressions: 0, clicks: 0,
                createdAt: serverTimestamp(),
                type: values.type
            });
            onClose();
        } catch (e) { setErr(e.toString()) }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create banner</DialogTitle>
            <DialogContent>
                <Stack spacing={2} pt={1}>
                    <TextField name="name" label="Banner name" value={values.name} onChange={handleChange} />
                    <TextField name="type" select label="Type" value={values.type} onChange={handleChange}>
                        <MenuItem value="horizontal">Horizontal (1200×300)</MenuItem>
                        <MenuItem value="vertical">Vertical (300×600)</MenuItem>
                    </TextField>
                    <TextField name="targetUrl" label="Target URL" value={values.targetUrl} onChange={handleChange} />
                    <Button variant="outlined" component="label">Upload image
                        <input type="file" hidden accept="image/png, image/jpeg, image/webp" onChange={handleChange} />
                    </Button>
                    {err && <Typography color="error">{err}</Typography>}
                    <Button variant="contained" onClick={submit}>Save</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}