import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { TextField, Box, Grid, ToggleButtonGroup, ToggleButton, Typography, useMediaQuery, Stack } from "@mui/material";
import { mapboxConfig } from "src/config";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState, useCallback } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import debounce from "lodash.debounce";
import { INFO } from "src/libs/log";
import toast from "react-hot-toast";
import {
    US_COUNTRY_CODE,
    US_MAP_MAX_BOUNDS,
    US_ONLY_LOCATION_MESSAGE,
    filterUsPlaces,
    findUsPlace
} from "src/utils/location-utils";

export const AddressAutoCompleteWithPolygon = ({
    handleSuggestionClick = () => {
    },
    location, isoData = { profile: "walking", minutes: "20" },
    withMap = false,
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
    const [isoprofile, setIsoprofile] = useState("walking");
    const [isominutes, setIsominutes] = useState("20");
    const [isochronePolygon, setIsochronePolygon] = useState(null);
    const [options, setOptions] = useState([]); // Состояние для опций
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    useEffect(() => {
        if (!location) return;
        setValue(location);
        if (isoData) {
            setIsoprofile(isoData.profile);
            setIsominutes(isoData.minutes);
        }
        setInputValue(location.place_name);
        setMarkerLocation(location.center);
        setViewState((prev) => ({
            ...prev,
            longitude: location.center[0],
            latitude: location.center[1]
        }));
    }, [location, isoData]);

    const applyReverseGeocode = async (lng, lat, { notify = true } = {}) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?country=${US_COUNTRY_CODE}&access_token=${mapboxConfig.apiKey}`
            );
            const data = await response.json();
            INFO("ReverseGeocode", data);
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
            handleSuggestionClick(place, {
                profile: isoprofile,
                minutes: isominutes,
                isochronePolygon: isochronePolygon
            });
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
                setOptions(value ? [value] : []);
                return;
            }
            try {
                const proximity = userLocation ? `&proximity=${userLocation.join(",")}` : "";
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=${US_COUNTRY_CODE}${proximity}&access_token=${mapboxConfig.apiKey}`
                );
                const data = await response.json();
                setOptions(filterUsPlaces(data.features));
            } catch (error) {
                console.error("Error fetching places:", error);
                setOptions([]);
            }
        }, 500),
        [value, userLocation]
    );

    useEffect(() => {
        fetchPlaces(inputValue);
    }, [inputValue, fetchPlaces]);

    const fetchIsochrone = async (lng, lat, profile, minutes) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxConfig.apiKey}`
            );
            const data = await response.json();
            INFO("fetchIsochrone", data);
            return data.features[0];
        } catch (error) {
            console.error("Error fetching isochrone:", error);
            return null;
        }
    };

    useEffect(() => {
        if (markerLocation) {
            fetchIsochrone(markerLocation[0], markerLocation[1], isoprofile, isominutes)
                .then((polygon) => {
                    INFO("polygon", polygon);
                    setIsochronePolygon(polygon);

                    handleSuggestionClick(value, {
                        profile: isoprofile,
                        minutes: isominutes,
                        isochronePolygon: polygon
                    });

                });
        }
    }, [markerLocation, isoprofile, isominutes]);

    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v11';

    const handleIsoprofileChange = (event, newValue) => {
        if (newValue) {
            setIsoprofile(newValue);
        }
    };

    const handleIsominutesChange = (event, newValue) => {
        if (newValue) {
            setIsominutes(newValue);
        }
    };

    /*   useEffect(() => {
           INFO("эта шляпа?")
           handleSuggestionClick(location, {profile: isoprofile, minutes: isominutes, isochronePolygon: isochronePolygon});
       }, [location, isoprofile, isominutes, isochronePolygon]);*/

    return (
        <>
            <Autocomplete
                options={options}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.place_name)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(x) => x}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                noOptionsText="No US locations found"
                onChange={(event, newValue) => {
                    setValue(newValue);
                    handleSuggestionClick(newValue, {
                        profile: isoprofile,
                        minutes: isominutes,
                        isochronePolygon: isochronePolygon
                    });
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
                        sx={{ width: smUp ? 552 : "100%" }}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>{option.place_name}</li>
                )}
            />
            <Grid
                xs={12}
                md={12}
                direction="row">
                <Stack direction={smUp ? "row" : "column"} mt={smUp ? 2 : 1} alignItems={smUp ? "center" : "flex-start"}
                    justifyContent="space-between">
                    <Typography sx={{ mr: 2 }} variant={smUp ? "body2" : "caption"}>
                        Choose a way to get there:
                    </Typography>
                    <ToggleButtonGroup
                        color="primary"
                        value={isoprofile}
                        onChange={handleIsoprofileChange}
                        exclusive
                        aria-label="Platform"
                    >
                        <ToggleButton value="walking">Walking</ToggleButton>
                        <ToggleButton value="driving">Driving</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Grid>
            <Grid
                xs={12}
                md={12}
                direction="row"
            >
                <Stack direction={smUp ? "row" : "column"} mt={smUp ? 2 : 1} alignItems={smUp ? "center" : "flex-start"}
                    justifyContent="space-between">
                    <Typography sx={{ mr: 2 }} variant={smUp ? "body2" : "caption"}>
                        Maximum duration you ready to go (in minutes):
                    </Typography>
                    <ToggleButtonGroup
                        color="primary"
                        value={isominutes}
                        onChange={handleIsominutesChange}
                        exclusive
                        aria-label="isominutes"
                    >
                        <ToggleButton value="10">10</ToggleButton>
                        <ToggleButton value="20">20</ToggleButton>
                        <ToggleButton value="30">30</ToggleButton>
                        <ToggleButton value="40">40</ToggleButton>
                        <ToggleButton value="50">50</ToggleButton>
                        <ToggleButton value="60">60</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Grid>

            {withMap && (
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
                        {isochronePolygon && (
                            <Source
                                id="isochrone"
                                type="geojson"
                                data={isochronePolygon}
                            >
                                <Layer
                                    id="isochrone-fill"
                                    type="fill"
                                    paint={{
                                        "fill-color": "#5a3fc0",
                                        "fill-opacity": 0.3
                                    }}
                                />
                            </Source>
                        )}
                    </Map>
                </Box>
            )}
        </>
    );
};