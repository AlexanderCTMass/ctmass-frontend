import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { focusRingSx } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const SectionNav = ({ sections, activeId, onSectionClick }) => {
    if (!sections.length) {
        return null;
    }

    return (
        <Box
            component="nav"
            aria-label="Profile sections"
            sx={{
                position: 'sticky',
                top: { xs: 90, md: 120 },
                zIndex: 5,
                mx: { xs: -2, md: 0 },
                px: { xs: 2, md: 1 },
                py: { xs: 1, md: 1 },
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                gap: { xs: 0.75, md: 0.25 },
                overflowX: { xs: 'auto', md: 'visible' },
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                bgcolor: { xs: alpha(BRAND.mist, 0.92), md: '#FFFFFF' },
                backdropFilter: { xs: 'blur(10px)', md: 'none' },
                borderRadius: { xs: 0, md: RADIUS.card },
                border: { xs: 0, md: `1px solid ${alpha(BRAND.navy, 0.08)}` },
                boxShadow: { xs: 'none', md: SHADOW.sm }
            }}
        >
            {sections.map((section) => {
                const active = activeId === section.id;

                return (
                    <Box
                        key={section.id}
                        component="button"
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => onSectionClick(section.id)}
                        sx={{
                            position: 'relative',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: { xs: 38, md: 42 },
                            px: { xs: 1.75, md: 2 },
                            border: { xs: `1px solid ${active ? BRAND.navy : alpha(BRAND.navy, 0.12)}`, md: 0 },
                            borderRadius: { xs: RADIUS.pill, md: '12px' },
                            bgcolor: {
                                xs: active ? BRAND.navy : '#FFFFFF',
                                md: active ? alpha(BRAND.navy, 0.07) : 'transparent'
                            },
                            color: { xs: active ? '#FFFFFF' : BRAND.navy, md: active ? BRAND.navy : BRAND.muted },
                            font: 'inherit',
                            fontSize: 14,
                            fontWeight: active ? 700 : 600,
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color .2s ease, color .2s ease',
                            '&::before': {
                                content: '""',
                                display: { xs: 'none', md: 'block' },
                                position: 'absolute',
                                left: 0,
                                top: 10,
                                bottom: 10,
                                width: 3,
                                borderRadius: 3,
                                bgcolor: active ? BRAND.green : 'transparent',
                                transition: 'background-color .2s ease'
                            },
                            '&:hover': { color: { xs: active ? '#FFFFFF' : BRAND.navy, md: BRAND.navy }, bgcolor: { md: alpha(BRAND.navy, 0.05) } },
                            ...focusRingSx
                        }}
                    >
                        {section.label}
                    </Box>
                );
            })}
        </Box>
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
