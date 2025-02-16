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
    Stack,
    TextField,
    Typography,
    Chip, TableRow, TableCell, TableHead, TableBody, Table, TableContainer, Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React, {useEffect, useState} from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import ImageModalWindow from "./ImageModalWindow";
import CloseIcon from "@mui/icons-material/Close";
import {collectionGroup, getDocs} from "firebase/firestore";
import {firestore} from "../../../../libs/firebase";
import InfoIcon from "@mui/icons-material/Info";

export default function ServiceAndPrices({profile, editMode}) {
    const [spec, setSpec] = useState(profile?.specialties || []);
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
    const [newService, setNewService] = useState({name: "", services: []});
    const [newItems, setNewItems] = useState([{description: "", price: "", images: []}]);

    const [editServiceIndex, setEditServiceIndex] = useState(null); // Для редактирования сервиса

    const [specialties, setSpecialties] = useState([]);
    const [allServices, setAllServices] = useState([]); // Все услуги
    const [specialty, setSpecialty] = useState(null);
    const [services, setServices] = useState([]); // Выбранные услуги
    const [loading, setLoading] = useState(true);

    const [randomSpec, setRandomSpec] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(firestore, "services"));

                const specialtiesData = specialtiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    path: doc.ref.path,
                    ...doc.data()
                }));

                const servicesData = servicesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    path: doc.ref.path,
                    ...doc.data()
                }));

                setSpecialties(specialtiesData);
                setRandomSpec(specialtiesData.filter(item => item.id === profile.specialties[0].specialty)[0])
                setAllServices(servicesData); // Сохраняем все услуги
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (profile) {
            setSpecialty(profile.specialties || null);
            setServices(profile.services || []);
        }
    }, [profile]);

    const handleSpecialtyChange = (_, newValue, itemIndex) => {
        const updatedSpec = [...spec];
        updatedSpec[itemIndex].specialty = newValue;
        updatedSpec[itemIndex].services = []; // Сбрасываем услуги при смене специальности
        setSpec(updatedSpec);
    };

    const handleOpen = (imageIndex, certImages) => {
        setImages(certImages);
        setCurrentIndex(imageIndex);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImages([]);
        setCurrentIndex(0);
    };

    const deleteService = (index) => {
        setSpec(spec.filter((_, i) => i !== index));
    };

    const openAddServiceDialog = () => {
        setNewService({name: "", services: []});
        setNewItems([{description: "", price: "", images: []}]);
        setAddServiceDialogOpen(true);
    };

    const saveNewService = () => {
        debugger
        const updatedService = {name: newService.label, services: newItems};
        setSpec([...spec, updatedService]);
        setAddServiceDialogOpen(false);
    };

    const handleImageUpload = (event, itemIndex, serviceIndex) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedSpec = [...spec];
                // Проверяем, существует ли массив images, и создаем его, если нет
                if (!updatedSpec[itemIndex].services[serviceIndex].images) {
                    updatedSpec[itemIndex].services[serviceIndex].images = [];
                }
                // Добавляем новое изображение
                updatedSpec[itemIndex].services[serviceIndex].images.push(reader.result);
                setSpec(updatedSpec);
            };
            reader.readAsDataURL(file);
        }
    };

    const addNewItem = () => {
        setNewItems([...newItems, {description: "", price: "", images: []}]);
    };

    const removeItem = (index) => {
        const updatedItems = newItems.filter((_, i) => i !== index);
        setNewItems(updatedItems);
    };

    const deleteImage = (itemIndex, serviceIndex, imgIndex) => {
        const updatedSpec = [...spec];
        updatedSpec[itemIndex].services[serviceIndex].images.splice(imgIndex, 1);
        setSpec(updatedSpec);
    };

    const openEditServiceDialog = (serviceIndex) => {
        setEditServiceIndex(serviceIndex);
        setNewService(spec[serviceIndex]);
        setNewItems(spec[serviceIndex].services);
        setAddServiceDialogOpen(true);
    };

    const saveEditedService = () => {
        debugger
        const updatedService = {name: newService.label, services: newItems};
        const updatedServices = [...spec];
        updatedServices[editServiceIndex] = updatedService;
        setSpec(updatedServices);
        setAddServiceDialogOpen(false);
        setEditServiceIndex(null);
    };

    const handleServiceChange = (_, newValue, itemIndex) => {
        const updatedSpec = [...spec];
        updatedSpec[itemIndex].services = newValue.map(service => ({
            ...service,
            description: "",
            price: "",
            images: []
        }));
        setSpec(updatedSpec);
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
            {spec && spec.map((service, serviceIndex) => (
                <Accordion key={serviceIndex}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            <Typography fontWeight="bold">{service.name}</Typography>
                            {editMode && (
                                <Box>
                                    <IconButton onClick={() => openEditServiceDialog(serviceIndex)} sx={{ml: 1}}>
                                        <ModeEditIcon/>
                                    </IconButton>
                                    <IconButton onClick={() => deleteService(serviceIndex)} sx={{ml: 1}}>
                                        <DeleteIcon color="error"/>
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ml: 2}}>
                        {service?.services?.map((service, detailIndex) => (
                            <Box key={detailIndex} sx={{mb: 2}}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={7}>
                                        <TextField
                                            fullWidth
                                            label="Item Description"
                                            value={service.description}
                                            onChange={(e) => {
                                                const updatedSpec = [...spec];
                                                updatedSpec[serviceIndex].services[detailIndex].description = e.target.value;
                                                setSpec(updatedSpec);
                                            }}
                                            margin="dense"
                                        />
                                    </Grid>
                                    <Grid item xs={3} sx={{textAlign: "right"}}>
                                        <TextField
                                            fullWidth
                                            label="Price"
                                            value={service.price}
                                            onChange={(e) => {
                                                const updatedSpec = [...spec];
                                                updatedSpec[serviceIndex].services[detailIndex].price = e.target.value;
                                                setSpec(updatedSpec);
                                            }}
                                            margin="dense"
                                        />
                                    </Grid>
                                </Grid>
                                {service.images?.length > 0 && (
                                    <Box sx={{ml: 2, mt: 2, display: "flex", flexWrap: "wrap", gap: 1}}>
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
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}

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
                            <CloseIcon/> {/* Кнопка закрытия */}
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {spec.map((item, itemIndex) => {
                        const currentSpecId = item.specialty;
                        const currentSpec = specialties.find(spec => spec.id === currentSpecId);

                        return (
                            <div key={itemIndex}>
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
                                            value={currentSpec}
                                            onChange={(_, newValue) => handleSpecialtyChange(_, newValue, itemIndex)}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Kind of specialty"
                                                           placeholder="Electrician"/>
                                            )}
                                        />
                                    </div>
                                )}

                                {loading ? (
                                    <CircularProgress/>
                                ) : (
                                    <div>
                                        <Typography variant="h6" sx={{mb: 1, mt: 2}}>
                                            Select the services you want to offer
                                        </Typography>
                                        <Autocomplete
                                            multiple
                                            options={allServices.filter(s => s.parent === currentSpecId)}
                                            getOptionLabel={(option) => option.label}
                                            value={item.services}
                                            onChange={(_, newValue) => handleServiceChange(_, newValue, itemIndex)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Kind of service"
                                                    placeholder="e.g Electrical wiring installation"
                                                />
                                            )}
                                            disabled={!currentSpec}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={option.label}
                                                        {...getTagProps({index})}
                                                    />
                                                ))
                                            }
                                        />
                                        {item.services.map((service, serviceIndex) => (
                                            <Box key={serviceIndex} sx={{mt: 2, border: "1px solid #ddd", borderRadius: 2, p: 2}}>
                                                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: "bold"}}>
                                                    Сервис: {service.label}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    label="Описание"
                                                    value={service.description}
                                                    onChange={(e) => {
                                                        const updatedSpec = [...spec];
                                                        updatedSpec[itemIndex].services[serviceIndex].description = e.target.value;
                                                        setSpec(updatedSpec);
                                                    }}
                                                    margin="dense"
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Цена"
                                                    value={service.price}
                                                    onChange={(e) => {
                                                        const updatedSpec = [...spec];
                                                        updatedSpec[itemIndex].services[serviceIndex].price = e.target.value;
                                                        setSpec(updatedSpec);
                                                    }}
                                                    margin="dense"
                                                />
                                                <Box sx={{mt: 2}}>
                                                    <input
                                                        accept="image/*"
                                                        style={{display: 'none'}}
                                                        id={`upload-button-${itemIndex}-${serviceIndex}`}
                                                        type="file"
                                                        onChange={(e) => handleImageUpload(e, itemIndex, serviceIndex)}
                                                    />
                                                    <label htmlFor={`upload-button-${itemIndex}-${serviceIndex}`}>
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
                                                                        onClick={() => deleteImage(itemIndex, serviceIndex, imgIndex)}
                                                                    >
                                                                        <DeleteIcon fontSize="small"/>
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddServiceDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={editServiceIndex !== null ? saveEditedService : saveNewService} color="primary">
                        {editServiceIndex !== null ? "Save Changes" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}