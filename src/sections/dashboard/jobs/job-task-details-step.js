import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { Button, Card, Chip, InputAdornment, Radio, Stack, SvgIcon, TextField, Typography } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';

const dateOptions = [
    {
        title: 'Today, ' + new Date(),
        value: 'today'
    },
    {
        title: 'Tomorrow, ' + new Date(),
        value: 'tomorrow'
    },
    {
        title: 'Choose day in the calendar',
        value: 'choose'
    },
    {
        title: 'When it is convenient for the specialist',
        value: 'specialist-choose'
    }
];

export const JobTaskDetailsStep = (props) => {
    const { onBack, onNext, job, ...other } = props;
    const [date, setDate] = useState('today');
    const [startDate, setStartDate] = useState(new Date());

    const handleStartDateChange = useCallback((date) => {
        setStartDate(date);
    }, []);


    const handleDateChange = useCallback((date) => {
        setDate(date);
    }, []);


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
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={job.category}
                    placeholder="e.g Installation of the entrance door"
                />
            </Stack>
            <div>
                <Typography variant="h6">
                    When is the project starting?
                </Typography>
            </div>
            <Stack spacing={2}>
                {dateOptions.map((option) => (
                    <Card
                        key={option.value}
                        sx={{
                            alignItems: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            p: 2,
                            ...(date === option.value && {
                                backgroundColor: 'primary.alpha12',
                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                            })
                        }}
                        onClick={() => handleDateChange(option.value)}
                        variant="outlined"
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                        >
                            <Radio
                                checked={date === option.value}
                                color="primary"
                            />
                            <div>
                                <Typography variant="subtitle1">
                                    {option.title}
                                </Typography>
                            </div>
                        </Stack>
                    </Card>
                ))}
            </Stack>
            {date === 'choose' && (
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
                </Stack>)}
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
                    onClick={onNext}
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

JobTaskDetailsStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
