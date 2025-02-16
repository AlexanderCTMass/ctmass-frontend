import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Stack, SvgIcon, Typography} from '@mui/material';
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import {mapboxConfig} from 'src/config';
import {AddressMinimap, SearchBox} from "@mapbox/search-js-react";
import {useTheme} from "@mui/material/styles";


export const ProjectLocationStep = (props) => {
    const {onBack, onNext, project, user, ...other} = props;
    const theme = useTheme();
    const [location, setLocation] = useState(project.location);

    const handleOnNext = () => {
        project.location = location;
        if (user) {
            project.userId = user.id;
        }
        onNext(project, user != null);
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
            <AddressAutoComplete location={location} withMap={true} handleSuggestionClick={(location) => {
                setLocation(location);
            }}/>
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
                    {user ? "Create & publish project" : "Next"}
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
