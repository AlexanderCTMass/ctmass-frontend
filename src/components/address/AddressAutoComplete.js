import {useTheme} from "@mui/material/styles";
import * as React from "react";
import {TextField, Box} from "@mui/material";
import {mapboxConfig} from "src/config";
import Autocomplete from "@mui/material/Autocomplete";
import {useEffect, useState, useRef, useCallback} from "react";
import Map, {Marker} from "react-map-gl";
import debounce from "lodash.debounce";

export const AddressAutoComplete = ({
                                        handleSuggestionClick = () => {
                                        },
                                        location,
                                        withMap = false,
                                        ...other
                                    }) => {
    const theme = useTheme();

    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [markerLocation, setMarkerLocation] = useState(null);
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
        console.log(viewState);
    }, [location]);

    // Получаем координаты пользователя
    useEffect(() => {
        if (location) {
            return;
        }
        console.log("geolocation auto")
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    const userCoords = [longitude, latitude];
                    setUserLocation(userCoords);
                    setMarkerLocation(userCoords);
                    setViewState((prev) => ({
                        ...prev,
                        longitude,
                        latitude
                    }));
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                }
            );
        }
    }, []);

    // Функция обратного геокодинга (получение адреса по координатам)
    const reverseGeocode = async (lng, lat) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?country=us&access_token=${mapboxConfig.apiKey}`
            );
            const data = await response.json();
            if (data.features.length > 0) {
                const place = data.features[0];
                setValue(place);
                setInputValue(place.place_name);
                handleSuggestionClick(place);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
    };

    // Обработчик ввода с debounce
    const fetchPlaces = useCallback(
        debounce(async (query) => {
            if (!query) {
                optionsRef.current = value ? [value] : [];
                return;
            }

            try {
                const proximity = userLocation ? `&proximity=${userLocation.join(",")}` : "";
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=us${proximity}&access_token=${mapboxConfig.apiKey}`
                );
                const data = await response.json();
                optionsRef.current = data.features;
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
                noOptionsText="No locations"
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
                        sx={{width:552}}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>{option.place_name}</li>
                )}
            />

            {/* Карта с маркером */}
            {withMap &&
                <Box sx={{height: 400, mt: 2, borderRadius: "12px", overflow: "hidden"}}>
                    <Map
                        {...viewState}
                        style={{width: "100%", height: "100%"}}
                        mapStyle={mapStyle}
                        mapboxAccessToken={mapboxConfig.apiKey}
                        onMove={(evt) => setViewState(evt.viewState)}
                        onClick={(e) => {
                            const newCoords = [e.lngLat.lng, e.lngLat.lat];
                            setMarkerLocation(newCoords);
                            setViewState((prev) => ({
                                ...prev,
                                longitude: newCoords[0],
                                latitude: newCoords[1]
                            }));
                            reverseGeocode(newCoords[0], newCoords[1]); // Получаем адрес
                        }}
                    >
                        {markerLocation && (
                            <Marker
                                longitude={markerLocation[0]}
                                latitude={markerLocation[1]}
                                draggable
                                onDragEnd={(e) => {
                                    const newCoords = [e.lngLat.lng, e.lngLat.lat];
                                    setMarkerLocation(newCoords);
                                    setViewState((prev) => ({
                                        ...prev,
                                        longitude: newCoords[0],
                                        latitude: newCoords[1]
                                    }));
                                    reverseGeocode(newCoords[0], newCoords[1]); // Получаем адрес
                                }}
                            />
                        )}
                    </Map>
                </Box>}
        </>
    );
};
