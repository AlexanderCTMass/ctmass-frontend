import {
    Card,
    CardContent,
    Grid,
    InputAdornment,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
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

function TradeLocationSection({ values, onChange, commuteDurations }) {
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

                    <Grid container>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Choose a way to get there
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                value={values.commuteMode}
                                onChange={(_, next) => next && onChange('commuteMode', next)}
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1.2
                                    }
                                }}
                            >
                                <ToggleButton value="walking">
                                    <DirectionsWalkOutlinedIcon sx={{ mr: 1 }} />
                                    Walking
                                </ToggleButton>
                                <ToggleButton value="driving">
                                    <DirectionsCarFilledOutlinedIcon sx={{ mr: 1 }} />
                                    Driving
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Maximum duration you’re ready to go (minutes)
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                value={values.commuteDuration}
                                onChange={(_, next) => next && onChange('commuteDuration', next)}
                                sx={{
                                    flexWrap: 'wrap',
                                    '& .MuiToggleButton-root': {
                                        px: 2.5,
                                        borderRadius: 2,
                                        textTransform: 'none'
                                    }
                                }}
                            >
                                {commuteDurations.map((duration) => (
                                    <ToggleButton key={duration} value={duration}>
                                        {duration}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                    </Grid>

                    <Stack spacing={1}>
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
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradeLocationSection;