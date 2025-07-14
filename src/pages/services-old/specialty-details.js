import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router';
import zipcodes from 'zipcodes';
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Unstable_Grid2 as Grid,
    useMediaQuery,
    SvgIcon,
    Rating
} from '@mui/material';
import {
    Search as SearchIcon,
    LocationOn as LocationOnIcon,
    Language as LanguageIcon,
    EventAvailable as EventAvailableIcon,
    LocalOffer as LocalOfferIcon,
    Clear as ClearIcon,
    RateReview as RateReviewIcon,
    Verified as VerifiedIcon,
    FactCheck as FactCheckIcon,
    CameraAlt as CameraAltIcon
} from '@mui/icons-material';
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import {useDebounce} from 'use-debounce';
import geodist from 'geodist';
import {SpecialistCard} from "src/pages/services-old/specialist-card";
import {projectsApi} from "src/api/projects";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {profileService} from "src/service/profile-service";
import {profileApi} from "src/api/profile";
import {INFO} from "src/libs/log";
import {ProjectStatus} from "src/enums/project-state";
import {getSiteDuration} from "src/utils/date-locale";
import useDictionaries from "src/hooks/use-dictionaries";
import {usePageView} from "src/hooks/use-page-view";
import {Seo} from "src/components/seo";

const AVAILABLE_LANGUAGES = [
    'English',
    'Spanish',
    'Chinese',
    'French',
    'Tagalog',
    'Vietnamese',
    'Arabic',
    'Korean',
    'Russian',
    'German',
    'Ukrainian'
];

const statusOptions = [
    {value: 'available', label: 'Available'},
    {value: 'busy', label: 'Busy'}
];

const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [zipCode, setZipCode] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(coords);

                    // Пытаемся найти ближайший ZIP code
                    try {
                        const nearest = zipcodes.lookupByCoords(coords.lat, coords.lng);

                        if (nearest?.zip) {
                            setZipCode(nearest.zip);
                        } else {
                            // Если не нашли точный ZIP, попробуем найти ближайшие
                            const nearby = zipcodes.radius(coords.lat, coords.lng, 5); // 5 miles radius
                            if (nearby?.length > 0) {
                                setZipCode(nearby[0].zip);
                            } else {
                                console.warn('No ZIP code found for coordinates:', coords);
                            }
                        }
                    } catch (err) {
                        console.error('Error looking up ZIP code:', err);
                    }
                },
                (err) => {
                    setError(err.message || "Could not get your location");
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    }, []);

    return { location, zipCode, error };
};

