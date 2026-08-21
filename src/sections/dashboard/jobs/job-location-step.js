import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { Box, Button, Stack, SvgIcon, Typography } from '@mui/material';
import { QuillEditor } from 'src/components/quill-editor';
import { mapboxConfig } from 'src/config';
import Map, { Marker } from 'react-map-gl';
import { AddressAutofill, AddressMinimap, SearchBox } from "@mapbox/search-js-react";
import { useTheme } from "@mui/material/styles";
import { US_COUNTRY_CODE, US_MAP_MAX_BOUNDS, findUsPlace } from "src/utils/location-utils";

const ZOOM = 16;
const VIEW_STATE = {
    latitude: 40.74281576586265,
    longitude: -73.99277240443942,
    zoom: ZOOM
};

export const JobLocationStep = (props) => {
    const { onBack, onNext, job, ...other } = props;
    const theme = useTheme();

    const [viewState, setViewState] = useState(null);
    const [address, setAddress] = useState("");

    const mapRef = useRef(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let newVar = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    zoom: ZOOM
                };
                console.log(newVar);
                setViewState(newVar);
                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${newVar.longitude},${newVar.latitude}.json?types=poi&country=${US_COUNTRY_CODE}&access_token=${mapboxConfig.apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        const place = findUsPlace(data.features);
                        if (!place) {
                            setViewState(VIEW_STATE);
                            return;
                        }
                        setAddress(place.place_name);
                    })
                    .catch(error => console.error(error));
            });
        } else {
            setViewState(VIEW_STATE);
        }

    }, []);


    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v9'
        : 'mapbox://styles/mapbox/light-v9';

    const handleOnNext = () => {
        job.address = address;
        onNext(job);
    }

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Where is it necessary to perform the work?
                </Typography>

            </div>
            <SearchBox value={address} accessToken={mapboxConfig.apiKey} options={{ country: US_COUNTRY_CODE }} onRetrieve={(e) => {
                if (!viewState) {
                    let newVar = {
                        latitude: e.features[0].geometry.coordinates[1],
                        longitude: e.features[0].geometry.coordinates[0],
                        zoom: ZOOM
                    };
                    setViewState(newVar);
                } else {
                    const map = mapRef.current;
                    let flyOptions = {
                        center: [e.features[0].geometry.coordinates[0], e.features[0].geometry.coordinates[1]],
                        duration: 200, // Animate over 12 seconds
                        essential: true,
                        zoom: ZOOM
                    };
                    map.flyTo(flyOptions);
                }
            }} />
            {viewState && (<Map
                attributionControl={false}
                initialViewState={viewState}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxConfig.apiKey}
                maxBounds={US_MAP_MAX_BOUNDS}
                ref={mapRef}
                maxZoom={20}
                minZoom={5}
                style={{ width: { md: "550px", xs: "100px" }, height: "300px" }}
            >
            </Map>)}
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon />
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                >
                    Continue
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

JobLocationStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
