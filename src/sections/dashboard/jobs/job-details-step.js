import {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Chip, InputAdornment, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import {MobileDatePicker} from '@mui/x-date-pickers';

export const JobDetailsStep = (props) => {
    const {onBack, onNext, job, ...other} = props;
    const [tag, setTag] = useState('');
    const [title, setTitle] = useState(job.title);
    const [tags, setTags] = useState([]);
    const [startDate, setStartDate] = useState(job.start || new Date());
    const [endDate, setEndDate] = useState(job.end || new Date());

    const handleStartDateChange = useCallback((date) => {
        setStartDate(date);
    }, []);

    const handleEndDateChange = useCallback((date) => {
        setEndDate(date);
    }, []);

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
        job.title = title;
        job.start = startDate;
        job.end = endDate;
        onNext(job);
    }

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    What is the job about?
                </Typography>
            </div>
            <Stack spacing={3}>
                <TextField
                    error={!title}
                    helperText={!title&&"Required to fill"}
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    defaultValue={title}
                    placeholder="e.g Installation of the entrance door"
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
            </Stack>
            <div>
                <Typography variant="h6">
                    When is the job starting?
                </Typography>
            </div>
            <Stack
                alignItems="center"
                direction="row"
                spacing={3}
            >
                <MobileDatePicker
                    label="Start Date"
                    inputFormat="MM/dd/yyyy"
                    value={startDate}
                    onChange={handleStartDateChange}
                    renderInput={(inputProps) => <TextField {...inputProps} />}
                />
                <MobileDatePicker
                    label="End Date"
                    inputFormat="MM/dd/yyyy"
                    value={endDate}
                    onChange={handleEndDateChange}
                    renderInput={(inputProps) => <TextField {...inputProps} />}
                />
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

JobDetailsStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
