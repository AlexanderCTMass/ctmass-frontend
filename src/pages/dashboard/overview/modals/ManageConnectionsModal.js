import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PlaceIcon from '@mui/icons-material/Place';
import RecommendIcon from '@mui/icons-material/Recommend';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { profileApi } from 'src/api/profile';
import useDictionary from 'src/hooks/use-dictionaries';
import { OnlineStatusBadge } from 'src/components/online-status-badge';
import { ERROR } from 'src/libs/log';

const CATEGORY_META = {
    trustedColleagues: {
        title: 'Trusted Colleagues',
        description: 'Contractors you recommend to others',
        color: 'success',
        icon: <RecommendIcon fontSize="small" />
    },
    localPros: {
        title: 'Local Pros',
        description: 'Fellow builders and tradespeople nearby',
        color: 'info',
        icon: <PlaceIcon fontSize="small" />
    },
    pastClients: {
        title: 'Past Clients',
        description: "Homeowners you've completed work for",
        color: 'warning',
        icon: <HandshakeIcon fontSize="small" />
    },
    interestedHomeowners: {
        title: 'Interested Homeowners',
        description: 'Potential clients checking your profile',
        color: 'secondary',
        icon: <VisibilityIcon fontSize="small" />
    }
};

const chipSx = {
    textTransform: 'none',
    borderRadius: 999,
    px: 1.25,
    height: 28,
    m: 0.5,
    '& .MuiButton-startIcon': { m: 0, mr: 0.75 },
};

