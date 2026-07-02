import { trackEvent } from 'src/libs/analytics/ga4';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { alpha, useTheme } from '@mui/material/styles';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import toast from 'react-hot-toast';
import { cabinetApi } from 'src/api/cabinet';
import { profileApi } from 'src/api/profile';
import { AddressAutoComplete } from 'src/components/address/AddressAutoComplete';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useSettings } from 'src/hooks/use-settings';
import { paths } from 'src/paths';
import { storage } from 'src/libs/firebase';
import { PROFESSIONAL_ROLE_OPTIONS } from 'src/constants/professional-role-options';
import { DiversityModal } from './modals/diversity-modal';
import { AiAvatarModal } from './modals/ai-avatar-modal';
import { InviteDialog } from 'src/pages/cabinet/profiles/my/Connections/InviteDialog';
import { useProfileInformation, useInvalidateProfileInformation } from 'src/queries/use-profile-information';
import { SOCIAL_GROUP_OPTION_MAP, humanizeSocialGroupValue } from 'src/constants/social-groups';
import { IMaskInput } from 'react-imask';
import { isValidUSPhone, normalizeUSPhone, phonesMatch, formatUSPhoneForDisplay } from 'src/utils/validation/phone';

const PhoneMaskInput = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{ '0': /[0-9]/ }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const KEY_PROFILE_FIELDS = ['avatar', 'fullName', 'companyName', 'professionalRole', 'shortBio', 'primaryAddress', 'phoneNumber', 'primaryEmail'];

const calcProfileCompletion = (values) => {
    const filled = KEY_PROFILE_FIELDS.filter((f) => !!values[f]).length;
    return Math.round((filled / KEY_PROFILE_FIELDS.length) * 100);
};

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

