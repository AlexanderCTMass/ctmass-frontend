export const pa = {
    page: '#F3FAF6',
    sidebar: '#E9F7EF',
    sidebarBorder: '#D5EDDF',
    surface: '#FFFFFF',
    surfaceMuted: '#F7FBF9',
    border: '#E2EEE7',
    borderStrong: '#C9DFD2',
    text: '#0B1F14',
    textSecondary: '#4B5F53',
    textMuted: '#7A8B81',
    primary: '#12A150',
    primaryHover: '#0E8A43',
    primarySoft: '#DDF4E6',
    danger: '#D92D20',
    dangerSoft: '#FEE4E2',
    warningSoft: '#FFF4E5',
    warningBorder: '#FEDF89',
    warningText: '#B54708',
    radius: '14px',
    shadow: '0 1px 2px rgba(16, 40, 24, 0.04), 0 4px 16px rgba(16, 40, 24, 0.04)'
};

export const cardSx = {
    bgcolor: pa.surface,
    border: `1px solid ${pa.border}`,
    borderRadius: pa.radius,
    boxShadow: pa.shadow
};

export const primaryButtonSx = {
    bgcolor: pa.primary,
    color: '#fff',
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 700,
    boxShadow: 'none',
    '&:hover': { bgcolor: pa.primaryHover, boxShadow: 'none' }
};

export const outlinedButtonSx = {
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    color: pa.text,
    borderColor: pa.borderStrong,
    bgcolor: pa.surface,
    '&:hover': { borderColor: pa.primary, bgcolor: pa.surfaceMuted }
};

export const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: pa.surface,
        '& fieldset': { borderColor: pa.borderStrong },
        '&:hover fieldset': { borderColor: pa.primary },
        '&.Mui-focused fieldset': { borderColor: pa.primary }
    },
    '& .MuiInputLabel-root.Mui-focused': { color: pa.primaryHover }
};

export const sectionLabelSx = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: pa.textMuted
};
