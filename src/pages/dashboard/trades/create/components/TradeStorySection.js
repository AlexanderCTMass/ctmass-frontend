import {
    Card,
    CardContent,
    Stack,
    TextField,
    Typography
} from '@mui/material';

function TradeStorySection({ values, onChange }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700}>
                        Why should customers hire you?
                    </Typography>

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
