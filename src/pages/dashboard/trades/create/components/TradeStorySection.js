import { useCallback } from 'react';
import {
    Card,
    CardContent,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';

function TradeStorySection({ values, onChange, specialtyOptions = [], priceTypeOptions }) {
    const filteredSpecialties = specialtyOptions.filter((option) => option?.value && option?.label);

    const handlePrimarySpecialtyChange = useCallback((event) => {
        const nextValue = event.target.value;
        onChange('primarySpecialty', nextValue);

        const selectedOption = specialtyOptions?.find?.((option) => option.value === nextValue);
        onChange('primarySpecialtyLabel', selectedOption?.label || '');
        onChange('primarySpecialtyPath', selectedOption?.fullId || '');
    }, [onChange, specialtyOptions]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700}>
                        Why should customers hire you?
                    </Typography>

                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Primary specialty"
                                select
                                fullWidth
                                value={values.primarySpecialty}
                                onChange={handlePrimarySpecialtyChange}
                                SelectProps={{ displayEmpty: true }}
                            >
                                <MenuItem value="">
                                </MenuItem>
                                {filteredSpecialties.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3} p={1}>
                            <TextField
                                label="Price Type"
                                select
                                fullWidth
                                value={values.priceType}
                                onChange={(event) => onChange('priceType', event.target.value)}
                                SelectProps={{ displayEmpty: false }}
                            >
                                {priceTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3} p={1}>
                            <TextField
                                label="Average Price"
                                fullWidth
                                value={values.price}
                                onChange={(event) => onChange('price', event.target.value)}
                                placeholder="$120"
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Trade Title"
                        fullWidth
                        value={values.tradeTitle}
                        onChange={(event) => onChange('tradeTitle', event.target.value)}
                        placeholder="Plumber with 10 years experience"
                    />

                    <TextField
                        label="About your trade (up to 2000 characters)"
                        multiline
                        minRows={6}
                        fullWidth
                        value={values.about}
                        onChange={(event) => onChange('about', event.target.value)}
                        placeholder="Explain what makes your business stand out and why you'll do a great job."
                    />

                    <TextField
                        label="Short Description (up to 500 characters)"
                        multiline
                        minRows={4}
                        fullWidth
                        value={values.shortDescription}
                        onChange={(event) => onChange('shortDescription', event.target.value)}
                        placeholder="Summarize why customers should pick your trade."
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradeStorySection;