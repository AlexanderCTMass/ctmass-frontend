import { useCallback, useMemo } from 'react';
import zipcodes from 'zipcodes';
import {
    Box,
    Button,
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
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { BRAND, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';
import { btn, cardTitleSx, fieldSx } from 'src/components/ctmass-ui';

export const AVAILABLE_LANGUAGES = [
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

const STATUS_OPTIONS = [
    { value: '', label: 'Any' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' }
];

const labelSx = { mb: 1, fontSize: 13, fontWeight: 700, color: BRAND.ink };

export const isValidZip = (zipCode) => !!zipCode && zipCode.length === 5 && !!zipcodes.lookup(zipCode);

export const SpecialistsSearchBar = ({ filters, setFilters, isLoading, onOpenFilters, activeCount }) => {
    const zipCode = filters.zipCode || '';
    const zipInvalid = !!zipCode && !isValidZip(zipCode);

    const handleName = useCallback((event) => {
        setFilters((prev) => ({ ...prev, businessName: event.target.value }));
    }, [setFilters]);

    const handleZip = useCallback((event) => {
        const value = event.target.value.replace(/[^0-9]/g, '').substring(0, 5);
        setFilters((prev) => ({ ...prev, zipCode: value }));
    }, [setFilters]);

    const inputSx = {
        '& .MuiOutlinedInput-root': { height: 56, borderRadius: RADIUS.tile, bgcolor: 'transparent', fontWeight: 500 },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent !important' },
        '& .MuiOutlinedInput-root:hover': { bgcolor: BRAND.mist },
        '& .MuiOutlinedInput-root.Mui-focused': { bgcolor: BRAND.mist, boxShadow: `inset 0 0 0 2px ${alpha(BRAND.green, 0.5)}` },
        '& .MuiOutlinedInput-root.Mui-error': { boxShadow: `inset 0 0 0 2px ${alpha(BRAND.danger, 0.6)}` }
    };

    return (
        <Box
            role="search"
            sx={{
                mt: { xs: 3, md: 4 },
                p: 1,
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) 1px 220px' },
                alignItems: 'center',
                gap: 1,
                bgcolor: '#FFFFFF',
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.1)}`,
                boxShadow: SHADOW.md
            }}
        >
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name or company"
                value={filters.businessName || ''}
                onChange={handleName}
                inputProps={{ 'aria-label': 'Search by name or company' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: BRAND.navy }} />
                        </InputAdornment>
                    )
                }}
                sx={{ ...inputSx, gridColumn: { xs: '1 / -1', md: 'auto' } }}
            />
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 32, bgcolor: alpha(BRAND.navy, 0.12) }} />
            <TextField
                fullWidth
                variant="outlined"
                placeholder="ZIP code"
                value={zipCode}
                onChange={handleZip}
                error={zipInvalid}
                disabled={isLoading}
                inputProps={{ 'aria-label': 'ZIP code', inputMode: 'numeric' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <PlaceOutlinedIcon sx={{ color: zipInvalid ? BRAND.danger : BRAND.navy }} />
                        </InputAdornment>
                    )
                }}
                sx={inputSx}
            />
            <Button
                onClick={onOpenFilters}
                startIcon={<TuneRoundedIcon />}
                sx={{ ...btn.navy, display: { xs: 'inline-flex', md: 'none' }, height: 56, px: 2 }}
            >
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
            {zipInvalid && (
                <Typography sx={{ gridColumn: '1 / -1', px: 1.5, pb: 0.5, fontSize: 13, fontWeight: 500, color: BRAND.danger }}>
                    Enter a valid 5-digit US ZIP code.
                </Typography>
            )}
        </Box>
    );
};

export const SpecialistsFilterFields = ({
    filters,
    setFilters,
    onReset,
    locationError,
    availableSpecialties,
    selectedSpecialtyIds,
    onSpecialtiesChange,
    isLoading,
    showHeader = true
}) => {
    const zipValid = isValidZip(filters.zipCode);
    const radius = filters.radius || 30;

    const handleChange = useCallback((field) => (event) => {
        setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    }, [setFilters]);

    const handleTagsChange = useCallback((event) => {
        const tags = event.target.value.split(',').map((tag) => tag.trim());
        setFilters((prev) => ({ ...prev, tags }));
    }, [setFilters]);

    const handleSpecialtiesSelect = useCallback((event) => {
        const value = event.target.value || [];
        onSpecialtiesChange(Array.isArray(value) ? value : [value]);
    }, [onSpecialtiesChange]);

    const handleRadiusChange = useCallback((_, value) => {
        setFilters((prev) => ({ ...prev, radius: Number(value) }));
    }, [setFilters]);

    const specialtiesMap = useMemo(() => {
        const map = new Map();
        availableSpecialties.forEach((specialty) => map.set(specialty.id, specialty.label));
        return map;
    }, [availableSpecialties]);

    return (
        <Stack
            spacing={3}
            sx={{
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                transition: 'opacity .2s ease'
            }}
        >
            {showHeader && (
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography component="h2" sx={cardTitleSx}>Filters</Typography>
                    <Button onClick={onReset} disabled={isLoading} sx={{ ...btn.text, minHeight: 36, fontSize: 13 }}>
                        Reset all
                    </Button>
                </Stack>
            )}

            <FormControl fullWidth sx={fieldSx}>
                <InputLabel shrink>Specialty</InputLabel>
                <Select
                    multiple
                    displayEmpty
                    value={selectedSpecialtyIds}
                    onChange={handleSpecialtiesSelect}
                    disabled={isLoading}
                    input={<OutlinedInput notched label="Specialty" />}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                    renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                            return <Box component="span" sx={{ color: BRAND.muted }}>Any specialty</Box>;
                        }
                        return selected.map((id) => specialtiesMap.get(id) || id).join(', ');
                    }}
                >
                    {availableSpecialties.map((specialty) => (
                        <MenuItem key={specialty.id} value={specialty.id}>
                            {specialty.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box>
                <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Typography sx={labelSx}>Distance</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND.navy, fontVariantNumeric: 'tabular-nums' }}>
                        Within {radius} mi
                    </Typography>
                </Stack>
                <Slider
                    value={radius}
                    onChange={handleRadiusChange}
                    min={1}
                    max={100}
                    step={1}
                    aria-label="Distance in miles"
                    disabled={isLoading || (!zipValid && !!locationError)}
                    sx={{
                        color: BRAND.green,
                        height: 6,
                        '& .MuiSlider-rail': { bgcolor: alpha(BRAND.navy, 0.14), opacity: 1 },
                        '& .MuiSlider-thumb': {
                            width: 22,
                            height: 22,
                            bgcolor: '#FFFFFF',
                            border: `3px solid ${BRAND.green}`,
                            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(BRAND.green, 0.16)}` }
                        }
                    }}
                />
                <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: locationError && !zipValid ? BRAND.danger : BRAND.muted }}>
                    {zipValid
                        ? `Measured from ZIP ${filters.zipCode}.`
                        : locationError
                            ? 'We could not detect your location. Enter a ZIP code to filter by distance.'
                            : 'Measured from your current location, or enter a ZIP code.'}
                </Typography>
            </Box>

            <Box>
                <Typography sx={labelSx}>Availability</Typography>
                <Box
                    role="radiogroup"
                    aria-label="Availability"
                    sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.75 }}
                >
                    {STATUS_OPTIONS.map((option) => {
                        const active = (filters.status || '') === option.value;

                        return (
                            <Box
                                key={option.label}
                                component="button"
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={isLoading}
                                onClick={() => setFilters((prev) => ({ ...prev, status: option.value }))}
                                sx={{
                                    height: 44,
                                    borderRadius: '12px',
                                    border: `1px solid ${active ? BRAND.navy : alpha(BRAND.navy, 0.14)}`,
                                    bgcolor: active ? BRAND.navy : '#FFFFFF',
                                    color: active ? '#FFFFFF' : BRAND.ink,
                                    font: 'inherit',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
                                    '&:hover': { borderColor: BRAND.navy },
                                    '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                                }}
                            >
                                {option.label}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <FormControl fullWidth sx={fieldSx}>
                <InputLabel shrink>Language</InputLabel>
                <Select
                    displayEmpty
                    value={filters.language || ''}
                    onChange={handleChange('language')}
                    disabled={isLoading}
                    input={<OutlinedInput notched label="Language" />}
                    renderValue={(value) => value || <Box component="span" sx={{ color: BRAND.muted }}>Any language</Box>}
                >
                    <MenuItem value="">Any language</MenuItem>
                    {AVAILABLE_LANGUAGES.map((language) => (
                        <MenuItem key={language} value={language}>{language}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Tags"
                placeholder="kitchen, tile, deck"
                helperText="Separate tags with commas."
                value={filters.tags?.join(', ') || ''}
                onChange={handleTagsChange}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={fieldSx}
            />
        </Stack>
    );
};
