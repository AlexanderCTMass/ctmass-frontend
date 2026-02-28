import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/paths';

const CertificatesFilters = ({ certificates, filters, onFiltersChange }) => {
    const navigate = useNavigate();

    const institutions = useMemo(() => {
        const set = new Set();
        certificates.forEach((c) => {
            const val = c.institution || c.issuingOrganization;
            if (val) set.add(val);
        });
        return Array.from(set);
    }, [certificates]);

    const documentTypes = useMemo(() => {
        const set = new Set();
        certificates.forEach((c) => {
            const val = c.documentType || c.certificateType;
            if (val) set.add(val);
        });
        return Array.from(set);
    }, [certificates]);

    const hasLinkedTrades = useMemo(() =>
        certificates.some((c) => (c.linkedTradeIds || []).length > 0),
        [certificates]
    );

    const handleSearch = useCallback((e) => {
        onFiltersChange({ search: e.target.value });
    }, [onFiltersChange]);

    const handleDocumentType = useCallback((e) => {
        onFiltersChange({ documentType: e.target.value });
    }, [onFiltersChange]);

    const handleInstitution = useCallback((e) => {
        onFiltersChange({ institution: e.target.value });
    }, [onFiltersChange]);

    const handleAttachedToResume = useCallback((e) => {
        onFiltersChange({ attachedToResume: e.target.value });
    }, [onFiltersChange]);

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
            flexWrap="wrap"
            sx={{ mb: 3 }}
        >
            <TextField
                size="small"
                placeholder="Search by name or specialty"
                value={filters.search || ''}
                onChange={handleSearch}
                sx={{ flex: 1, minWidth: 220 }}
                InputProps={{
                    sx: {
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        '& .MuiInputBase-input': {
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1,
                            py: 0,
                        },
                        '& .MuiInputAdornment-root': {
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            maxHeight: '100%',
                            marginTop: '0 !important'
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: 22,
                        },
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                    )
                }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                    displayEmpty
                    value={filters.documentType || ''}
                    onChange={handleDocumentType}
                    renderValue={(v) => v || 'Document type'}
                >
                    <MenuItem value="">Document type</MenuItem>
                    {documentTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                    displayEmpty
                    value={filters.institution || ''}
                    onChange={handleInstitution}
                    renderValue={(v) => v || 'Institution'}
                >
                    <MenuItem value="">Institution</MenuItem>
                    {institutions.map((inst) => (
                        <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 170 }}>
                <Select
                    displayEmpty
                    value={filters.attachedToResume || ''}
                    onChange={handleAttachedToResume}
                    renderValue={(v) => v || 'Attached to resume'}
                >
                    <MenuItem value="">Attached to resume</MenuItem>
                    <MenuItem value="yes">Attached</MenuItem>
                    <MenuItem value="no">Not attached</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ flexShrink: 0 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(paths.dashboard.certificates.create)}
                    sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                >
                    Add Document
                </Button>
            </Box>
        </Stack>
    );
};

CertificatesFilters.propTypes = {
    certificates: PropTypes.array.isRequired,
    filters: PropTypes.shape({
        search: PropTypes.string,
        documentType: PropTypes.string,
        institution: PropTypes.string,
        attachedToResume: PropTypes.string
    }).isRequired,
    onFiltersChange: PropTypes.func.isRequired
};

export default memo(CertificatesFilters);
