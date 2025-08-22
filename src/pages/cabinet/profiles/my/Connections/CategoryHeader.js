import {
    Stack,
    Typography,
    Chip,
} from '@mui/material';

export const CategoryHeader = ({ meta, count }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    {meta.title}
                </Typography>
                <Chip size="small" label={count} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
                {meta.description}
            </Typography>
        </Stack>
    </Stack>
);