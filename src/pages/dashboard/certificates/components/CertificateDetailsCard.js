import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TagIcon from '@mui/icons-material/Tag';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';

const formatAttendanceDates = (cert) => {
    const start = [cert.startMonth, cert.startYear].filter(Boolean).join(' ');
    const end = [cert.endMonth, cert.endYear].filter(Boolean).join(' ');
    if (start && end) return `${start} — ${end}`;
    return start || end || '';
};

const getDisplayTitle = (cert) => {
    if (cert.degreeLevel && cert.specialty) return `${cert.degreeLevel} in ${cert.specialty}`;
    return cert.specialty || cert.degreeLevel || cert.institution || cert.issuingOrganization || cert.title || 'Certificate';
};

const FieldRow = memo(({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
                <Box sx={{ mt: 0.25, color: 'text.secondary', flexShrink: 0, width: 24 }}>
                    <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ letterSpacing: 0.6, textTransform: 'uppercase', display: 'block' }}
                    >
                        {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
                        {value}
                    </Typography>
                </Box>
            </Box>
            <Divider />
        </>
    );
});

FieldRow.displayName = 'FieldRow';

const CertificateDetailsCard = ({ certificate }) => {
    const visibility = useMemo(() => certificate?.visibility || {}, [certificate]);
    const documentType = certificate?.documentType || certificate?.certificateType || '';
    const displayTitle = useMemo(() => getDisplayTitle(certificate || {}), [certificate]);
    const attendanceDates = useMemo(() => formatAttendanceDates(certificate || {}), [certificate]);

    const fields = useMemo(() => [
        {
            icon: AccountBalanceOutlinedIcon,
            label: 'Institution',
            value: visibility.showInstitution !== false
                ? (certificate?.institution || certificate?.issuingOrganization || '')
                : ''
        },
        {
            icon: BadgeOutlinedIcon,
            label: 'Specialty',
            value: visibility.showSpecialty !== false ? (certificate?.specialty || '') : ''
        },
        {
            icon: MenuBookOutlinedIcon,
            label: 'Degree Level',
            value: visibility.showDegree !== false ? (certificate?.degreeLevel || '') : ''
        },
        {
            icon: CalendarTodayOutlinedIcon,
            label: 'Attendance Dates',
            value: visibility.showStartEndDates !== false ? attendanceDates : ''
        },
        {
            icon: TagIcon,
            label: 'Document Number',
            value: visibility.showDocumentNumber !== false ? (certificate?.documentNumber || '') : ''
        },
        {
            icon: GradeOutlinedIcon,
            label: 'Grade / GPA',
            value: visibility.showGPA !== false ? (certificate?.gpa || '') : ''
        }
    ], [certificate, visibility, attendanceDates]);

    if (!certificate) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        bgcolor: (theme) => `${theme.palette.primary.main}14`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <SchoolOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                </Box>

                {documentType && (
                    <Chip
                        label={documentType}
                        size="small"
                        sx={{ borderRadius: 2, fontSize: 12 }}
                    />
                )}

                <Typography variant="h5" fontWeight={700} textAlign="center">
                    {displayTitle}
                </Typography>
            </Stack>

            <Divider sx={{ mb: 0.5 }} />

            <Box>
                {fields.map((field) => (
                    <FieldRow
                        key={field.label}
                        icon={field.icon}
                        label={field.label}
                        value={field.value}
                    />
                ))}
            </Box>
        </Paper>
    );
};

CertificateDetailsCard.propTypes = {
    certificate: PropTypes.object
};

CertificateDetailsCard.defaultProps = {
    certificate: null
};

export default memo(CertificateDetailsCard);
