import {
    Dialog, DialogTitle, IconButton, TextField, Stack,
    List, ListItem, ListItemAvatar, Avatar, ListItemText,
    Button, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useCallback } from 'react';
import { profileApi } from 'src/api/profile';
import { RouterLink } from 'src/components/router-link';

export default function TagSpecialistsModal({ tag, onClose }) {
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const load = useCallback(async (reset = false) => {
        if (done && !reset) return;
        setLoading(true);
        const res = await profileApi.getProfilesByTag(tag, 10, reset ? null : cursor);
        setItems(prev => reset ? res.docs : [...prev, ...res.docs]);
        setCursor(res.last);
        setDone(!res.last);
        setLoading(false);
    }, [tag, cursor, done]);

    useEffect(() => { load(true); }, [tag]);

    const list = items.filter(u => {
        const q = filter.toLowerCase();
        return (u.businessName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q);
    });

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Specialists with tag: {tag}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Stack spacing={2} sx={{ p: 3, pt: 0 }}>
                <TextField
                    placeholder="Search by business name or email"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    size="small"
                    InputProps={{
                        sx: {
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            '& .MuiInputBase-input': {
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1,
                                py: 0,
                            },
                            '& .MuiInputAdornment-root': {
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                maxHeight: '100%',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: 22,
                            },
                        },
                    }}
                />

                <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {list.map(u => (
                        <ListItem key={u.id}
                            secondaryAction={
                                <Button
                                    component={RouterLink}
                                    href={`/contractors/first1000/${u.profilePage || u.id}`}
                                    size="small"
                                >
                                    View profile
                                </Button>
                            }>
                            <ListItemAvatar><Avatar src={u.avatar} /></ListItemAvatar>
                            <ListItemText primary={u.businessName || u.email} secondary={u.email} />
                        </ListItem>
                    ))}
                    {loading && <CircularProgress sx={{ m: 'auto', my: 2 }} />}
                </List>

                {!done &&
                    <Button variant="outlined" onClick={() => load()}>
                        Load more
                    </Button>}
            </Stack>
        </Dialog>
    );
}