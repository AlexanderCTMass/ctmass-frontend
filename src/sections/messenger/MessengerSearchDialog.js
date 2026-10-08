import { useEffect, useState } from 'react';
import { Box, Dialog, IconButton, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';
import { PersonRow, useProfileSearch } from './MessengerSidebar';

export const MessengerSearchDialog = ({ open, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const { results, searching } = useProfileSearch(open ? query : '', 50);

    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    return (
        <Dialog fullScreen open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#FFFFFF', backgroundImage: 'none' } }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 1.5, pt: 'calc(env(safe-area-inset-top) + 12px)', pb: 1.5, borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}` }}
            >
                <IconButton aria-label="Back to messages" onClick={onClose} sx={{ color: BRAND.navy }}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <OutlinedInput
                    fullWidth
                    autoFocus
                    placeholder="Search people"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    inputProps={{ 'aria-label': 'Search people' }}
                    startAdornment={(
                        <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: BRAND.muted }} />
                        </InputAdornment>
                    )}
                    sx={{
                        height: 46,
                        borderRadius: RADIUS.tile,
                        bgcolor: BRAND.mist,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: alpha(BRAND.green, 0.6), borderWidth: 1 }
                    }}
                />
            </Stack>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                {results.map((u) => (
                    <PersonRow
                        key={u.id}
                        avatar={u.avatar}
                        name={u.businessName || u.name || u.email}
                        subtitle={u.email}
                        onClick={() => onSelect(u.id)}
                    />
                ))}
                {query.trim() && !searching && results.length === 0 && (
                    <Typography sx={{ p: 3, textAlign: 'center', fontSize: 14, color: BRAND.muted }}>
                        No one found for “{query.trim()}”.
                    </Typography>
                )}
                {!query.trim() && (
                    <Typography sx={{ p: 3, textAlign: 'center', fontSize: 14, color: BRAND.muted }}>
                        Type a name or email to find someone.
                    </Typography>
                )}
            </Box>
        </Dialog>
    );
};
