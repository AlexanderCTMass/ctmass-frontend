import {Button, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import dayjs from "dayjs";
import PropTypes from 'prop-types';
import * as React from "react";
import {useCallback, useState} from "react";

export const ProjectDetailsStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const [tag, setTag] = useState('');
    const [title, setTitle] = useState(project.title);
    const [tags, setTags] = useState([]);
    const [startDate, setStartDate] = useState(project.start ? project.start.toDate() : new Date());
    const [endDate, setEndDate] = useState(project.end ? project.end.toDate() : new Date());

    const handleTagAdd = useCallback((tag) => {
        setTags((prevState) => {
            return [...prevState, tag];
        });
    }, []);

    const handleTagDelete = useCallback((tag) => {
        setTags((prevState) => {
            return prevState.filter((t) => t !== tag);
        });
    }, []);

    const handleOnNext = () => {
        project.title = title;
        project.start = startDate;
        project.end = endDate;
        onNext(project);
    }

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    What is the project about?
                </Typography>
            </div>
            <Stack spacing={3}>
                <TextField
                    error={!title}
                    helperText={!title && "Required to fill"}
                    fullWidth
                    label="Project Title"
                    name="projectTitle"
                    defaultValue={title}
                    placeholder="e.g Installation of the entrance door"
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
            </Stack>
            <div>
                <Typography variant="h6">
                    When is the project starting?
                </Typography>
            </div>
            <Stack
                alignItems="center"
                direction="row"
                spacing={3}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateRangePicker
                        onChange={(value, context) => {
                            if (value[0]) {
                                setStartDate(value[0].toDate());
                            } else {
                                setStartDate(null);
                            }
                            if (value[1]) {
                                setEndDate(value[1].toDate());
                            } else {
                                setEndDate(null);
                            }
                        }}
                        defaultValue={[dayjs(startDate), dayjs(endDate)]}
                        localeText={{start: 'Project start', end: 'Finish'}}/>
                </LocalizationProvider>
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
                    disabled={!title}
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

ProjectDetailsStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
