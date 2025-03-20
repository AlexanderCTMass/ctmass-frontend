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
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React, {useEffect, useState} from "react";

export const ProfileSpecialtiesEditModalView = ({
                                                    profile,
                                                    setProfile,
                                                    allSpecialties,
                                                    allServices,
                                                    currentService,
                                                    addServiceDialogOpen,
                                                    setAddServiceDialogOpen,
                                                    editServiceIndex,
                                                    expandedServiceIndex,
                                                    setExpandedServiceIndex,
                                                    loading,
                                                    editMode,
                                                    handleOpen,
                                                }) => {
    const [localService, setLocalService] = useState(currentService);
    const [initialSpecialties, setInitialSpecialties] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (addServiceDialogOpen) {
            let newLocalService = currentService;

            // Если добавляем новую специальность, добавляем пустой сервис
            if (editServiceIndex === null) {
                newLocalService = {
                    ...newLocalService,
                    services: [{ service: null, description: "", price: "", images: [] }],
                };
            }

            setLocalService(newLocalService);
            setInitialSpecialties(JSON.parse(JSON.stringify(profile.specialties || [])));
        }
    }, [addServiceDialogOpen, currentService, profile.specialties, editServiceIndex]);

    const validateForm = () => {
        const newErrors = {};

        if (!localService.specialty) {
            newErrors.specialty = "Specialty is required";
        }

        if (localService.services.length === 0) {
            newErrors.services = "At least one service is required";
        }

        localService.services.forEach((service, index) => {
            if (!service.service) {
                newErrors[`service-${index}`] = "Service is required";
            }
            if (!service.description) {
                newErrors[`description-${index}`] = "Description is required";
            }
            if (!service.price) {
                newErrors[`price-${index}`] = "Price is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const toggleAccordion = (index) => {
        setExpandedServiceIndex(expandedServiceIndex === index ? null : index);
    };

    const filterSpecialties = () => {
        const usedSpecialtyIds = profile.specialties.map((s) => s.specialty);
        return allSpecialties.filter((s) => !usedSpecialtyIds.includes(s.id));
    };

    const filterServices = (index) => {
        const usedServiceIds = localService.services
            .map((service) => service.service)
            .filter((id) => id !== null && id !== undefined);

        return allServices
            .filter((s) => s.parent === localService.specialty)
            .filter((s) => !usedServiceIds.includes(s.id));
    };

    const deleteServiceBlock = (index) => {
        const updatedServices = [...localService.services];
        updatedServices.splice(index, 1);
        setLocalService((prev) => ({...prev, services: updatedServices}));
    };

    const handleSpecialtyChange = (_, newValue) => {
        const newService = {
            specialty: newValue.id,
            services: [{ service: null, description: "", price: "", images: [] }], // Добавляем пустой сервис
            user: profile.profile.id,
        };
        setLocalService(newService);
        setExpandedServiceIndex(0);
    };

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...localService.services];
        updatedServices[index][field] = value;
        setLocalService((prev) => ({...prev, services: updatedServices}));
    };

    const handleImageUpload = (event, index) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const updatedServices = [...localService.services];
            if (!updatedServices[index].images) {
                updatedServices[index].images = [];
            }

            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    updatedServices[index].images.push(reader.result);
                    setLocalService((prev) => ({...prev, services: updatedServices}));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const deleteImage = (serviceIndex, imgIndex) => {
        const updatedServices = [...localService.services];
        updatedServices[serviceIndex].images.splice(imgIndex, 1);
        setLocalService((prev) => ({...prev, services: updatedServices}));
    };

    const addNewServiceBlock = () => {
        setLocalService((prev) => ({
            ...prev,
            services: [...prev.services, {service: null, description: "", price: "", images: []}],
        }));
        setExpandedServiceIndex(localService.services.length);
    };

    const handleServiceSelection = (_, newValue, index) => {
        const updatedServices = [...localService.services];
        updatedServices[index].service = newValue.id;
        setLocalService((prev) => ({...prev, services: updatedServices}));
    };

    const saveService = () => {
        setIsSubmitted(true);
        if (!validateForm()) {
            return;
        }
        let addedSpec;
        if (editServiceIndex !== null) {
            const updatedSpec = [...profile.specialties];
            updatedSpec[editServiceIndex] = localService;
            addedSpec = updatedSpec;
        } else {
            addedSpec = [...profile.specialties, localService];
        }

        setProfile((prev) => ({
            ...prev,
            specialties: addedSpec?.map((specialty) => ({
                ...specialty,
                services: specialty.services
                    ? specialty.services.map((service) =>
                        service.service && service.service.id
                            ? {...service, service: service.service.id}
                            : service
                    )
                    : [],
            })),
        }));
        setAddServiceDialogOpen(false);
    };

    const handleClose = () => {
        setAddServiceDialogOpen(false);
        setLocalService(currentService);
        setProfile((prev) => ({
            ...prev,
            specialties: initialSpecialties,
        }));
        setIsSubmitted(false); // Сбрасываем состояние isSubmitted
    };

    const filteredSpecialties = filterSpecialties();

    return (
        <Dialog open={addServiceDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {editServiceIndex !== null ? "Edit Service" : "Add New Service"}
                    <IconButton onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {!loading ? (
                    <CircularProgress/>
                ) : (
                    <div>
                        <Typography variant="h6" sx={{mb: 1}}>
                            Choose a specialty
                        </Typography>
                        <Autocomplete
                            options={filteredSpecialties}
                            getOptionLabel={(option) => option.label}
                            value={allSpecialties.find((s) => s.id === localService.specialty) || null}
                            onChange={handleSpecialtyChange}
                            renderInput={(params) => (
                                <TextField {...params} label="Kind of specialty"
                                                       placeholder="Electrician"
                                                       error={isSubmitted && !!errors.specialty}
                                                       helperText={isSubmitted && errors.specialty}/>
                                )}
                        />

                        <Typography variant="h6" sx={{mb: 1, mt: 2}}>
                            Select the services you want to offer
                        </Typography>
                        {localService.services.map((service, index) => (
                            <Accordion
                                key={index}
                                expanded={expandedServiceIndex === index}
                                onChange={() => toggleAccordion(index)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography fontWeight="bold">
                                            {allServices.find((s) => s.id === service.service)?.label || "New Service"}
                                        </Typography>

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
                                        options={filterServices(index)}
                                        getOptionLabel={(option) => option.label}
                                        value={allServices.find((s) => s.id === service.service)}
                                        onChange={(_, newValue) => handleServiceSelection(_, newValue, index)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Kind of service"
                                                placeholder="e.g Electrical wiring installation"
                                                error={isSubmitted && !!errors[`service-${index}`]}
                                                helperText={isSubmitted && errors[`service-${index}`]}
                                            />
                                        )}
                                        disabled={!localService.specialty}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={service.description}
                                        onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                                        margin="dense"
                                        error={isSubmitted && !!errors[`description-${index}`]}
                                        helperText={isSubmitted && errors[`description-${index}`]}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        value={service.price}
                                        onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                                        margin="dense"
                                        error={isSubmitted && !!errors[`price-${index}`]}
                                        helperText={isSubmitted && errors[`price-${index}`]}
                                    />
                                    <Box sx={{mt: 2}}>
                                        <input
                                            accept="image/*"
                                            style={{display: "none"}}
                                            id={`upload-button-${index}`}
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, index)}
                                            multiple
                                        />
                                        <label htmlFor={`upload-button-${index}`}>
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                fullWidth
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Images
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
                        <Button variant="contained" fullWidth sx={{mt: 2}} onClick={addNewServiceBlock}>
                            Add Service
                        </Button>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>handleClose()} color="secondary">
                    Cancel
                </Button>
                <Button onClick={saveService} color="primary" disabled={!validateForm}>
                    {editServiceIndex !== null ? "Save Changes" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};