import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, InputAdornment, OutlinedInput, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { formatDistanceToNowStrict } from 'date-fns';
import { profileApi } from 'src/api/profile';
import { focusRingSx, IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';

export const useProfileSearch = (query, limit) => {
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const requestRef = useRef(0);

    useEffect(() => {
        const value = query.trim();
        const requestId = ++requestRef.current;
        if (!value) {
            setResults([]);
            setSearching(false);
            return undefined;
        }
        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await profileApi.searchMessengerProfiles(null, () => { }, value);
                if (requestId === requestRef.current) setResults(res.slice(0, limit));
            } catch {
                if (requestId === requestRef.current) setResults([]);
            } finally {
                if (requestId === requestRef.current) setSearching(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query, limit]);

    return { results, searching };
};

const formatAgo = (value) => {
    if (!value) return '';
    const ms = value?.toMillis ? value.toMillis() : value;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return '';
    return formatDistanceToNowStrict(date);
};

export const PersonRow = ({ avatar, name, subtitle, meta, unread, selected, isSelf, isService, onClick }) => (
    <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.25,
            py: 1.1,
            border: 0,
            borderRadius: RADIUS.inner,
            bgcolor: selected ? alpha(BRAND.navy, 0.07) : 'transparent',
            textAlign: 'left',
            font: 'inherit',
            cursor: 'pointer',
            transition: 'background-color .2s ease',
            '&:hover': { bgcolor: selected ? alpha(BRAND.navy, 0.09) : alpha(BRAND.navy, 0.04) },
            ...focusRingSx
        }}
    >
        {isSelf ? (
            <IconTile size={46} tone="navy" sx={{ borderRadius: '50%' }}><BookmarkRoundedIcon /></IconTile>
        ) : (
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar src={avatar} sx={{ width: 46, height: 46, bgcolor: BRAND.navy, fontWeight: 700 }}>
                    {(name || '?').charAt(0).toUpperCase()}
                </Avatar>
                {isService && (
                    <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: '50%', bgcolor: BRAND.green, border: '2px solid #FFFFFF' }} />
                )}
            </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: unread ? 800 : 700, color: BRAND.ink }}>
                    {name}
                </Typography>
                {meta && (
                    <Typography noWrap sx={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: unread ? BRAND.green : BRAND.muted }}>
                        {meta}
                    </Typography>
                )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: unread ? 600 : 400, color: unread ? BRAND.ink : BRAND.muted }}>
                    {subtitle || ' '}
                </Typography>
                {unread > 0 && (
                    <Box sx={{ minWidth: 20, height: 20, px: 0.75, borderRadius: RADIUS.pill, bgcolor: BRAND.green, color: '#FFFFFF', fontSize: 11, fontWeight: 800, lineHeight: '20px', textAlign: 'center' }}>
                        {unread}
                    </Box>
                )}
            </Stack>
        </Box>
    </Box>
);

export const MessengerSidebar = ({ tab, threads, onSelectThread, currentThreadId }) => {
    const mdUp = useMediaQuery((t) => t.breakpoints.up('md'));
    const [query, setQuery] = useState('');
    const { results: searchResults, searching } = useProfileSearch(mdUp ? query : '', 30);

    const chatsList = threads
        .filter((t) => t.category === tab || t.pinned)
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.updatedAt - a.updatedAt;
        });

    const isSearching = mdUp && !!query.trim();

    return (
        <Box
            sx={{
                flex: { xs: '1 1 auto', md: '0 0 360px' },
                width: { xs: '100%', md: 360 },
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: { md: `1px solid ${alpha(BRAND.navy, 0.08)}` },
                bgcolor: '#FFFFFF'
            }}
        >
            {mdUp && (
                <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                    <Typography component="h2" sx={{ mb: 1.75, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: BRAND.navy }}>
                        Messages
                    </Typography>
                    <OutlinedInput
                        fullWidth
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
                            height: 44,
                            borderRadius: RADIUS.tile,
                            bgcolor: BRAND.mist,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            '&.Mui-focused': { bgcolor: '#FFFFFF', boxShadow: `0 0 0 4px ${alpha(BRAND.green, 0.14)}` },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: alpha(BRAND.green, 0.6), borderWidth: 1 }
                        }}
                    />
                </Box>
            )}

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pt: { xs: 1, md: 0 }, pb: 2 }}>
                {isSearching ? (
                    <>
                        {searchResults.map((item) => (
                            <PersonRow
                                key={item.id || item.email}
                                avatar={item.avatar}
                                name={item.businessName || item.name || item.email}
                                subtitle={item.email}
                                onClick={() => onSelectThread(item.id || item.email)}
                            />
                        ))}
                        {!searching && searchResults.length === 0 && (
                            <Typography sx={{ p: 3, textAlign: 'center', fontSize: 14, color: BRAND.muted }}>
                                No one found for “{query.trim()}”.
                            </Typography>
                        )}
                    </>
                ) : (
                    <>
                        {chatsList.map((item) => {
                            const last = item.lastMessage;
                            const name = item.isService ? 'CTMASS support' : item.isSelf ? 'Saved messages' : item.name;
                            const preview = last?.text || (last?.attachments?.length ? 'Photo' : '');

                            return (
                                <PersonRow
                                    key={item.id}
                                    avatar={item.isService ? '/assets/logo.jpg' : item.avatar}
                                    name={name}
                                    subtitle={preview}
                                    meta={last?.text || last?.attachments?.length ? formatAgo(last.createdAt) : ''}
                                    unread={Number(item.unreadCount) || 0}
                                    selected={item.id === currentThreadId}
                                    isSelf={item.isSelf}
                                    isService={item.isService}
                                    onClick={() => onSelectThread(item.id)}
                                />
                            );
                        })}
                        {chatsList.length === 0 && (
                            <Stack alignItems="center" sx={{ px: 3, py: 6, textAlign: 'center' }}>
                                <IconTile size={52} tone="navy"><ChatBubbleOutlineRoundedIcon /></IconTile>
                                <Typography sx={{ mt: 1.5, fontWeight: 700, color: BRAND.navy }}>No conversations yet</Typography>
                                <Typography sx={{ mt: 0.5, fontSize: 14, color: BRAND.muted }}>
                                    Message a pro from their profile, or search for someone by name.
                                </Typography>
                            </Stack>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};
