import PropTypes from 'prop-types';
import {Button, Stack, ToggleButton, ToggleButtonGroup, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import {mapboxConfig} from 'src/config';
import type {FillLayer, MarkerDragEvent} from 'react-map-gl';
import Map, {Layer, Marker, Source} from 'react-map-gl';
import type {FeatureCollection} from 'geojson';
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import RoomIcon from '@mui/icons-material/Room';
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import toast from "react-hot-toast";

const geojsonInit: FeatureCollection = {
    type: 'FeatureCollection',
    features: []
};

const layerStyle: FillLayer = {
    'id': 'isoLayer',
    'type': 'fill',
    'source': 'iso',
    'layout': {},
    'paint': {
        'fill-color': '#5a3fc0',
        'fill-opacity': 0.3
    }
};

export const AddressEditForm = (props) => {
    const {address, distance, onSubmit, ...other} = props;
    const theme = useTheme();
    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v9'
        : 'mapbox://styles/mapbox/light-v9';
    const mapRef = useRef(null);

    const [isoprofile, setIsoprofile] = useState(address ? address.profile : 'walking');
    const [isominutes, setIsominutes] = useState(address ? address.duration : "40");
    const [location, setLocation] = useState(address ? address.location : null);


    const [geojson, setGeojson] = useState(geojsonInit);
    const [zipCode, setZipCode] = useState(""); // Новое состояние для ZIP-кода

    const [viewport, setViewport] = useState({
        latitude: location ? location.center[1] : 40,
        longitude: location ? location.center[0] : -75,
        zoom: 13
    });

    const getIso = async (prof, minutes) => {
        // Create variables to use in getIso()
        const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';

        const query = await fetch(
            `${urlBase}${prof}/${viewport.longitude},${viewport.latitude}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxConfig.apiKey}`,
            {method: 'GET'}
        );
        const data = await query.json();
        // Set the 'iso' source's data to what's returned by the API query
        setGeojson(data);
        setIsoprofile(prof);
        setIsominutes(minutes);
    }

    const handleUpdateAddress = () => {
        onSubmit({
            address: {
                location: location,
                duration: isominutes,
                profile: isoprofile,
                zipCode: zipCode // Передача ZIP-кода при отправке
            }
        });
        toast.success('Address info updated');
    };

    const handleIsoprofileChange = (e, value) => {
        if (!value) return;
        getIso(value, isominutes);
    };

    const handleIsominutesChange = (e, value) => {
        if (!value) return;
        getIso(isoprofile, value);
    }

    const onMarkerDragStart = (event: MarkerDragEvent) => {
        setGeojson(geojsonInit);
    }

    const onMarkerDragEnd = async (event: MarkerDragEvent) => {
        setViewport((prev) => {
            return {
                ...prev, latitude: event.lngLat.lat,
                longitude: event.lngLat.lng
            }
        });
    }

    const handleSuggestionClick = (suggestion) => {
        if (!suggestion)
            return;
        setLocation(suggestion);

        const streetAndNumber = suggestion.place_name.split(",")[0];
        const latitude = suggestion.center[1];
        const longitude = suggestion.center[0];

        const address = {
            streetAndNumber,
            place: "",
            region: "",
            postcode: "",
            country: "",
            latitude,
            longitude,
        };

        // Получение ZIP-кода из компонентов адреса
        const zipComponent = suggestion.context.find(contextItem =>
            contextItem.id.startsWith("postcode")
        );
        setZipCode(zipComponent ? zipComponent.text : ""); // Установка ZIP-кода

        setViewport((prev) => ({
            ...prev,
            latitude: latitude,
            longitude: longitude
        }));
    };


    useEffect(() => {
        const asyncFn = async () => {
            const query1 = await fetch('https://ipapi.co/json');
            const data1 = await query1.json();
            if (data1) {
                const query2 = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${data1.longitude},${data1.latitude}.json?access_token=${mapboxConfig.apiKey}`,
                    {});
                const data2 = await query2.json();
                if (!data2)
                    return;
                if (!data2.features)
                    return;
                if (data2.features.length === 1 && !data2.features[0].id.startsWith("locality"))
                    return;

                const filterElement = data2.features.filter((fe) => fe.id.startsWith("locality"))[0];
                if (filterElement) {
                    setLocation(filterElement);
                    setViewport((prev) => {
                        return {
                            ...prev, latitude: filterElement.center[1],
                            longitude: filterElement.center[0]
                        }
                    })
                }
            }
        }
        if (!location) {
            asyncFn();
        } else
            getIso(isoprofile, isominutes)
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map)
            return;
        map.flyTo({
                center: [viewport.longitude, viewport.latitude],
                essential: true,
                speed: 8,
                zoom: viewport.zoom
            }
        );
    }, [viewport])

    return (
        <>
            <Stack spacing={1}>
                <Grid
                    xs={12}
                    md={12}
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                    <Typography sx={{mr: 2}}>
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
                </Grid>
                <Grid
                    xs={12}
                    md={12}
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                    <Typography sx={{mr: 2}}>
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
                </Grid>
                <Grid
                    xs={12}
                    md={12}
                >
                    <AddressAutoComplete location={location} handleSuggestionClick={handleSuggestionClick}/>
                </Grid>
                <Grid
                    xs={12}
                    md={12}
                >
                    {zipCode && (
                        <Typography sx={{mt: 1, color: 'gray'}}>
                            ZIP Code: {zipCode}
                        </Typography>
                    )}
                </Grid>
                <Grid
                    xs={12}
                    md={12}
                >
                    <Map
                        mapboxAccessToken={mapboxConfig.apiKey}
                        initialViewState={viewport}
                        mapStyle={mapStyle}
                        ref={mapRef}
                        mapLib={import('mapbox-gl')}
                        onZoomEnd={() => {
                            getIso(isoprofile, isominutes);
                        }}
                        style={{height: "300px"}}
                    >
                        <Source id="my-data" type="geojson" data={geojson}>
                            <Layer {...layerStyle} />
                        </Source>
                        <Marker
                            longitude={viewport.longitude}
                            latitude={viewport.latitude}
                            anchor="bottom"
                            // draggable
                            // onDragStart={onMarkerDragStart}
                            // onDragEnd={onMarkerDragEnd}
                        >
                            <RoomIcon/>
                        </Marker>
                    </Map>
                </Grid>
            </Stack>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                flexWrap="wrap"
                justifyContent={"flex-end"}
                spacing={3}
                sx={{pt: 3}}
            >
                <Button
                    disabled={false}
                    onClick={handleUpdateAddress}
                    variant="contained"
                >
                    Update
                </Button>
            </Stack>


        </>
    );
};

AddressEditForm.propTypes = {
    contacts: PropTypes.object
};
