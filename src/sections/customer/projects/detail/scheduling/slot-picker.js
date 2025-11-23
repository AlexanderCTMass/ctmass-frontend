import {
    Alert,
    ButtonBase,
    Chip,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import { TIME_OF_DAY_LABELS } from './utils';

export const SlotPicker = ({
    slots,
    selectedIds,
    onToggle,
    disabled
}) => {
    if (!slots.length) {
        return (
            <Alert severity="info">
                There are no available slots for the selected range. Try another date or adjust filters.
            </Alert>
        );
    }

    return (
        <Grid container spacing={2}>
            {slots.map((slot) => {
                const isSelected = selectedIds.includes(slot.id);
                const dateStart = new Date(slot.start);
                const dateEnd = new Date(slot.end);

                return (
                    <Grid item xs={12} sm={6} md={4} key={slot.id}>
                        <ButtonBase
                            disabled={disabled}
                            onClick={() => onToggle(slot.id)}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                borderWidth: 2,
                                borderStyle: 'solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                                color: isSelected ? 'primary.contrastText' : 'text.primary',
                                p: 2,
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: isSelected ? 'primary.main' : 'primary.light',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {format(dateStart, 'EEE, dd MMM')}
                                </Typography>
                                <Typography variant="body2">
                                    {format(dateStart, 'HH:mm')} — {format(dateEnd, 'HH:mm')}
                                </Typography>
                                <Chip
                                    label={TIME_OF_DAY_LABELS[slot.timeOfDay] || 'Flexible'}
                                    size="small"
                                    sx={{ width: 'fit-content' }}
                                />
                                {isSelected && (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CheckIcon fontSize="small" />
                                        <Typography variant="caption">
                                            Selected
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </ButtonBase>
                    </Grid>
                );
            })}
        </Grid>
    );
};

SlotPicker.propTypes = {
    slots: PropTypes.array.isRequired,
    selectedIds: PropTypes.array.isRequired,
    onToggle: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};