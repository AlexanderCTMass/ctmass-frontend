import {
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Slider,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ClearIcon from '@mui/icons-material/Clear';

const languages = [
    'English',
    'Spanish',
    'Chinese',
    'French',
    'Tagalog',
    'Vietnamese',
    'Arabic',
    'Korean',
    'Russian',
    'German'
];

const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' }
];

export const SpecialistsFilter = ({
                                      filters,
                                      setFilters,
                                      onReset
                                  }) => {
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

    return (
        <Card sx={{ p: 3, mb: 3 }}>
            <Stack spacing={3}>
                <Typography variant="h6">Filter Specialists</Typography>

                {/* Business Name Search */}
                <TextField
                    fullWidth
                    label="Search by name"
                    value={filters.businessName || ''}
                    onChange={handleChange('businessName')}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Location Radius */}
                <Box>
                    <Typography gutterBottom>Distance from your location</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <LocationOnIcon color="action" />
                        <Slider
                            value={filters.radius || 50}
                            onChange={handleChange('radius')}
                            min={5}
                            max={100}
                            step={5}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value} miles`}
                            sx={{ flexGrow: 1 }}
                        />
                    </Stack>
                </Box>

                {/* Tags */}
                <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={filters.tags?.join(', ') || ''}
                    onChange={handleTagsChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LocalOfferIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Language Select */}
                <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                        value={filters.language || ''}
                        onChange={handleChange('language')}
                        startAdornment={
                            <InputAdornment position="start">
                                <LanguageIcon />
                            </InputAdornment>
                        }
                        label="Language"
                    >
                        <MenuItem value="">Any language</MenuItem>
                        {languages.map(lang => (
                            <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Availability Status */}
                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status || ''}
                        onChange={handleChange('status')}
                        startAdornment={
                            <InputAdornment position="start">
                                <EventAvailableIcon />
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

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                    <Button variant="contained">
                        Apply Filters
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
};