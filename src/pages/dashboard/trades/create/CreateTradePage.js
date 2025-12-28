import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Container, Snackbar, Stack, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
    commuteMode: 'driving',
    commuteDuration: 20,
    primarySpecialty: '',
    priceType: '',
    price: '',
    previewTagline: ''
};

function CreateTradePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
    const [profileAvatar, setProfileAvatar] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);

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

                setFormValues((prev) => ({
                    ...prev,
                    businessName: profile.companyName || prev.businessName,
                    professionalRole: profile.professionalRole || prev.professionalRole,
                    phone: profile.phoneNumber || prev.phone,
                    tradeTitle: profile.displayName
                        ? `${profile.displayName}'s Trade`
                        : prev.tradeTitle || 'My Trade',
                    shortDescription: profile.shortBio || prev.shortDescription,
                    avatarUrl: profile.avatar || prev.avatarUrl
                }));
                setProfileAvatar(profile.avatar || '');
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
    }, [user?.id]);

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

        return submitting || loadingProfile;
    }, [formValues.primarySpecialty, formValues.tradeTitle, loadingProfile, submitting]);

    const handleSubmit = useCallback(async () => {
        if (!user?.id) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'You must be logged in to create a trade.'
            });
            return;
        }

        setSubmitting(true);

        try {
            await tradesApi.createTrade(user.id, {
                title: formValues.tradeTitle || 'Untitled trade',
                subtitle: PRIMARY_SPECIALTY_OPTIONS.find((option) => option.value === formValues.primarySpecialty)?.label || 'Specialty',
                description: formValues.shortDescription || formValues.about || '',
                avatarUrl: formValues.avatarUrl || '',
                rating: 0,
                views: 0,
                viewsThisWeek: 0,
                reviews: 0,
                completedProjects: 0,
                projectsInProgress: 0,
                status: 'active',
                newOrders: 0,
                contact: {
                    businessName: formValues.businessName || '',
                    professionalRole: formValues.professionalRole || '',
                    phone: formValues.phone || '',
                    useProfilePhone: formValues.useProfilePhone
                },
                location: {
                    address: formValues.address || '',
                    commuteMode: formValues.commuteMode,
                    commuteDuration: formValues.commuteDuration
                },
                pricing: {
                    type: formValues.priceType || '',
                    amount: formValues.price || ''
                },
                story: {
                    about: formValues.about || '',
                    tagline: formValues.previewTagline || '',
                    shortDescription: formValues.shortDescription || ''
                }
            });

            setSnackbar({
                open: true,
                severity: 'success',
                message: 'Trade created successfully!'
            });

            navigate(paths.dashboard.trades.index);
        } catch (error) {
            console.error('[CreateTradePage] Failed to create trade', error);
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'Failed to create trade. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    }, [
        formValues.about,
        formValues.address,
        formValues.avatarUrl,
        formValues.businessName,
        formValues.commuteDuration,
        formValues.commuteMode,
        formValues.price,
        formValues.priceType,
        formValues.primarySpecialty,
        formValues.professionalRole,
        formValues.shortDescription,
        formValues.previewTagline,
        formValues.tradeTitle,
        formValues.useProfilePhone,
        formValues.phone,
        navigate,
        user?.id
    ]);

    const handleCancel = useCallback(() => {
        navigate(paths.dashboard.trades.index);
    }, [navigate]);

    return (
        <>
            <Seo title="Create New Trade" />
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
                                Create New Trade
                            </Box>
                            <Box component="p" sx={{ color: 'text.secondary', m: 0 }}>
                                Add details to stand out to customers and grow your business.
                            </Box>
                        </Stack>

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
                                    specialtyOptions={PRIMARY_SPECIALTY_OPTIONS}
                                    priceTypeOptions={PRICE_TYPE_OPTIONS}
                                />

                                <TradePreviewGallery values={formValues} />
                            </Stack>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <TradeFormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                disabled={isSubmitDisabled}
                submitting={submitting}
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