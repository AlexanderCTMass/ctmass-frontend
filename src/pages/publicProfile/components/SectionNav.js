import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
    List,
    ListItemButton,
    ListItemText,
    Paper
} from '@mui/material';

const SectionNav = ({ sections, activeId, onSectionClick }) => {
    if (!sections.length) {
        return null;
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                position: { md: 'sticky' },
                top: { md: 120 },
                display: { xs: 'none', md: 'block' },
                backgroundColor: 'background.paper'
            }}
        >
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sections.map((section) => (
                    <ListItemButton
                        key={section.id}
                        selected={activeId === section.id}
                        onClick={() => onSectionClick(section.id)}
                        sx={{
                            borderRadius: 2,
                            px: 2,
                            py: 1.25,
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                                color: (theme) => theme.palette.primary.main,
                                boxShadow: (theme) => theme.shadows[1],
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.18)
                                }
                            }
                        }}
                    >
                        <ListItemText
                            primary={section.label}
                            primaryTypographyProps={{
                                fontWeight: activeId === section.id ? 600 : 500,
                                fontSize: 14
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

SectionNav.propTypes = {
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    activeId: PropTypes.string,
    onSectionClick: PropTypes.func.isRequired
};

SectionNav.defaultProps = {
    activeId: null
};

export default SectionNav;