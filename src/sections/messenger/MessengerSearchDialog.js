import { useEffect, useState } from 'react';
import {
    Avatar, Box, Dialog, List, IconButton, ListItemAvatar, ListItemButton,
    ListItemText, OutlinedInput, SvgIcon, Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { profileApi } from 'src/api/profile';

export const MessengerSearchDialog = ({ open, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
        }
    }, [open]);

    const handleChange = async (e) => {
        const value = e.target.value;
        setQuery(value);
        if (!value) {
            setResults([]);
            return;
        }
        try {
            const res = await profileApi.searchMessengerProfiles(null, () => { }, value);
            setResults(res.slice(0, 50));
        } catch {
            setResults([]);
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center ' }}>
                    <IconButton onClick={onClose} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
                <OutlinedInput
                    fullWidth
                    placeholder="Search..."
                    value={query}
                    onChange={handleChange}
                    startAdornment={
                        <SvgIcon sx={{ mr: 1 }}>
                            <SearchMdIcon />
                        </SvgIcon>
                    }
                    size="small"
                />
            </Box>
            <List>
                {results.map((u) => (
                    <ListItemButton
                        key={u.id}
                        onClick={() => {
                            onSelect(u.id);
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar src={u.avatar || '/assets/default-avatar.png'} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={u.name || u.email}
                            secondary={u.email}
                        />
                    </ListItemButton>
                ))}
                {query && results.length === 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ p: 2, textAlign: 'center' }}
                    >
                        Nothing found
                    </Typography>
                )}
            </List>
        </Dialog>
    );
};