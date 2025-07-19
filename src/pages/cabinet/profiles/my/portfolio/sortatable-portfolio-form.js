import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    CircularProgress,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CloseIcon from '@mui/icons-material/Close';
import {
    collection,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
} from 'firebase/firestore';
import {firestore} from "src/libs/firebase";

const SortablePortfolioModal = ({ profileId, open, onClose }) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (open) {
            fetchPortfolioItems();
        } else {
            // Сброс состояния при закрытии
            setPortfolioItems([]);
            setLoading(true);
            setError(null);
            setSuccess(false);
            setIsDirty(false);
        }
    }, [open]);

    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            const portfolioRef = collection(firestore, 'profiles', profileId, 'portfolio');
            // Получаем все документы без фильтрации по order
            const querySnapshot = await getDocs(portfolioRef);

            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });

            // Сортируем элементы:
            // 1. Сначала элементы с order (сортировка по возрастанию)
            // 2. Затем элементы без order (в порядке их получения)
            items.sort((a, b) => {
                const aOrder = a.order !== undefined ? a.order : Infinity;
                const bOrder = b.order !== undefined ? b.order : Infinity;
                return aOrder - bOrder;
            });

            // Обновляем state
            setPortfolioItems(items);
        } catch (err) {
            console.error('Error fetching portfolio items:', err);
            setError('Failed to load portfolio items');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(portfolioItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        setPortfolioItems(updatedItems);
        setIsDirty(true);
    };

    const handleSaveOrder = async () => {
        try {
            const batch = writeBatch(firestore);
            portfolioItems.forEach((item) => {
                const itemRef = doc(firestore, 'profiles', profileId, 'portfolio', item.id);
                batch.update(itemRef, { order: item.order });
            });

            await batch.commit();
            setSuccess(true);
            setIsDirty(false);
            onClose();
        } catch (err) {
            console.error('Error updating order:', err);
            setError('Failed to save new order');
        }
    };

    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Sort Portfolio Items</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : portfolioItems.length === 0 ? (
                    <Typography variant="body1" align="center" p={2}>
                        No portfolio items found.
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Drag and drop items to reorder them.
                        </Typography>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="portfolioItems">
                                {(provided) => (
                                    <List
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        sx={{ mt: 1 }}
                                    >
                                        {portfolioItems.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <Paper
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        elevation={2}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        <ListItem>
                                                            <ListItemAvatar>
                                                                <Avatar
                                                                    src={item.thumbnail}
                                                                    alt={item.title}
                                                                    sx={{ width: 80, height: 60, mr:2 }}
                                                                    variant="square"
                                                                />
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={item.title}
                                                                secondary={item.description}
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                #{index + 1}
                                                            </Typography>
                                                        </ListItem>
                                                    </Paper>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </List>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSaveOrder}
                    variant="contained"
                    color="primary"
                    disabled={!isDirty || loading}
                >
                    Save Order
                </Button>
            </DialogActions>

            <Snackbar
                open={error !== null}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert severity="success" onClose={handleCloseSnackbar}>
                    Order saved successfully!
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default SortablePortfolioModal;