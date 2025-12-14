import { useCallback, useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LoadingButton from '@mui/lab/LoadingButton';
import {
    Box,
    Button,
    Checkbox,
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
import { useAuth } from 'src/hooks/use-auth';
import { cabinetApi } from 'src/api/cabinet';
import toast from 'react-hot-toast';

export const DIVERSITY_SECTIONS = [
    {
        title: 'Underrepresented genders & backgrounds',
        options: [
            { value: 'woman', label: 'Woman', icon: '♀️' },
            { value: 'nonBinary', label: 'Non-binary', icon: '⚧️' },
            { value: 'transgender', label: 'Transgender', icon: '🏳️‍⚧️' },
            { value: 'genderFluid', label: 'Gender fluid', icon: '💧' },
            { value: 'personOfColor', label: 'Person of color', icon: '🧑🏾' },
            { value: 'firstGeneration', label: 'First-generation immigrant', icon: '🛬' },
            { value: 'refugee', label: 'Refugee', icon: '🕊️' }
        ]
    },
    {
        title: 'Heritage & community',
        options: [
            { value: 'asian', label: 'Asian descent', icon: '🐉' },
            { value: 'black', label: 'Black descent', icon: '✊🏿' },
            { value: 'hispanic', label: 'Hispanic / Latino', icon: '🪅' },
            { value: 'indigenous', label: 'Indigenous / Native', icon: '🪶' },
            { value: 'middleEastern', label: 'Middle Eastern / North African', icon: '🌍' },
            { value: 'easternEuropean', label: 'Eastern European', icon: '🎻' },
            { value: 'pacificIslander', label: 'Pacific Islander', icon: '🏝️' },
            { value: 'religiousMinority', label: 'Religious minority', icon: '🕌' },
            { value: 'culturalMinority', label: 'Cultural minority', icon: '🏛️' }
        ]
    },
    {
        title: 'Career & Business Focus',
        options: [
            { value: 'founder', label: 'Founder', icon: '👩‍💼' },
            { value: 'startupEmployee', label: 'Startup employee', icon: '🚀' },
            { value: 'smallBusiness', label: 'Small-business owner', icon: '🏪' },
            { value: 'freelancer', label: 'Freelancer / Gig worker', icon: '🧑‍💻' },
            { value: 'artist', label: 'Artist / Creator', icon: '🎨' },
            { value: 'nonProfitWorker', label: 'Non-profit worker', icon: '👐' },
            { value: 'academic', label: 'Academic / Researcher', icon: '📚' }
        ]
    },
    {
        title: 'Specialization & Advocacy',
        options: [
            { value: 'accessibility', label: 'Accessibility advocate', icon: '♿️' },
            { value: 'mentalHealth', label: 'Mental-health advocate', icon: '🧠' },
            { value: 'environmental', label: 'Environmental advocate', icon: '🌿' },
            { value: 'disability', label: 'Disability advocate', icon: '🦽' },
            { value: 'veteran', label: 'Veteran', icon: '🎖️' },
            { value: 'singleParent', label: 'Single parent', icon: '👩‍👧' },
            { value: 'caregiver', label: 'Caregiver', icon: '🤝' },
            { value: 'ruralCommunity', label: 'Rural-community member', icon: '🚜' }
        ]
    }
];

const allOptionValues = DIVERSITY_SECTIONS.flatMap((section) =>
    section.options.map((option) => option.value)
);

export const DIVERSITY_OPTION_MAP = DIVERSITY_SECTIONS.flatMap((section) => section.options)
    .reduce((acc, option) => ({ ...acc, [option.value]: option }), {});

const DIALOG_SUBTITLE =
    'Select all options that describe your background or community involvement. This is optional and may be shown on your public profile.';

export const DiversityModal = ({
    open,
    onClose,
    currentSelection = [],
    onSaved
}) => {
    const { user } = useAuth();
    const theme = useTheme();
    const [selection, setSelection] = useState(currentSelection);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setSelection(currentSelection);
            setSearch('');
        }
    }, [open, currentSelection]);

    const filteredSections = useMemo(() => {
        if (!search.trim()) {
            return DIVERSITY_SECTIONS;
        }

        const q = search.toLowerCase();

        return DIVERSITY_SECTIONS
            .map((sec) => ({
                ...sec,
                options: sec.options.filter((o) =>
                    o.label.toLowerCase().includes(q)
                )
            }))
            .filter((sec) => sec.options.length);
    }, [search]);

    const toggle = useCallback((value, checked) => {
        setSelection((prev) =>
            checked ? Array.from(new Set([...prev, value]))
                : prev.filter((v) => v !== value)
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelection([...new Set(allOptionValues)]);
    }, []);

    const handleClearAll = useCallback(() => {
        setSelection([]);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user) return;
        try {
            setSaving(true);
            await cabinetApi.updateSocialGroups(user.id, selection);
            toast.success('Categories saved');
            onSaved?.(selection);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [selection, user, onSaved, onClose]);

    const selectionCount = selection.length;

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
                                            py: 0,
                                        },
                                        '& .MuiInputAdornment-root': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '100%',
                                            maxHeight: '100%',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: 22,
                                        },
                                    },
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
                                    sx={{ textTransform: 'none', borderRadius: 999 }}
                                >
                                    Select all
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    onClick={handleClearAll}
                                    sx={{ textTransform: 'none', borderRadius: 999 }}
                                >
                                    Clear all
                                </Button>
                            </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            Selected: {selectionCount}
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            pr: { sm: 1 }
                        }}
                    >
                        {filteredSections.length === 0 ? (
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
                                                const checked = selection.includes(option.value);

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
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography component="span" fontSize={20}>
                                                                    {option.icon}
                                                                </Typography>
                                                                <Typography component="span" variant="body2" fontWeight={500}>
                                                                    {option.label}
                                                                </Typography>
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
                                                            minHeight: 64,
                                                            '& .MuiCheckbox-root': {
                                                                alignSelf: 'center'
                                                            },
                                                            '& .MuiFormControlLabel-label': {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: theme.spacing(1)
                                                            },
                                                            '&:hover': {
                                                                borderColor: checked ? 'primary.dark' : alpha(theme.palette.text.primary, 0.2),
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