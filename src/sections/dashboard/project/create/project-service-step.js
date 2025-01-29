import {Button, Stack, SvgIcon, Typography} from '@mui/material';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import PropTypes from 'prop-types';
import * as React from "react";
import {useState} from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";

export const ProjectServiceStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const [service, setService] = useState(project.service);

    const handleOnNext = () => {
        project.service = service;
        onNext(project);
    }

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Service
                </Typography>
            </div>
            <Stack spacing={3}>
                <FullLoadServicesAutocomplete externalSearchText={service ? service.label : ""} onChange={(service) => {
                    setService(service)
                }}/>
            </Stack>
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
                    disabled={!service}
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

ProjectServiceStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