const SearchResultCard = memo(({ person, idsByCategory, onToggle }) => {
    const isActive = (key) => (idsByCategory?.[key] || []).includes(person.id);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <OnlineStatusBadge userId={person.id}>
                        <Avatar
                            src={person.avatar}
                            alt={person.businessName || person.name}
                            sx={{ width: 48, height: 48 }}
                        />
                    </OnlineStatusBadge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {person.businessName || person.name}
                        </Typography>
                        {person.specialties && person.specialties.length > 0 && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {person.specialties
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((s) => s.label)
                                    .join(', ')}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Divider />

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Add to connection categories
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        <Button
                            size="small"
                            color="success"
                            startIcon={<RecommendIcon fontSize="small" />}
                            onClick={() => onToggle('trustedColleagues', person)}
                            variant={isActive('trustedColleagues') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Trusted Colleagues</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="info"
                            startIcon={<PlaceIcon fontSize="small" />}
                            onClick={() => onToggle('localPros', person)}
                            variant={isActive('localPros') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Local Pros</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="warning"
                            startIcon={<HandshakeIcon fontSize="small" />}
                            onClick={() => onToggle('pastClients', person)}
                            variant={isActive('pastClients') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Past Clients</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="secondary"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => onToggle('interestedHomeowners', person)}
                            variant={isActive('interestedHomeowners') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Interested Homeowners</Typography>
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
});

SearchResultCard.propTypes = {
    person: PropTypes.object.isRequired,
    idsByCategory: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired
};

SearchResultCard.displayName = 'SearchResultCard';

const PersonConnectionCard = memo(({ person, categories, onToggle, idsByCategory, onRemoveFriend }) => {
    const isActive = (key) => (idsByCategory?.[key] || []).includes(person.id);
    const [confirmRemove, setConfirmRemove] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <OnlineStatusBadge userId={person.id}>
                        <Avatar
                            src={person.avatar}
                            alt={person.businessName || person.name}
                            sx={{ width: 48, height: 48 }}
                        />
                    </OnlineStatusBadge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {person.businessName || person.name}
                        </Typography>
                        {person.specialties && person.specialties.length > 0 && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {person.specialties
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((s) => s.label)
                                    .join(', ')}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Divider />

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                            In categories: {categories.join(', ')}
                        </Typography>
                    </Stack>

                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        <Button
                            size="small"
                            color="success"
                            startIcon={<RecommendIcon fontSize="small" />}
                            onClick={() => onToggle('trustedColleagues', person)}
                            variant={isActive('trustedColleagues') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Trusted Colleagues</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="info"
                            startIcon={<PlaceIcon fontSize="small" />}
                            onClick={() => onToggle('localPros', person)}
                            variant={isActive('localPros') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Local Pros</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="warning"
                            startIcon={<HandshakeIcon fontSize="small" />}
                            onClick={() => onToggle('pastClients', person)}
                            variant={isActive('pastClients') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Past Clients</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="secondary"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => onToggle('interestedHomeowners', person)}
                            variant={isActive('interestedHomeowners') ? 'contained' : 'outlined'}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Interested Homeowners</Typography>
                        </Button>
                    </Stack>
                </Box>

                <Divider />

                {confirmRemove ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                            Remove this friend?
                        </Typography>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => { onRemoveFriend(person); setConfirmRemove(false); }}
                        >
                            Yes, remove
                        </Button>
                        <Button size="small" onClick={() => setConfirmRemove(false)}>
                            Cancel
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        size="small"
                        color="error"
                        variant="text"
                        startIcon={<PersonRemoveIcon fontSize="small" />}
                        onClick={() => setConfirmRemove(true)}
                        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                    >
                        Remove Friend
                    </Button>
                )}
            </Stack>
        </Paper>
    );
});

PersonConnectionCard.propTypes = {
    person: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    onToggle: PropTypes.func.isRequired,
    idsByCategory: PropTypes.object.isRequired,
    onRemoveFriend: PropTypes.func.isRequired
};

PersonConnectionCard.displayName = 'PersonConnectionCard';

const CategorySection = memo(({ meta, people, onToggle, idsByCategory, onRemoveFriend }) => {
    if (people.length === 0) {
        return null;
    }

    return (
        <Box mb={4}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                {meta.icon}
                <Typography variant="h6" fontWeight={600}>
                    {meta.title}
                </Typography>
                <Chip size="small" label={people.length} color={meta.color} />
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
                {meta.description}
            </Typography>

            <Grid container spacing={2}>
                {people.map((person) => {
                    const categories = [];
                    Object.keys(idsByCategory).forEach((key) => {
                        if (idsByCategory[key].includes(person.id)) {
                            categories.push(CATEGORY_META[key].title);
                        }
                    });

                    return (
                        <Grid item xs={12} sm={6} md={4} key={person.id}>
                            <PersonConnectionCard
                                person={person}
                                categories={categories}
                                onToggle={onToggle}
                                idsByCategory={idsByCategory}
                                onRemoveFriend={onRemoveFriend}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
});

CategorySection.propTypes = {
    meta: PropTypes.object.isRequired,
    people: PropTypes.array.isRequired,
    onToggle: PropTypes.func.isRequired,
    idsByCategory: PropTypes.object.isRequired,
    onRemoveFriend: PropTypes.func.isRequired
};

CategorySection.displayName = 'CategorySection';

const ManageConnectionsModal = ({ open, onClose, profileId, onFriendRemoved }) => {
    const { specialties } = useDictionary();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [idsByCategory, setIdsByCategory] = useState({
        trustedColleagues: [],
        localPros: [],
        pastClients: [],
        interestedHomeowners: []
    });
    const [entitiesById, setEntitiesById] = useState({});
    const [friendIds, setFriendIds] = useState([]);

    const fetchConnections = useCallback(async () => {
        if (!profileId) return;

        try {
            setLoading(true);
            const friendIdsList = await profileApi.getConfirmedFriends(profileId);
            setFriendIds(friendIdsList || []);

            const c = await profileApi.getConnections(profileId);

            const filteredByFriends = {
                trustedColleagues: (c.trustedColleagues || []).filter((id) =>
                    friendIdsList.includes(id)
                ),
                localPros: (c.localPros || []).filter((id) => friendIdsList.includes(id)),
                pastClients: (c.pastClients || []).filter((id) => friendIdsList.includes(id)),
                interestedHomeowners: (c.interestedHomeowners || []).filter((id) =>
                    friendIdsList.includes(id)
                )
            };

            const uniqueIds = [...new Set(friendIdsList)].filter(Boolean);
            let loaded = {};
            if (uniqueIds.length) {
                const profiles = await profileApi.getProfilesById(uniqueIds, 100);
                profiles.forEach((p) => {
                    loaded[p.id] = {
                        ...p,
                        specialties: (p.specialties || [])
                            .map((sid) => specialties.byId[sid])
                            .filter(Boolean)
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
        if (open && profileId) {
            fetchConnections();
        }
    }, [open, profileId, fetchConnections]);

    const removeFriend = useCallback(async (person) => {
        if (!profileId) return;
        try {
            await profileApi.removeFriendship(profileId, person.id);
            setFriendIds(prev => prev.filter(id => id !== person.id));
            setIdsByCategory(prev => {
                const next = {};
                Object.keys(prev).forEach(key => {
                    next[key] = (prev[key] || []).filter(id => id !== person.id);
                });
                return next;
            });
            onFriendRemoved?.(person);
        } catch (error) {
            ERROR('Failed to remove friend:', error);
        }
    }, [profileId, onFriendRemoved]);

    const toggleCategory = useCallback(async (categoryKey, person) => {
        const isActive = (idsByCategory[categoryKey] || []).includes(person.id);

        try {
            if (isActive) {
                const updatedCategories = {
                    ...idsByCategory,
                    [categoryKey]: (idsByCategory[categoryKey] || []).filter(id => id !== person.id)
                };
                await profileApi.updateConnections(profileId, updatedCategories);
                setIdsByCategory(updatedCategories);
            } else {
                const updatedCategories = {
                    ...idsByCategory,
                    [categoryKey]: [...new Set([...(idsByCategory[categoryKey] || []), person.id])]
                };
                await profileApi.updateConnections(profileId, updatedCategories);
                setIdsByCategory(updatedCategories);
            }
        } catch (error) {
            ERROR('Failed to toggle category:', error);
        }
    }, [profileId, idsByCategory]);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const searchResults = useMemo(() => {
        if (!searchQuery) return [];

        const query = searchQuery.toLowerCase();
        return friendIds
            .map((id) => entitiesById[id])
            .filter(Boolean)
            .filter((person) => {
                const name = (person.businessName || person.name || '').toLowerCase();
                const email = (person.email || '').toLowerCase();
                return name.includes(query) || email.includes(query);
            });
    }, [searchQuery, friendIds, entitiesById]);

    const filteredByCategory = useMemo(() => {
        if (searchQuery) return {};

        return Object.keys(idsByCategory).reduce((acc, key) => {
            const ids = idsByCategory[key];
            const filtered = ids
                .map((id) => entitiesById[id])
                .filter(Boolean);

            acc[key] = filtered;
            return acc;
        }, {});
    }, [searchQuery, idsByCategory, entitiesById]);

    const totalConnections = Object.values(filteredByCategory).reduce(
        (sum, arr) => sum + arr.length,
        0
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6">Manage My Connections</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {totalConnections} total connections
                    </Typography>
                </Stack>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3 }}>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={handleSearchChange}
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
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClearSearch}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                {loading ? (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                        Loading connections...
                    </Typography>
                ) : searchQuery ? (
                    searchResults.length > 0 ? (
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Search Results ({searchResults.length})
                                </Typography>
                                <Grid container spacing={2}>
                                    {searchResults.map((person) => (
                                        <Grid item xs={12} sm={6} md={4} key={person.id}>
                                            <SearchResultCard
                                                person={person}
                                                idsByCategory={idsByCategory}
                                                onToggle={toggleCategory}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary" align="center" py={4}>
                            No friends found matching your search
                        </Typography>
                    )
                ) : totalConnections === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                        No connections yet
                    </Typography>
                ) : (
                    <Stack spacing={4}>
                        {Object.entries(CATEGORY_META).map(([key, meta]) => (
                            <CategorySection
                                key={key}
                                meta={meta}
                                people={filteredByCategory[key] || []}
                                onToggle={toggleCategory}
                                idsByCategory={idsByCategory}
                                onRemoveFriend={removeFriend}
                            />
                        ))}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

ManageConnectionsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    profileId: PropTypes.string,
    onFriendRemoved: PropTypes.func
};

ManageConnectionsModal.defaultProps = {
    profileId: null,
    onFriendRemoved: undefined
};

export default memo(ManageConnectionsModal);
