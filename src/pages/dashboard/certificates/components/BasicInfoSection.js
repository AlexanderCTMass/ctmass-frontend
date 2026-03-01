import { memo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
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
    'Card',
    'Other'
];

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
    const handleChange = (field) => (e) => {
        onChange(field, e.target.value);
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
                            <FormControl fullWidth required>
                                <InputLabel>Document type</InputLabel>
                                <Select
                                    label="Document type *"
                                    value={values.documentType || ''}
                                    onChange={handleChange('documentType')}
                                >
                                    <MenuItem value=""><em>Select type (Certificate, License, etc.)</em></MenuItem>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                            <FormControl fullWidth>
                                <InputLabel>Degree</InputLabel>
                                <Select
                                    label="Degree"
                                    value={values.degree || ''}
                                    onChange={handleChange('degree')}
                                >
                                    <MenuItem value=""><em>Select degree</em></MenuItem>
                                    {DEGREE_OPTIONS.map((deg) => (
                                        <MenuItem key={deg} value={deg}>{deg}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="License expiration date"
                                format="dd/MM/yyyy"
                                value={values.expirationDate || null}
                                onChange={(newValue) => onChange('expirationDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        helperText: 'Note: For temporary or time-limited licenses only.',
                                        placeholder: 'DD/MM/YYYY'
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
