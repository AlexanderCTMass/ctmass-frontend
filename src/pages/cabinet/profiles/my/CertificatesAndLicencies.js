import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Typography, Skeleton, Chip, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import ImageModalWindow from "./ImageModalWindow";
import PlusCard from 'src/components/plus-card'
import { downloadFile } from 'src/utils/downloadFile';
import { VisibilityIcon } from 'src/pages/components/visibility-icon';
import { extendedProfileApi } from './data/extendedProfileApi';

const CertificatesAndLicencies = ({ profile, setProfile, isMyProfile, onAddCertificate = () => { } }) => {
    const certs = profile?.education
        .filter((e) => !e?.isDeleted)
        .flatMap((e) => {
            const list = isMyProfile
                ? e.certificates
                : e.certificates.filter((c) => c.isPublic !== false);
            return list.map((c) => ({ ...c, eduId: e.id }));
        });
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingStates, setLoadingStates] = useState({});
    const [selectedTags, setSelectedTags] = useState([]);

    const allTags = [...new Set(certs?.flatMap(c => c.tags || []))];
    const filteredCerts = certs?.filter(cert =>
        selectedTags.length === 0 || selectedTags.some(tag => cert.tags?.includes(tag))
    );

    const handleOpen = useCallback((index) => {
        setCurrentIndex(index);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => setOpen(false), []);

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => prev.includes(tag)
            ? prev.filter(t => t !== tag)
            : [...prev, tag]);
    };

    const handleCertificateToggle = async (eduId, certId) => {
        setProfile(prev => {
            const nextEdu = prev.education.map(e =>
                e.id !== eduId
                    ? e
                    : {
                        ...e,
                        certificates: e.certificates.map(c =>
                            c.id === certId ? { ...c, isPublic: !c.isPublic } : c
                        )
                    }
            );
            return { ...prev, education: nextEdu };
        });

        const edu = profile.education.find(e => e.id === eduId);
        if (!edu) return;
        await extendedProfileApi.updateEducation(
            profile.profile.id,
            eduId,
            {
                ...edu,
                certificates: edu.certificates.map(c =>
                    c.id === certId ? { ...c, isPublic: !c.isPublic } : c
                )
            },
            edu
        );
    };

    return (
        <Box component="section" sx={{ mt: 4 }}>
            {/* Восстановленный заголовок */}
            <Typography variant="h6" color="text.secondary" gutterBottom>
                CERTIFICATES & LICENCIES
            </Typography>

            {/* Фильтр по тегам */}
            <Box sx={{ mb: 2 }}>
                {allTags?.map(tag => (
                    <Chip
                        key={tag}
                        label={`#${tag}`}
                        onClick={() => handleTagToggle(tag)}
                        color={selectedTags.includes(tag) ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                    />
                ))}
            </Box>

            <Grid container spacing={2}>
                {/* {(!filteredCerts || filteredCerts.length === 0) &&
                    <Typography sx={{ ml: 2, mt: 2 }} color="text.secondary" fontSize="14px">Scans of certificates or licenses have not been added.
                        {isMyProfile && (
                            <> <br />To add them, use the <strong>Education section → Add → Upload File.</strong></>
                        )}
                    </Typography>} */}
                {(!filteredCerts || filteredCerts.length === 0) && isMyProfile && (
                    <Grid item xs={12} sm={6} md={4}>
                        <PlusCard onClick={onAddCertificate} />
                    </Grid>
                )}

                {filteredCerts?.map((cert, index) => (
                    <Grid item xs={12} sm={6} md={4} key={cert.id}>
                        <Box sx={{
                            position: 'relative',
                            borderRadius: 1,
                            width: '97%',
                            height: 200,
                            overflow: 'hidden',
                            '&:hover .tags-overlay': { opacity: 1 }
                        }}>
                            {/* Прелоадер */}
                            {!loadingStates[cert.id] && (
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height={200}
                                    sx={{ borderRadius: 1 }}
                                />
                            )}

                            {/* Изображение */}
                            <Box
                                component="img"
                                src={cert.url}
                                alt={cert.name}
                                sx={{
                                    width: '97%',
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    display: loadingStates[cert.id] ? 'block' : 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                                onLoad={() => setLoadingStates(prev => ({ ...prev, [cert.id]: true }))}
                                onError={() => setLoadingStates(prev => ({ ...prev, [cert.id]: true }))}
                                onClick={() => handleOpen(index)}
                            />

                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    downloadFile(cert.url, cert.name);
                                }}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    zIndex: 3,
                                    bottom: 4,
                                    left: 4,
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                }}
                            >
                                <DownloadIcon fontSize="small" />
                            </IconButton>

                            {isMyProfile && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCertificateToggle(cert.eduId, cert.id);
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 3,
                                        bottom: 4,
                                        right: 12,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                    }}
                                >
                                    <VisibilityIcon value={cert.isPublic !== false} onToggle={() => { }} isWhite />
                                </IconButton>
                            )}

                            {/* Полоска с тегами */}
                            {cert.tags?.length > 0 && (
                                <Box className="tags-overlay" sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '100%',
                                    left: 0,
                                    right: 0,
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    p: 1,
                                    transition: 'opacity 0.3s',
                                    opacity: 0.8,
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.5,
                                        maxHeight: 40,
                                        overflow: 'hidden'
                                    }}>
                                        {cert.tags.map(tag => (
                                            <Typography
                                                key={tag}
                                                variant="caption"
                                                sx={{
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    lineHeight: 1.2,
                                                    '&:not(:last-child)::after': {
                                                        content: '"•"',
                                                        marginLeft: '4px',
                                                        color: 'rgba(255,255,255,0.5)'
                                                    }
                                                }}
                                            >
                                                #{tag}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}

                {filteredCerts?.length > 0 && isMyProfile && (
                    <Grid item xs={12} sm={6} md={4}>
                        <PlusCard onClick={onAddCertificate} />
                    </Grid>
                )}
            </Grid>

            <ImageModalWindow
                open={open}
                handleClose={handleClose}
                images={filteredCerts?.map(c => c.url)}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
            />
        </Box>
    );
};

CertificatesAndLicencies.propTypes = {
    profile: PropTypes.object.isRequired,
    setProfile: PropTypes.func.isRequired,
    isMyProfile: PropTypes.bool,
    onAddCertificate: PropTypes.func
};

export default memo(CertificatesAndLicencies);