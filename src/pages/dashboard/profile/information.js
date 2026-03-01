import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { cabinetApi } from 'src/api/cabinet';
import { AddressAutoComplete } from 'src/components/address/AddressAutoComplete';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useSettings } from 'src/hooks/use-settings';
import { paths } from 'src/paths';
import { storage } from 'src/libs/firebase';
import { PROFESSIONAL_ROLE_OPTIONS } from 'src/constants/professional-role-options';
import { DiversityModal } from './modals/diversity-modal';
import { AiAvatarModal } from './modals/ai-avatar-modal';
import { SOCIAL_GROUP_OPTION_MAP, humanizeSocialGroupValue } from 'src/constants/social-groups';

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const DEFAULT_ADDRESS_CENTER = [-95.7129, 37.0902];

const createFeatureFromAddressString = (address) => {
    if (!address) {
        return null;
    }

    return {
        id: `manual-${address}`,
        place_name: address,
        center: DEFAULT_ADDRESS_CENTER
    };
};

const ensureFeatureHasCenter = (feature, fallbackLabel = '') => {
    if (!feature) {
        return null;
    }

    if (Array.isArray(feature.center) && feature.center.length === 2) {
        return feature;
    }

    const geometryCoords = feature.geometry?.coordinates;
    if (Array.isArray(geometryCoords) && geometryCoords.length >= 2) {
        return {
            ...feature,
            center: [geometryCoords[0], geometryCoords[1]]
        };
    }

    return {
        ...feature,
        center: DEFAULT_ADDRESS_CENTER,
        place_name: feature.place_name || fallbackLabel
    };
};

const mapSocialGroupEntry = (item) => {
    if (!item) {
        return null;
    }

    if (typeof item === 'string') {
        const fallback = SOCIAL_GROUP_OPTION_MAP[item] || {};
        return {
            value: item,
            label: fallback.label || humanizeSocialGroupValue(item),
            icon: fallback.icon || '🌟',
            description: fallback.description || ''
        };
    }

    if (typeof item === 'object') {
        const value = item.value || item.id || item.name || '';
        if (!value) {
            return null;
        }
        const fallback = SOCIAL_GROUP_OPTION_MAP[value] || {};
        return {
            value,
            label: item.label || fallback.label || humanizeSocialGroupValue(value),
            icon: item.icon || fallback.icon || '🌟',
            description: item.description || fallback.description || ''
        };
    }

    return null;
};

const normalizeSocialGroups = (groups) => {
    if (!Array.isArray(groups)) {
        return [];
    }

    const seen = new Set();
    const result = [];

    groups.forEach((item) => {
        const mapped = mapSocialGroupEntry(item);
        if (mapped && !seen.has(mapped.value)) {
            seen.add(mapped.value);
            result.push(mapped);
        }
    });

    return result;
};

const defaultFormValues = {
    avatar: '',
    fullName: '',
    displayName: '',
    primaryEmail: '',
    secondaryEmail: '',
    emailVerified: false,
    phoneCountry: 'US',
    phoneNumber: '',
    phoneVerified: false,
    aiAvatarGenerationsLeft: 5,
    companyName: '',
    professionalRole: '',
    shortBio: '',
    primaryAddress: '',
    primaryAddressLocation: null,
    timeZone: '(GMT-05:00) Eastern Time (US & Canada)',
    faq: [],
    socialGroups: []
};

const COUNTRY_OPTIONS = [
    { code: 'US', label: 'United States (+1)' },
    { code: 'CA', label: 'Canada (+1)' },
    { code: 'MX', label: 'Mexico (+52)' }
];

const TIMEZONE_OPTIONS = [
    '(GMT-05:00) Eastern Time (US & Canada)',
    '(GMT-06:00) Central Time (US & Canada)',
    '(GMT-08:00) Pacific Time (US & Canada)',
    '(GMT+00:00) London',
    '(GMT+03:00) Eastern Europe'
];

const faqItemFactory = () => ({
    id: crypto.randomUUID(),
    question: '',
    answer: ''
});

const AVATAR_EDGE = 176;

