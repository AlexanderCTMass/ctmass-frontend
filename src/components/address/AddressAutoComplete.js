import { useTheme } from "@mui/material/styles";
import { TextField, Box } from "@mui/material";
import { mapboxConfig } from "src/config";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState, useRef, useCallback } from "react";
import Map, { Marker } from "react-map-gl";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";
import {
    US_COUNTRY_CODE,
    US_MAP_MAX_BOUNDS,
    US_ONLY_LOCATION_MESSAGE,
    filterUsPlaces,
    findUsPlace
} from "src/utils/location-utils";

export const AddressAutoComplete = ({
    handleSuggestionClick = () => {
    },
    location,
    withMap = false,
    autoDetect = true,
    ...other
}) => {
    const theme = useTheme();

    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [markerLocation, setMarkerLocation] = useState(null);
    const [markerKey, setMarkerKey] = useState(0);
    const [viewState, setViewState] = useState({
        longitude: -95.7129,
        latitude: 37.0902,
        zoom: 10
    });
    const optionsRef = useRef([]);

    useEffect(() => {
        if (!location) return;
        setValue(location);
        setInputValue(location.place_name);
        setMarkerLocation(location.center);
        setViewState((prev) => ({
            ...prev,
            longitude: location.center[0],
            latitude: location.center[1]
        }));
    }, [location]);

    const applyReverseGeocode = async (lng, lat, { notify = true } = {}) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?country=${US_COUNTRY_CODE}&access_token=${mapboxConfig.apiKey}`
            );
            const data = await response.json();
            const place = findUsPlace(data.features);
            if (!place) {
                if (notify) {
                    toast.error(US_ONLY_LOCATION_MESSAGE);
                }
                setMarkerKey((prev) => prev + 1);
                return false;
            }
            setValue(place);
            setInputValue(place.place_name);
            setMarkerLocation([lng, lat]);
            setViewState((prev) => ({
                ...prev,
                longitude: lng,
                latitude: lat
            }));
            handleSuggestionClick(place);
            return true;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            setMarkerKey((prev) => prev + 1);
            return false;
        }
    };

    useEffect(() => {
        if (location) {
            return;
        }
        if (!autoDetect) {
            return;
        }
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    applyReverseGeocode(longitude, latitude, { notify: false }).then((applied) => {
                        if (applied) {
                            setUserLocation([longitude, latitude]);
                        }
                    });
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                }
            );
        }
    }, []);

    const fetchPlaces = useCallback(
        debounce(async (query) => {
            if (!query) {
                optionsRef.current = value ? [value] : [];
                return;
            }

            try {
                const proximity = userLocation ? `&proximity=${userLocation.join(",")}` : "";
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=${US_COUNTRY_CODE}${proximity}&access_token=${mapboxConfig.apiKey}`
                );
                const data = await response.json();
                optionsRef.current = filterUsPlaces(data.features);
            } catch (error) {
                console.error("Error fetching places:", error);
            }
        }, 500),
        [value, userLocation]
    );

    useEffect(() => {
        fetchPlaces(inputValue);
    }, [inputValue, fetchPlaces]);

    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v11';


    return (
        <>
            <Autocomplete
                options={optionsRef.current}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.place_name)}
                filterOptions={(x) => x}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No US locations found"
                onChange={(event, newValue) => {
                    setValue(newValue);
                    handleSuggestionClick(newValue);
                    if (newValue?.center) {
                        setMarkerLocation(newValue.center);
                        setViewState((prev) => ({
                            ...prev,
                            longitude: newValue.center[0],
                            latitude: newValue.center[1]
                        }));
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Address"
                        fullWidth
                        sx={{ width: { sm: "100%", md: "552px" } }}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>{option.place_name}</li>
                )}
            />

            {withMap &&
                <Box sx={{ height: 400, mt: 2, borderRadius: "12px", overflow: "hidden" }}>
                    <Map
                        {...viewState}
                        style={{ width: "100%", height: "100%" }}
                        mapStyle={mapStyle}
                        mapboxAccessToken={mapboxConfig.apiKey}
                        maxBounds={US_MAP_MAX_BOUNDS}
                        onMove={(evt) => setViewState(evt.viewState)}
                        onClick={(e) => {
                            applyReverseGeocode(e.lngLat.lng, e.lngLat.lat);
                        }}
                    >
                        {markerLocation && (
                            <Marker
                                key={markerKey}
                                longitude={markerLocation[0]}
                                latitude={markerLocation[1]}
                                draggable
                                onDragEnd={(e) => {
                                    applyReverseGeocode(e.lngLat.lng, e.lngLat.lat);
                                }}
                            />
                        )}
                    </Map>
                </Box>}
        </>
    );
};