const SpecialistsFilter = ({
                               filters,
                               setFilters,
                               onReset,
                               locationError,
                               initialZipCode
                           }) => {
    const [zipCode, setZipCode] = useState(initialZipCode || '');

    const handleChange = (field) => (event) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleTagsChange = (event) => {
        const tags = event.target.value.split(',').map(tag => tag.trim());
        setFilters(prev => ({
            ...prev,
            tags
        }));
    };

    const handleZipCodeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 5);
        setZipCode(value);
        setFilters(prev => ({
            ...prev,
            zipCode: value
        }));
    };

    const isZipValid = zipCode.length === 5 && zipcodes.lookup(zipCode);

    return (
        <Card sx={{p: 3}}>
            <Stack spacing={3}>
                <Typography variant="h6">Filter Specialists</Typography>

                <TextField
                    fullWidth
                    label="Search by name"
                    value={filters.businessName || ''}
                    onChange={handleChange('businessName')}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="ZIP Code"
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    error={!!zipCode && !isZipValid}
                    helperText={zipCode && !isZipValid ? "Invalid US ZIP code" : ""}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LocationOnIcon color="action"/>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box>
                    <Typography gutterBottom>Distance from location (miles)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <LocationOnIcon color="action"/>
                        <Slider
                            value={filters.radius || 50}
                            onChange={handleChange('radius')}
                            min={1}
                            max={100}
                            step={1}
                            valueLabelDisplay="auto"
                            sx={{flexGrow: 1}}
                            disabled={!isZipValid && !!locationError}
                        />
                    </Stack>
                    {locationError && !isZipValid && (
                        <Typography color="error" variant="caption">
                            {locationError}
                        </Typography>
                    )}
                </Box>

                <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={filters.tags?.join(', ') || ''}
                    onChange={handleTagsChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LocalOfferIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                        value={filters.language || ''}
                        onChange={handleChange('language')}
                        startAdornment={
                            <InputAdornment position="start">
                                <LanguageIcon/>
                            </InputAdornment>
                        }
                        label="Language"
                    >
                        <MenuItem value="">Any language</MenuItem>
                        {AVAILABLE_LANGUAGES.map(lang => (
                            <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status || ''}
                        onChange={handleChange('status')}
                        startAdornment={
                            <InputAdornment position="start">
                                <EventAvailableIcon/>
                            </InputAdornment>
                        }
                        label="Status"
                    >
                        <MenuItem value="">Any status</MenuItem>
                        {statusOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon/>}
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
};

const useSpecialists = (specialtyId) => {
    const [specialists, setSpecialists] = useState([]);
    const [specialty, setSpecialty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSpecialistsGet = async () => {
        try {
            setLoading(true);
            // Получаем список специалистов
            const specialists = await profileApi.getUsers(specialtyId);
            INFO("Users list:", specialists);

            if (!specialists || !specialists.length) {
                setSpecialists([]);
                return;
            }

            // Подготавливаем параллельные запросы
            const userProjectsPromises = specialists.map(user =>
                projectsApi.getUserProjects(user.id, 1000).catch(e => {
                    console.error(`Error fetching projects for user ${user.id}:`, e);
                    return []; // Возвращаем пустой массив в случае ошибки
                })
            );

            const reviewsPromises = specialists.map(user =>
                extendedProfileApi.getReviews(user.id).catch(e => {
                    console.error(`Error fetching reviews for user ${user.id}:`, e);
                    return []; // Возвращаем пустой массив в случае ошибки
                })
            );

            // Выполняем все запросы параллельно
            const [userProjectsResults, userReviewsResults] = await Promise.all([
                Promise.all(userProjectsPromises),
                Promise.all(reviewsPromises)
            ]);

            // Обрабатываем данные
            const processedSpecialists = specialists.map((specialist, index) => {
                // Безопасное получение проектов и отзывов
                const projects = Array.isArray(userProjectsResults[index]) ? userProjectsResults[index] : [];
                const reviews = Array.isArray(userReviewsResults[index]) ? userReviewsResults[index] : [];

                // Фильтруем завершенные проекты
                const completedProjects = projects.filter(p =>
                    p && p.state === ProjectStatus.COMPLETED
                );

                // Обновляем рейтинг и информацию об отзывах
                const updatedSpecialist = profileService.updateRatingInfo(
                    {...specialist}, // Создаем копию
                    reviews
                );

                // Формируем галерею из фотографий проектов
                const gallery = completedProjects
                    .flatMap(p => p.photos || [])
                    .filter(photo => photo) // Фильтруем возможные null/undefined
                    .slice(0, 14);

                return {
                    ...updatedSpecialist,
                    since: specialist?.registrationAt
                        ? getSiteDuration(specialist.registrationAt.toDate())
                        : null,
                    completedProjects: completedProjects.length,
                    gallery,
                    commonContacts: 0,
                    coordinates: specialist.address?.location?.center,
                    duration: specialist.address?.duration,
                    // Добавляем дополнительную информацию из отзывов
                    reviewsLength: reviews.length,
                    rating: updatedSpecialist.rating || 0
                };
            });

            setSpecialists(processedSpecialists);
        } catch (err) {
            console.error('Error in handleSpecialistsGet:', err);
            setError(err.message || "Failed to load specialists");
            setSpecialists([]); // Сбрасываем список при ошибке
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (specialtyId) {
            handleSpecialistsGet();
        }
    }, [specialtyId]);

    return {specialists, specialty, loading, error};
};


const Page = () => {
    const {specialtyId} = useParams();
    const {specialists, loading, error} = useSpecialists(specialtyId);
    const [filters, setFilters] = useState({
        businessName: '',
        radius: 50,
        tags: [],
        language: '',
        status: '',
        zipCode: ''
    });
    const [debouncedFilters] = useDebounce(filters, 300);
    const {location, zipCode: detectedZipCode, error: locationError} = useGeolocation();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const {specialties} = useDictionaries();

    const handleResetFilters = useCallback(() => {
        setFilters({
            businessName: '',
            radius: 50,
            tags: [],
            language: '',
            status: ''
        });
    }, []);

    useEffect(() => {
        if (detectedZipCode && !filters.zipCode) {
            setFilters(prev => ({...prev, zipCode: detectedZipCode}));
        }
    }, [detectedZipCode]);

    const filterSpecialists = useCallback((userSpecialties) => {
        if (!userSpecialties) return [];

        return userSpecialties.filter((specialist) => {
            // Filter by business name
            if (debouncedFilters.businessName &&
                !specialist.businessName.toLowerCase().includes(debouncedFilters.businessName.toLowerCase())) {
                return false;
            }

            // Filter by tags
            if (debouncedFilters.tags.length > 0) {
                const hasMatchingTags = debouncedFilters.tags.some(filterTag =>
                    specialist.tags?.some(specialistTag =>
                        specialistTag.toLowerCase().startsWith(filterTag.toLowerCase())
                    ) || false
                );
                if (!hasMatchingTags) return false;
            }

            // Filter by language - теперь проверяем вхождение в массив languages
            if (debouncedFilters.language &&
                (!specialist.languages || !specialist.languages.includes(debouncedFilters.language))) {
                return false;
            }

            // Filter by status
            if (debouncedFilters.status === 'available' && specialist.busyUntil) {
                return false;
            }
            if (debouncedFilters.status === 'busy' && !specialist.busyUntil) {
                return false;
            }

            // Filter by distance
            if (debouncedFilters.radius && debouncedFilters.zipCode) {
                const userZipInfo = zipcodes.lookup(debouncedFilters.zipCode);
                const specialistZipInfo = specialist.address?.location ? {latitude: specialist.address.location.center[1],longitude: specialist.address.location.center[0]} : null;

                if (userZipInfo && specialistZipInfo) {
                    const distance = geodist(
                        {lat: userZipInfo.latitude, lon: userZipInfo.longitude},
                        {lat: specialistZipInfo.latitude, lon: specialistZipInfo.longitude},
                        {exact: true, unit: 'mi'}
                    );
                    if (distance > debouncedFilters.radius) {
                        return false;
                    }
                } else if (location && specialist.coordinates) {
                    // Fallback to coordinates if ZIP code lookup fails
                    const distance = geodist(
                        {lat: location.lat, lon: location.lng},
                        {lat: specialist.coordinates[0], lon: specialist.coordinates[1]},
                        {exact: true, unit: 'mi'}
                    );
                    if (distance > debouncedFilters.radius) {
                        return false;
                    }
                } else {
                    // If we can't calculate distance, include the specialist
                    return true;
                }
            }

            return true;
        });
    }, [debouncedFilters, location]);

    const filteredSpecialists = useMemo(() => {
        return filterSpecialists(specialists);
    }, [specialists, filterSpecialists]);

    const activeFilters = useMemo(() => {
        return Object.entries(debouncedFilters)
            .filter(([key, value]) =>
                value && (Array.isArray(value) ? value.length > 0 : true)
            )
            .map(([key, value]) => ({
                key,
                label: `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            }));
    }, [debouncedFilters]);

    const removeFilter = useCallback((filterKey) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: Array.isArray(prev[filterKey]) ? [] : ''
        }));
    }, []);

    usePageView();

    const specialty = specialties?.byId[specialtyId];
    return (
        <>
            <Seo title="Specialty"/>
            <Box sx={{
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                pb: '40px',
                pt: '100px'
            }}>
                <Container maxWidth="lg">
                    <Stack spacing={1}>
                        <Typography variant="h3">
                            Specialists in {specialty?.label || "list"}
                        </Typography>
                        <Typography color="text.secondary" variant="body1">
                            Browse our list of qualified specialists
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Box component="main" sx={{flexGrow: 1, pb: 8, pt: 3}}>
                {!loading && !error && (
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            <Grid xs={12} md={4} lg={3}>
                                <Box sx={{
                                    position: {md: 'sticky'},
                                    top: 120,
                                    maxHeight: 'calc(100vh - 140px)',
                                    overflowY: 'auto',
                                    pb: 2
                                }}>
                                    <SpecialistsFilter
                                        filters={filters}
                                        setFilters={setFilters}
                                        onReset={handleResetFilters}
                                        locationError={locationError}
                                        initialZipCode={detectedZipCode}
                                    />
                                </Box>
                            </Grid>

                            {/* Список специалистов справа */}
                            <Grid xs={12} md={8} lg={9}>
                                {activeFilters.length > 0 && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2" sx={{mb: 1}}>
                                            Active filters:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {activeFilters.map(filter => (
                                                <Chip
                                                    key={filter.key}
                                                    label={filter.label}
                                                    onDelete={() => removeFilter(filter.key)}
                                                    sx={{mb: 1}}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Typography variant="subtitle1" sx={{mb: 2}}>
                                    {filteredSpecialists.length} specialists found
                                </Typography>

                                <Stack spacing={3}>
                                    {filteredSpecialists.map((specialist) => (
                                        <SpecialistCard
                                            key={specialist.id}
                                            specialist={specialist}
                                            smUp={smUp}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>
                )}
            </Box>
        </>
    );
};

export default Page;