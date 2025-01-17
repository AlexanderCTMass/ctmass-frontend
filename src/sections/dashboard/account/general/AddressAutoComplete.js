import * as React from "react";
import {TextField} from "@mui/material";
import {mapboxConfig} from "../../../../config";
import Autocomplete from "@mui/material/Autocomplete";
import {useEffect} from "react";

export const AddressAutoComplete = (props) => {
    const {handleSuggestionClick, location, ...other} = props;
    const [value, setValue] = React.useState(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState([]);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!location)
            return;
        setValue(location);
        setInputValue(location.place_name);
    }, [location]);

    const handleChange = (event) => {
        handleInputChange(event.target.value);
    };

    const handleInputChange = async (query) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxConfig.apiKey}`,
                {}
            );
            const data = await response.json()
            setOptions(data.features);
            console.log(options);
        } catch (error) {
            console.error("There was an error while fetching places:", error);
        }
    };


    React.useEffect(() => {
        const asyncFn = async () => {
            if (inputValue === '') {
                setOptions(value ? [value] : []);
                return undefined;
            }

            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${inputValue}.json?access_token=${mapboxConfig.apiKey}`,
                    {}
                );
                const data = await response.json()
                setOptions(data.features);
            } catch (error) {
                console.error("There was an error while fetching places:", error);
            }
        };
        asyncFn();

    }, [value, inputValue]);

    return (
        <Autocomplete
            id="google-map-demo"
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.place_name
            }
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="No locations"
            onChange={(event, newValue) => {
                setOptions(newValue ? [newValue, ...options] : options);
                setValue(newValue);
                handleSuggestionClick(newValue);
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField {...params} label="Address" fullWidth/>
            )}
            renderOption={(props, option) => {
                return (
                    <li {...props}>
                        {option.place_name}
                    </li>
                );
            }}
        />
    );
}