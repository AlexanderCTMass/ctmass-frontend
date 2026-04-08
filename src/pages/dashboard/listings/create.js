import { useCallback, useEffect, useState, forwardRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Stack,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    Chip,
    IconButton,
    InputAdornment,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { AddressAutoComplete } from 'src/components/address/AddressAutoComplete';
import {
    Save as SaveIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Info as InfoIcon,
    ArrowBack as ArrowBackIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import {
    listingService,
    LISTING_STATUS,
    LISTING_CATEGORIES,
    LISTING_TYPES,
    LISTING_CONDITIONS
} from 'src/service/listing-service';
import { FileDropzone } from 'src/components/file-dropzone';
import { RouterLink } from 'src/components/router-link';
import { QuillEditor } from 'src/components/quill-editor';
import { IMaskInput } from 'react-imask';
import { isValidUSPhone } from 'src/utils/validation/phone';

const PhoneMaskInput = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{ '0': /[0-9]/ }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

// Компонент для предпросмотра изображений
const ImagePreview = ({ src, onRemove, isMain, onSetMain }) => (
    <Paper
        sx={{
            position: 'relative',
            width: 120,
            height: 120,
            overflow: 'hidden',
            borderRadius: 1,
            border: isMain ? '2px solid' : '1px solid',
            borderColor: isMain ? 'primary.main' : 'divider',
            cursor: 'pointer',
            '&:hover': {
                '& .image-overlay': {
                    opacity: 1
                }
            }
        }}
        onClick={onSetMain}
    >
        <Box
            component="img"
            src={src}
            sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }}
        />

        <Box
            className="image-overlay"
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s'
            }}
        >
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                sx={{ color: 'white' }}
            >
                <DeleteIcon />
            </IconButton>
        </Box>

        {isMain && (
            <Chip
                size="small"
                label="Main"
                color="primary"
                sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    height: 20,
                    '& .MuiChip-label': { px: 1, fontSize: '0.625rem' }
                }}
            />
        )}
    </Paper>
);

