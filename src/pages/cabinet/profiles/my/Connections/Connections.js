import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { profileApi } from 'src/api/profile';
import useDictionary from 'src/hooks/use-dictionaries';
import { ERROR } from 'src/libs/log';
import { CATEGORY_META } from './utils';
import { CategoryHeader } from './CategoryHeader';
import { PersonCard } from './PersonCard';
import { SearchResultCard } from './SearchResultCard';
import { InviteDialog } from './InviteDialog';

const Connections = ({ profile, setProfile, isMyProfile }) => {
    const { specialties } = useDictionary();
    const [invite, setInvite] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idsByCategory, setIdsByCategory] = useState({
        trustedColleagues: [],
        localPros: [],
        pastClients: [],
        interestedHomeowners: []
    });
    const [entitiesById, setEntitiesById] = useState({});
    const [friendsIds, setFriendsIds] = useState([]);

    const profileId = profile?.profile?.id;

    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);

            const friends = await profileApi.getConfirmedFriends(profileId);
            const friendIds = friends || [];
            setFriendsIds(friendIds);

            const c = await profileApi.getConnections(profileId);

            const filteredByFriends = {
                trustedColleagues: (c.trustedColleagues || []).filter(id => friendIds.includes(id)),
                localPros: (c.localPros || []).filter(id => friendIds.includes(id)),
                pastClients: (c.pastClients || []).filter(id => friendIds.includes(id)),
                interestedHomeowners: (c.interestedHomeowners || []).filter(id => friendIds.includes(id))
            };

            const uniqueIds = [...new Set(friendIds)].filter(Boolean);
            let loaded = {};
            if (uniqueIds.length) {
                const profiles = await profileApi.getProfilesById(uniqueIds, 100);
                profiles.forEach(p => {
                    loaded[p.id] = {
                        ...p,
                        specialties: (p.specialties || []).map(sid => specialties.byId[sid]).filter(Boolean)
                    };
                });
            }

            setEntitiesById(loaded);
            setIdsByCategory(filteredByFriends);
        } catch (e) {
            ERROR(e);
        } finally {
            setLoading(false);
        }
    }, [profileId, specialties.byId]);

    useEffect(() => {
        if (profileId) {
            fetchConnections();
        }
    }, [profileId, specialties.byId, fetchConnections]);

    useEffect(() => {
        if (profileId) {
            fetchConnections();
        }
    }, [profileId, fetchConnections]);

    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (query.length === 0) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const lower = query.toLowerCase();
            const results = friendsIds
                .map(id => entitiesById[id])
                .filter(Boolean)
                .filter(p => {
                    const name = (p.businessName || p.name || p.email || '').toLowerCase();
                    return name.includes(lower);
                })
                .slice(0, 50);

            setSearchResults(results);
        } catch (error) {
            ERROR(error);
        } finally {
            setIsSearching(false);
        }
    }, [friendsIds, entitiesById]);

    const removeFromCategory = useCallback(async (categoryKey, personId) => {
        try {
            await profileApi.removeFromConnectionCategory(profileId, categoryKey, personId);

            setIdsByCategory(prev => ({
                ...prev,
                [categoryKey]: (prev[categoryKey] || []).filter(id => id !== personId)
            }));
        } catch (e) {
            ERROR(e);
        }
    }, [profileId]);

    const isInCategory = useCallback((categoryKey, id) => {
        return (idsByCategory[categoryKey] || []).includes(id);
    }, [idsByCategory]);

    const toggleCategory = useCallback(async (categoryKey, person) => {
        const active = isInCategory(categoryKey, person.id);
        try {
            if (active) {
                await profileApi.removeFromConnectionCategory(profileId, categoryKey, person.id);
                setIdsByCategory(prev => ({
                    ...prev,
                    [categoryKey]: (prev[categoryKey] || []).filter(x => x !== person.id)
                }));
            } else {
                await profileApi.addToConnectionCategory(profileId, categoryKey, person.id);
                setIdsByCategory(prev => ({
                    ...prev,
                    [categoryKey]: [...new Set([...(prev[categoryKey] || []), person.id])]
                }));
                setEntitiesById(prev => ({ ...prev, [person.id]: person }));
            }
        } catch (e) {
            ERROR(e);
        }
    }, [isInCategory, profileId]);

    const renderCategory = (key) => {
        const meta = CATEGORY_META[key];
        const ids = idsByCategory[key] || [];
        const people = ids.map(id => entitiesById[id]).filter(Boolean);

        return (
            <Box sx={{ mt: 4 }}>
                <CategoryHeader meta={meta} count={people.length} onAdd={isMyProfile ? () => setInvite({ category: key }) : undefined} />
                <Divider sx={{ mb: 2 }} />
                {people.length === 0 ? (
                    <Typography color="text.secondary">No one here yet</Typography>
                ) : (
                    <Grid container spacing={1}>
                        {people.map(person => (
                            <Grid key={`${key}-${person.id}`} item xs={12}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        '&:hover': {
                                            boxShadow: (theme) => theme.shadows[2]
                                        },
                                    }}
                                >
                                    <PersonCard
                                        person={person}
                                        badgeType={key}
                                        onRemove={isMyProfile ? (id) => removeFromCategory(key, id) : undefined}
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    CONNECTIONS AMONG FRIENDS
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                CONNECTIONS AMONG FRIENDS
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {isMyProfile && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="subtitle2" gutterBottom>
                        Add people to your connections
                    </Typography>

                    <TextField
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search specialists by business name..."
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
                            startAdornment: (
                                <InputAdornment position="start" style={{ marginBottom: 14 }}>
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => {
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{ mb: 2 }}
                    />

                    {isSearching && <Box display="flex" justifyContent="center"><CircularProgress size={24} /></Box>}

                    {searchResults.length > 0 && (
                        <Paper elevation={0} sx={{ p: 1, mb: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Search among friends
                            </Typography>
                            <Grid container spacing={1}>
                                {searchResults.map((specialist) => (
                                    <Grid item xs={12} key={specialist.id}>
                                        <SearchResultCard
                                            specialist={specialist}
                                            idsByCategory={idsByCategory}
                                            onToggle={toggleCategory}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    )}
                </Paper>
            )}

            {renderCategory('trustedColleagues')}
            {renderCategory('localPros')}
            {renderCategory('pastClients')}
            {renderCategory('interestedHomeowners')}

            {invite && (
                <InviteDialog
                    open
                    categoryKey={invite.category}
                    onClose={() => setInvite(null)}
                    profileId={profileId}
                    categoryMeta={CATEGORY_META[invite.category]}
                />
            )}
        </Box>
    );
};

export default Connections;