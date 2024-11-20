import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Avatar, Box, Button, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import {useCallback, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import toast from "react-hot-toast";
import Slider from "@mui/material/Slider";
import * as React from "react";
import {AddressEditForm} from "../account/general/address-edit-form";

const DistanceSliderSettings = {
    valuetext: (value) => {
        return `${value} m`;
    },
    marks: [
        {
            value: 10,
            label: '10',
        },
        {
            value: 100,
            label: '100',
        },
    ]
}

export const SpecialistAddressStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const [address, setAddress] = useState(profile.address);
    const [distance, setDistance] = useState(profile.distance || 40);
    const handleOnNext = () => {
        if (profile.address === address && profile.distance === distance)
            onNext();
        else
            onNext({
                address: address,
                distance: distance,
                profileDataProgress: 2
            });
    }


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    To receive orders nearby, specify the exact address.
                </Typography>
                <Typography variant="body2">
                    Other users will not see it, we will select orders taking into account the specified distance
                </Typography>
            </div>

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{pt: 2}}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!address}
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

SpecialistAddressStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
