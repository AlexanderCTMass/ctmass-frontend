import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { tradesApi } from 'src/api/trades';
import toast from 'react-hot-toast';
import { paths } from 'src/paths';
import BasicInfoSection from './components/BasicInfoSection';
import EducationDetailsSection from './components/EducationDetailsSection';
import AttachedFilesSection from './components/AttachedFilesSection';
import VisibilitySettingsSection from './components/VisibilitySettingsSection';
import LinkToTradesSection from './components/LinkToTradesSection';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const monthNameToDate = (monthName, yearStr) => {
    if (!yearStr) return null;
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) return null;
    const monthIndex = monthName ? MONTH_NAMES.indexOf(monthName) : 0;
    return new Date(year, monthIndex >= 0 ? monthIndex : 0, 1);
};

const parseExpirationDate = (str) => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        const date = c > 31
            ? new Date(c, a - 1, b)
            : new Date(c, b - 1, a);
        if (!isNaN(date.getTime())) return date;
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
};

const formatDate = (date) => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

const DEFAULT_VALUES = {
    documentType: '',
    institution: '',
    locationIssued: null,
    locationIssuedText: '',
    specialty: '',
    degree: '',
    expirationDate: null,
    startDate: null,
    endDate: null,
    documentNumber: '',
    gpa: '',
    description: '',
    files: [],
    visibility: {
        showInstitution: true,
        showSpecialty: true,
        showDegree: true,
        showStartEndDates: true,
        showGPA: true,
        showDocumentNumber: true
    },
    linkedTradeIds: []
};

