import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    Typography
} from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

const VISIBILITY_FIELDS = [
    { key: 'showInstitution', label: 'Show institution' },
    { key: 'showSpecialty', label: 'Show specialty' },
    { key: 'showDegree', label: 'Show degree' },
    { key: 'showStartEndDates', label: 'Show start/end dates' },
    { key: 'showGPA', label: 'Show GPA' },
    { key: 'showDocumentNumber', label: 'Show document number' }
];

const VisibilitySettingsSection = ({ values, onChange }) => {
    const handleChange = useCallback((key, checked) => {
        onChange(key, checked);
    }, [onChange]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <OpenInNewOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                        Section 4: Visibility Settings
                    </Typography>
                </Box>

                <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                    What to show on the public document page?
                </Typography>

                <Grid container>
                    {VISIBILITY_FIELDS.map(({ key, label }) => (
                        <Grid item xs={12} sm={6} key={key}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={values[key] !== false}
                                        onChange={(e) => handleChange(key, e.target.checked)}
                                        sx={{ color: 'primary.main' }}
                                    />
                                }
                                label={<Typography variant="body2">{label}</Typography>}
                            />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

VisibilitySettingsSection.propTypes = {
    values: PropTypes.shape({
        showInstitution: PropTypes.bool,
        showSpecialty: PropTypes.bool,
        showDegree: PropTypes.bool,
        showStartEndDates: PropTypes.bool,
        showGPA: PropTypes.bool,
        showDocumentNumber: PropTypes.bool
    }).isRequired,
    onChange: PropTypes.func.isRequired
};

export default memo(VisibilitySettingsSection);
