import { useState, useCallback } from 'react';
import {
    Avatar, Box, CircularProgress, List, ListItemAvatar, ListItemButton,
    ListItemText, OutlinedInput, Stack, Typography, useMediaQuery
} from '@mui/material';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { SvgIcon } from '@mui/material';
import { formatDistanceToNowStrict } from 'date-fns';
import { useAuth } from 'src/hooks/use-auth';
import { profileApi } from 'src/api/profile';

export const MessengerSidebar = ({
    container,
    tab,
    threads,
    onSelectThread,
    currentThreadId,
    mobileSearch
}) => {
    const { user } = useAuth();
    const mdUp = useMediaQuery((t) => t.breakpoints.up('md'));

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const handleSearch = useCallback(
        async (e) => {
            const value = e.target.value;
            setQuery(value);
            if (!value) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await profileApi.searchMessengerProfiles(
                    null,
                    () => { },
                    value
                );
                setSearchResults(res.slice(0, 30));
            } catch {
                setSearchResults([]);
            }
        },
        []
    );

    const chatsList = threads
        .filter((t) => t.category === tab || t.pinned)
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.updatedAt - a.updatedAt;
        });

    const listToShow = mdUp ? (query ? searchResults : chatsList) : chatsList;

    return (
        <Box
            sx={{
                width: { xs: '100%', md: 320 },
                flexShrink: 0,
                borderRight: { md: (t) => `1px solid ${t.palette.divider}` },
                height: { xs: 'auto', md: '100%' },
                overflowY: 'auto'
            }}
        >
            {mdUp && (
                <Box sx={{ p: 2 }}>
                    <OutlinedInput
                        fullWidth
                        placeholder="Search..."
                        value={query}
                        onChange={handleSearch}
                        startAdornment={
                            <SvgIcon sx={{ mr: 1 }}>
                                <SearchMdIcon />
                            </SvgIcon>
                        }
                        size="small"
                    />
                </Box>
            )}

            {/* {!mdUp && (
                <ListItemButton onClick={mobileSearch}>
                    <SvgIcon sx={{ mr: 1 }}>
                        <SearchMdIcon />
                    </SvgIcon>
                    <ListItemText primary="Search users" />
                </ListItemButton>
            )} */}

            {threads.loading ? (
                <CircularProgress sx={{ m: 2 }} />
            ) : threads.error ? (
                <Box sx={{ p: 2 }}>{threads.error}</Box>
            ) : (
                <List>
                    {listToShow.map((item) => {
                        const isThread = mdUp ? !query : true;
                        const key = item.id || item.email;
                        const last = isThread ? item.lastMessage : null
                        const name = item.isService ? 'CTMASS support' : item.name;
                        const avatar = item.isService ? '/assets/logo.jpg' : item.avatar;
                        return (
                            <ListItemButton
                                key={key}
                                selected={isThread && item.id === currentThreadId}
                                onClick={() => onSelectThread(item.id || item.email)}
                                sx={{
                                    ...(item.isService && {
                                        bgcolor: '#fff9e0'
                                    }),
                                    ...(isThread && item.id === currentThreadId && {
                                        backgroundColor: (t) => t.palette.action.selected
                                    })
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={avatar} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={name}
                                    secondary={
                                        isThread && last ? (
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography
                                                    variant="caption"
                                                    sx={{ flexGrow: 1, pr: 1 }}
                                                    noWrap
                                                >
                                                    {last.text ||
                                                        (last.attachments?.length ? 'Attachment' : '')}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                >
                                                    {formatDistanceToNowStrict(
                                                        last.createdAt?.toMillis
                                                            ? last.createdAt.toMillis()
                                                            : last.createdAt
                                                    )}{' '}
                                                    ago
                                                </Typography>
                                            </Stack>
                                        ) : null
                                    }
                                />
                            </ListItemButton>
                        );
                    })}
                    {mdUp && listToShow.length === 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: 2, textAlign: 'center' }}
                        >
                            Nothing found
                        </Typography>
                    )}
                </List>
            )}
        </Box>
    );
};