import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import ImageModalWindow from "./ImageModalWindow";

export default function ServicesAndPrices({ services: initialServices }) {
    const [services, setServices] = useState(initialServices);
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState({ description: "", price: "", images: [] });
    const [newService, setNewService] = useState({ name: "", details: [] });
    const [currentServiceIndex, setCurrentServiceIndex] = useState(null);

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

    const toggleEditing = () => setIsEditing(!isEditing);

    const deleteService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const deleteDetail = (serviceIndex, detailIndex) => {
        const updatedServices = [...services];
        updatedServices[serviceIndex].details.splice(detailIndex, 1);
        setServices(updatedServices);
    };

    const openAddItemDialog = (serviceIndex) => {
        setCurrentServiceIndex(serviceIndex);
        setNewItem({ description: "", price: "", images: [] });
        setAddItemDialogOpen(true);
    };

    const saveNewItem = () => {
        const updatedServices = [...services];
        updatedServices[currentServiceIndex].details.push(newItem);
        setServices(updatedServices);
        setAddItemDialogOpen(false);
    };

    const openAddServiceDialog = () => {
        setNewService({ name: "", details: [] });
        setAddServiceDialogOpen(true);
    };

    const saveNewService = () => {
        setServices([...services, newService]);
        setAddServiceDialogOpen(false);
    };

    return (
        <div>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography mt={3} color="text.secondary">
                    SERVICES & PRICES
                </Typography>
                <Box display="flex" gap={1}>
                    <Button onClick={openAddServiceDialog} startIcon={<AddIcon />}>
                        Add Service
                    </Button>
                    <Button onClick={toggleEditing} startIcon={<AddIcon />}>
                        {isEditing ? "Done" : "Edit"}
                    </Button>
                </Box>
            </Box>

            {services.map((service, serviceIndex) => (
                <Accordion key={serviceIndex}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            <Typography fontWeight="bold">{service.name}</Typography>
                            {isEditing && (
                                <IconButton onClick={() => deleteService(serviceIndex)} sx={{ ml: 1 }}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ ml: 2 }}>
                        {service.details.map((details, detailIndex) => (
                            <Box key={detailIndex}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography sx={{ marginRight: "auto" }}>
                                        {details.description}
                                    </Typography>
                                    <Typography>{details.price}</Typography>
                                    {isEditing && (
                                        <IconButton
                                            onClick={() => deleteDetail(serviceIndex, detailIndex)}
                                            sx={{ ml: 2 }}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    )}
                                </Box>
                                {details.images?.length > 0 && (
                                    <Box sx={{ ml: 2, mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {details.images.map((image, imgIndex) => (
                                            <Box
                                                key={imgIndex}
                                                component="img"
                                                src={image}
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                                onClick={() => handleOpen(imgIndex, details.images)}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        ))}

                        {/* Кнопка добавления нового айтема */}
                        {isEditing && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => openAddItemDialog(serviceIndex)}
                                sx={{ mt: 2 }}
                            >
                                Add Item
                            </Button>
                        )}
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

            {/* Модальное окно для добавления нового айтема */}
            <Dialog open={addItemDialogOpen} onClose={() => setAddItemDialogOpen(false)}>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Images (comma separated URLs)"
                        value={newItem.images.join(", ")}
                        onChange={(e) =>
                            setNewItem({ ...newItem, images: e.target.value.split(",").map((url) => url.trim()) })
                        }
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddItemDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={saveNewItem} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно для добавления нового сервиса */}
            <Dialog open={addServiceDialogOpen} onClose={() => setAddServiceDialogOpen(false)}>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Service Name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddServiceDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={saveNewService} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
