import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Container, Snackbar, Stack, useMediaQuery } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { cabinetApi } from 'src/api/cabinet';
import { tradesApi } from 'src/api/trades';
import { paths } from 'src/paths';
import { PROFESSIONAL_ROLE_OPTIONS } from 'src/constants/professional-role-options';
import TradeHeroPanel from './components/TradeHeroPanel';
import TradePrimaryDetails from './components/TradePrimaryDetails';
import TradeLocationSection from './components/TradeLocationSection';
import TradeStorySection from './components/TradeStorySection';
import TradePreviewGallery from './components/TradePreviewGallery';
import TradeFormActions from './components/TradeFormActions';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from 'src/libs/firebase';
import { useSpecialties } from 'src/sections/home/home-hero';

const DEFAULT_MAP_CENTER = [-95.7129, 37.0902];

const normalizeAddressLocation = (location) => {
    if (!location) {
        return null;
    }

    const raw = location.addressLocation ?? location;
    const placeName = raw?.place_name ?? location.address ?? raw?.text ?? '';

    if (!placeName) {
        return null;
    }

    const rawCenter = Array.isArray(raw?.center) && raw.center.length === 2 ? raw.center
        : Array.isArray(location.center) && location.center.length === 2 ? location.center
            : Array.isArray(location.coordinates) && location.coordinates.length === 2 ? location.coordinates
                : null;

    const center = rawCenter ?? DEFAULT_MAP_CENTER;
    const normalizedId = raw?.id ?? `manual-${placeName}`;

    const normalized = {
        ...raw,
        id: normalizedId,
        place_name: placeName,
        text: raw?.text ?? placeName.split(',')[0] ?? placeName,
        center,
        geometry: raw?.geometry ?? (center ? { coordinates: center } : undefined)
    };

    return normalized;
};

const coerceNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const formatPriceInputValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    return value;
};

const PRIMARY_SPECIALTY_OPTIONS = [
    { value: 'plumbing', label: 'Plumber' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'hvac', label: 'HVAC Technician' }
];

const PRICE_TYPE_OPTIONS = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'project', label: 'Per project' },
    { value: 'consultation', label: 'Consultation' }
];

const COMMUTE_DURATIONS = [10, 20, 30, 40, 50];

const DEFAULT_FORM_VALUES = {
    businessName: '',
    professionalRole: '',
    phone: '',
    useProfilePhone: true,
    avatarUrl: '',
    description: '',
    tradeTitle: '',
    shortDescription: '',
    about: '',
    address: '',
    addressLocation: null,
    commuteMode: 'driving',
    commuteDuration: 20,
    primarySpecialty: '',
    primarySpecialtyLabel: '',
    primarySpecialtyPath: '',
    priceType: '',
    price: '',
    previewTagline: '',
    status: 'on_review',
    rating: 0,
    reviews: 0,
    reviewCount: 0,
    registrationAt: null,
    createdAt: null,
    busyUntil: null,
};

function CreateTradePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { tradeId } = useParams();
    const isEditMode = Boolean(tradeId);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
    const [profileAvatar, setProfileAvatar] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingTrade, setLoadingTrade] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);

    const homeSpecialties = useSpecialties();
    const specialtyOptions = useMemo(() => {
        if (!homeSpecialties || homeSpecialties.length === 0) {
            return PRIMARY_SPECIALTY_OPTIONS;
        }

        return homeSpecialties.map((item) => ({
            value: item.id,
            label: item.label,
            fullId: item.fullId
        }));
    }, [homeSpecialties]);

    useEffect(() => {
        let active = true;

        if (!user?.id) {
            setLoadingProfile(false);
            return undefined;
        }

        (async () => {
            try {
                setLoadingProfile(true);
                const profile = await cabinetApi.getProfileInformation(user.id);
                if (!active) return;

                setProfileAvatar(profile.avatar || '');

                if (!isEditMode) {
                    setFormValues((prev) => ({
                        ...prev,
                        businessName: profile.companyName || prev.businessName,
                        professionalRole: profile.professionalRole || prev.professionalRole,
                        phone: profile.phoneNumber || prev.phone,
                        tradeTitle: profile.displayName
                            ? profile.displayName
                            : prev.tradeTitle || 'My Trade',
                        shortDescription: profile.shortBio || prev.shortDescription,
                        avatarUrl: profile.avatar || prev.avatarUrl,
                        registrationAt: profile.registrationAt || prev.registrationAt,
                        ownerId: user?.id
                    }));
                }
            } catch (error) {
                console.error('[CreateTradePage] Failed to fetch profile info', error);
            } finally {
                if (active) {
                    setLoadingProfile(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [isEditMode, user?.id]);

    useEffect(() => {
        if (!isEditMode || !tradeId) {
            return;
        }

        let active = true;

        const loadTrade = async () => {
            try {
                setLoadingTrade(true);
                const trade = await tradesApi.getTrade(tradeId);
                if (!active) return;

                if (!trade) {
                    setSnackbar({
                        open: true,
                        severity: 'error',
                        message: 'Trade not found.'
                    });
                    navigate(paths.dashboard.trades.index);
                    return;
                }

                const normalizedLocation = normalizeAddressLocation(trade.location);
                const locationAddress = trade.location?.address ?? normalizedLocation?.place_name ?? '';

                setFormValues((prev) => ({
                    ...prev,
                    businessName: trade.contact?.businessName ?? prev.businessName,
                    professionalRole: trade.contact?.professionalRole ?? prev.professionalRole,
                    phone: trade.contact?.phone ?? prev.phone,
                    useProfilePhone: trade.contact?.useProfilePhone ?? true,
                    avatarUrl: trade.avatarUrl ?? prev.avatarUrl,
                    description: trade.description ?? prev.description,
                    tradeTitle: trade.title ?? prev.tradeTitle,
                    shortDescription: trade.story?.shortDescription ?? trade.description ?? prev.shortDescription,
                    about: trade.story?.about ?? prev.about,
                    address: locationAddress || prev.address,
                    addressLocation: normalizedLocation,
                    commuteMode: trade.location?.commuteMode ?? prev.commuteMode,
                    commuteDuration: trade.location?.commuteDuration ?? prev.commuteDuration,
                    primarySpecialty: trade.primarySpecialtyId ?? prev.primarySpecialty,
                    primarySpecialtyLabel: trade.primarySpecialtyLabel ?? prev.primarySpecialtyLabel,
                    primarySpecialtyPath: trade.primarySpecialtyPath ?? prev.primarySpecialtyPath,
                    priceType: trade.pricing?.type ?? prev.priceType,
                    price: formatPriceInputValue(trade.pricing?.amount ?? prev.price),
                    rating: coerceNumber(trade.rating, prev.rating),
                    reviews: coerceNumber(trade.reviews, prev.reviews),
                    reviewCount: coerceNumber(trade.reviewCount ?? trade.reviews, prev.reviewCount),
                    status: trade.status ?? prev.status,
                    registrationAt: trade.registrationAt ?? trade.createdAt ?? prev.registrationAt,
                    createdAt: trade.createdAt ?? prev.createdAt,
                    busyUntil: trade.busyUntil ?? prev.busyUntil
                }));
            } catch (error) {
                console.error('[CreateTradePage] Failed to load trade', error);
                setSnackbar({
                    open: true,
                    severity: 'error',
                    message: 'Unable to load trade for editing.'
                });
                navigate(paths.dashboard.trades.index);
            } finally {
                if (active) {
                    setLoadingTrade(false);
                }
            }
        };

        loadTrade();

        return () => {
            active = false;
        };
    }, [isEditMode, tradeId, navigate]);

    const handleFieldChange = useCallback((field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleAvatarButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleApplyProfileAvatar = useCallback(() => {
        if (!profileAvatar) {
            setSnackbar({
                open: true,
                severity: 'warning',
                message: 'Your profile avatar is empty.'
            });
            return;
        }

        setFormValues((prev) => ({
            ...prev,
            avatarUrl: profileAvatar
        }));
    }, [profileAvatar]);

    const handleAvatarUpload = useCallback(
        async (event) => {
            const file = event.target.files?.[0];
            if (!file || !user?.id) {
                return;
            }

            try {
                setSubmitting(true);
                const storageRef = ref(
                    storage,
                    `trade-avatars/${user.id}/${Date.now()}-${file.name}`
                );
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                setFormValues((prev) => ({
                    ...prev,
                    avatarUrl: url
                }));

                setSnackbar({
                    open: true,
                    severity: 'success',
                    message: 'Trade avatar uploaded successfully.'
                });
            } catch (error) {
                console.error('[CreateTradePage] Avatar upload failed', error);
                setSnackbar({
                    open: true,
                    severity: 'error',
                    message: 'Failed to upload avatar. Please try again.'
                });
            } finally {
                setSubmitting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [user?.id]
    );

    const isSubmitDisabled = useMemo(() => {
        if (!formValues.tradeTitle || !formValues.primarySpecialty) {
            return true;
        }

        return submitting || loadingProfile || loadingTrade;
    }, [formValues.primarySpecialty, formValues.tradeTitle, loadingProfile, loadingTrade, submitting]);

    const handleSubmit = useCallback(async () => {
        if (!user?.id) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'You must be logged in to create a trade.'
            });
            return;
        }

        if (isEditMode && !tradeId) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'Trade identifier is missing.'
            });
            return;
        }

        setSubmitting(true);

        try {
            const selectedSpecialty = specialtyOptions.find(
                (option) => option.value === formValues.primarySpecialty
            );

            const basePayload = {
                title: formValues.tradeTitle || 'Untitled trade',
                subtitle: selectedSpecialty?.label || formValues.primarySpecialtyLabel || 'Specialty',
                description: formValues.shortDescription || formValues.about || '',
                avatarUrl: formValues.avatarUrl || '',
                primarySpecialtyId: selectedSpecialty?.value || formValues.primarySpecialty || '',
                primarySpecialtyLabel: selectedSpecialty?.label || formValues.primarySpecialtyLabel || '',
                primarySpecialtyPath: selectedSpecialty?.fullId || formValues.primarySpecialtyPath || '',
                contact: {
                    businessName: formValues.businessName || '',
                    professionalRole: formValues.professionalRole || '',
                    phone: formValues.phone || '',
                    useProfilePhone: formValues.useProfilePhone
                },
                location: {
                    address: formValues.address || '',
                    addressLocation: formValues.addressLocation || null,
                    commuteMode: formValues.commuteMode,
                    commuteDuration: formValues.commuteDuration
                },
                pricing: {
                    type: formValues.priceType || '',
                    amount: formValues.price || ''
                },
                story: {
                    about: formValues.about || '',
                    shortDescription: formValues.shortDescription || ''
                }
            };

            if (isEditMode) {
                await tradesApi.updateTrade(tradeId, basePayload);
                setSnackbar({
                    open: true,
                    severity: 'success',
                    message: 'Trade updated successfully!'
                });
            } else {
                await tradesApi.createTrade(user.id, {
                    ...basePayload,
                    rating: 0,
                    views: 0,
                    viewsThisWeek: 0,
                    reviews: 0,
                    completedProjects: 0,
                    projectsInProgress: 0,
                    status: 'on_review',
                    statusDetails: '',
                    newOrders: 0
                });
                setSnackbar({
                    open: true,
                    severity: 'success',
                    message: 'Trade created successfully!'
                });
            }

            navigate(paths.dashboard.trades.index);
        } catch (error) {
            console.error('[CreateTradePage] Failed to submit trade', error);
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'Failed to save trade. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    }, [
        isEditMode,
        tradeId,
        formValues.about,
        formValues.address,
        formValues.addressLocation,
        formValues.avatarUrl,
        formValues.businessName,
        formValues.commuteDuration,
        formValues.commuteMode,
        formValues.price,
        formValues.priceType,
        formValues.primarySpecialty,
        formValues.primarySpecialtyLabel,
        formValues.primarySpecialtyPath,
        formValues.professionalRole,
        formValues.shortDescription,
        formValues.tradeTitle,
        formValues.useProfilePhone,
        formValues.phone,
        navigate,
        specialtyOptions,
        user?.id
    ]);

    const handleCancel = useCallback(() => {
        navigate(paths.dashboard.trades.index);
    }, [navigate]);

    return (
        <>
            <Seo title={isEditMode ? 'Edit Trade' : 'Create New Trade'} />
            <Box component="main" sx={{
                px: { xs: 2, sm: 3, lg: 6 },
                py: { xs: 7, sm: 8 },
                pb: { xs: 14, md: 18 },
                maxWidth: 1280,
            }}>
                <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
                    <Stack spacing={{ xs: 4, md: 6 }}>
                        <Stack spacing={1}>
                            <Box component="h1" sx={{ fontWeight: 700, fontSize: { xs: 32, md: 40 }, m: 0 }}>
                                {isEditMode
                                    ? `Edit trade - ${formValues.tradeTitle || 'Untitled trade'}`
                                    : 'Create New Trade'}
                            </Box>
                            <Box component="p" sx={{ color: 'text.secondary', m: 0 }}>
                                {isEditMode
                                    ? 'Update your trade to keep customers informed and engaged.'
                                    : 'Add details to stand out to customers and grow your business.'}
                            </Box>
                        </Stack>

                        {isEditMode && loadingTrade ? (
                            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 5 }}>
                                {!mdUp && <TradeHeroPanel />}
                                <Stack flex={1} spacing={5}>
                                    <TradePrimaryDetails
                                        values={formValues}
                                        onChange={handleFieldChange}
                                        professionalRoleOptions={PROFESSIONAL_ROLE_OPTIONS}
                                        onAvatarUploadClick={handleAvatarButtonClick}
                                        onApplyProfileAvatar={handleApplyProfileAvatar}
                                        fileInputRef={fileInputRef}
                                        onAvatarFileChange={handleAvatarUpload}
                                        loadingProfile={loadingProfile}
                                    />

                                    <TradeLocationSection
                                        values={formValues}
                                        onChange={handleFieldChange}
                                        commuteDurations={COMMUTE_DURATIONS}
                                    />

                                    <TradeStorySection
                                        values={formValues}
                                        onChange={handleFieldChange}
                                        specialtyOptions={specialtyOptions}
                                        priceTypeOptions={PRICE_TYPE_OPTIONS}
                                    />

                                    <TradePreviewGallery values={formValues} ownerId={user?.id} />
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                </Container>
            </Box>

            <TradeFormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                disabled={isSubmitDisabled}
                submitting={submitting}
                submitLabel={isEditMode ? 'Save changes' : 'Create Trade'}
            />

            <Snackbar
                open={snackbar.open}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                autoHideDuration={4000}
                message={snackbar.message}
            />
        </>
    );
}

export default CreateTradePage;