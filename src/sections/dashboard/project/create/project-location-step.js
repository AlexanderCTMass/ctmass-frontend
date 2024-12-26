import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Stack, SvgIcon, Typography} from '@mui/material';
import {mapboxConfig} from 'src/config';
import {AddressMinimap, SearchBox} from "@mapbox/search-js-react";
import {useTheme} from "@mui/material/styles";


export const ProjectLocationStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const theme = useTheme();
    const [location, setLocation] = useState(project.location || {placeName: ""});
    const [minimapFeature, setMinimapFeature] = useState()

    function locationFrom(data) {
        return {
            latitude: data.features[0].geometry.coordinates[1],
            longitude: data.features[0].geometry.coordinates[0],
            placeName: data.features[0].properties.full_address || data.features[0].place_name || data.features[0].place_formatted
        };
    }

    useEffect(() => {
        if (location && location.placeName) {
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?types=poi&access_token=${mapboxConfig.apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        setLocation(locationFrom(data));
                        setMinimapFeature(data.features[0]);
                    })
                    .catch(error => console.error(error));
            });
        }

    }, [location]);


    const mapStyle = theme.palette.mode === 'dark'
        ? 'mapbox://styles/mapbox/dark-v9'
        : 'mapbox://styles/mapbox/light-v9';

    const handleOnNext = () => {
        project.location = location;
        onNext({location: location}, true);
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
            <SearchBox options={{"country": "US", "types": "street"}} value={location.placeName}
                       accessToken={mapboxConfig.apiKey}
                       onRetrieve={(e) => {
                           setLocation(locationFrom(e));
                           setMinimapFeature(e.features[0])

                       }}/>
            <div id="minimap-container" style={{height: "300px"}}>
                <AddressMinimap
                    feature={minimapFeature}
                    show={!!minimapFeature}
                    satelliteToggle
                    // canAdjustMarker
                    accessToken={mapboxConfig.apiKey}
                    style={{height: "300px"}}
                    // theme={mapStyle}
                />
            </div>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                >
                    Save
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

ProjectLocationStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