const ProfileInformationPage = () => {
    const { user } = useAuth();
    const settings = useSettings();
    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
    const [formValues, setFormValues] = useState(defaultFormValues);
    const [initialValues, setInitialValues] = useState(defaultFormValues);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [diversityModalOpen, setDiversityModalOpen] = useState(false);
    const [aiAvatarModalOpen, setAiAvatarModalOpen] = useState(false);

    const layoutIsHorizontal = settings.layout === 'horizontal';

    const fetchProfile = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            setLoading(true);
            const profile = await cabinetApi.getProfileInformation(user.id);
            const cloned = deepClone(profile);

            cloned.socialGroups = normalizeSocialGroups(cloned.socialGroups);

            const normalizedPrimaryAddressLocation =
                cloned.primaryAddressLocation && typeof cloned.primaryAddressLocation === 'object'
                    ? cloned.primaryAddressLocation
                    : (cloned.primaryAddress && typeof cloned.primaryAddress === 'object' ? cloned.primaryAddress : null);

            const normalizedPrimaryAddress =
                typeof cloned.primaryAddress === 'string'
                    ? cloned.primaryAddress
                    : normalizedPrimaryAddressLocation?.place_name || '';

            const safePrimaryAddressLocation = ensureFeatureHasCenter(
                normalizedPrimaryAddressLocation,
                normalizedPrimaryAddress
            );

            cloned.primaryAddressLocation = safePrimaryAddressLocation;
            cloned.primaryAddress = normalizedPrimaryAddress;

            setFormValues(cloned);
            setInitialValues(deepClone(cloned));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile information');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(formValues) !== JSON.stringify(initialValues);
    }, [formValues, initialValues]);

    const handleFieldChange = useCallback((field) => (event) => {
        const value = event?.target?.value ?? '';
        setFormValues((prev) => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleFaqChange = useCallback((id, field, value) => {
        setFormValues((prev) => ({
            ...prev,
            faq: prev.faq.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        }));
    }, []);

    const handleFaqAdd = useCallback(() => {
        setFormValues((prev) => ({
            ...prev,
            faq: [...prev.faq, faqItemFactory()]
        }));
    }, []);

    const handleFaqRemove = useCallback((id) => {
        setFormValues((prev) => ({
            ...prev,
            faq: prev.faq.filter((item) => item.id !== id)
        }));
    }, []);

    const handleCancel = useCallback(() => {
        setFormValues(deepClone(initialValues));
        toast.success('Changes reverted');
    }, [initialValues]);

    const handleSave = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            setSaving(true);
            const payload = deepClone(formValues);
            payload.primaryAddress = payload.primaryAddress || payload.primaryAddressLocation?.place_name || '';
            if (!payload.primaryAddressLocation) {
                payload.primaryAddressLocation = null;
            }
            payload.socialGroups = normalizeSocialGroups(payload.socialGroups);

            await cabinetApi.saveProfileInformation(user.id, payload);
            setInitialValues(deepClone(payload));
            toast.success('Changes saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }, [formValues, user]);

    const handlePreview = useCallback(() => {
        if (!user) {
            return;
        }

        const url = paths.specialist.publicPage.replace(':profileId', user.id);
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [user]);

    const openDiversityModal = useCallback(() => setDiversityModalOpen(true), []);
    const closeDiversityModal = useCallback(() => setDiversityModalOpen(false), []);

    const openAiAvatarModal = useCallback(() => setAiAvatarModalOpen(true), []);
    const closeAiAvatarModal = useCallback(() => setAiAvatarModalOpen(false), []);

    const handleDiversitySaved = useCallback((list) => {
        const normalized = normalizeSocialGroups(list);
        setFormValues((prev) => ({ ...prev, socialGroups: normalized }));
        setInitialValues((prev) => ({
            ...prev,
            socialGroups: deepClone(normalized)
        }));
    }, []);

    const handleAiGenerationsChange = useCallback((left) => {
        setFormValues((prev) => ({ ...prev, aiAvatarGenerationsLeft: left }));
        setInitialValues((prev) => ({ ...prev, aiAvatarGenerationsLeft: left }));
    }, []);

    const handleAiAvatarApplied = useCallback((url, generationsLeft) => {
        setFormValues((prev) => ({ ...prev, avatar: url, aiAvatarGenerationsLeft: generationsLeft }));
        setInitialValues((prev) => ({ ...prev, avatar: url, aiAvatarGenerationsLeft: generationsLeft }));
    }, []);

    const handleAvatarButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAvatarUpload = useCallback(
        async (event) => {
            if (!user) {
                return;
            }

            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            try {
                setAvatarUploading(true);
                const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                await cabinetApi.updateAvatar(user.id, url);
                setFormValues((prev) => ({ ...prev, avatar: url }));
                setInitialValues((prev) => ({ ...prev, avatar: url }));
                toast.success('Avatar updated');
            } catch (error) {
                console.error(error);
                toast.error('Failed to upload avatar');
            } finally {
                setAvatarUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [user]
    );

    const primaryAddressFeature = useMemo(() => {
        if (formValues.primaryAddressLocation) {
            return ensureFeatureHasCenter(formValues.primaryAddressLocation, formValues.primaryAddress);
        }

        return createFeatureFromAddressString(formValues.primaryAddress);
    }, [formValues.primaryAddressLocation, formValues.primaryAddress]);

    const handlePrimaryAddressSelect = useCallback((place) => {
        if (!place) {
            setFormValues((prev) => ({
                ...prev,
                primaryAddress: '',
                primaryAddressLocation: null
            }));
            return;
        }

        const normalizedPlace = ensureFeatureHasCenter(place);

        setFormValues((prev) => ({
            ...prev,
            primaryAddress: normalizedPlace?.place_name ?? '',
            primaryAddressLocation: normalizedPlace
        }));
    }, []);

    const actionBarStyles = {
        position: 'fixed',
        bottom: 0,
        left: {
            xs: 0,
            lg: layoutIsHorizontal ? 0 : 280
        },
        width: {
            xs: '100%',
            lg: layoutIsHorizontal ? '100%' : 'calc(100% - 280px)'
        },
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: (t) => alpha(t.palette.background.paper, 0.94),
        backdropFilter: 'blur(12px)',
        zIndex: (t) => t.zIndex.drawer + 1,
        px: { xs: 2, md: 4, lg: 6 },
        py: 2
    };

    if (loading) {
        return (
            <>
                <Seo title="Profile settings — Information" />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh'
                    }}
                >
                    <CircularProgress />
                </Box>
            </>
        );
    }

    return (
        <>
            <Seo title="Profile settings — Information" />
            <Box
                component="main"
                sx={{
                    px: { xs: 2, sm: 3, lg: 6 },
                    py: { xs: 7, sm: 8 },
                    pb: { xs: '220px', sm: '100px', md: '144px' },
                    maxWidth: 1280,
                    // mx: 'auto'
                }}
            >
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700}>
                            Profile settings
                        </Typography>
                    </Stack>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={4} paddingRight={2}>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <AccountCircleOutlinedIcon color="primary" />
                                        <Typography variant="h6">Profile Information</Typography>
                                    </Stack>

                                    <Grid
                                        container
                                        spacing={{ xs: 3, md: 4 }}
                                        alignItems={isMdDown ? 'flex-start' : 'stretch'}
                                    >
                                        <Grid item xs={12} md={2}>
                                            <Stack spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                                                <Box
                                                    sx={{
                                                        width: AVATAR_EDGE,
                                                        height: AVATAR_EDGE,
                                                        borderRadius: 4,
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {formValues.avatar ? (
                                                        <Box
                                                            component="img"
                                                            src={formValues.avatar}
                                                            alt="Avatar"
                                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            component="img"
                                                            src="/assets/avatars/defaultUser.jpg"
                                                            alt="Default avatar"
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                <input
                                                    hidden
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Stack spacing={1.5} sx={{ height: '100%' }}>
                                                <Stack
                                                    direction={{ xs: 'column', sm: 'row' }}
                                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                                    flexWrap="wrap"
                                                    flexDirection="row"
                                                >
                                                    <LoadingButton
                                                        loading={avatarUploading}
                                                        startIcon={<PhotoCameraIcon />}
                                                        variant="contained"
                                                        onClick={handleAvatarButtonClick}
                                                        sx={{ minWidth: 160, mb: 1 }}
                                                    >
                                                        Upload
                                                    </LoadingButton>
                                                    <Button
                                                        startIcon={<AutoAwesomeIcon />}
                                                        variant="outlined"
                                                        onClick={openAiAvatarModal}
                                                        sx={{ minWidth: 200 }}
                                                    >
                                                        AI-Generate Avatar
                                                    </Button>
                                                </Stack>

                                                <Typography variant="caption" color="text.secondary">
                                                    {formValues.aiAvatarGenerationsLeft} Generations left today
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={5}>
                                            <Stack spacing={1} sx={{ height: '100%' }}>
                                                <Typography variant="subtitle2">
                                                    Social group &amp; diversity
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
                                                    {(formValues.socialGroups || []).length === 0 && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            No categories selected
                                                        </Typography>
                                                    )}
                                                    {(formValues.socialGroups || []).map((group) => {
                                                        const normalized = mapSocialGroupEntry(group);
                                                        if (!normalized) {
                                                            return null;
                                                        }
                                                        return (
                                                            <Chip
                                                                key={normalized.value}
                                                                label={normalized.label}
                                                                size="small"
                                                                avatar={
                                                                    <Avatar
                                                                        sx={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            fontSize: 14,
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                                        }}
                                                                    >
                                                                        {normalized.icon}
                                                                    </Avatar>
                                                                }
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        );
                                                    })}
                                                    <Tooltip title="Add social category">
                                                        <IconButton
                                                            color="primary"
                                                            size="small"
                                                            onClick={openDiversityModal}
                                                            sx={{
                                                                border: 1,
                                                                borderColor: 'divider',
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.16)
                                                                }
                                                            }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Full Name
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Full name"
                                                value={formValues.fullName}
                                                onChange={handleFieldChange('fullName')}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Display Name
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Display name"
                                                value={formValues.displayName}
                                                onChange={handleFieldChange('displayName')}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Primary Email
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Primary email"
                                                value={formValues.primaryEmail}
                                                onChange={handleFieldChange('primaryEmail')}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Chip
                                                                label={formValues.emailVerified ? 'Verified' : 'Unverified'}
                                                                color={formValues.emailVerified ? 'success' : 'warning'}
                                                                size="small"
                                                                variant="soft"
                                                            />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Secondary Email
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Secondary email"
                                                value={formValues.secondaryEmail}
                                                onChange={handleFieldChange('secondaryEmail')}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Button
                                                                size="small"
                                                                color="primary"
                                                                variant="text"
                                                                onClick={() => toast.success('Verification email sent')}
                                                                sx={{ textTransform: 'none', px: 1, minWidth: 'auto' }}
                                                            >
                                                                Resend verification
                                                            </Button>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Phone Number
                                            </Typography>
                                            <Grid sx={{ display: 'flex' }} gap={1} flex-direction='row'>
                                                <TextField
                                                    sx={{ mt: 1.5, mb: 1 }}
                                                    select
                                                    label="Country"
                                                    value={formValues.phoneCountry}
                                                    onChange={handleFieldChange('phoneCountry')}
                                                >
                                                    {COUNTRY_OPTIONS.map((option) => (
                                                        <MenuItem key={option.code} value={option.code}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                <TextField
                                                    sx={{ mt: 1.5, mb: 1 }}
                                                    fullWidth
                                                    label="Phone number"
                                                    value={formValues.phoneNumber}
                                                    onChange={handleFieldChange('phoneNumber')}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Chip
                                                                        label={formValues.phoneVerified ? 'Verified' : 'Unverified'}
                                                                        color={formValues.phoneVerified ? 'success' : 'warning'}
                                                                        size="small"
                                                                        variant="soft"
                                                                    />
                                                                    <Button
                                                                        size="small"
                                                                        variant="text"
                                                                        onClick={() => toast('OTP sent')}
                                                                        sx={{ textTransform: 'none', px: 1, minWidth: 'auto' }}
                                                                    >
                                                                        Send code
                                                                    </Button>
                                                                </Stack>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3} paddingRight={2}>
                                <Typography variant="h6">Business / Professional info</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Company / Business name (optional)
                                        </Typography>
                                        <TextField
                                            sx={{ mt: 1.5, mb: 1 }}
                                            fullWidth
                                            label="Company / Business name"
                                            placeholder="Acme Inc."
                                            value={formValues.companyName}
                                            onChange={handleFieldChange('companyName')}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Company Professional role
                                        </Typography>
                                        <TextField
                                            sx={{ mt: 1.5, mb: 1 }}
                                            select
                                            fullWidth
                                            label="Professional role"
                                            value={formValues.professionalRole}
                                            onChange={handleFieldChange('professionalRole')}
                                        >
                                            {PROFESSIONAL_ROLE_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Short Bio (1000 chars)
                                        </Typography>
                                        <TextField
                                            sx={{ mt: 1.5, mb: 1 }}
                                            fullWidth
                                            multiline
                                            minRows={4}
                                            label="Short bio"
                                            placeholder="Tell us about yourself"
                                            value={formValues.shortBio}
                                            onChange={handleFieldChange('shortBio')}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3} paddingRight={2}>
                                <Typography variant="h6">Location</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                            Primary service address
                                        </Typography>
                                        <AddressAutoComplete
                                            location={primaryAddressFeature}
                                            handleSuggestionClick={handlePrimaryAddressSelect}
                                            withMap={false}
                                            label="Primary service address"
                                            placeholder="Start typing your primary service address"
                                            textFieldProps={{
                                                helperText: 'Autocomplete works with United States addresses only.',
                                                InputProps: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <PlaceOutlinedIcon fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Time Zone
                                        </Typography>
                                        <TextField
                                            sx={{ mt: 1.5, mb: 1 }}
                                            select
                                            fullWidth
                                            label="Time zone"
                                            value={formValues.timeZone}
                                            onChange={handleFieldChange('timeZone')}
                                        >
                                            {TIMEZONE_OPTIONS.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">Frequently Asked Questions</Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        variant="outlined"
                                        onClick={handleFaqAdd}
                                    >
                                        Add FAQ item
                                    </Button>
                                </Stack>

                                <Stack spacing={2}>
                                    {(formValues.faq || []).length === 0 && (
                                        <Box
                                            sx={{
                                                borderRadius: 2,
                                                border: '1px dashed',
                                                borderColor: 'divider',
                                                p: 3
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                No FAQ items yet. Add answers to the most common customer questions.
                                            </Typography>
                                        </Box>
                                    )}

                                    {(formValues.faq || []).map((item, index) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                p: 2
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Stack
                                                    direction={{ xs: 'column', sm: 'row' }}
                                                    spacing={2}
                                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label={`Question ${index + 1}`}
                                                        value={item.question}
                                                        onChange={(event) =>
                                                            handleFaqChange(item.id, 'question', event.target.value)
                                                        }
                                                    />
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Preview">
                                                            <span>
                                                                <IconButton size="small">
                                                                    <VisibilityOutlinedIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <span>
                                                                <IconButton size="small">
                                                                    <EditOutlinedIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleFaqRemove(item.id)}
                                                                >
                                                                    <DeleteOutlineOutlinedIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </Stack>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    minRows={3}
                                                    label="Answer"
                                                    value={item.answer}
                                                    onChange={(event) =>
                                                        handleFaqChange(item.id, 'answer', event.target.value)
                                                    }
                                                />
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            <Box sx={actionBarStyles}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="flex-end"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <Button variant="text" onClick={handleCancel} disabled={!hasUnsavedChanges}>
                        Cancel
                    </Button>
                    <Button variant="outlined" onClick={handlePreview} disabled={!user}>
                        Preview public profile
                    </Button>
                    <LoadingButton
                        variant="contained"
                        loading={saving}
                        disabled={!hasUnsavedChanges}
                        onClick={handleSave}
                    >
                        Save changes
                    </LoadingButton>
                </Stack>
            </Box>

            <DiversityModal
                open={diversityModalOpen}
                onClose={closeDiversityModal}
                currentSelection={formValues.socialGroups || []}
                onSaved={handleDiversitySaved}
            />

            <AiAvatarModal
                open={aiAvatarModalOpen}
                onClose={closeAiAvatarModal}
                userId={user?.id}
                currentAvatarUrl={formValues.avatar}
                generationsLeft={formValues.aiAvatarGenerationsLeft ?? 0}
                dailyLimit={5}
                onGenerationsChange={handleAiGenerationsChange}
                onAvatarApplied={handleAiAvatarApplied}
            />
        </>
    );
};

export default ProfileInformationPage;