import {
    Box,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import {
    BUSINESS_ROLES,
    BUSINESS_STRUCTURES,
    CREW_SIZES,
    LANGUAGES,
    PAYMENT_METHODS,
    PREFERRED_CONTACTS
} from 'src/constants/trade-options';
import { isValidWebsite } from 'src/utils/business-profile';

const currentYear = new Date().getFullYear();

const toggleSx = {
    flexWrap: 'wrap',
    gap: 1,
    '& .MuiToggleButtonGroup-grouped': {
        borderRadius: '14px !important',
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        textTransform: 'none',
        m: 0
    }
};

export const foundedYearError = (value) => (
    value !== null && value !== undefined && (value < 1900 || value > currentYear)
        ? `Enter a year between 1900 and ${currentYear}.`
        : ''
);

export const preferredContactError = (contact, hasPhone) => {
    if (contact.preferred === 'phone' && (!hasPhone || !contact.showPhone)) {
        return 'Add and show your phone to make it preferred.';
    }
    if (contact.preferred === 'email' && !contact.showEmail) {
        return 'Show your email to make it preferred.';
    }
    return '';
};

export function BusinessDetailsFields({ business, contact, hasPhone, onBusinessChange, onContactChange }) {
    const setBusiness = (patch) => onBusinessChange({ ...business, ...patch });
    const setContact = (patch) => onContactChange({ ...contact, ...patch });
    const yearError = foundedYearError(business.foundedYear);
    const websiteError = isValidWebsite(business.website) ? '' : 'Enter a valid website, e.g. example.com';
    const contactError = preferredContactError(contact, hasPhone);

    return (
        <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
                Shared by all your trades. Years of experience are set separately in each trade.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                    select
                    label="Your role (optional)"
                    value={business.role}
                    onChange={(event) => setBusiness({ role: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {BUSINESS_ROLES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Business structure (optional)"
                    value={business.structure}
                    onChange={(event) => setBusiness({ structure: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {BUSINESS_STRUCTURES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Crew size (optional)"
                    value={business.crewSize}
                    onChange={(event) => setBusiness({ crewSize: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {CREW_SIZES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Year founded (optional)"
                    value={business.foundedYear ?? ''}
                    onChange={(event) => {
                        const digits = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        setBusiness({ foundedYear: digits ? Number(digits) : null });
                    }}
                    error={Boolean(yearError)}
                    helperText={yearError || 'Years in business are shown separately from trade experience.'}
                    inputProps={{ inputMode: 'numeric' }}
                />
                <TextField
                    label="Website (optional)"
                    value={business.website}
                    onChange={(event) => setBusiness({ website: event.target.value })}
                    placeholder="example.com"
                    error={Boolean(websiteError)}
                    helperText={websiteError}
                />
            </Box>
            <FormControlLabel
                control={(
                    <Switch
                        checked={business.usesSubcontractors}
                        onChange={(event) => setBusiness({ usesSubcontractors: event.target.checked })}
                    />
                )}
                label="I work with subcontractors when needed"
            />
            <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Languages you speak with customers</Typography>
                <ToggleButtonGroup
                    value={business.languages}
                    onChange={(_, next) => setBusiness({ languages: next })}
                    sx={toggleSx}
                >
                    {LANGUAGES.map((language) => (
                        <ToggleButton key={language} value={language}>{language}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Payment methods</Typography>
                <ToggleButtonGroup
                    value={business.paymentMethods}
                    onChange={(_, next) => setBusiness({ paymentMethods: next })}
                    sx={toggleSx}
                >
                    {PAYMENT_METHODS.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Contact on your trades</Typography>
                <FormControlLabel
                    control={<Switch checked={contact.showPhone} onChange={(event) => setContact({ showPhone: event.target.checked })} />}
                    label="Show my phone on my trades (homeowners get a Call button)"
                />
                <FormControlLabel
                    control={<Switch checked={contact.showEmail} onChange={(event) => setContact({ showEmail: event.target.checked })} />}
                    label="Show my email on my trades"
                />
                <TextField
                    select
                    label="Preferred contact"
                    value={contact.preferred}
                    onChange={(event) => setContact({ preferred: event.target.value })}
                    error={Boolean(contactError)}
                    helperText={contactError || 'CTMASS messages are always available.'}
                    sx={{ maxWidth: { md: 360 } }}
                >
                    {PREFERRED_CONTACTS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Stack>
        </Stack>
    );
}
