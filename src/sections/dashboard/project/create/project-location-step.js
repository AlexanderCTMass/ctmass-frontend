import React, {useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Stack, SvgIcon, Typography, useMediaQuery} from '@mui/material';
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import {useTheme} from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import {ERROR} from "src/libs/log";
import toast from "react-hot-toast";

export const ProjectLocationStep = (props) => {
    const {onBack, onNext, project, user, ...other} = props;
    const theme = useTheme();
    const [location, setLocation] = useState(project.location);
    const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [submitting, setSubmitting] = useState(false);

    const handleOnNext = async () => {
        setSubmitting(true);
        try {
            project.location = location;
            if (user) {
                project.userId = user.id;
            }
            await onNext(project, user != null);
        } catch (error) {
            ERROR("Error during onNext:", error);
            toast.error("Error during create project");
        } finally {
            setSubmitting(false);
        }
    };

    const isLocationValid = () => {
        return !!location;
    };

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Where is it necessary to perform the work?
                </Typography>
            </div>
            <AddressAutoComplete
                location={location}
                withMap={true}
                handleSuggestionClick={(location) => {
                    setLocation(location);
                }}
            />
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
                    startIcon={submitting && <CircularProgress color="inherit" size={20}/>}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!isLocationValid() || submitting}
                >
                    {user ? (!mdDown ? "Create & publish projects" : "Create") : "Next"}
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                    disabled={submitting}
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