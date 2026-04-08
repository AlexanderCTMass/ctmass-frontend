import { useState, useCallback } from 'react';
import {
    Avatar, Box, CircularProgress, List, ListItemAvatar, ListItemButton,
    ListItemText, OutlinedInput, Stack, Typography, useMediaQuery, Badge, alpha
} from '@mui/material';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { SvgIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNowStrict } from 'date-fns';
import { profileApi } from 'src/api/profile';

export const MessengerSidebar = ({
    container,
    tab,
    threads,
    onSelectThread,
    currentThreadId,
    mobileSearch
}) => {
    const mdUp = useMediaQuery((t) => t.breakpoints.up('md'));
    const theme = useTheme();

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
                flex: { xs: '0 0 100%', md: '0 0 40%' },
                maxWidth: { xs: '100%', md: '40%' },
                height: { xs: '100%', md: '100%' },
                borderRight: { md: (t) => `1px solid ${t.palette.divider}` },
                overflowY: 'auto',
                pb: { xs: 8, md: 0 },
                bgcolor: 'background.paper'
            }}
        >
            {mdUp && (
                <Box sx={{ p: 2, borderBottom: t => `1px solid ${t.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Messages
                    </Typography>
                    <OutlinedInput
                        fullWidth
                        placeholder="Search people..."
                        value={query}
                        onChange={handleSearch}
                        startAdornment={
                            <SvgIcon sx={{ mr: 1, color: 'text.disabled' }} fontSize="small">
                                <SearchMdIcon />
                            </SvgIcon>
                        }
                        size="small"
                        sx={{ borderRadius: 2 }}
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
                                    px: 2,
                                    py: 1.25,
                                    transition: 'background 0.15s',
                                    ...(item.isService && {
                                        bgcolor: alpha(theme.palette.warning.light, 0.12)
                                    }),
                                    ...(isThread && item.id === currentThreadId && {
                                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                                        borderLeft: `3px solid ${theme.palette.primary.main}`
                                    }),
                                    '&:hover': {
                                        bgcolor: (t) => alpha(t.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        color="success"
                                        variant="dot"
                                        invisible={!item.isService}
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    >
                                        <Avatar
                                            src={avatar}
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                ...(isThread && item.id === currentThreadId && {
                                                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`
                                                })
                                            }}
                                        />
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            fontWeight={Number(item.unreadCount) > 0 ? 700 : 500}
                                            noWrap
                                        >
                                            {name}
                                        </Typography>
                                    }
                                    secondary={
                                        isThread && last ? (
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="caption"
                                                    color={Number(item.unreadCount) > 0 ? 'text.primary' : 'text.secondary'}
                                                    fontWeight={Number(item.unreadCount) > 0 ? 600 : 400}
                                                    sx={{ flexGrow: 1, pr: 1 }}
                                                    noWrap
                                                >
                                                    {last.text ||
                                                        (last.attachments?.length ? 'Attachment' : '')}
                                                </Typography>
                                                {last.createdAt && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.disabled"
                                                        noWrap
                                                        sx={{ fontSize: '0.7rem' }}
                                                    >
                                                        {formatDistanceToNowStrict(
                                                            last.createdAt?.toMillis
                                                                ? last.createdAt.toMillis()
                                                                : last.createdAt
                                                        )}{' '}
                                                        ago
                                                    </Typography>
                                                )}
                                            </Stack>
                                        ) : null
                                    }
                                />

                                {Number(item.unreadCount) > 0 && (
                                    <Badge
                                        color="primary"
                                        badgeContent={item.unreadCount}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                right: 0,
                                                top: 'calc(50% - 5px)'
                                            }
                                        }}
                                    />
                                )}
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