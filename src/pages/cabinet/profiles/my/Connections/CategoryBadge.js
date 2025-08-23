import {
    Chip,
} from '@mui/material';
import { CATEGORY_META } from './utils';

export const CategoryBadge = ({ type }) => {
    const meta = CATEGORY_META[type];
    if (!meta) return null;
    return (
        <Chip
            size="small"
            color={meta.color}
            icon={meta.icon}
            label={meta.title}
            sx={{ height: 22 }}
        />
    );
};