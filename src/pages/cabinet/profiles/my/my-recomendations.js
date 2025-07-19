import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import {useAuth} from "src/hooks/use-auth";
import {SpecialistMicroPreview} from "src/sections/components/specialist/specialist-micro-preview";
import {profileApi} from "src/api/profile";
import {roles} from "src/roles";
import useDictionary from "src/hooks/use-dictionaries";
import {paths} from "src/paths";

export const SpecialistRecommendations = (props) => {
    const {recommendationIds = [], isMyProfile = false, onAddRecommendation, onRemoveRecommendation} = props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const {user} = useAuth();
    const {specialties} = useDictionary();

    // Fetch full recommendation profiles when component mounts or recommendationIds change
    useEffect(() => {
        const fetchRecommendations = async () => {
            debugger
            if (recommendationIds?.length > 0) {
                setIsLoadingRecommendations(true);
                try {
                    // Передаем список ID для получения только нужных профилей
                    const workers = await profileApi.getProfilesByIdWithReviews(recommendationIds);

                    // Обрабатываем специализации
                    const processedRecommendations = workers.map(worker => ({
                        ...worker,
                        specialties: worker.specialties?.map(specialty => specialties.byId[specialty])
                    }));

                    setRecommendations(processedRecommendations);
                } catch (error) {
                    console.error('Failed to load recommendations:', error);
                } finally {
                    setIsLoadingRecommendations(false);
                }
            } else {
                setRecommendations([]);
            }
        };

        fetchRecommendations();
    }, [recommendationIds, specialties.byId]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 10, query.toLowerCase());
            workers.forEach(worker => {
                if (worker.specialties) {
                    worker.specialties = worker.specialties.map(specialty => specialties.byId[specialty])
                }
            });
            setSearchResults(workers);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddRecommendation = (specialist) => {
        if (onAddRecommendation) {
            onAddRecommendation(specialist);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveRecommendation = (specialistId) => {
        if (onRemoveRecommendation) {
            onRemoveRecommendation(specialistId);
        }
    };

    return (
        <Box sx={{mt: 4}}>
            <Typography variant="h6" color="text.secondary" sx={{textTransform: 'uppercase'}}>
                {isMyProfile ? 'My Recommendations' : 'Recommended Specialists'}
            </Typography>
            <Divider sx={{mb: 2}}/>

            {isMyProfile && (
                <Box sx={{mb: 3}}>
                    <TextField
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search specialists by business name (enter min 3 symbols)..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon/>
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => {
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}>
                                        <ClearIcon/>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{mb: 2}}
                    />

                    {isSearching && <Box display="flex" justifyContent="center"><CircularProgress size={24}/></Box>}

                    {searchResults.length > 0 && (
                        <Paper elevation={2} sx={{p: 2, mb: 2}}>
                            <Typography variant="subtitle2" gutterBottom>
                                Search Results
                            </Typography>
                            <List>
                                {searchResults.map((specialist) => (
                                    <ListItem key={specialist.id} sx={{p: 0}}>
                                        <Box sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                            <SpecialistMicroPreview
                                                specialist={specialist}
                                                to={`/specialists/${specialist.id}`}
                                            />
                                            <Button
                                                size="small"
                                                startIcon={<AddIcon/>}
                                                onClick={() => handleAddRecommendation(specialist)}
                                                sx={{ml: 'auto'}}
                                            >
                                                Add
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Box>
            )}

            {isLoadingRecommendations ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress/>
                </Box>
            ) : recommendations.length > 0 ? (
                <List>
                    {recommendations.map((recommendation) => (
                        <ListItem key={recommendation.id} sx={{p: 0, mb: 1}}>
                            <Box sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                <SpecialistMicroPreview
                                    specialist={recommendation}
                                    to={paths.specialist.publicPage.replace(':profileId', recommendation.id)}
                                />
                                {isMyProfile && (
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveRecommendation(recommendation.id)}
                                        sx={{ml: 'auto'}}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography color="text.secondary">
                    {isMyProfile
                        ? "You haven't recommended any specialists yet. Search above to add recommendations."
                        : "This specialist hasn't recommended anyone yet."}
                </Typography>
            )}
        </Box>
    );
};

SpecialistRecommendations.propTypes = {
    recommendationIds: PropTypes.arrayOf(PropTypes.string),
    isMyProfile: PropTypes.bool,
    onAddRecommendation: PropTypes.func,
    onRemoveRecommendation: PropTypes.func
};

SpecialistRecommendations.defaultProps = {
    recommendationIds: [],
    isMyProfile: false
};