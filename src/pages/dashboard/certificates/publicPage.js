import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from 'src/hooks/use-auth';
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { Seo } from 'src/components/seo';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { paths } from 'src/paths';
import HeroSection from 'src/pages/publicProfile/components/HeroSection';
import CTASection from 'src/pages/publicProfile/components/CTASection';
import VerificationBanner from './components/VerificationBanner';
import CertificateDetailsCard from './components/CertificateDetailsCard';
import AttachedDocumentsSection from './components/AttachedDocumentsSection';

const formatLocation = (profile) => {
    const address = profile?.profile?.address;
    if (!address) return '';
    const parts = [
        address.location?.place_name,
        address.city,
        address.state,
        address.country
    ].filter(Boolean);
    return parts.join(', ');
};

const isDateInFuture = (value) => {
    if (!value) return false;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d >= today;
};

const CertificatePublicPage = () => {
    const { userId, certId } = useParams();
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!userId) return;

        let mounted = true;

        const load = async () => {
            try {
                const data = await extendedProfileApi.getUserData(userId, []);
                if (!mounted) return;

                setProfileData(data);

                const cert = (data.education || []).find((e) => e.id === certId);
                if (cert) {
                    setCertificate(cert);
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setNotFound(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [userId, certId]);

    const locationLabel = useMemo(() => formatLocation(profileData), [profileData]);

    const status = useMemo(() => {
        const busyUntil = profileData?.profile?.busyUntil;
        if (isDateInFuture(busyUntil)) {
            return {
                label: `Busy until ${new Date(busyUntil).toLocaleDateString()}`,
                color: 'warning'
            };
        }
        return { label: 'Active', color: 'success' };
    }, [profileData]);

    const shareUrl = useMemo(() => {
        const profile = profileData?.profile;
        if (!profile) return '';
        return `${process.env.REACT_APP_HOST_P ?? ''}/contractors/first1000/${profile.profilePage || profile.id || ''}`;
    }, [profileData]);

    const goToProfileHref = useMemo(() => {
        const profile = profileData?.profile;
        if (!profile) return undefined;
        return paths.specialist.publicPage.replace(':profileId', profile.profilePage || profile.id || userId);
    }, [profileData, userId]);

    const certFiles = useMemo(
        () => certificate?.files || certificate?.certificates || [],
        [certificate]
    );

    const handleCall = useCallback(() => {
        const phone = profileData?.profile?.phone;
        if (phone) window.location.href = `tel:${phone}`;
    }, [profileData]);

    const handleOpenQr = useCallback(() => {}, []);

    const seoTitle = useMemo(() => {
        if (!certificate) return 'Certificate';
        const type = certificate.documentType || certificate.certificateType || '';
        const inst = certificate.institution || certificate.issuingOrganization || '';
        return [type, inst].filter(Boolean).join(' — ') || 'Certificate';
    }, [certificate]);

    if (loading) {
        return (
            <Box
                component="main"
                sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (notFound) {
        return (
            <Box
                component="main"
                sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
            >
                <Typography variant="h6" color="text.secondary">
                    Certificate not found
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Seo title={seoTitle} />
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3, lg: 1 } }}>
                <Container maxWidth="md">
                    <Stack spacing={3}>
                        {profileData && (
                            <HeroSection
                                profile={profileData}
                                status={status}
                                locationLabel={locationLabel}
                                onOpenQr={handleOpenQr}
                                shareUrl={shareUrl}
                            />
                        )}

                        <VerificationBanner />

                        <CertificateDetailsCard certificate={certificate} />

                        <AttachedDocumentsSection files={certFiles} />

                        <CTASection
                            phone={profileData?.profile?.phone}
                            onCall={profileData?.profile?.phone ? handleCall : undefined}
                            requestItems={[]}
                            goToProfileHref={goToProfileHref}
                            isOwnProfile={Boolean(user) && !user.isAnonymous && user.id === userId}
                        />
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default memo(CertificatePublicPage);
