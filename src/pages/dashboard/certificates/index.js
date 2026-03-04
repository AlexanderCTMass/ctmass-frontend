import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
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
        if (!window.confirm('Are you sure you want to delete this certificate?')) return;
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

    if (loading) {
        return (
            <Box
                component="main"
                sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', py: 8, px: { xs: 2, sm: 3, lg: 1 } }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (certificates.length === 0) {
        return (
            <>
                <Seo title="My Certificates and Licenses" />
                <Box component="main" sx={{ flexGrow: 1, py: 8, px: { xs: 2, sm: 3, lg: 1 } }}>
                    <Container maxWidth={false}>
                        <EmptyState />
                    </Container>
                </Box>
            </>
        );
    }

    return (
        <>
            <Seo title="My Certificates and Licenses" />
            <Box component="main" sx={{ flexGrow: 1, py: 8, px: 6 }}>
                <Container maxWidth={false}>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
                        My Certificates and Licenses
                    </Typography>

                    <CertificatesFilters
                        certificates={certificates}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />

                    <Grid container spacing={2}>
                        {filteredCertificates.map((cert) => (
                            <Grid item xs={12} sm={6} md={4} key={cert.id}>
                                <CertificateCard
                                    certificate={cert}
                                    onToggleVisibility={handleToggleVisibility}
                                    onDelete={handleDelete}
                                />
                            </Grid>
                        ))}
                        {filteredCertificates.length === 0 && (
                            <Grid item xs={12}>
                                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No certificates found matching your filters.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default memo(CertificatesPage);
