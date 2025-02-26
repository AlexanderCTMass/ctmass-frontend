import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React, {useEffect, useState} from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import {collectionGroup, getDocs} from "firebase/firestore";
import {firestore} from "../../../../libs/firebase";
import ImageModalWindow from "./ImageModalWindow";

export default function ServiceAndPrices({profile, editMode, setProfile}) {
    const [spec, setSpec] = useState(profile?.specialties || []);
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
    const [editServiceIndex, setEditServiceIndex] = useState(null);
    const [currentService, setCurrentService] = useState({
        specialty: null,
        services: []
    });

    const [specialties, setSpecialties] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedServiceIndex, setExpandedServiceIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(firestore, "services"));

                const specialtiesData = specialtiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const servicesData = servicesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setSpecialties(specialtiesData);
                setAllServices(servicesData);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOpen = (imageIndex, images) => {
        setImages(images);
        setCurrentIndex(imageIndex);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setImages([]);
        setCurrentIndex(0);
    };

    const deleteService = (index, event) => {
        event.stopPropagation()
        const sp = spec.filter((_, i) => i !== index);
        setSpec(sp);
        setProfile(prev => ({
            ...prev,
            specialties: sp
        }));
        if (expandedServiceIndex === index) {
            setExpandedServiceIndex(null);
        }
    };

    const deleteServiceBlock = (index) => {
        const updatedServices = [...currentService.services];
        updatedServices.splice(index, 1);
        setCurrentService(prev => ({...prev, services: updatedServices}));
    };

    const openAddServiceDialog = () => {
        setCurrentService({specialty: null, services: []});
        setAddServiceDialogOpen(true);
        setEditServiceIndex(null);
        setExpandedServiceIndex(0); // Сбрасываем индекс раскрытого аккордиона
    };

    const openEditServiceDialog = (index, event) => {
        event.stopPropagation()
        setCurrentService(spec[index]);
        setAddServiceDialogOpen(true);
        setEditServiceIndex(index);
        setExpandedServiceIndex(0); // Сбрасываем индекс раскрытого аккордиона
    };

    const saveService = () => {
        let addedSpec;
        if (editServiceIndex !== null) {
            const updatedSpec = [...spec];
            updatedSpec[editServiceIndex] = currentService;
            addedSpec = updatedSpec;
        } else {
            addedSpec = [...spec, currentService];
        }
        setSpec(addedSpec);

        setProfile(prev => ({
            ...prev,
            specialties: addedSpec?.map(specialty => ({
                ...specialty,
                services: specialty.services
                    ? specialty.services.map(service =>
                        service.service && service.service.id
                            ? {...service, service: service.service.id}
                            : service
                    )
                    : []
            }))
        }));

        setAddServiceDialogOpen(false);
    };

    const handleSpecialtyChange = (_, newValue) => {
        setCurrentService({specialty: newValue.id, services: [], user: profile.profile.id});
        setExpandedServiceIndex(0); // Раскрываем первый аккордион
    };

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...currentService.services];
        updatedServices[index][field] = value;
        setCurrentService(prev => ({...prev, services: updatedServices}));
    };

    const handleImageUpload = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedServices = [...currentService.services];
                if (!updatedServices[index].images) {
                    updatedServices[index].images = [];
                }
                updatedServices[index].images.push(reader.result);
                setCurrentService(prev => ({...prev, services: updatedServices}));
            };
            reader.readAsDataURL(file);
        }
    };

    const deleteImage = (serviceIndex, imgIndex) => {
        const updatedServices = [...currentService.services];
        updatedServices[serviceIndex].images.splice(imgIndex, 1);
        setCurrentService(prev => ({...prev, services: updatedServices}));
    };

    const addNewServiceBlock = () => {
        setCurrentService(prev => ({
            ...prev,
            services: [...prev.services, {service: null, description: "", price: "", images: []}]
        }));
        setExpandedServiceIndex(currentService.services.length); // Раскрываем новый аккордион
    };

    const handleServiceSelection = (_, newValue, index) => {
        const updatedServices = [...currentService.services];
        updatedServices[index].service = newValue;
        setCurrentService(prev => ({...prev, services: updatedServices}));
    };

    const toggleAccordion = (index) => {
        setExpandedServiceIndex(expandedServiceIndex === index ? null : index);
    };

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography mt={3} color="text.secondary" gutterBottom>
                    SERVICES & PRICES
                </Typography>
                {editMode && (
                    <Button sx={{mt: 2, mb: 0.5}} variant="outlined" onClick={openAddServiceDialog}
                            startIcon={<AddIcon color="primary"/>}>
                        Add new Service
                    </Button>
                )}
            </Box>

            {(!spec || spec.length === 0) &&
                <Typography color="secondary">there is no completed service information</Typography>}
            {profile.specialties.map((service, serviceIndex) => {
                const specialty = specialties.find(s => s.id === service.specialty);
                return (
                    <Accordion key={serviceIndex}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Typography fontWeight="bold">{specialty?.label || "Unknown Specialty"}</Typography>
                                {editMode && (
                                    <Box>
                                        <IconButton onClick={(event) => openEditServiceDialog(serviceIndex, event)}
                                                    sx={{ml: 1}}>
                                            <ModeEditIcon/>
                                        </IconButton>
                                        <IconButton onClick={(event) => deleteService(serviceIndex, event)}
                                                    sx={{ml: 1}}>
                                            <DeleteIcon color="error"/>
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ml: 2}}>
                            {service.services.map((serviceDetail, detailIndex) => (
                                <Box key={detailIndex} sx={{
                                    mb: 2,
                                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                                    borderRadius: '8px',
                                    p: 2
                                }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={7}>
                                            <Typography
                                                fontWeight="bold">{allServices.find(s => s.id === serviceDetail.service)?.label}</Typography>
                                            <Typography>{serviceDetail.description}</Typography>
                                        </Grid>
                                        <Grid item xs={3} sx={{textAlign: "right"}}>
                                            <Typography>{serviceDetail.price}</Typography>
                                        </Grid>
                                    </Grid>
                                    {serviceDetail.images?.length > 0 && (
                                        <Box sx={{ml: 2, mt: 2, display: "flex", flexWrap: "wrap", gap: 1}}>
                                            {serviceDetail.images.map((image, imgIndex) => (
                                                <Box key={imgIndex} position="relative">
                                                    <Box
                                                        component="img"
                                                        src={image}
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            objectFit: "cover",
                                                            borderRadius: "4px",
                                                        }}
                                                        onClick={() => handleOpen(imgIndex, serviceDetail.images)}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            <ImageModalWindow
                open={open}
                handleClose={handleClose}
                images={images}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
            />

            <Dialog open={addServiceDialogOpen} onClose={() => setAddServiceDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {editServiceIndex !== null ? "Edit Service" : "Add New Service"}
                        <IconButton onClick={() => setAddServiceDialogOpen(false)}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <CircularProgress/>
                    ) : (
                        <div>
                            <Typography variant="h6" sx={{mb: 1}}>
                                Choose a specialty
                            </Typography>
                            <Autocomplete
                                options={specialties}
                                getOptionLabel={(option) => option.label}
                                value={specialties.find(s => s.id === currentService.specialty) || null}
                                onChange={(_, newValue) => handleSpecialtyChange(_, newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Kind of specialty" placeholder="Electrician"/>
                                )}
                            />

                            <Typography variant="h6" sx={{mb: 1, mt: 2}}>
                                Select the services you want to offer
                            </Typography>
                            {currentService.services.map((service, index) => (
                                <Accordion
                                    key={index}
                                    expanded={expandedServiceIndex === index}
                                    onChange={() => toggleAccordion(index)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Typography
                                                fontWeight="bold">{allServices.find(s => s.id === service.service)?.label || "New Service"}</Typography>

                                            <IconButton
                                                onClick={() => deleteServiceBlock(index)}
                                                color="error"
                                                sx={{marginLeft: "auto"}}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Autocomplete
                                            sx={{flex: 1}}
                                            options={allServices.filter(s => s.parent === currentService.specialty)}
                                            getOptionLabel={(option) => option.label}
                                            value={allServices.find(s => s.id === service.service)}
                                            onChange={(_, newValue) => handleServiceSelection(_, newValue, index)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Kind of service"
                                                    placeholder="e.g Electrical wiring installation"
                                                />
                                            )}
                                            disabled={!currentService.specialty}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Описание"
                                            value={service.description}
                                            onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                                            margin="dense"
                                        />
                                        <TextField
                                            fullWidth
                                            label="Цена"
                                            value={service.price}
                                            onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                                            margin="dense"
                                        />
                                        <Box sx={{mt: 2}}>
                                            <input
                                                accept="image/*"
                                                style={{display: 'none'}}
                                                id={`upload-button-${index}`}
                                                type="file"
                                                onChange={(e) => handleImageUpload(e, index)}
                                            />
                                            <label htmlFor={`upload-button-${index}`}>
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    fullWidth
                                                    startIcon={<CloudUploadIcon/>}
                                                >
                                                    Upload Image
                                                </Button>
                                            </label>
                                        </Box>
                                        {service.images?.length > 0 && (
                                            <Box sx={{mt: 2, display: "flex", flexWrap: "wrap", gap: 1}}>
                                                {service.images.map((image, imgIndex) => (
                                                    <Box key={imgIndex} position="relative">
                                                        <Box
                                                            component="img"
                                                            src={image}
                                                            sx={{
                                                                width: 100,
                                                                height: 100,
                                                                objectFit: "cover",
                                                                borderRadius: "4px",
                                                            }}
                                                            onClick={() => handleOpen(imgIndex, service.images)}
                                                        />
                                                        {editMode && (
                                                            <IconButton
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    right: 0,
                                                                    color: "error.main",
                                                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                                }}
                                                                onClick={() => deleteImage(index, imgIndex)}
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{mt: 2}}
                                onClick={addNewServiceBlock}
                            >
                                Add Another Service
                            </Button>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddServiceDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={saveService} color="primary">
                        {editServiceIndex !== null ? "Save Changes" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}