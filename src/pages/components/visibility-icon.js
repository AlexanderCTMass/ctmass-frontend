import { IconButton, Tooltip } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export const VisibilityIcon = ({ value, onToggle, isWhite, ...props }) => (
    <Tooltip title={value ? 'Visible to others. Click to hide'
        : 'Hidden from others. Click to show'}>
        <IconButton size="small" onClick={onToggle} style={{ color: `${isWhite ? 'white' : undefined}` }} {...props}>
            {value ? <Visibility fontSize="inherit" /> : <VisibilityOff fontSize="inherit" />}
        </IconButton>
    </Tooltip>
);