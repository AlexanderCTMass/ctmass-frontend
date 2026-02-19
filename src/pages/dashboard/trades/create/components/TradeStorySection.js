import { useCallback, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { SpecialtySelectForm } from 'src/components/specialty-select-form';

function TradeStorySection({ values, onChange, specialtyOptions = [], priceTypeOptions }) {
    const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);

    const handleOpenSpecialtyModal = useCallback(() => {
        setSpecialtyModalOpen(true);
    }, []);

    const handleCloseSpecialtyModal = useCallback(() => {
        setSpecialtyModalOpen(false);
    }, []);

    const handleSpecialtySelect = useCallback((specialty) => {
        if (specialty) {
            onChange('primarySpecialty', specialty.id || specialty.value);
            onChange('primarySpecialtyLabel', specialty.label || '');
            onChange('primarySpecialtyPath', specialty.fullId || specialty.id || '');
        }
        setSpecialtyModalOpen(false);
    }, [onChange]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700}>
                        Why should customers hire you?
                    </Typography>

                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleOpenSpecialtyModal}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    ":hover": {
                                        backgroundColor: 'rgba(17, 25, 39, 0.04)',
                                        borderColor: 'rgb(229, 231, 235)',
                                    },
                                    height: '57px',
                                    borderColor: 'rgb(229, 231, 235)',
                                    color: values.primarySpecialtyLabel ? 'text.primary' : 'text.secondary'
                                }}
                            >
                                {values.primarySpecialtyLabel || 'Select Primary Specialty'}
                            </Button>
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

            <SpecialtySelectForm
                open={specialtyModalOpen}
                onClose={handleCloseSpecialtyModal}
                onSpecialtyChange={handleSpecialtySelect}
                selectedSpecialties={[]}
                onChange={handleSpecialtySelect}
            />
        </Card>
    );
}

export default TradeStorySection;