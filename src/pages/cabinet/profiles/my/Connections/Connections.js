import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    Divider,
    Paper,
    Grid,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { profileApi } from 'src/api/profile';
import { roles } from 'src/roles';
import { useAuth } from 'src/hooks/use-auth';
import useDictionary from 'src/hooks/use-dictionaries';
import { ERROR } from 'src/libs/log';
import { CATEGORY_META } from './utils';
import { CategoryHeader } from './CategoryHeader';
import { PersonCard } from './PersonCard';
import { SearchResultCard } from './SearchResultCard';

const Connections = ({ profile, setProfile, isMyProfile }) => {
    const { user } = useAuth();
    const { specialties } = useDictionary();
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

    const profileId = profile?.profile?.id;

    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            const c = await profileApi.getConnections(profileId);

            const ids = [
                ...c.trustedColleagues,
                ...c.localPros,
                ...c.pastClients,
                ...c.interestedHomeowners
            ];
            const uniqueIds = [...new Set(ids)].filter(Boolean);
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
            setIdsByCategory(c);
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
    }, [profileId, fetchConnections]);

    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 10, query.toLowerCase());
            workers.forEach(w => {
                if (w.specialties) {
                    w.specialties = w.specialties.map(s => specialties.byId[s]).filter(Boolean);
                }
            });
            setSearchResults(workers);
        } catch (error) {
            ERROR(error);
        } finally {
            setIsSearching(false);
        }
    }, [specialties.byId]);

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
                <CategoryHeader meta={meta} count={people.length} />
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
                    CONNECTIONS
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
                CONNECTIONS
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
                        placeholder="Search specialists by business name (enter min 3 symbols)..."
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
                                Search Results
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
        </Box>
    );
};

export default Connections;