const TIMEZONE_OPTIONS = [
    '(GMT-05:00) Eastern Time (US & Canada)',
    '(GMT-06:00) Central Time (US & Canada)',
    '(GMT-07:00) Mountain Time (US & Canada)',
    '(GMT-08:00) Pacific Time (US & Canada)',
    '(GMT-09:00) Alaska',
    '(GMT-10:00) Hawaii'
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
    const [formValues, setFormValues] = useState(defaultFormValues);
    const [initialValues, setInitialValues] = useState(defaultFormValues);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [diversityModalOpen, setDiversityModalOpen] = useState(false);
    const [aiAvatarModalOpen, setAiAvatarModalOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    const layoutIsHorizontal = settings.layout === 'horizontal';

    const userId = user?.id;

    const { data: profileData, isLoading: loading, isError } = useProfileInformation(userId);
    const invalidateProfileInformation = useInvalidateProfileInformation(userId);
    const seededRef = useRef(false);

    useEffect(() => {
        if (isError) {
            toast.error('Failed to load profile information');
        }
    }, [isError]);

    // Seed the editable form from the cached profile once, so background
    // refetches never clobber in-progress edits.
    useEffect(() => {
        if (!profileData || seededRef.current) {
            return;
        }
        seededRef.current = true;

        const cloned = deepClone(profileData);

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
    }, [profileData]);

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(formValues) !== JSON.stringify(initialValues);
    }, [formValues, initialValues]);

    const secondaryEmailMatchesPrimary = useMemo(() => {
        const secondary = (formValues.secondaryEmail || '').trim().toLowerCase();
        const primary = (formValues.primaryEmail || '').trim().toLowerCase();
        return !!secondary && !!primary && secondary === primary;
    }, [formValues.primaryEmail, formValues.secondaryEmail]);

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

    const handleSave = useCallback(async () => {
        if (!user) {
            return;
        }

        if (secondaryEmailMatchesPrimary) {
            toast.error('Secondary email must be different from the primary email.');
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

            const normalizedPhone = normalizeUSPhone(payload.phoneNumber);
            if (normalizedPhone && !phonesMatch(normalizedPhone, initialValues.phoneNumber)) {
                const isTaken = await profileApi.checkExistPhone(normalizedPhone, user.id, user.email);
                if (isTaken) {
                    toast.error('Phone number is already registered');
                    return;
                }
                payload.phoneNumber = formatUSPhoneForDisplay(normalizedPhone);
            }

            await cabinetApi.saveProfileInformation(user.id, payload);
            setInitialValues(deepClone(payload));
            invalidateProfileInformation();
            const completionPercent = calcProfileCompletion(payload);
            trackEvent('profile_save', {
                completion_percent: completionPercent,
                is_80_complete: completionPercent >= 80,
                role: user.role
            });
            toast.success('Changes saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }, [formValues, secondaryEmailMatchesPrimary, user, initialValues.phoneNumber, invalidateProfileInformation]);

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
        // setInitialValues((prev) => ({ ...prev, aiAvatarGenerationsLeft: left }));
    }, []);

    const handleAiAvatarApplied = useCallback((url, generationsLeft) => {
        setFormValues((prev) => ({ ...prev, avatar: url, aiAvatarGenerationsLeft: generationsLeft }));
        // Обновляем initialValues, но через setTimeout, чтобы дать время модалке закрыться
        setTimeout(() => {
            setInitialValues((prev) => ({ ...prev, avatar: url, aiAvatarGenerationsLeft: generationsLeft }));
        }, 100);
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
                invalidateProfileInformation();
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
        [user, invalidateProfileInformation]
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
        py: { xs: 1.25, sm: 3 }
    };

    if (loading || (!seededRef.current && Boolean(userId))) {
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
                    pb: { xs: '140px', sm: '100px', md: '120px' },
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
                        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
                            <Stack spacing={4}>
                                <Stack spacing={3}>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AccountCircleOutlinedIcon color="primary" />
                                            <Typography variant="h6">Profile Information</Typography>
                                        </Stack>
                                        <Button
                                            variant="outlined"
                                            startIcon={<PersonAddAltIcon />}
                                            onClick={() => setInviteDialogOpen(true)}
                                            sx={{
                                                display: { xs: 'none', sm: 'inline-flex' },
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Invite Friends
                                        </Button>
                                    </Stack>

                                    {/* Avatar + actions */}
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={3}
                                        alignItems={{ xs: 'center', sm: 'flex-start' }}
                                    >
                                        <Box
                                            sx={{
                                                width: AVATAR_EDGE,
                                                height: AVATAR_EDGE,
                                                flexShrink: 0,
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
                                            <Box
                                                component="img"
                                                src={formValues.avatar || '/assets/avatars/defaultUser.jpg'}
                                                alt="Avatar"
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>

                                        <input
                                            hidden
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />

                                        <Stack
                                            spacing={1.5}
                                            sx={{
                                                flex: 1,
                                                width: '100%',
                                                alignItems: { xs: 'center', sm: 'flex-start' }
                                            }}
                                        >
                                            <Stack
                                                direction={{ xs: 'column', md: 'row' }}
                                                spacing={1.5}
                                                sx={{ width: { xs: '100%', md: 'auto' } }}
                                            >
                                                <LoadingButton
                                                    loading={avatarUploading}
                                                    startIcon={<PhotoCameraIcon />}
                                                    variant="contained"
                                                    onClick={handleAvatarButtonClick}
                                                    sx={{ minWidth: { md: 160 } }}
                                                >
                                                    Upload
                                                </LoadingButton>
                                                <Button
                                                    startIcon={<AutoAwesomeIcon />}
                                                    variant="outlined"
                                                    onClick={openAiAvatarModal}
                                                    sx={{ minWidth: { md: 200 }, whiteSpace: 'nowrap' }}
                                                >
                                                    AI-Generate Avatar
                                                </Button>
                                                <Button
                                                    startIcon={<PersonAddAltIcon />}
                                                    variant="outlined"
                                                    onClick={() => setInviteDialogOpen(true)}
                                                    sx={{
                                                        display: { xs: 'inline-flex', sm: 'none' },
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Invite Friends
                                                </Button>
                                            </Stack>

                                            <Typography variant="caption" color="text.secondary">
                                                {formValues.aiAvatarGenerationsLeft} Generations left today
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    {/* Social group & diversity */}
                                    <Stack spacing={1.5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Social group &amp; diversity
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                gap: 1,
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                p: 2,
                                                minHeight: 64
                                            }}
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
                                        </Box>
                                    </Stack>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                                            columnGap: 3,
                                            rowGap: 1
                                        }}
                                    >
                                        <Box>
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
                                        </Box>
                                        <Box>
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
                                        </Box>
                                        <Box>
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
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Secondary Email
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Secondary email"
                                                value={formValues.secondaryEmail}
                                                onChange={handleFieldChange('secondaryEmail')}
                                                error={secondaryEmailMatchesPrimary}
                                                helperText={secondaryEmailMatchesPrimary ? 'Secondary email must be different from the primary email.' : ''}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Phone Number
                                            </Typography>
                                            <TextField
                                                sx={{ mt: 1.5, mb: 1 }}
                                                fullWidth
                                                label="Phone number"
                                                placeholder="+1 (555) 000-0000"
                                                value={formValues.phoneNumber}
                                                onChange={handleFieldChange('phoneNumber')}
                                                error={!!formValues.phoneNumber && !isValidUSPhone(formValues.phoneNumber)}
                                                helperText={!!formValues.phoneNumber && !isValidUSPhone(formValues.phoneNumber) ? 'Enter a valid US phone number (+1 and 10 digits)' : 'United States (+1) only'}
                                                InputProps={{
                                                    inputComponent: PhoneMaskInput,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            🇺🇸
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
                            <Stack spacing={3}>
                                <Typography variant="h6">Business / Professional info</Typography>
                                <Box>
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
                                </Box>
                                <Box>
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
                                </Box>
                                <Box>
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
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
                            <Stack spacing={3}>
                                <Typography variant="h6">Location</Typography>
                                <Box>
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
                                </Box>
                                <Box>
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
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
                            <Stack spacing={3}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    justifyContent="space-between"
                                    spacing={1.5}
                                >
                                    <Typography variant="h6">Frequently Asked Questions</Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        variant="outlined"
                                        onClick={handleFaqAdd}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            alignSelf: { xs: 'flex-start', sm: 'auto' }
                                        }}
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
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label={`Question ${index + 1}`}
                                                        value={item.question}
                                                        onChange={(event) =>
                                                            handleFaqChange(item.id, 'question', event.target.value)
                                                        }
                                                    />
                                                    <Tooltip title="Delete">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleFaqRemove(item.id)}
                                                                sx={{ flexShrink: 0 }}
                                                            >
                                                                <DeleteOutlineOutlinedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
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
                    spacing={{ xs: 1, sm: 2 }}
                    justifyContent={{ sm: 'flex-end' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <Button
                        variant="outlined"
                        onClick={handlePreview}
                        disabled={!user}
                    >
                        View public profile
                    </Button>
                    <LoadingButton
                        variant="contained"
                        loading={saving}
                        disabled={!hasUnsavedChanges || secondaryEmailMatchesPrimary}
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
                userRole={user?.role}
                currentAvatarUrl={formValues.avatar}
                generationsLeft={formValues.aiAvatarGenerationsLeft ?? 0}
                dailyLimit={5}
                onGenerationsChange={handleAiGenerationsChange}
                onAvatarApplied={handleAiAvatarApplied}
            />

            <InviteDialog
                open={inviteDialogOpen}
                onClose={() => setInviteDialogOpen(false)}
                profileId={user?.id}
            />
        </>
    );
};

export default ProfileInformationPage;