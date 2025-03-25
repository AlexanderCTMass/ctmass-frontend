import React, {memo, useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import {Add, Close, CloudUpload, Delete, Edit, ExpandMore} from "@mui/icons-material";
import ImageModalWindow from "./ImageModalWindow";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

const Education = ({education, profile, setProfile, isMyProfile}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentEducation, setCurrentEducation] = useState({
        id: Date.now().toString(),
        title: '',
        year: '',
        description: '',
        degree: '',
        certificates: []
    });
    const [editIndex, setEditIndex] = useState(null);
    const [modalState, setModalState] = useState({
        open: false,
        images: [],
        index: 0
    });

    // Стили для изображений сертификатов
    const certificateStyle = {
        width: 180, // Увеличено с 100
        height: 180, // Увеличено с 100
        objectFit: 'cover',
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'transform 0.3s',
        '&:hover': {transform: 'scale(1.05)'}
    };

    const handleSaveEducation = useCallback(async () => {
        try {
            let updatedEducation;

            if (editIndex !== null) {
                const updated = await extendedProfileApi.updateEducation(profile.profile.id, currentEducation.id, currentEducation, profile.education[editIndex]);
                updatedEducation = profile.education.map((edu, index) =>
                    index === editIndex ? updated : edu
                );
            } else {
                const addedEducation = await extendedProfileApi.addEducation(
                    profile.profile.id,
                    currentEducation
                );
                updatedEducation = [...profile.education, addedEducation];
            }

            setProfile(prev => ({
                ...prev,
                education: updatedEducation
            }));

            setDialogOpen(false);
        } catch (error) {
            console.error("Error saving education:", error);
        }
    }, [currentEducation, editIndex, profile, setProfile]);

    // Удаление образования
    const handleDeleteEducation = useCallback((edu) => {
        setProfile((prev) => {
            const updatedEducation = prev.education.filter(item => item.id !== edu.id);
            return {...prev, education: updatedEducation};
        });

        extendedProfileApi.deleteEducation(profile.profile.id, edu.id, edu.certificates)
    }, [setProfile]);


    // Загрузка изображения сертификата
    const handleCertificateUpload = useCallback((event, certIndex = null) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const newCertificate = {
                id: Date.now().toString(),
                name: file.name,
                url: reader.result,
                tags: [],
                uploadedAt: new Date().toISOString().split('T')[0]
            };

            setCurrentEducation(prev => ({
                ...prev,
                certificates: certIndex !== null
                    ? prev.certificates.map((cert, idx) =>
                        idx === certIndex ? newCertificate : cert
                    )
                    : [...prev.certificates, newCertificate]
            }));
        };
        reader.readAsDataURL(file);
    }, []);

    const openEditDialog = useCallback((index) => {
        const edu = education[index];
        // Глубокое копирование сертификатов с тегами
        setCurrentEducation({
            ...edu,
            certificates: edu.certificates.map(cert => ({
                ...cert,
                tags: [...cert.tags] // Копируем массив тегов
            }))
        });
        setEditIndex(index);
        setDialogOpen(true);
    }, [education]);


    const renderCertificates = (certificates) => (
        <Box sx={{mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
            {certificates?.map((cert, certIndex) => (
                <Box key={cert.id} sx={{position: 'relative'}}>
                    <Box
                        component="img"
                        src={cert.url}
                        sx={certificateStyle}
                        onClick={() => setModalState({
                            open: true,
                            images: certificates?.map(c => c.url),
                            index: certIndex
                        })}
                    />
                    {/* Полоска с тегами */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        p: 1,
                        minHeight: 48 // Увеличено место для тегов
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            maxHeight: 40,
                            overflow: 'hidden'
                        }}>
                            {cert.tags.map((tag, i) => (
                                <Typography
                                    key={i}
                                    variant="caption"
                                    sx={{
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        lineHeight: 1.2
                                    }}
                                >
                                    #{tag}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );

    return (
        <Box component="section" sx={{mt: 3}}>
            {/* Заголовок и кнопка добавления */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h6" color="text.secondary">EDUCATION</Typography>
                <Add color="success"
                     onClick={() => {
                         setCurrentEducation({
                             title: '',
                             year: '',
                             degree: '',
                             description: '',
                             certificates: []
                         });
                         setDialogOpen(true);
                     }}
                     sx={{
                         cursor: "pointer",
                         transition: "transform 0.2s ease-in-out",
                         "&:hover": {
                             transform: "scale(1.2)",
                         },
                         mr:1
                     }}
                />
            </Box>
            {/* Список образований */}
            {(!education || education.length === 0) ? (
                    <Typography color="text.secondary" fontSize="14px">there is no completed service
                        education</Typography>) :

                (education?.map((edu, index) => (
                    <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Box sx={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: "center"
                            }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">{edu?.degree} </Typography>
                                    <Typography variant="subtitle1">{edu?.title} ({edu?.year})</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {!edu?.certificates || edu?.certificates?.length === 0 ? "there are no attached certificates" : edu?.certificates?.length + " certificates"}
                                    </Typography>
                                </Box>
                                {isMyProfile && (
                                    <Box>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditDialog(index);
                                            }}
                                        >
                                            <Edit fontSize="small"/>
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteEducation(edu)}>
                                            <Delete fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Box sx={{pl: 2}}>
                                <Typography paragraph>{edu?.description}</Typography>
                                {renderCertificates(edu?.certificates)}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )))}

            {/* Диалоговое окно редактирования */}
            <Dialog fullWidth maxWidth="md" open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {editIndex !== null ? 'Edit Education' : 'Add New Education'}
                        <IconButton onClick={() => setDialogOpen(false)}>
                            <Close/>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        label="School"
                        value={currentEducation.title}
                        onChange={(e) => setCurrentEducation(prev => ({
                            ...prev,
                            title: e.target.value
                        }))}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Degree"
                        value={currentEducation.degree}
                        onChange={(e) => setCurrentEducation(prev => ({
                            ...prev,
                            degree: e.target.value
                        }))}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={currentEducation.year}
                        onChange={(e) => setCurrentEducation(prev => ({
                            ...prev,
                            year: e.target.value
                        }))}
                        margin="normal"
                        required
                        inputProps={{min: 1900, max: new Date().getFullYear()}}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={currentEducation.description}
                        onChange={(e) => setCurrentEducation(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        margin="normal"
                    />

                    {/* Блок сертификатов */}
                    <Typography variant="subtitle2" sx={{mt: 3, mb: 1}}>
                        Certificates
                    </Typography>

                    {currentEducation.certificates?.map((cert, certIndex) => (
                        <Box key={cert.id} sx={{mb: 2, border: '1px solid #ddd', borderRadius: 1, p: 2}}>
                            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                <Box
                                    component="img"
                                    src={cert.url}
                                    sx={{width: 60, height: 60, objectFit: 'cover', borderRadius: 1}}
                                />

                                <Box sx={{flexGrow: 1}}>
                                    <TextField
                                        fullWidth
                                        label="Certificate Name"
                                        value={cert.name}
                                        onChange={(e) => {
                                            const updatedCerts = [...currentEducation.certificates];
                                            updatedCerts[certIndex].name = e.target.value;
                                            setCurrentEducation(prev => ({
                                                ...prev,
                                                certificates: updatedCerts
                                            }));
                                        }}
                                        margin="dense"
                                    />

                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={[]}
                                        value={cert.tags}
                                        onChange={(_, newValue) => {
                                            const updatedCerts = [...currentEducation.certificates];
                                            updatedCerts[certIndex].tags = newValue;
                                            setCurrentEducation(prev => ({
                                                ...prev,
                                                certificates: updatedCerts
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Tags"
                                                margin="dense"
                                                placeholder="Add tags..."
                                            />
                                        )}
                                    />
                                </Box>

                                <IconButton
                                    onClick={() => {
                                        setCurrentEducation(prev => ({
                                            ...prev,
                                            certificates: prev.certificates.filter((_, idx) => idx !== certIndex)
                                        }));
                                    }}
                                >
                                    <Delete color="error"/>
                                </IconButton>
                            </Box>
                        </Box>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<CloudUpload/>}
                        component="label"
                        sx={{mt: 2}}
                    >
                        Add Certificate
                        <input
                            type="file"
                            hidden
                            onChange={(e) => handleCertificateUpload(e)}
                        />
                    </Button>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEducation}
                        disabled={!currentEducation.title || !currentEducation.year}
                    >
                        {editIndex !== null ? 'Save Changes' : 'Add Education'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ImageModalWindow
                open={modalState.open}
                handleClose={() => setModalState(prev => ({...prev, open: false}))}
                images={modalState.images}
                currentIndex={modalState.index}
                setCurrentIndex={(index) => setModalState(prev => ({...prev, index}))}
            />
        </Box>
    );
};

Education.propTypes = {
    education: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            year: PropTypes.string.isRequired,
            description: PropTypes.string,
            certificates: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired,
                    url: PropTypes.string.isRequired,
                    tags: PropTypes.arrayOf(PropTypes.string),
                    uploadedAt: PropTypes.string.isRequired
                })
            )
        })
    ).isRequired,
    setProfile: PropTypes.func.isRequired
};

export default memo(Education);