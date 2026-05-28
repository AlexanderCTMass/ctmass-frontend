import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AddressAutoComplete } from 'src/components/address/AddressAutoComplete';

const DOCUMENT_TYPES = [
    'Certificate',
    'License',
    'General Contractor License',
    'Home Improvement Contractor (HIC)',
    'Construction Supervisor License (CSL)',
    'Journeyman License',
    'Master Plumber License',
    'Master Electrician License',
    'HVAC License',
    'EPA Section 608 Certification',
    'OSHA 10-Hour Certificate',
    'OSHA 30-Hour Certificate',
    'Lead-Safe Certification',
    'First Aid/CPR Certificate',
    'Asbestos Handler Certificate',
    'Safety Certificate',
    'Continuing Education Certificate',
    'Card'
];

const ADD_CUSTOM_VALUE = '__add_custom__';

const DEGREE_OPTIONS = [
    'High School Diploma',
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    'Doctoral Degree',
    'Trade School Certificate',
    'Vocational Certificate',
    'Professional Certificate',
    'Journeyman Certificate',
    'Master Certificate',
    'Apprenticeship Certificate'
];

const BasicInfoSection = ({ values, onChange }) => {
    const [docTypeCustom, setDocTypeCustom] = useState(false);
    const [degreeCustom, setDegreeCustom] = useState(false);

    const handleChange = (field) => (e) => {
        onChange(field, e.target.value);
    };

    const renderSelectWithCustom = ({
        field,
        label,
        options,
        required,
        placeholder,
        customMode,
        setCustomMode
    }) => {
        const value = values[field] || '';
        const showInput = customMode || (Boolean(value) && !options.includes(value));

        if (showInput) {
            return (
                <Stack spacing={0.5}>
                    <TextField
                        fullWidth
                        required={required}
                        label={label}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange(field)}
                        autoFocus
                    />
                    <Button
                        size="small"
                        variant="text"
                        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        onClick={() => {
                            setCustomMode(false);
                            onChange(field, '');
                        }}
                    >
                        Choose from list
                    </Button>
                </Stack>
            );
        }

        return (
            <FormControl fullWidth required={required}>
                <InputLabel>{label}</InputLabel>
                <Select
                    label={required ? `${label} *` : label}
                    value={value}
                    onChange={(e) => {
                        if (e.target.value === ADD_CUSTOM_VALUE) {
                            setCustomMode(true);
                            onChange(field, '');
                        } else {
                            onChange(field, e.target.value);
                        }
                    }}
                >
                    <MenuItem value=""><em>{placeholder}</em></MenuItem>
                    {options.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                    <MenuItem value={ADD_CUSTOM_VALUE} sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                        ＋ Add custom…
                    </MenuItem>
                </Select>
            </FormControl>
        );
    };

    const handleLocationChange = (place) => {
        if (!place) {
            onChange('locationIssued', null);
            onChange('locationIssuedText', '');
            return;
        }
        onChange('locationIssued', place);
        onChange('locationIssuedText', place.place_name || '');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            Section 1: Basic Information
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            {renderSelectWithCustom({
                                field: 'documentType',
                                label: 'Document type',
                                options: DOCUMENT_TYPES,
                                required: true,
                                placeholder: 'Select type (Certificate, License, etc.)',
                                customMode: docTypeCustom,
                                setCustomMode: setDocTypeCustom
                            })}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Institution *"
                                placeholder="Search for institution or add new"
                                value={values.institution || ''}
                                onChange={handleChange('institution')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SchoolOutlinedIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            sx={{
                                '& .MuiAutocomplete-root .MuiTextField-root': { width: '100% !important' }
                            }}
                        >
                            <AddressAutoComplete
                                location={values.locationIssued || null}
                                handleSuggestionClick={handleLocationChange}
                                withMap={false}
                                label="Location issued"
                                placeholder="City"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Specialty / Program"
                                placeholder="e.g., Computer Science"
                                value={values.specialty || ''}
                                onChange={handleChange('specialty')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SchoolOutlinedIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            {renderSelectWithCustom({
                                field: 'degree',
                                label: 'Degree',
                                options: DEGREE_OPTIONS,
                                required: false,
                                placeholder: 'Select degree',
                                customMode: degreeCustom,
                                setCustomMode: setDegreeCustom
                            })}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="License expiration date"
                                format="MM/dd/yyyy"
                                value={values.expirationDate || null}
                                onChange={(newValue) => onChange('expirationDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        helperText: 'Note: For temporary or time-limited licenses only.',
                                        placeholder: 'MM/DD/YYYY'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
};

BasicInfoSection.propTypes = {
    values: PropTypes.shape({
        documentType: PropTypes.string,
        institution: PropTypes.string,
        locationIssued: PropTypes.object,
        locationIssuedText: PropTypes.string,
        specialty: PropTypes.string,
        degree: PropTypes.string,
        expirationDate: PropTypes.instanceOf(Date)
    }).isRequired,
    onChange: PropTypes.func.isRequired
};

export default memo(BasicInfoSection);