const ListingForm = ({ mode = 'create' }) => {
    const navigate = useNavigate();
    const { listingId } = useParams();
    const { user } = useAuth();
    const snackbar = useSnackbar();

    const [loading, setLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagesToRemoves, setImagesToRemoves] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [addressLocation, setAddressLocation] = useState(null);

    // Состояние формы
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        priceType: 'fixed',
        category: '',
        type: 'sale',
        condition: '',
        location: '',
        addressLocation: null,
        contactPhone: user.phone || '',
        contactMethod: 'any',
        status: LISTING_STATUS.ACTIVE,
        allowOffers: true,
        showPhone: true
    });

    // Загрузка данных при редактировании
    useEffect(() => {
        const loadListing = async () => {
            if (mode === 'edit' && listingId) {
                try {
                    setLoading(true);
                    const listing = await listingService.getListingById(listingId);

                    // Проверка прав
                    if (listing.author.id !== user.id && user.role !== 'admin') {
                        setError('You do not have permission to edit this listing');
                        return;
                    }

                    setFormData({
                        title: listing.title || '',
                        description: listing.description || '',
                        price: listing.price?.toString() || '',
                        priceType: listing.priceType || 'fixed',
                        category: listing.category || '',
                        type: listing.type || 'sale',
                        condition: listing.condition || '',
                        location: listing.location || '',
                        addressLocation: listing.addressLocation || null,
                        contactPhone: listing.contactInfo?.phone || '',
                        contactMethod: listing.contactInfo?.preferContactMethod || 'any',
                        status: listing.status || LISTING_STATUS.ACTIVE,
                        allowOffers: listing.allowOffers !== false,
                        showPhone: listing.showPhone !== false
                    });
                    setAddressLocation(listing.addressLocation || null);

                    setImages(listing.images || []);
                    setError(null);
                } catch (err) {
                    console.error('Error loading listing:', err);
                    setError('Failed to load listing');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadListing();
    }, [mode, listingId, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleImageDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => file);
        setImageFiles(prev => [...prev, ...newFiles]);

        // Создаем превью
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleImageRemove = (index) => {
        setImagesToRemoves(prev => [...prev, images[index]]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Валидация
        if (!formData.title.trim()) {
            snackbar.error('Title is required');
            return;
        }
        if (!formData.description.trim()) {
            snackbar.error('Description is required');
            return;
        }
        if (!formData.category) {
            snackbar.error('Category is required');
            return;
        }

        setSubmitting(true);

        try {
            // Подготовка данных
            const listingData = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                images: images
            };

            // Переупорядочиваем изображения, чтобы главное было первым
            if (images.length > 0 && mainImageIndex > 0) {
                const reorderedImages = [images[mainImageIndex], ...images.filter((_, i) => i !== mainImageIndex)];
                listingData.images = reorderedImages;
            }

            if (mode === 'create') {
                // Создание нового объявления
                const newListing = await listingService.createListing(
                    listingData,
                    user,
                    imageFiles
                );
                snackbar.success('Listing created successfully');
                navigate(paths.dashboard.listings.details.replace(':listingId', newListing.id));
            } else {
                // Обновление существующего
                await listingService.updateListing(
                    listingId,
                    listingData,
                    user,
                    imageFiles,
                    imagesToRemoves || []
                );
                snackbar.success('Listing updated successfully');
                navigate(paths.dashboard.listings.details.replace(':listingId', listingId));
            }
        } catch (error) {
            console.error('Error saving listing:', error);
            snackbar.error('Failed to save listing');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (mode === 'create') {
            navigate(paths.dashboard.listings.index);
        } else {
            navigate(paths.dashboard.listings.details.replace(':listingId', listingId));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 8 }}>
                <Container maxWidth="xl">
                    <Alert severity="error">{error}</Alert>
                    <Button
                        component={RouterLink}
                        href={paths.dashboard.listings.index}
                        sx={{ mt: 2 }}
                    >
                        Back to Listings
                    </Button>
                </Container>
            </Box>
        );
    }

    return (
        <>
            <Seo title={mode === 'create' ? 'Create Listing' : 'Edit Listing'} />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    {/* Заголовок */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <IconButton onClick={handleCancel}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h3">
                            {mode === 'create' ? 'Create New Listing' : 'Edit Listing'}
                        </Typography>
                    </Stack>

                    <Grid container spacing={4}>
                        {/* Левая колонка - основная информация */}
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3}>
                                {/* Основная информация */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="h6">
                                                Basic Information
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                required
                                                label="Title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                helperText="A clear descriptive title helps buyers find your listing"
                                            />

                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Description
                                                </Typography>
                                                <QuillEditor
                                                    placeholder="Describe your item in detail..."
                                                    value={formData.description}
                                                    onChange={handleDescriptionChange}
                                                    disabled={submitting}
                                                    minHeight={200}
                                                />
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth required>
                                                        <InputLabel>Category</InputLabel>
                                                        <Select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            label="Category"
                                                            disabled={submitting}
                                                        >
                                                            {LISTING_CATEGORIES.map((cat) => (
                                                                <MenuItem key={cat.value} value={cat.value}>
                                                                    {cat.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Type</InputLabel>
                                                        <Select
                                                            name="type"
                                                            value={formData.type}
                                                            onChange={handleInputChange}
                                                            label="Type"
                                                            disabled={submitting}
                                                        >
                                                            {LISTING_TYPES.map((type) => (
                                                                <MenuItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Condition</InputLabel>
                                                        <Select
                                                            name="condition"
                                                            value={formData.condition}
                                                            onChange={handleInputChange}
                                                            label="Condition"
                                                            disabled={submitting}
                                                        >
                                                            {LISTING_CONDITIONS.map((cond) => (
                                                                <MenuItem key={cond.value} value={cond.value}>
                                                                    {cond.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                            </Grid>

                                            <AddressAutoComplete
                                                location={addressLocation}
                                                handleSuggestionClick={(place) => {
                                                    if (!place) {
                                                        setFormData(prev => ({ ...prev, location: '', addressLocation: null }));
                                                        setAddressLocation(null);
                                                        return;
                                                    }
                                                    const normalized = place.id ? place : { ...place, id: `manual-${place.place_name || Date.now()}` };
                                                    setFormData(prev => ({ ...prev, location: normalized.place_name ?? '', addressLocation: normalized }));
                                                    setAddressLocation(normalized);
                                                }}
                                                withMap={Boolean(addressLocation)}
                                                label="Location"
                                                placeholder="470 Prospect Street, Hadley, Massachusetts 01035"
                                                textFieldProps={{
                                                    helperText: 'Autocomplete supports United States addresses.',
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LocationIcon />
                                                            </InputAdornment>
                                                        )
                                                    },
                                                    disabled: submitting
                                                }}
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Изображения */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="h6">
                                                Images
                                            </Typography>

                                            {images.length > 0 && (
                                                <>
                                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                        {images.map((img, index) => (
                                                            <ImagePreview
                                                                key={index}
                                                                src={img}
                                                                isMain={index === mainImageIndex}
                                                                onRemove={() => handleImageRemove(index)}
                                                                onSetMain={() => setMainImageIndex(index)}
                                                            />
                                                        ))}
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Click on an image to set it as main. First image will be the
                                                        cover.
                                                    </Typography>
                                                </>
                                            )}

                                            <FileDropzone
                                                accept={{ 'image/*': [] }}
                                                maxFiles={10 - images.length}
                                                onDrop={handleImageDrop}
                                                caption="Upload up to 10 images (JPG, PNG, GIF)"
                                                disabled={submitting || images.length >= 10}
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Правая колонка - цена и дополнительные настройки */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                {/* Цена */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="h6">
                                                Pricing
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                label="Price"
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <MoneyIcon />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />

                                            <FormControl fullWidth>
                                                <InputLabel>Price Type</InputLabel>
                                                <Select
                                                    name="priceType"
                                                    value={formData.priceType}
                                                    onChange={handleInputChange}
                                                    label="Price Type"
                                                    disabled={submitting}
                                                >
                                                    <MenuItem value="fixed">Fixed Price</MenuItem>
                                                    <MenuItem value="negotiable">Negotiable</MenuItem>
                                                    <MenuItem value="free">Free</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name="allowOffers"
                                                        checked={formData.allowOffers}
                                                        onChange={handleSwitchChange}
                                                        disabled={submitting}
                                                    />
                                                }
                                                label="Allow offers"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Контактная информация */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="h6">
                                                Contact Information
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                error={!!formData.contactPhone && !isValidUSPhone(formData.contactPhone)}
                                                helperText={!!formData.contactPhone && !isValidUSPhone(formData.contactPhone) ? 'Enter a valid US phone number (+1 and 10 digits)' : 'Optional. Will be shown to interested buyers'}
                                                InputProps={{ inputComponent: PhoneMaskInput }}
                                            />

                                            <FormControl fullWidth>
                                                <InputLabel>Preferred Contact Method</InputLabel>
                                                <Select
                                                    name="contactMethod"
                                                    value={formData.contactMethod}
                                                    onChange={handleInputChange}
                                                    label="Preferred Contact Method"
                                                    disabled={submitting}
                                                >
                                                    <MenuItem value="any">Any</MenuItem>
                                                    <MenuItem value="email">Email only</MenuItem>
                                                    <MenuItem value="phone">Phone only</MenuItem>
                                                    <MenuItem value="chat">Chat only</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name="showPhone"
                                                        checked={formData.showPhone}
                                                        onChange={handleSwitchChange}
                                                        disabled={submitting}
                                                    />
                                                }
                                                label="Show phone number in listing"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Публикация */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="h6">
                                                Publishing
                                            </Typography>

                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    label="Status"
                                                    disabled={submitting}
                                                >
                                                    <MenuItem value={LISTING_STATUS.ACTIVE}>Active (Publish
                                                        now)</MenuItem>
                                                    <MenuItem value={LISTING_STATUS.DRAFT}>Save as Draft</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <Alert severity="info" icon={<InfoIcon />}>
                                                Active listings are visible to everyone. Drafts are only visible to you.
                                            </Alert>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Действия */}
                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                            >
                                                {submitting ? 'Saving...' : mode === 'create' ? 'Publish Listing' : 'Save Changes'}
                                            </Button>

                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                onClick={handleCancel}
                                                disabled={submitting}
                                            >
                                                Cancel
                                            </Button>

                                            {mode === 'edit' && (
                                                <Button
                                                    fullWidth
                                                    variant="text"
                                                    color="error"
                                                    startIcon={<VisibilityIcon />}
                                                    component={RouterLink}
                                                    href={paths.dashboard.listings.details.replace(':listingId', listingId)}
                                                >
                                                    View Listing
                                                </Button>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

// Экспортируем для create и edit
export const CreateListing = () => <ListingForm mode="create" />;
export const EditListing = () => <ListingForm mode="edit" />;