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
        title: 'Company & Leadership',
        options: [
            { value: 'ownerFounder', label: 'Owner / Founder', icon: '👑' },
            { value: 'managingDirector', label: 'Managing Director', icon: '📊' },
            { value: 'companyPrincipal', label: 'Company Principal', icon: '🏢' },
            { value: 'operationsManager', label: 'Operations Manager', icon: '🛠️' }
        ]
    },
    {
        title: 'Project & Construction Management',
        options: [
            { value: 'constructionManager', label: 'Construction Manager', icon: '🏗️' },
            { value: 'projectManager', label: 'Project Manager', icon: '📋' },
            { value: 'assistantProjectManager', label: 'Assistant Project Manager', icon: '🧾' },
            { value: 'siteSuperintendent', label: 'Site Superintendent', icon: '🧰' },
            { value: 'constructionSupervisor', label: 'Construction Supervisor (CSL)', icon: '🛡️' },
            { value: 'foremanLeadTechnician', label: 'Foreman / Lead Technician', icon: '👷‍♂️' }
        ]
    },
    {
        title: 'Engineering & Technical Professionals',
        options: [
            { value: 'fieldEngineer', label: 'Field Engineer', icon: '🧭' },
            { value: 'mechanicalEngineer', label: 'Mechanical Engineer', icon: '⚙️' },
            { value: 'electricalEngineer', label: 'Electrical Engineer', icon: '💡' },
            { value: 'hvacEngineer', label: 'HVAC Engineer', icon: '❄️' },
            { value: 'buildingSystemsEngineer', label: 'Building Systems Engineer', icon: '🏢' },
            { value: 'controlsAutomationEngineer', label: 'Controls / Automation Engineer', icon: '🤖' },
            { value: 'commissioningEngineer', label: 'Commissioning Engineer', icon: '✅' }
        ]
    },
    {
        title: 'Licensed Trades',
        options: [
            { value: 'hvacMechanical', label: 'HVAC & Mechanical', icon: '🌬️' },
            { value: 'hvacTechnician', label: 'HVAC Technician', icon: '🛠️' },
            { value: 'hvacInstaller', label: 'HVAC Installer', icon: '🔧' },
            { value: 'refrigerationTechnician', label: 'Refrigeration Technician', icon: '🧊' },
            { value: 'boilerTechnician', label: 'Boiler Technician', icon: '🔥' },
            { value: 'sheetMetalMechanic', label: 'Sheet Metal Mechanic', icon: '🔩' },
            { value: 'controlsTechnician', label: 'Controls Technician', icon: '🎛️' }
        ]
    },
    {
        title: 'Electrical',
        options: [
            { value: 'electricianJourneymanMaster', label: 'Electrician (Journeyman / Master)', icon: '⚡' },
            { value: 'lowVoltageTechnician', label: 'Low Voltage Technician', icon: '🔌' },
            { value: 'fireAlarmTechnician', label: 'Fire Alarm Technician', icon: '🚨' },
            { value: 'solarTechnician', label: 'Solar Technician', icon: '☀️' },
            { value: 'plumbingPiping', label: 'Plumbing & Piping', icon: '🚰' },
            { value: 'plumberJourneymanMaster', label: 'Plumber (Journeyman / Master)', icon: '🔧' },
            { value: 'pipefitter', label: 'Pipefitter', icon: '🛠️' },
            { value: 'steamfitter', label: 'Steamfitter', icon: '♨️' },
            { value: 'gasFitter', label: 'Gas Fitter', icon: '🔥' }
        ]
    },
    {
        title: 'General Construction',
        options: [
            { value: 'carpenter', label: 'Carpenter', icon: '🪚' },
            { value: 'finishCarpenter', label: 'Finish Carpenter', icon: '🪵' },
            { value: 'framer', label: 'Framer', icon: '📐' },
            { value: 'drywallInstaller', label: 'Drywall Installer', icon: '🧱' },
            { value: 'masonBricklayer', label: 'Mason / Bricklayer', icon: '🧱' },
            { value: 'concreteFinisher', label: 'Concrete Finisher', icon: '🪨' },
            { value: 'roofer', label: 'Roofer', icon: '🏠' }
        ]
    },
    {
        title: 'Specialty Trades & Systems',
        options: [
            { value: 'buildingAutomationSpecialist', label: 'Building Automation Specialist', icon: '🕹️' },
            { value: 'fireProtectionTechnician', label: 'Fire Protection Technician', icon: '🧯' },
            { value: 'securitySystemsTechnician', label: 'Security Systems Technician', icon: '🔒' },
            { value: 'accessControlTechnician', label: 'Access Control Technician', icon: '🛑' },
            { value: 'audioVisualTechnician', label: 'Audio / Visual Technician', icon: '🎛️' },
            { value: 'insulationTechnician', label: 'Insulation Technician', icon: '🧤' },
            { value: 'waterproofingSpecialist', label: 'Waterproofing Specialist', icon: '💧' }
        ]
    },
    {
        title: 'Service, Maintenance & Facilities',
        options: [
            { value: 'maintenanceTechnician', label: 'Maintenance Technician', icon: '🧰' },
            { value: 'buildingEngineer', label: 'Building Engineer', icon: '🏢' },
            { value: 'facilitiesTechnician', label: 'Facilities Technician', icon: '🏗️' },
            { value: 'serviceTechnician', label: 'Service Technician', icon: '🛎️' },
            { value: 'preventiveMaintenanceTechnician', label: 'Preventive Maintenance Technician', icon: '🔄' },
            { value: 'emergencyRepairTechnician', label: 'Emergency Repair Technician', icon: '🚑' }
        ]
    },
    {
        title: 'Estimating, Sales & Procurement',
        options: [
            { value: 'estimator', label: 'Estimator', icon: '📊' },
            { value: 'salesEngineer', label: 'Sales Engineer', icon: '🛒' },
            { value: 'projectSalesManager', label: 'Project Sales Manager', icon: '🤝' },
            { value: 'businessDevelopmentManager', label: 'Business Development Manager', icon: '📈' },
            { value: 'purchasingSpecialist', label: 'Purchasing / Procurement Specialist', icon: '🧾' }
        ]
    },
    {
        title: 'Safety, Quality & Compliance',
        options: [
            { value: 'safetyManager', label: 'Safety Manager', icon: '🦺' },
            { value: 'siteSafetyOfficer', label: 'Site Safety Officer', icon: '🚧' },
            { value: 'oshaComplianceSpecialist', label: 'OSHA Compliance Specialist', icon: '📋' },
            { value: 'qualityControlManager', label: 'Quality Control Manager', icon: '✅' },
            { value: 'tradeInspector', label: 'Trade Inspector', icon: '🔍' }
        ]
    },
    {
        title: 'Administrative & Support',
        options: [
            { value: 'officeManager', label: 'Office Manager', icon: '🗂️' },
            { value: 'projectAdministrator', label: 'Project Administrator', icon: '📝' },
            { value: 'schedulerPlanner', label: 'Scheduler / Planner', icon: '🗓️' },
            { value: 'accountingPayrollSpecialist', label: 'Accounting & Payroll Specialist', icon: '💵' },
            { value: 'contractAdministrator', label: 'Contract Administrator', icon: '📄' }
        ]
    },
    {
        title: 'Entry-Level & Workforce Development',
        options: [
            { value: 'entryApprentice', label: 'Apprentice', icon: '🧑‍🏭' },
            { value: 'helperLaborer', label: 'Helper / Laborer', icon: '🧰' },
            { value: 'juniorTechnician', label: 'Junior Technician', icon: '🔧' },
            { value: 'engineeringConstructionIntern', label: 'Engineering or Construction Intern', icon: '🎓' }
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
                                    sx={{ textTransform: 'none' }}
                                >
                                    Select all
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    onClick={handleClearAll}
                                    sx={{ textTransform: 'none' }}
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