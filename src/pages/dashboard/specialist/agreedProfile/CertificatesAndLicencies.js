import React, {memo, useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Grid, Typography, Skeleton, Chip} from "@mui/material";
import ImageModalWindow from "./ImageModalWindow";

const CertificatesAndLicencies = ({profile}) => {
    const certs = profile?.education
        ?.filter(edu => !edu.isDeleted) // Фильтруем education по isDeleted
        ?.flatMap(edu => edu?.certificates || []);
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

    return (
        <Box component="section" sx={{mt: 4}}>
            {/* Восстановленный заголовок */}
            <Typography variant="h6" color="text.secondary" gutterBottom>
                CERTIFICATES & LICENCIES
            </Typography>

            {/* Фильтр по тегам */}
            <Box sx={{mb: 2}}>
                {allTags?.map(tag => (
                    <Chip
                        key={tag}
                        label={`#${tag}`}
                        onClick={() => handleTagToggle(tag)}
                        color={selectedTags.includes(tag) ? "primary" : "default"}
                        sx={{m: 0.5}}
                    />
                ))}
            </Box>

            <Grid container spacing={2}>
                {(!filteredCerts || filteredCerts.length === 0) &&
                    <Typography sx={{ml: 2}} color="secondary">there is no completed certificates
                        information</Typography>}

                {filteredCerts?.map((cert, index) => (
                    <Grid item xs={12} sm={6} md={4} key={cert.id}>
                        <Box sx={{
                            position: 'relative',
                            borderRadius: 1,
                            width: '97%',
                            height: 200,
                            overflow: 'hidden',
                            '&:hover .tags-overlay': {opacity: 1}
                        }}>
                            {/* Прелоадер */}
                            {!loadingStates[cert.id] && (
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height={200}
                                    sx={{borderRadius: 1}}
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
                                    '&:hover': {transform: 'scale(1.02)'}
                                }}
                                onLoad={() => setLoadingStates(prev => ({...prev, [cert.id]: true}))}
                                onError={() => setLoadingStates(prev => ({...prev, [cert.id]: true}))}
                                onClick={() => handleOpen(index)}
                            />

                            {/* Полоска с тегами */}
                            {cert.tags?.length > 0 && (
                                <Box className="tags-overlay" sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '97%',
                                    left: 0,
                                    right: 0,
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    p: 1,
                                    transition: 'opacity 0.3s',
                                    opacity: 0.8
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
    certs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        url: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
    })),
};

export default memo(CertificatesAndLicencies);