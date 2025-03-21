import {
    Box,
    Button,
    FormControlLabel,
    InputAdornment,
    Radio,
    RadioGroup,
    Stack,
    SvgIcon,
    TextField,
    Typography
} from '@mui/material';
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import dayjs from "dayjs";
import PropTypes from 'prop-types';
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { INFO } from "src/libs/log";

const projectStartTypes = [
    {
        label: 'ASAP',
        value: 'asap'
    },
    {
        label: 'Specialist\'s choice',
        value: 'specialist'
    },
    {
        label: 'Choose date',
        value: 'period'
    }
];

export const ProjectDetailsStep = (props) => {
    const { onBack, onNext, project, ...other } = props;
    const [tag, setTag] = useState('');
    const [title, setTitle] = useState(project.title);
    const [projectStartType, setProjectStartType] = useState(project.projectStartType || 'asap');
    const [projectMaximumBudget, setProjectMaximumBudget] = useState(project.projectMaximumBudget);
    const [tags, setTags] = useState([]);
    const [startDate, setStartDate] = useState(project.start ? (project.id ? project.start.toDate() : project.start) : null);
    const [endDate, setEndDate] = useState(project.end ? (project.id ? project.end.toDate() : project.end) : null);

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
        project.projectStartType = projectStartType;
        project.projectMaximumBudget = projectMaximumBudget;
        project.start = startDate;
        project.end = endDate;
        onNext(project);
    }

    // Проверка, что все обязательные поля заполнены
    const isFormValid = () => {
        const isTitleValid = !!title; // title обязательно
        const isBudgetValid = !!projectMaximumBudget; // projectMaximumBudget обязательно
        const isStartTypeValid = !!projectStartType; // projectStartType обязательно

        // Если projectStartType равен 'period', проверяем startDate и endDate
        if (projectStartType === 'period') {
            return isTitleValid && isBudgetValid && isStartTypeValid && !!startDate && !!endDate;
        }

        // Для других типов достаточно title, budget и startType
        return isTitleValid && isBudgetValid && isStartTypeValid;
    };

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
                    Maximum budget?
                </Typography>
            </div>
            <Stack spacing={3}>
                <TextField
                    error={!projectMaximumBudget}
                    helperText={!projectMaximumBudget && "Required to fill"}
                    label="Max budget"
                    name="projectMaximumBudget"
                    defaultValue={projectMaximumBudget}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    type="number"
                    onChange={(e) => {
                        setProjectMaximumBudget(e.target.value)
                    }}
                />
            </Stack>

            <div>
                <Typography variant="h6">
                    What is your desired project start date?
                </Typography>
            </div>
            <Stack
                alignItems="start"
                justifyContent={"start"}
                direction="column"
                spacing={3}
            >
                <div>
                    <RadioGroup
                        name="paymentMethod"
                        onChange={(event, value) => {
                            setProjectStartType(event.target.value);
                        }}
                        sx={{ flexDirection: 'row' }}
                        value={projectStartType}
                    >
                        {projectStartTypes.map((projectStartTypesItem) => (
                            <FormControlLabel
                                control={<Radio />}
                                key={projectStartTypesItem.value}
                                label={(
                                    <Typography variant="body1">
                                        {projectStartTypesItem.label}
                                    </Typography>
                                )}
                                value={projectStartTypesItem.value}
                            />
                        ))}
                    </RadioGroup>
                </div>
                {
                    projectStartType === 'period'
                    &&
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
                            localeText={{ start: 'Project to start', end: 'Project to end' }} />
                    </LocalizationProvider>
                }
            </Stack>
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
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!isFormValid()} // Используем функцию isFormValid для проверки
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