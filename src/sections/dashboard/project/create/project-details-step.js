import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
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
import { ProjectStartTypes } from "src/enums/project-start-type";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { ContactBestTimes, ContactMethods, PhoneContactMethods } from "src/enums/contact-preferences";
import { useAuth } from "src/hooks/use-auth";
import { normalizeUSPhone } from "src/utils/validation/phone";

const contactMethodIcons = {
    app: ChatBubbleOutlineIcon,
    phone: PhoneOutlinedIcon,
    sms: SmsOutlinedIcon,
    email: EmailOutlinedIcon
};


export const ProjectDetailsStep = (props) => {
    const { onBack, onNext, project, ...other } = props;
    const [tag, setTag] = useState('');
    const [title, setTitle] = useState(project.title);
    const [projectStartType, setProjectStartType] = useState(project.projectStartType || 'asap');
    const [projectMaximumBudget, setProjectMaximumBudget] = useState(project.projectMaximumBudget);
    const [tags, setTags] = useState([]);
    const [startDate, setStartDate] = useState(project.start ? (project.id ? project.start.toDate() : project.start) : null);
    const [endDate, setEndDate] = useState(project.end ? (project.id ? project.end.toDate() : project.end) : null);
    const { user } = useAuth();
    const [contactMethods, setContactMethods] = useState(project.contactPreferences?.methods || []);
    const [bestTime, setBestTime] = useState(project.contactPreferences?.bestTime || "");
    const [contactPhone, setContactPhone] = useState(project.contactPhone || user?.phone || "");

    const needsPhone = contactMethods.some((method) => PhoneContactMethods.includes(method));
    const isPhoneValid = !needsPhone || !!normalizeUSPhone(contactPhone);

    const toggleContactMethod = (method) => {
        setContactMethods((prev) => prev.includes(method)
            ? prev.filter((item) => item !== method)
            : [...prev, method]);
    };

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
        project.contactPreferences = { methods: contactMethods, bestTime };
        if (needsPhone) {
            project.contactPhone = normalizeUSPhone(contactPhone);
        }
        if (contactMethods.includes("email") && user?.email && !project.contactEmail) {
            project.contactEmail = user.email;
        }
        onNext(project);
    }

    // Проверка, что все обязательные поля заполнены
    const isFormValid = () => {
        const isTitleValid = !!title; // title обязательно
        const isStartTypeValid = !!projectStartType; // projectStartType обязательно
        const isContactValid = contactMethods.length > 0 && !!bestTime && isPhoneValid;
        if (!isContactValid) {
            return false;
        }

        // Если projectStartType равен 'period', проверяем startDate и endDate
        if (projectStartType === 'period') {
            return isTitleValid && isStartTypeValid && !!startDate && !!endDate;
        }

        // Для других типов достаточно title  и startType
        return isTitleValid && isStartTypeValid;
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
                    label="Max budget"
                    name="projectMaximumBudget"
                    defaultValue={projectMaximumBudget}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        inputProps: {
                            min: 0,
                        },
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
                        {ProjectStartTypes.map((projectStartTypesItem) => (
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

            <div>
                <Typography variant="h6">
                    How should contractors contact you?
                </Typography>
            </div>
            <Stack spacing={1.5}>
                {ContactMethods.map((method) => {
                    const Icon = contactMethodIcons[method.value];
                    const active = contactMethods.includes(method.value);
                    return (
                        <Paper
                            key={method.value}
                            variant="outlined"
                            onClick={() => toggleContactMethod(method.value)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2,
                                py: 1,
                                cursor: "pointer",
                                borderRadius: 2,
                                borderColor: active ? "primary.main" : "divider",
                                transition: "border-color 0.2s"
                            }}
                        >
                            <Icon fontSize="small" color={active ? "primary" : "action"} />
                            <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
                                {method.label}
                            </Typography>
                            <Switch
                                checked={active}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => toggleContactMethod(method.value)}
                                inputProps={{ "aria-label": method.label }}
                            />
                        </Paper>
                    );
                })}
                {needsPhone && (
                    <TextField
                        fullWidth
                        label="Phone number"
                        value={contactPhone}
                        placeholder="+1 (555) 123-4567"
                        error={!!contactPhone && !isPhoneValid}
                        helperText={!isPhoneValid ? "Enter a valid US phone number (+1 and 10 digits)" : " "}
                        onChange={(e) => setContactPhone(e.target.value)}
                    />
                )}
                <FormControl fullWidth>
                    <InputLabel id="best-time-label">Best time to reach you</InputLabel>
                    <Select
                        labelId="best-time-label"
                        label="Best time to reach you"
                        value={bestTime}
                        onChange={(e) => setBestTime(e.target.value)}
                    >
                        {ContactBestTimes.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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