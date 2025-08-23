import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Avatar,
    Box,
    Button, CircularProgress,
    IconButton,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useCallback, useRef, useState } from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../libs/firebase";
import toast from "react-hot-toast";
import Slider from "@mui/material/Slider";
import * as React from "react";
import SpecialityCard from "../account/general/specialties-card";
import { SpecialtySelectForm } from "../../../components/specialty-select-form";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import { profileApi } from "../../../api/profile";
import { QuillEditor } from "../../../components/quill-editor";
import SmartTextArea from "src/components/smart-text-ares";
import { AddressAutoComplete } from "src/components/address/AddressAutoComplete";
import { AddressAutoCompleteWithPolygon } from "src/components/address/AddressAutoCompleteWithPolygon";
import { INFO } from "src/libs/log";

export const SpecialistLocationStep = (props) => {
    const { profile, onNext, step = 2, onBack, ...other } = props;
    const [location, setLocation] = useState(profile.address?.location || null);
    const [isoData, setIsoData] = useState({
        minutes: profile.address?.duration || "20",
        profile: profile.address?.profile || "walking"
    });
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [submitting, setSubmitting] = useState(false);


    const handleOnNext = () => {
        onNext({
            address: {
                location: location,
                duration: isoData.minutes,
                profile: isoData.profile
            },
            ...(step && { profileDataProgress: step })
        });
    }

    const handleLocationChange = useCallback((location, isoData) => {
        INFO("LOCATION CHANGE", { location, isoData })
        setLocation(location);
        setIsoData(isoData)
    }, []);

    const isLocationValid = () => {
        return !!location && !!isoData;
    };


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Where are you available to work?
                </Typography>
                <Typography variant="body2">
                    Specify the address and area where you're available to work. We'll match you with projects in that
                    location.
                </Typography>
            </div>
            <AddressAutoCompleteWithPolygon
                location={location}
                isoData={isoData}
                withMap={true}
                handleSuggestionClick={handleLocationChange} />
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
                    startIcon={submitting && <CircularProgress color="inherit" size={20} />}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!isLocationValid() || submitting}
                >
                    {step ? "Next" : "Save"}
                </Button>
                {onBack && <Button
                    color="inherit"
                    onClick={onBack}
                    disabled={submitting}
                >
                    Back
                </Button>}
            </Stack>
        </Stack>
    );
};

SpecialistLocationStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
