import { Stack, Typography, Chip, IconButton, Tooltip, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const OrangeTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
    ({ theme }) => ({
        [`& .${theme.components?.MuiTooltip?.classes?.tooltip || 'MuiTooltip-tooltip'}`]: {
            backgroundColor: 'transparent',
            color: theme.palette.warning.main,
            fontWeight: 500,
            boxShadow: 'none',
            fontSize: 13
        }
    })
);

export const CategoryHeader = ({ meta, count, onAdd }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {meta.title}
            </Typography>
            <Chip size="small" label={count} />
        </Stack>

        {onAdd && (
            <Tooltip title={`Please add your ${meta.title} using their email or phone number`} arrow>
                <IconButton size="small" onClick={onAdd}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Stack>
);