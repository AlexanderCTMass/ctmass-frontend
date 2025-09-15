import { Stack, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export const CategoryHeader = ({ meta, count, onAdd }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {meta.title}
            </Typography>
            <Chip size="small" label={count} />
        </Stack>

        {onAdd && (
            <Tooltip title="Invite to this category">
                <IconButton size="small" onClick={onAdd}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Stack>
);