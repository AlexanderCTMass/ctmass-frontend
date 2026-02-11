import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    Paper,
    Popover,
    Rating,
    Stack,
    Switch,
    TablePagination,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { useAuth } from 'src/hooks/use-auth';
import toast from 'react-hot-toast';
import { PortfolioCreateModal } from '../modals/PortfolioCreateModal';

const PortfolioCard = ({
    portfolio,
    index,
    onEdit,
    onDelete,
    onTogglePublic,
    onToggleFavorite
}) => {
    const [isFavorite, setIsFavorite] = useState(portfolio.isFavorite || false);

    const handleToggleFavorite = useCallback((e) => {
        e.stopPropagation();
        setIsFavorite(prev => !prev);
        onToggleFavorite(portfolio.id, !isFavorite);
    }, [isFavorite, onToggleFavorite, portfolio.id]);

    const averageRating = useMemo(() => {
        if (!portfolio.images || portfolio.images.length === 0) return 0;
        const totalLikes = portfolio.images.reduce((sum, img) => sum + (img.likes?.length || 0), 0);
        return (totalLikes / portfolio.images.length).toFixed(1);
    }, [portfolio.images]);

    return (
        <Draggable draggableId={portfolio.id} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                        position: 'relative',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                        }
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <CardMedia
                            component="img"
                            height="200"
                            image={portfolio.thumbnail || portfolio.images?.[0]?.url || '/placeholder.jpg'}
                            alt={portfolio.title}
                            sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                            onClick={handleToggleFavorite}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                            }}
                            size="small"
                        >
                            {isFavorite ? (
                                <StarIcon color="warning" />
                            ) : (
                                <StarBorderIcon />
                            )}
                        </IconButton>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" fontWeight={600}>
                                {averageRating}
                            </Typography>
                        </Box>
                    </Box>

                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                            {portfolio.title}
                        </Typography>
                        {portfolio.location && (
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {portfolio.location}
                                </Typography>
                            </Stack>
                        )}
                        {portfolio.tags && portfolio.tags.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                {portfolio.tags.slice(0, 3).map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                                {portfolio.tags.length > 3 && (
                                    <Chip
                                        label={`+${portfolio.tags.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        )}

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 2 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                    Public
                                </Typography>
                                <Switch
                                    checked={portfolio.public !== false}
                                    onChange={(e) => onTogglePublic(portfolio.id, e.target.checked)}
                                    size="small"
                                />
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                                <IconButton
                                    size="small"
                                    onClick={() => onEdit(portfolio)}
                                    color="primary"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(portfolio.id)}
                                    color="error"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Draggable>
    );
};

PortfolioCard.propTypes = {
    portfolio: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onTogglePublic: PropTypes.func.isRequired,
    onToggleFavorite: PropTypes.func.isRequired
};

const PortfolioTab = ({ trade }) => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [tagAnchorEl, setTagAnchorEl] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        if (!user?.id || !trade?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const portfolioData = await extendedProfileApi.getPortfolio(user.id);
            const tradePortfolio = portfolioData.filter(p => p.tradeId === trade.id);
            setPortfolio(tradePortfolio.sort((a, b) => (a.order || 0) - (b.order || 0)));
        } catch (error) {
            console.error('Failed to load portfolio:', error);
            toast.error('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    }, [user?.id, trade?.id]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const allTags = useMemo(() => {
        const tagsSet = new Set();
        portfolio.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet);
    }, [portfolio]);

    const filteredPortfolio = useMemo(() => {
        return portfolio.filter(p => {
            const matchesSearch = !searchQuery ||
                p.title?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTags = selectedTags.length === 0 ||
                selectedTags.every(tag => p.tags?.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [portfolio, searchQuery, selectedTags]);

    const paginatedPortfolio = useMemo(() => {
        return filteredPortfolio.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredPortfolio, page, rowsPerPage]);

    const handleDragEnd = useCallback(async (result) => {
        if (!result.destination) return;

        const items = Array.from(filteredPortfolio);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setPortfolio(updatedItems);

        try {
            await Promise.all(
                updatedItems.map(item =>
                    extendedProfileApi.updatePortfolioWithoutImages(user.id, item.id, { order: item.order })
                )
            );
        } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order');
            fetchPortfolio();
        }
    }, [filteredPortfolio, user.id, fetchPortfolio]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleTagFilterClick = useCallback((event) => {
        setTagAnchorEl(event.currentTarget);
    }, []);

    const handleTagFilterClose = useCallback(() => {
        setTagAnchorEl(null);
    }, []);

    const handleToggleTag = useCallback((tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const handleOpenModal = useCallback((portfolioItem = null) => {
        if (portfolioItem) {
            setCurrentPortfolio(portfolioItem);
            setIsEditMode(true);
        } else {
            setCurrentPortfolio(null);
            setIsEditMode(false);
        }
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setCurrentPortfolio(null);
        setIsEditMode(false);
    }, []);

    const handleSubmitPortfolio = useCallback(async (values) => {
        try {
            const portfolioData = {
                title: values.title,
                date: values.date,
                specialtyId: values.specialtyId,
                shortDescription: values.shortDescription,
                location: values.location,
                tags: values.tags,
                tradeId: trade.id,
                beforeImage: values.beforeImages[0]?.url || values.beforeImages[0]?.preview,
                afterImage: values.afterImages[0]?.url || values.afterImages[0]?.preview,
                images: [
                    ...(values.beforeImages || []),
                    ...(values.afterImages || [])
                ]
            };

            if (isEditMode && currentPortfolio) {
                await extendedProfileApi.updatePortfolio(
                    user.id,
                    currentPortfolio.id,
                    portfolioData,
                    currentPortfolio.images || []
                );
                toast.success('Portfolio updated successfully');
            } else {
                await extendedProfileApi.addPortfolio(user.id, portfolioData, true);
                toast.success('Portfolio added successfully');
            }

            fetchPortfolio();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save portfolio:', error);
            toast.error('Failed to save portfolio');
        }
    }, [isEditMode, currentPortfolio, user.id, trade.id, fetchPortfolio, handleCloseModal]);

    const handleDeletePortfolio = useCallback(async (portfolioId) => {
        if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
            return;
        }

        try {
            const portfolioItem = portfolio.find(p => p.id === portfolioId);
            await extendedProfileApi.deletePortfolio(user.id, portfolioId, portfolioItem?.images || []);
            toast.success('Portfolio deleted successfully');
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to delete portfolio:', error);
            toast.error('Failed to delete portfolio');
        }
    }, [portfolio, user.id, fetchPortfolio]);

    const handleTogglePublic = useCallback(async (portfolioId, isPublic) => {
        try {
            await extendedProfileApi.updatePortfolioWithoutImages(user.id, portfolioId, { public: isPublic });
            setPortfolio(prev => prev.map(p =>
                p.id === portfolioId ? { ...p, public: isPublic } : p
            ));
            toast.success(`Portfolio ${isPublic ? 'published' : 'unpublished'}`);
        } catch (error) {
            console.error('Failed to toggle public:', error);
            toast.error('Failed to update portfolio');
        }
    }, [user.id]);

    const handleToggleFavorite = useCallback(async (portfolioId, isFavorite) => {
        try {
            await extendedProfileApi.updatePortfolioWithoutImages(user.id, portfolioId, { isFavorite });
            setPortfolio(prev => prev.map(p =>
                p.id === portfolioId ? { ...p, isFavorite } : p
            ));
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            toast.error('Failed to update favorite');
        }
    }, [user.id]);

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                    Portfolio Management
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                >
                    Add Project
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                    size="small"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                    }}
                    sx={{ width: 300 }}
                    InputProps={{
                        sx: {
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            '& .MuiInputBase-input': {
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1,
                                py: 0,
                            },
                            '& .MuiInputAdornment-root': {
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                maxHeight: '100%',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: 22,
                            },
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleTagFilterClick}
                >
                    Filter by Tag {selectedTags.length > 0 && `(${selectedTags.length})`}
                </Button>
                <Popover
                    open={Boolean(tagAnchorEl)}
                    anchorEl={tagAnchorEl}
                    onClose={handleTagFilterClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <Paper sx={{ width: 250, maxHeight: 300 }}>
                        <List sx={{ py: 0 }}>
                            {allTags.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        primary="No tags available"
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    />
                                </ListItem>
                            ) : (
                                allTags.map((tag) => (
                                    <ListItem key={tag} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleToggleTag(tag)}
                                            selected={selectedTags.includes(tag)}
                                        >
                                            <ListItemText primary={tag} />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Popover>
            </Stack>

            {loading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    Loading portfolio...
                </Typography>
            ) : paginatedPortfolio.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    {filteredPortfolio.length === 0 && portfolio.length > 0
                        ? 'No portfolio items found matching your search'
                        : 'No portfolio items yet. Click "Add Project" to get started.'}
                </Typography>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="portfolio-list">
                        {(provided) => (
                            <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: 'repeat(1, 1fr)',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)'
                                    }
                                }}
                            >
                                {paginatedPortfolio.map((portfolioItem, index) => (
                                    <PortfolioCard
                                        key={portfolioItem.id}
                                        portfolio={portfolioItem}
                                        index={index}
                                        onEdit={handleOpenModal}
                                        onDelete={handleDeletePortfolio}
                                        onTogglePublic={handleTogglePublic}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {filteredPortfolio.length > rowsPerPage && (
                <Paper sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <TablePagination
                        rowsPerPageOptions={[6, 12, 18]}
                        component="div"
                        count={filteredPortfolio.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {modalOpen && (
                <PortfolioCreateModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitPortfolio}
                    profile={user}
                    tradeId={trade.id}
                    currentPortfolio={currentPortfolio || {}}
                    isEditMode={isEditMode}
                />
            )}
        </Stack>
    );
};

PortfolioTab.propTypes = {
    trade: PropTypes.object.isRequired
};

export default PortfolioTab;
