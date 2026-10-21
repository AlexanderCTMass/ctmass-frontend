import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ProjectStatus } from 'src/enums/project-state';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';

const AMBER = '#B54708';

const STATUS_STYLES = {
    [ProjectStatus.DRAFT]: { color: BRAND.muted, label: 'Draft' },
    [ProjectStatus.PUBLISHED]: { color: BRAND.navy, label: 'Published' },
    [ProjectStatus.IN_PROGRESS]: { color: AMBER, label: 'In progress' },
    [ProjectStatus.ON_CONFIRM]: { color: AMBER, label: 'Waiting for confirmation' },
    [ProjectStatus.COMPLETED]: { color: BRAND.green, label: 'Completed' },
    [ProjectStatus.ARCHIVED]: { color: BRAND.muted, label: 'Archived' },
    [ProjectStatus.ON_HOLD]: { color: AMBER, label: 'On hold' },
    [ProjectStatus.CANCELLED]: { color: BRAND.danger, label: 'Cancelled' }
};

const ProjectStatusDisplay = ({ status, size = 'medium' }) => {
    if (!status) {
        return null;
    }

    const style = STATUS_STYLES[status] || { color: BRAND.muted, label: status.replace(/_/g, ' ') };

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                height: size === 'small' ? 24 : 28,
                px: size === 'small' ? 1.1 : 1.4,
                borderRadius: RADIUS.pill,
                bgcolor: alpha(style.color, 0.12),
                color: style.color,
                fontSize: size === 'small' ? 12 : 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                '&::before': {
                    content: '""',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: 'currentColor'
                }
            }}
        >
            {style.label}
        </Box>
    );
};

ProjectStatusDisplay.propTypes = {
    status: PropTypes.oneOf(Object.values(ProjectStatus)),
    size: PropTypes.oneOf(['small', 'medium'])
};

export default ProjectStatusDisplay;
