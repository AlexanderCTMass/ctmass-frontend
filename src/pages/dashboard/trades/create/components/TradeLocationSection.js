import {
    Box,
    Card,
    CardContent,
    InputAdornment,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { SERVICE_RADII } from 'src/constants/trade-options';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { AddressAutoComplete } from 'src/components/address/AddressAutoComplete';

const DEFAULT_MAP_CENTER = [-95.7129, 37.0902];

const ensurePlaceShape = (place) => {
    if (!place) {
        return null;
    }

    const withId = place.id ? place : { ...place, id: place.place_name ? `manual-${place.place_name}` : `manual-${Date.now()}` };
    const hasCenter = Array.isArray(withId.center) && withId.center.length === 2;

    if (hasCenter) {
        return withId;
    }

    return {
        ...withId,
        center: DEFAULT_MAP_CENTER
    };
};

function TradeLocationSection({ values, onChange, radiusMiles, onRadiusChange, areas, onAreasChange, addressError = false }) {
    const locationValue = values.addressLocation ?? null;

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                            Where are you available to work?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Specify the address and area where you&apos;re available to work. We&apos;ll match you with projects in that location.
                        </Typography>
                    </Stack>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Service radius
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            value={radiusMiles}
                            onChange={(_, next) => next && onRadiusChange(next)}
                            sx={{
                                flexWrap: 'wrap',
                                '& .MuiToggleButton-root': {
                                    px: 2.5,
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }
                            }}
                        >
                            {SERVICE_RADII.map((miles) => (
                                <ToggleButton key={miles} value={miles}>
                                    {miles} mi
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        <TextField
                            label="Towns you serve (optional)"
                            fullWidth
                            value={areas}
                            onChange={(event) => onAreasChange(event.target.value)}
                            placeholder="Hartford, West Hartford, Glastonbury"
                            helperText="Separate towns with commas. Homeowners see your city, state and radius, never your street address."
                        />
                    </Stack>

                    <Stack spacing={1}>
                        <Box
                            sx={addressError ? {
                                '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'error.main'
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'error.main'
                                }
                            } : undefined}
                        >
                            <AddressAutoComplete
                                location={locationValue}
                                handleSuggestionClick={(place) => {
                                    if (!place) {
                                        onChange('address', '');
                                        onChange('addressLocation', null);
                                        return;
                                    }

                                    const normalizedPlace = ensurePlaceShape(place);
                                    onChange('address', normalizedPlace.place_name ?? '');
                                    onChange('addressLocation', normalizedPlace);
                                }}
                                withMap={Boolean(locationValue)}
                                label="Service address"
                                placeholder="470 Prospect Street, Hadley, Massachusetts 01035"
                                textFieldProps={{
                                    helperText: 'Autocomplete supports United States addresses.',
                                    InputProps: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <PlaceOutlinedIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Box>
                        {addressError && (
                            <Typography variant="caption" color="error">
                                Please add the address where you’re available to work.
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradeLocationSection;