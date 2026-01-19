import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';
import { downloadFile } from 'src/utils/downloadFile';

const EducationSection = ({ education, summary }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedMap, setLoadedMap] = useState({});

    const visibleEducation = useMemo(
        () =>
            (education || []).filter(
                (item) =>
                    item &&
                    !item.isDeleted &&
                    item.isPrivate !== true
            ),
        [education]
    );

    const description = useMemo(() => {
        if (summary?.trim()) {
            return summary.trim();
        }

        const firstWithDescription = visibleEducation.find((item) => item?.description);
        if (firstWithDescription?.description) {
            return firstWithDescription.description;
        }

        return 'No information has been provided yet.';
    }, [summary, visibleEducation]);

    const certificates = useMemo(
        () =>
            visibleEducation.flatMap((item) =>
                (item?.certificates || [])
                    .filter((cert) => cert && cert.isPublic !== false)
                    .map((cert) => ({
                        id: cert.id || `${item.id}-${cert.name || cert.url || 'certificate'}`,
                        name: cert.name || 'Certificate',
                        year: cert.year || item.year || '',
                        issuer: cert.issuingOrganization || item.issuingOrganization || item.title || '',
                        location: item.location || '',
                        url: cert.url || '',
                        tags: cert.tags || []
                    }))
            ),
        [visibleEducation]
    );

    const mediaCertificates = useMemo(
        () => certificates.filter((cert) => Boolean(cert.url)),
        [certificates]
    );

    const textCertificates = useMemo(
        () => certificates.filter((cert) => !cert.url),
        [certificates]
    );

    const certificateImages = useMemo(
        () => mediaCertificates.map((cert) => cert.url),
        [mediaCertificates]
    );

    const handleOpenModal = useCallback(
        (index) => {
            setCurrentIndex(index);
            setModalOpen(true);
        },
        []
    );

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    const handleImageLoad = useCallback((id) => {
        setLoadedMap((prev) => ({ ...prev, [id]: true }));
    }, []);

    const handleDownload = useCallback((event, cert) => {
        event.stopPropagation();
        if (!cert.url) {
            return;
        }
        downloadFile(cert.url, cert.name || 'certificate');
    }, []);

    const hasEducation = visibleEducation.length > 0;
    const hasCertificates = mediaCertificates.length > 0 || textCertificates.length > 0;

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
            <Stack spacing={3.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Education &amp; Certificates
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>

                {hasEducation ? (
                    <Stack spacing={2}>
                        {visibleEducation.map((item) => (
                            <Box key={item.id}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {item.issuingOrganization || item.title || 'Education'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {[item.degree, item.location, item.year].filter(Boolean).join(' • ') || 'Details not provided.'}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No education records have been published yet.
                    </Typography>
                )}

                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <EmojiEventsIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                            Licenses &amp; Certificates
                        </Typography>
                    </Stack>

                    {hasCertificates ? (
                        <Stack spacing={2}>
                            {mediaCertificates.length > 0 && (
                                <Grid container spacing={1}>
                                    {mediaCertificates.map((cert, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={cert.id}>
                                            <Box
                                                onClick={() => handleOpenModal(index)}
                                                sx={{
                                                    position: 'relative',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    aspectRatio: '4 / 3',
                                                    backgroundColor: 'background.default'
                                                }}
                                            >
                                                {!loadedMap[cert.id] && (
                                                    <Skeleton
                                                        variant="rectangular"
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            height: '100%',
                                                            width: '100%'
                                                        }}
                                                    />
                                                )}

                                                <Box
                                                    component="img"
                                                    src={cert.url}
                                                    alt={cert.name}
                                                    onLoad={() => handleImageLoad(cert.id)}
                                                    onError={() => handleImageLoad(cert.id)}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        display: loadedMap[cert.id] ? 'block' : 'none'
                                                    }}
                                                />

                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.75) 100%)',
                                                        opacity: 0.95,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-end',
                                                        p: 2,
                                                        color: '#fff'
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                                        {[cert.issuer, cert.year].filter(Boolean).join(' • ')}
                                                    </Typography>
                                                </Box>

                                                <IconButton
                                                    size="small"
                                                    onClick={(event) => handleDownload(event, cert)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        bgcolor: 'rgba(0,0,0,0.65)',
                                                        color: '#fff',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0,0,0,0.8)'
                                                        }
                                                    }}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}

                            {textCertificates.length > 0 && (
                                <Stack spacing={1}>
                                    {textCertificates.map((cert) => (
                                        <Stack key={cert.id} direction="row" spacing={1} alignItems="center">
                                            <EmojiEventsIcon fontSize="small" color="disabled" />
                                            <Typography variant="body2">
                                                {cert.name}
                                                {[
                                                    cert.issuer && ` (${cert.issuer})`,
                                                    cert.year && `, ${cert.year}`
                                                ]
                                                    .filter(Boolean)
                                                    .join('')}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Licenses or certificates have not been uploaded yet.
                        </Typography>
                    )}
                </Stack>
            </Stack>

            <ImageModalWindow
                open={modalOpen}
                handleClose={handleCloseModal}
                images={certificateImages}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
            />
        </Paper>
    );
};

EducationSection.propTypes = {
    education: PropTypes.arrayOf(PropTypes.object),
    summary: PropTypes.string
};

EducationSection.defaultProps = {
    education: [],
    summary: ''
};

export default EducationSection;