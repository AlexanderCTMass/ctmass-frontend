import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { Box, Button, Drawer, IconButton, Stack, SvgIcon, Typography, useMediaQuery } from '@mui/material';
import { profileApi } from 'src/api/profile'; // Используем реальный API вместо моков
import { Scrollbar } from 'src/components/scrollbar';
import { useAuth } from 'src/hooks/use-auth'; // Используем реального пользователя
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { useDispatch, useSelector } from 'src/store';
import { ChatSidebarSearch } from './chat-sidebar-search';
import { ChatThreadItem } from './chat-thread-item';
import { thunks } from "src/thunks/chat";
import { ChatFeatureToggles } from "src/featureToggles/ChatFeatureToggles";
import { useNavigate } from "react-router-dom";
import { navigateToCurrentWithParams } from "src/utils/navigate";

const getThreadKey = (thread, userId) => {
    if (!thread || !userId) return null;

    if (thread.type === 'GROUP') {
        return thread.id;
    }

    return thread.users?.find((user) => user.id !== userId);
};

const useThreads = () => {
    return useSelector((state) => state.chat.threads);
};

const useCurrentThreadId = () => {
    return useSelector((state) => state.chat.currentThreadId);
};


export const ChatSidebar = (props) => {
    const {
        container, onClose, open, profiles, setProfiles,
        projectId,
        sidebarLabel = <Typography
            variant="h5"
            sx={{ flexGrow: 1, m: 2 }}
        >
            Chats
        </Typography>, ...other
    } = props;
    const { user } = useAuth();
    const router = useRouter();
    const navigate = useNavigate();
    const threads = useThreads();
    const currentThreadId = useCurrentThreadId();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const dispatch = useDispatch();

    const handleCompose = useCallback(() => {
        navigateToCurrentWithParams(navigate, "compose", true);
    }, [router]);

    const handleSearchChange = useCallback(async (event) => {
        const { value } = event.target;

        setSearchQuery(value);

        if (!value) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await profileApi.searchProfiles(profiles, setProfiles, value);
            setSearchResults(res)
        } catch (err) {
            console.error('Error searching contacts:', err);
            setSearchResults([]);
        }
    }, []);

    const handleSearchClickAway = useCallback(() => {
        if (searchFocused) {
            setSearchFocused(false);
            setSearchQuery('');
        }
    }, [searchFocused]);

    const handleSearchFocus = useCallback(() => {
        setSearchFocused(true);
    }, []);

    const handleSearchSelect = useCallback((contact) => {
        setSearchFocused(false);
        setSearchQuery('');
        navigateToCurrentWithParams(navigate, "threadKey", contact.id);
    }, [router]);

    useEffect(() => {
        dispatch(thunks.getThreads(user, projectId));
    }, [dispatch]);

    const handleThreadSelect = useCallback((threadId) => {
        const thread = threads.byId[threadId];
        navigateToCurrentWithParams(navigate, "threadKey", thread.id ? thread.id : null);
    }, [router, threads, user]);

    const content = (
        <>
            {(ChatFeatureToggles.groupChat || sidebarLabel) &&
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                >
                    {sidebarLabel}
                    {ChatFeatureToggles.groupChat &&
                        <Button
                            onClick={handleCompose}
                            startIcon={(
                                <SvgIcon>
                                    <PlusIcon />
                                </SvgIcon>
                            )}
                            variant="contained"
                        >
                            Group
                        </Button>
                    }
                    {!mdUp && (
                        <IconButton onClick={onClose}>
                            <SvgIcon>
                                <XIcon />
                            </SvgIcon>
                        </IconButton>
                    )}
                </Stack>
            }
            {ChatFeatureToggles.globalContactSearch &&
                <ChatSidebarSearch
                    isFocused={searchFocused}
                    onChange={handleSearchChange}
                    onClickAway={handleSearchClickAway}
                    onFocus={handleSearchFocus}
                    onSelect={handleSearchSelect}
                    query={searchQuery}
                    results={searchResults}
                />
            }
            <Box sx={{ display: searchFocused ? 'none' : 'block' }}>
                <Scrollbar>
                    <Stack
                        component="ul"
                        spacing={0.5}
                        sx={{
                            listStyle: 'none',
                            m: 0,
                            p: 2
                        }}
                    >
                        {threads.allIds.map((threadId) => (
                            <ChatThreadItem
                                active={currentThreadId === threadId}
                                key={threadId}
                                onSelect={() => handleThreadSelect(threadId)}
                                thread={threads.byId[threadId]}
                            />
                        ))}
                    </Stack>
                </Scrollbar>
            </Box>
        </>
    );

    if (mdUp) {
        return (
            <Drawer
                anchor="left"
                open={open}
                PaperProps={{
                    sx: {
                        position: 'relative',
                        width: 380
                    }
                }}
                SlideProps={{ container }}
                variant="persistent"
                {...other}>
                {content}
            </Drawer>
        );
    }

    return (
        <Drawer
            anchor="left"
            hideBackdrop
            ModalProps={{
                container,
                sx: {
                    pointerEvents: 'none',
                    position: 'absolute'
                }
            }}
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: 380,
                    pointerEvents: 'auto',
                    position: 'absolute'
                }
            }}
            SlideProps={{ container }}
            variant="temporary"
            {...other}>
            {content}
        </Drawer>
    );
};

ChatSidebar.propTypes = {
    container: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool
};
