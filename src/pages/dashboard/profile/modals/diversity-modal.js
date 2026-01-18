import { useCallback, useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LoadingButton from '@mui/lab/LoadingButton';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { cabinetApi } from 'src/api/cabinet';
import { profileApi } from 'src/api/profile'
import {
    SOCIAL_GROUP_OPTION_MAP,
    SOCIAL_GROUP_OPTIONS_FLAT,
    SOCIAL_GROUP_SECTION_ORDER,
    SOCIAL_GROUP_SECTIONS,
    humanizeSocialGroupValue
} from 'src/constants/social-groups';

const DEFAULT_SECTION_BY_VALUE = SOCIAL_GROUP_OPTIONS_FLAT.reduce((acc, option) => {
    acc[option.value] = option.sectionTitle;
    return acc;
}, {});

const RANDOM_ICON_POOL = ['🌟', '🤝', '🏆', '🌱', '💡', '🛠️', '🎯', '🚀', '🧭', '🎓', '🧩', '🛡️', '🏅', '🌈', '⚙️'];

const buildSectionsFromDefinitions = (definitions, extraValues = []) => {
    const options = [];
    const seen = new Set();

    if (Array.isArray(definitions) && definitions.length) {
        definitions.forEach((definition, index) => {
            const rawValue = definition.value || definition.id || definition.name;
            if (!rawValue) {
                return;
            }

            const value = String(rawValue);
            if (seen.has(value)) {
                return;
            }

            const fallback = SOCIAL_GROUP_OPTION_MAP[value] || {};
            const label = definition.label || definition.name || fallback.label || humanizeSocialGroupValue(value);
            const description = definition.description || fallback.description || '';
            const icon = definition.icon || fallback.icon || RANDOM_ICON_POOL[index % RANDOM_ICON_POOL.length];
            const sectionTitle =
                definition.section ||
                fallback.sectionTitle ||
                DEFAULT_SECTION_BY_VALUE[value] ||
                'Additional affiliations';

            options.push({
                value,
                label,
                icon,
                description,
                sectionTitle,
                order: typeof definition.order === 'number' ? definition.order : fallback.order ?? index
            });

            seen.add(value);
        });
    }

    SOCIAL_GROUP_OPTIONS_FLAT.forEach((fallbackOption, index) => {
        if (seen.has(fallbackOption.value)) {
            return;
        }

        options.push({
            value: fallbackOption.value,
            label: fallbackOption.label,
            icon: fallbackOption.icon,
            description: fallbackOption.description,
            sectionTitle: fallbackOption.sectionTitle,
            order: fallbackOption.order ?? options.length + index
        });

        seen.add(fallbackOption.value);
    });

    (extraValues || []).forEach((raw, index) => {
        if (!raw) {
            return;
        }

        const value = String(raw);
        if (seen.has(value)) {
            return;
        }

        const fallback = SOCIAL_GROUP_OPTION_MAP[value] || {};
        const sectionTitle = fallback.sectionTitle || DEFAULT_SECTION_BY_VALUE[value] || 'Additional affiliations';

        options.push({
            value,
            label: fallback.label || humanizeSocialGroupValue(value),
            icon: fallback.icon || RANDOM_ICON_POOL[(options.length + index) % RANDOM_ICON_POOL.length],
            description: fallback.description || '',
            sectionTitle,
            order: Number.MAX_SAFE_INTEGER - (extraValues.length - index)
        });

        seen.add(value);
    });

    const grouped = options.reduce((acc, option) => {
        const key = option.sectionTitle || 'Additional affiliations';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(option);
        return acc;
    }, {});

    return Object.entries(grouped)
        .sort((a, b) => {
            const indexA = SOCIAL_GROUP_SECTION_ORDER.indexOf(a[0]);
            const indexB = SOCIAL_GROUP_SECTION_ORDER.indexOf(b[0]);

            if (indexA === -1 && indexB === -1) {
                return a[0].localeCompare(b[0]);
            }
            if (indexA === -1) {
                return 1;
            }
            if (indexB === -1) {
                return -1;
            }
            return indexA - indexB;
        })
        .map(([title, sectionOptions]) => ({
            title,
            options: sectionOptions
                .sort((a, b) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }
                    return a.label.localeCompare(b.label);
                })
                .map(({ sectionTitle, ...rest }) => rest)
        }));
};

