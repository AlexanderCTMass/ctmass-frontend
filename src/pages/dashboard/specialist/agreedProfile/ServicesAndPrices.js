import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
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
import React, {useState} from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import ImageModalWindow from "./ImageModalWindow";
import CloseIcon from "@mui/icons-material/Close";
import FullLoadServicesAutocomplete from "../../../../components/FullLoadServicesAutocomplete";

export default function ServiceAndPrices({profile, editMode}) {
    const [spec, setSpec] = useState(profile?.specialties);
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
    const [newService, setNewService] = useState({name: "", services: []});
    const [newItems, setNewItems] = useState([{description: "", price: "", images: []}]);

    const [editServiceIndex, setEditServiceIndex] = useState(null); // Для редактирования сервиса

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

    const handleImageUpload = (event, itemIndex) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedItems = [...newItems];
                updatedItems[itemIndex].images.push(reader.result);
                setNewItems(updatedItems);
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

    const deleteImage = (itemIndex, imgIndex) => {
        const updatedItems = [...newItems];
        updatedItems[itemIndex].images.splice(imgIndex, 1);
        setNewItems(updatedItems);
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
                        {service?.services?.map((services, detailIndex) => (
                            <Box key={detailIndex} sx={{mb: 2}}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={7}>
                                        <Typography>{services.description}</Typography>
                                    </Grid>
                                    <Grid item xs={3} sx={{textAlign: "right"}}>
                                        <Typography>{services.price}</Typography>
                                    </Grid>
                                </Grid>
                                {services.images?.length > 0 && (
                                    <Box sx={{ml: 2, mt: 2, display: "flex", flexWrap: "wrap", gap: 1}}>
                                        {services.images.map((image, imgIndex) => (
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
                                                    onClick={() => handleOpen(imgIndex, services.images)}
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
                    <FullLoadServicesAutocomplete externalSearchText={newService ? newService.name : ""}
                                                  onChange={(service) => {
                                                      setNewService(service)
                                                  }}/>
                    {newItems.map((item, itemIndex) => (
                        <Box key={itemIndex} sx={{
                            backgroundColor: "#ebebeb75", borderRadius: 2, padding: 0,
                        }}>
                            {editMode && (
                                <IconButton sx={{marginLeft: "auto"}} onClick={() => removeItem(itemIndex)}>
                                    <DeleteIcon color="error"/>
                                </IconButton>
                            )}
                            <Box sx={{mb: 2, px: 2, pb: 2}}>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <TextField
                                            fullWidth
                                            label="Item Description"
                                            value={item.description}
                                            onChange={(e) => {
                                                const updatedItems = [...newItems];
                                                updatedItems[itemIndex].description = e.target.value;
                                                setNewItems(updatedItems);
                                            }}
                                            margin="dense"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            label="Price"
                                            value={item.price}
                                            onChange={(e) => {
                                                const updatedItems = [...newItems];
                                                updatedItems[itemIndex].price = e.target.value;
                                                setNewItems(updatedItems);
                                            }}
                                            margin="dense"
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{mt: 2}}>
                                    <input
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        id={`upload-button-${itemIndex}`}
                                        type="file"
                                        onChange={(e) => handleImageUpload(e, itemIndex)}
                                    />
                                    <label htmlFor={`upload-button-${itemIndex}`}>
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
                                {item.images && item.images.length > 0 && (
                                    <Box sx={{mt: 2, display: "flex", flexWrap: "wrap", gap: 2, width: "100%"}}>
                                        {item.images.map((image, imgIndex) => (
                                            <Box key={imgIndex} position="relative"
                                                 sx={{flexGrow: 1, maxWidth: "147px"}}>
                                                <Box
                                                    component="img"
                                                    src={image}
                                                    sx={{
                                                        width: 150, // Занимает всю ширину родительского блока
                                                        height: 152,   // Фиксированная высота
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
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
                                                        onClick={() => deleteImage(itemIndex, imgIndex)}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}

                    <Button
                        variant="outlined"
                        onClick={addNewItem}
                        sx={{mt: 2}}
                        fullWidth
                    >
                        Add Item
                    </Button>
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