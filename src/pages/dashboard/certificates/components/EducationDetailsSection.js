import { memo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EducationDetailsSection = ({ values, onChange }) => {
    const handleChange = (field) => (e) => {
        onChange(field, e.target.value);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <CalendarTodayOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            Section 2: Education Details
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Start date"
                                format="dd/MM/yyyy"
                                value={values.startDate || null}
                                onChange={(newValue) => onChange('startDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        placeholder: 'DD/MM/YYYY'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="End date"
                                format="dd/MM/yyyy"
                                value={values.endDate || null}
                                onChange={(newValue) => onChange('endDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        placeholder: 'DD/MM/YYYY'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Document number (Optional)"
                                placeholder="e.g., LIC-88923-X"
                                value={values.documentNumber || ''}
                                onChange={handleChange('documentNumber')}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="GPA (Optional)"
                                placeholder="e.g., 3.8/4.0"
                                value={values.gpa || ''}
                                onChange={handleChange('gpa')}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                Description
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Describe your achievements, relevant coursework, or certification requirements..."
                                value={values.description || ''}
                                onChange={handleChange('description')}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
};

EducationDetailsSection.propTypes = {
    values: PropTypes.shape({
        startDate: PropTypes.instanceOf(Date),
        endDate: PropTypes.instanceOf(Date),
        documentNumber: PropTypes.string,
        gpa: PropTypes.string,
        description: PropTypes.string
    }).isRequired,
    onChange: PropTypes.func.isRequired
};

export default memo(EducationDetailsSection);