const DIALOG_SUBTITLE = 'Select all options that describe your background or community involvement. This is optional and may be shown on your public profile.';
export const DIVERSITY_SECTIONS = SOCIAL_GROUP_SECTIONS;
export const DIVERSITY_OPTION_MAP = SOCIAL_GROUP_OPTION_MAP;

export const DiversityModal = ({ open, onClose, currentSelection = [], onSaved }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const [selection, setSelection] = useState([]);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [definitions, setDefinitions] = useState(null);
    const [loadingDefinitions, setLoadingDefinitions] = useState(true);
    const [definitionsError, setDefinitionsError] = useState(false);

    useEffect(() => {
        let active = true;

        const loadDefinitions = async () => {
            try {
                const defs = await profileApi.getAllSocialGroups();
                if (!active) {
                    return;
                }
                setDefinitions(defs);
                setDefinitionsError(false);
            } catch (error) {
                console.error(error);
                if (active) {
                    setDefinitions([]);
                    setDefinitionsError(true);
                }
            } finally {
                if (active) {
                    setLoadingDefinitions(false);
                }
            }
        };

        loadDefinitions();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (open) {
            const values = Array.isArray(currentSelection)
                ? currentSelection
                    .map((item) => (typeof item === 'string' ? item : item?.value))
                    .filter(Boolean)
                : [];
            setSelection(values);
            setSearch('');
        }
    }, [open, currentSelection]);

    const extraValues = useMemo(() => {
        const initial = Array.isArray(currentSelection) ? currentSelection : [];
        const formattedInitial = initial
            .map((item) => (typeof item === 'string' ? item : item?.value))
            .filter(Boolean);
        return Array.from(new Set([...formattedInitial, ...(Array.isArray(selection) ? selection : [])]));
    }, [currentSelection, selection]);

    const sections = useMemo(
        () => buildSectionsFromDefinitions(definitions, extraValues),
        [definitions, extraValues]
    );

    const allOptions = useMemo(
        () => sections.flatMap((section) => section.options),
        [sections]
    );

    const optionLookup = useMemo(() => {
        const map = {};
        allOptions.forEach((option) => {
            map[option.value] = option;
        });
        return map;
    }, [allOptions]);

    const allOptionValues = useMemo(
        () => Array.from(new Set(allOptions.map((option) => option.value))),
        [allOptions]
    );

    const filteredSections = useMemo(() => {
        if (!search.trim()) {
            return sections;
        }

        const query = search.trim().toLowerCase();

        return sections
            .map((section) => ({
                ...section,
                options: section.options.filter((option) => {
                    const label = option.label?.toLowerCase() || '';
                    const description = option.description?.toLowerCase() || '';
                    return label.includes(query) || description.includes(query);
                })
            }))
            .filter((section) => section.options.length);
    }, [sections, search]);

    const toggle = useCallback((value, checked) => {
        setSelection((prev) => {
            const prevArray = Array.isArray(prev) ? prev : [];
            if (checked) {
                return Array.from(new Set([...prevArray, value]));
            }
            return prevArray.filter((item) => item !== value);
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!allOptionValues.length) {
            return;
        }

        setSelection(allOptionValues);
    }, [allOptionValues]);

    const handleClearAll = useCallback(() => {
        setSelection([]);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user) {
            return;
        }

        const uniqueSelection = Array.from(new Set(Array.isArray(selection) ? selection : []));
        const payload = uniqueSelection.map((value) => {
            const fromLookup = optionLookup[value] || SOCIAL_GROUP_OPTION_MAP[value] || {};
            return {
                value,
                label: fromLookup.label || humanizeSocialGroupValue(value),
                icon: fromLookup.icon || '🌟',
                description: fromLookup.description || ''
            };
        });

        try {
            setSaving(true);
            await cabinetApi.updateSocialGroups(user.id, payload);
            toast.success('Categories saved');
            onSaved?.(payload);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [selection, user, optionLookup, onSaved, onClose]);

    const selectionCount = Array.isArray(selection) ? selection.length : 0;

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
        >
            <DialogTitle
                sx={{
                    pb: 2,
                    pr: 2
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack spacing={1} pr={1.5}>
                        <Typography variant="h6" fontWeight={700}>
                            Social group &amp; diversity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {DIALOG_SUBTITLE}
                        </Typography>
                    </Stack>

                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            mt: -0.5
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: 0
                }}
            >
                <Stack
                    spacing={3}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        minHeight: { xs: 460, sm: 520 }
                    }}
                >
                    <Stack spacing={1.5}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                            <TextField
                                fullWidth
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search options…"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon color="action" fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        height: 44,
                                        display: 'flex',
                                        alignItems: 'center',
                                        '& .MuiInputBase-input': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            lineHeight: 1,
                                            py: 0
                                        },
                                        '& .MuiInputAdornment-root': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '100%',
                                            maxHeight: '100%'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: 22
                                        }
                                    }
                                }}
                            />

                            <Stack
                                direction="row"
                                spacing={1}
                                justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                            >
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={handleSelectAll}
                                    disabled={!allOptionValues.length || loadingDefinitions}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Select all
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    onClick={handleClearAll}
                                    disabled={loadingDefinitions}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Clear all
                                </Button>
                            </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            Selected: {selectionCount}
                        </Typography>
                        {definitionsError && (
                            <Typography variant="caption" color="error">
                                Failed to load the latest social group list. Displaying defaults.
                            </Typography>
                        )}
                    </Stack>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            pr: { sm: 1 }
                        }}
                    >
                        {loadingDefinitions ? (
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                sx={{ minHeight: 240 }}
                                spacing={2}
                            >
                                <CircularProgress size={28} />
                                <Typography variant="body2" color="text.secondary">
                                    Loading social groups…
                                </Typography>
                            </Stack>
                        ) : filteredSections.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Nothing found
                            </Typography>
                        ) : (
                            <Stack spacing={3}>
                                {filteredSections.map((section) => (
                                    <Stack key={section.title} spacing={1.5}>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {section.title}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gap: 1.25,
                                                gridTemplateColumns: {
                                                    xs: 'repeat(1, minmax(0, 1fr))',
                                                    sm: 'repeat(2, minmax(0, 1fr))',
                                                    md: 'repeat(3, minmax(0, 1fr))'
                                                }
                                            }}
                                        >
                                            {section.options.map((option) => {
                                                const checked = Array.isArray(selection)
                                                    ? selection.includes(option.value)
                                                    : false;

                                                return (
                                                    <FormControlLabel
                                                        key={option.value}
                                                        control={
                                                            <Checkbox
                                                                checked={checked}
                                                                onChange={(e) => toggle(option.value, e.target.checked)}
                                                            />
                                                        }
                                                        label={
                                                            <Stack spacing={0.5}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Typography component="span" fontSize={20}>
                                                                        {option.icon}
                                                                    </Typography>
                                                                    <Typography component="span" variant="body2" fontWeight={500}>
                                                                        {option.label}
                                                                    </Typography>
                                                                </Stack>
                                                            </Stack>
                                                        }
                                                        sx={{
                                                            m: 0,
                                                            px: 1.75,
                                                            py: 1.25,
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: checked ? 'primary.main' : 'divider',
                                                            backgroundColor: checked
                                                                ? alpha(theme.palette.primary.main, 0.08)
                                                                : alpha(theme.palette.common.white, 0.0),
                                                            transition: 'all 0.2s ease',
                                                            alignItems: 'center',
                                                            minHeight: 72,
                                                            '& .MuiCheckbox-root': {
                                                                alignSelf: 'center'
                                                            },
                                                            '& .MuiFormControlLabel-label': {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                gap: theme.spacing(0.5)
                                                            },
                                                            '&:hover': {
                                                                borderColor: checked
                                                                    ? 'primary.dark'
                                                                    : alpha(theme.palette.text.primary, 0.2),
                                                                backgroundColor: checked
                                                                    ? alpha(theme.palette.primary.main, 0.12)
                                                                    : alpha(theme.palette.text.primary, 0.04)
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    px: { xs: 3, sm: 4 },
                    py: 3,
                    justifyContent: 'flex-end',
                    gap: 1.5
                }}
            >
                <Button
                    onClick={onClose}
                    variant="text"
                    sx={{
                        textTransform: 'none',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2
                    }}
                >
                    Cancel
                </Button>
                <LoadingButton
                    loading={saving}
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                        textTransform: 'none',
                        px: 2.75,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: 'none'
                    }}
                >
                    Save selections
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};