const CertificateCreatePage = () => {
    const navigate = useNavigate();
    const { certId } = useParams();
    const { user } = useAuth();
    const isEditing = Boolean(certId);

    const [values, setValues] = useState(DEFAULT_VALUES);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        tradesApi.getTradesByUser(user.id).then(setTrades).catch(console.error);
    }, [user?.id]);

    useEffect(() => {
        if (!isEditing || !user?.id) return;

        const loadCertificate = async () => {
            try {
                setLoading(true);
                const education = await extendedProfileApi.getEducation(user.id);
                const cert = education.find((e) => e.id === certId);
                if (!cert) {
                    toast.error('Certificate not found');
                    navigate(paths.dashboard.certificates.index);
                    return;
                }
                setOriginalData(cert);
                setValues({
                    documentType: cert.documentType || cert.certificateType || '',
                    institution: cert.institution || cert.issuingOrganization || cert.title || '',
                    locationIssued: cert.locationIssued || null,
                    locationIssuedText: cert.locationIssuedText || cert.location || '',
                    specialty: cert.specialty || cert.degree || '',
                    degree: cert.degreeLevel || '',
                    expirationDate: parseExpirationDate(cert.expirationDate),
                    startDate: monthNameToDate(cert.startMonth, cert.startYear || cert.year),
                    endDate: monthNameToDate(cert.endMonth, cert.endYear),
                    documentNumber: cert.documentNumber || '',
                    gpa: cert.gpa || '',
                    description: cert.description || '',
                    files: (cert.files || cert.certificates || []).map((f) => ({
                        id: f.id || String(Date.now()),
                        name: f.name || 'file',
                        url: f.url,
                        size: f.size || 0,
                        type: f.type || '',
                        isPublic: f.isPublic !== false
                    })),
                    visibility: cert.visibility || DEFAULT_VALUES.visibility,
                    linkedTradeIds: cert.linkedTradeIds || []
                });
            } catch (err) {
                console.error(err);
                toast.error('Failed to load certificate');
            } finally {
                setLoading(false);
            }
        };

        loadCertificate();
    }, [isEditing, certId, user?.id, navigate]);

    const handleChange = useCallback((field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleVisibilityChange = useCallback((key, checked) => {
        setValues((prev) => ({
            ...prev,
            visibility: { ...prev.visibility, [key]: checked }
        }));
    }, []);

    const handleFileDrop = useCallback((newFiles) => {
        setValues((prev) => ({
            ...prev,
            files: [
                ...prev.files,
                ...newFiles.map((f) => ({
                    id: String(Date.now()) + Math.random(),
                    name: f.name,
                    url: f.preview || URL.createObjectURL(f),
                    size: f.size,
                    type: f.type,
                    isPublic: true,
                    _file: f
                }))
            ]
        }));
    }, []);

    const handleFileRemove = useCallback((index) => {
        setValues((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    }, []);

    const handleFileTogglePublic = useCallback((index, isPublic) => {
        setValues((prev) => ({
            ...prev,
            files: prev.files.map((f, i) => i === index ? { ...f, isPublic } : f)
        }));
    }, []);

    const handleLinkedTradesChange = useCallback((ids) => {
        setValues((prev) => ({ ...prev, linkedTradeIds: ids }));
    }, []);

    const buildPayload = useCallback(() => {
        const startMonth = values.startDate ? MONTH_NAMES[values.startDate.getMonth()] : '';
        const startYear = values.startDate ? String(values.startDate.getFullYear()) : '';
        const endMonth = values.endDate ? MONTH_NAMES[values.endDate.getMonth()] : '';
        const endYear = values.endDate ? String(values.endDate.getFullYear()) : '';

        return {
            documentType: values.documentType,
            certificateType: values.documentType,
            institution: values.institution,
            issuingOrganization: values.institution,
            title: values.institution,
            locationIssued: values.locationIssued,
            locationIssuedText: values.locationIssuedText,
            location: values.locationIssuedText,
            specialty: values.specialty,
            degreeLevel: values.degree,
            degree: values.specialty || values.degree,
            expirationDate: formatDate(values.expirationDate),
            startMonth,
            startYear,
            year: startYear,
            endMonth,
            endYear,
            startDateFormatted: formatDate(values.startDate),
            endDateFormatted: formatDate(values.endDate),
            documentNumber: values.documentNumber,
            gpa: values.gpa,
            description: values.description,
            visibility: values.visibility,
            linkedTradeIds: values.linkedTradeIds,
            certificates: values.files.map((f) => ({
                id: f.id,
                name: f.name,
                url: f.url,
                size: f.size,
                type: f.type,
                isPublic: f.isPublic,
                tags: [],
                uploadedAt: new Date().toISOString().split('T')[0]
            })),
            files: values.files.map((f) => ({
                id: f.id,
                name: f.name,
                url: f.url,
                size: f.size,
                type: f.type,
                isPublic: f.isPublic
            }))
        };
    }, [values]);

    const handleSave = useCallback(async () => {
        if (!values.institution.trim()) {
            toast.error('Institution is required');
            return;
        }
        if (!values.documentType) {
            toast.error('Document type is required');
            return;
        }

        try {
            setSaving(true);
            const payload = buildPayload();

            if (isEditing) {
                await extendedProfileApi.updateEducation(user.id, certId, payload, originalData || {});
                toast.success('Certificate updated successfully');
            } else {
                await extendedProfileApi.addEducation(user.id, payload);
                toast.success('Certificate created successfully');
            }

            navigate(paths.dashboard.certificates.index);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save certificate');
        } finally {
            setSaving(false);
        }
    }, [values, isEditing, certId, user?.id, originalData, buildPayload, navigate]);

    const visibilityValues = useMemo(() => values.visibility, [values.visibility]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Seo title={isEditing ? 'Edit Document' : 'Add New Document'} />
            <Box component="main" sx={{ flexGrow: 1, py: 8, px: { xs: 2, sm: 3, lg: 8 } }}>
                <Box sx={{ maxWidth: 900, pb: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <Button
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(paths.dashboard.certificates.index)}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                    </Stack>

                    <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                        {isEditing ? 'Edit document' : 'Add New Document'}
                    </Typography>

                    <BasicInfoSection
                        values={values}
                        onChange={handleChange}
                    />

                    <EducationDetailsSection
                        values={values}
                        onChange={handleChange}
                    />

                    <AttachedFilesSection
                        files={values.files}
                        onDrop={handleFileDrop}
                        onRemove={handleFileRemove}
                        onTogglePublic={handleFileTogglePublic}
                    />

                    <VisibilitySettingsSection
                        values={visibilityValues}
                        onChange={handleVisibilityChange}
                    />

                    <LinkToTradesSection
                        trades={trades}
                        linkedTradeIds={values.linkedTradeIds}
                        onChange={handleLinkedTradesChange}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(paths.dashboard.certificates.index)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={18} /> : <SaveOutlinedIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {isEditing ? 'Save Changes' : 'Create Document'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default memo(CertificateCreatePage);
