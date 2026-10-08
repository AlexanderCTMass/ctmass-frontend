import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Skeleton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { btn, DashPage, EmptyState as KitEmptyState } from 'src/components/ctmass-ui';
import { RADIUS } from 'src/theme/ctmass-tokens';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import toast from 'react-hot-toast';
import EmptyState from './components/EmptyState';
import CertificateCard from './components/CertificateCard';
import CertificatesFilters from './components/CertificatesFilters';

const CertificatesPage = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        documentType: '',
        institution: '',
        attachedToResume: ''
    });

    const fetchCertificates = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const education = await extendedProfileApi.getEducation(user.id);
            setCertificates(education);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleFiltersChange = useCallback((changed) => {
        setFilters((prev) => ({ ...prev, ...changed }));
    }, []);

    const handleToggleVisibility = useCallback(async (certId, isPublic) => {
        try {
            const cert = certificates.find((c) => c.id === certId);
            if (!cert) return;
            await extendedProfileApi.updateEducation(user.id, certId, { ...cert, isPrivate: !isPublic }, cert);
            setCertificates((prev) =>
                prev.map((c) => c.id === certId ? { ...c, isPrivate: !isPublic } : c)
            );
        } catch (err) {
            console.error(err);
            toast.error('Failed to update visibility');
        }
    }, [certificates, user?.id]);

    const handleDelete = useCallback(async (certId) => {
        try {
            const cert = certificates.find((c) => c.id === certId);
            await extendedProfileApi.deleteEducation(user.id, certId, cert?.files || cert?.certificates || []);
            setCertificates((prev) => prev.filter((c) => c.id !== certId));
            toast.success('Certificate deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete certificate');
        }
    }, [certificates, user?.id]);

    const filteredCertificates = useMemo(() => {
        return certificates.filter((cert) => {
            const searchVal = filters.search.toLowerCase();
            if (searchVal) {
                const title = (cert.institution || cert.issuingOrganization || cert.title || '').toLowerCase();
                const specialty = (cert.specialty || cert.degree || '').toLowerCase();
                if (!title.includes(searchVal) && !specialty.includes(searchVal)) return false;
            }

            if (filters.documentType) {
                const type = cert.documentType || cert.certificateType || '';
                if (type !== filters.documentType) return false;
            }

            if (filters.institution) {
                const inst = cert.institution || cert.issuingOrganization || '';
                if (inst !== filters.institution) return false;
            }

            if (filters.attachedToResume === 'yes') {
                if (!cert.linkedTradeIds || cert.linkedTradeIds.length === 0) return false;
            } else if (filters.attachedToResume === 'no') {
                if (cert.linkedTradeIds && cert.linkedTradeIds.length > 0) return false;
            }

            return true;
        });
    }, [certificates, filters]);

    const addButton = (
        <Button
            component={RouterLink}
            href={paths.dashboard.certificates.create}
            startIcon={<AddRoundedIcon />}
            sx={{ ...btn.green, minHeight: 50, px: 3, width: { xs: '100%', md: 'auto' } }}
        >
            Add a document
        </Button>
    );

    return (
        <>
            <Seo title="Licenses and certificates" />
            <DashPage
                title="Licenses and certificates"
                subtitle="Documents that prove your skills. Public ones appear on your profile."
                action={!loading && certificates.length > 0 ? addButton : null}
                maxWidth="xl"
            >
                {loading ? (
                    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={240} sx={{ borderRadius: RADIUS.card }} />)}
                    </Box>
                ) : certificates.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <CertificatesFilters
                            certificates={certificates}
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />

                        {filteredCertificates.length === 0 ? (
                            <KitEmptyState
                                title="No documents match"
                                text="Try another search or clear the filters."
                                action={<Button onClick={() => setFilters({ search: '', documentType: '', institution: '', attachedToResume: '' })} sx={btn.outline}>Clear filters</Button>}
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: { xs: 2, md: 2.5 },
                                    gridTemplateColumns: {
                                        xs: 'minmax(0, 1fr)',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        lg: 'repeat(3, minmax(0, 1fr))'
                                    }
                                }}
                            >
                                {filteredCertificates.map((cert) => (
                                    <CertificateCard
                                        key={cert.id}
                                        certificate={cert}
                                        onToggleVisibility={handleToggleVisibility}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </DashPage>
        </>
    );
};

export default memo(CertificatesPage);
