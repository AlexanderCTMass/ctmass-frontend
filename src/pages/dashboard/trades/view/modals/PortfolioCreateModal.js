import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
    CircularProgress,
    useMediaQuery,
    DialogTitle,
    DialogContent
} from "@mui/material";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FileUploadSection } from "src/components/file-upload-with-view";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useUserSpecialties from "src/hooks/use-userSpecialties";
import { useFormik } from "formik";
import * as Yup from "yup";
import { INFO } from "src/libs/log";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { SpecialtySelectForm } from 'src/components/specialty-select-form';
import TagInput from 'src/components/TagInput';

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Project title is required'),
    location: Yup.string().required('Project location is required'),
    specialtyId: Yup.string().required('Specialty is required'),
    beforeImages: Yup.array().min(1, 'At least one before image is required'),
    afterImages: Yup.array().min(1, 'At least one after image is required'),
    tags: Yup.array().max(4, 'Maximum 4 tags allowed')
});

const normalize = (tag = '') =>
    tag.replace(/^#/, '').trim().toLowerCase();

export const PortfolioCreateModal = ({
    profile,
    tradeId,
    open,
    onClose,
    onSubmit,
    currentPortfolio,
    isEditMode
}) => {
    const { userSpecialties, isFetching: isFetchingUserSpecialties } = useUserSpecialties(profile.id);
    const [localSpecialties, setLocalSpecialties] = useState([]);
    const [addSpecOpen, setAddSpecOpen] = useState(false);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    useEffect(() => setLocalSpecialties(userSpecialties), [userSpecialties]);

    const formik = useFormik({
        initialValues: {
            title: currentPortfolio.title || '',
            date: currentPortfolio.date || null,
            specialtyId: currentPortfolio.specialtyId || '',
            shortDescription: currentPortfolio.shortDescription || '',
            beforeImages: currentPortfolio.beforeImages || [],
            afterImages: currentPortfolio.afterImages || [],
            location: currentPortfolio.location || '',
            tags: currentPortfolio.tags || [],
            tradeId: tradeId
        },
        validationSchema,
        onSubmit: (values) => {
            INFO('Submitting portfolio', values);
            onSubmit(values);
            onClose();
            formik.resetForm();
        },
        enableReinitialize: true
    });

    const handleDropBefore = (newFiles) => {
        const formattedFiles = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        formik.setFieldValue('beforeImages', [...formik.values.beforeImages, ...formattedFiles]);
    };

    const handleDropAfter = (newFiles) => {
        const formattedFiles = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        formik.setFieldValue('afterImages', [...formik.values.afterImages, ...formattedFiles]);
    };

    const handleRemoveBefore = (index) => {
        const newFiles = [...formik.values.beforeImages];
        newFiles.splice(index, 1);
        formik.setFieldValue('beforeImages', newFiles);
    };

    const handleRemoveAfter = (index) => {
        const newFiles = [...formik.values.afterImages];
        newFiles.splice(index, 1);
        formik.setFieldValue('afterImages', newFiles);
    };

    const handleRemoveAllBefore = () => {
        formik.setFieldValue('beforeImages', []);
    };

    const handleRemoveAllAfter = () => {
        formik.setFieldValue('afterImages', []);
    };

    const handleSpecialtyAdded = async (newSpec) => {
        try {
            await extendedProfileApi.addSpecialties(profile.id, newSpec.id);

            setLocalSpecialties((prev) =>
                prev.some((s) => s.id === newSpec.id) ? prev : [...prev, newSpec]
            );

            formik.setFieldValue('specialtyId', newSpec.id);

            INFO('Specialty added from portfolio modal', newSpec);
        } catch (err) {
            console.error('Failed to add specialty', err);
        } finally {
            setAddSpecOpen(false);
        }
    };

    const handleUpdateFilesBefore = useCallback((newFile) => {
        if (newFile) {
            formik.setFieldValue('beforeImages',
                formik.values.beforeImages.map((file) => {
                    if (file.preview === newFile.preview) {
                        return newFile;
                    }
                    return file;
                })
            );
        }
    }, [formik.values.beforeImages]);

    const handleUpdateFilesAfter = useCallback((newFile) => {
        if (newFile) {
            formik.setFieldValue('afterImages',
                formik.values.afterImages.map((file) => {
                    if (file.preview === newFile.preview) {
                        return newFile;
                    }
                    return file;
                })
            );
        }
    }, [formik.values.afterImages]);

    const renderSpecialtySelect = () => {
        if (!isFetchingUserSpecialties) {
            return (
                <TextField
                    fullWidth
                    label="Specialty from your list of services"
                    disabled
                    InputProps={{
                        endAdornment: <CircularProgress size={20} />
                    }}
                    helperText="Loading specialties..."
                    error={formik.touched.specialtyId && Boolean(formik.errors.specialtyId)}
                />
            );
        }

        return (
            <TextField
                select
                fullWidth
                label="Specialty from your list of services"
                name="specialtyId"
                required
                value={formik.values.specialtyId}
                onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                        setAddSpecOpen(true);
                    } else {
                        formik.handleChange(e);
                    }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.specialtyId && Boolean(formik.errors.specialtyId)}
                helperText={formik.touched.specialtyId && formik.errors.specialtyId}
            >
                {localSpecialties.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                        {s.label}
                    </MenuItem>
                ))}

                <MenuItem value="__add_new__" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                    ＋ Add a new specialty…
                </MenuItem>
            </TextField>
        );
    };

    const handleClose = () => {
        formik.resetForm();
        onClose();
    }

    const handleTagsChange = (newTags) => {
        const normalized = newTags.map(normalize).slice(0, 4);
        formik.setFieldValue('tags', normalized);
    };

    const handleDeleteTag = (tagToDelete) => {
        const updated = formik.values.tags.filter(t => t !== tagToDelete);
        formik.setFieldValue('tags', updated);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="md"
                fullScreen={!mdUp}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{isEditMode ? 'Edit' : 'Add'} Project to Portfolio</Typography>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Alert severity="info">
                        Fill in the project information and upload before/after images to add to your portfolio. You can add up to 4 tags to categorize your work.
                    </Alert>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                required
                                placeholder="ex. Door Installation"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date *"
                                    required
                                    value={formik.values.date}
                                    onChange={(date) => formik.setFieldValue('date', date)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={formik.touched.date && Boolean(formik.errors.date)}
                                            helperText={formik.touched.date && formik.errors.date}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Box>
                        <TextField
                            fullWidth
                            label="Location"
                            name="location"
                            required
                            placeholder="enter the project location"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && Boolean(formik.errors.location)}
                            helperText={formik.touched.location && formik.errors.location}
                        />
                        {renderSpecialtySelect()}
                        <TextField
                            fullWidth
                            label="Project Description"
                            name="shortDescription"
                            placeholder="ex. Customer needs a door installed in their home."
                            multiline
                            minRows={2}
                            maxRows={10}
                            value={formik.values.shortDescription}
                            onChange={formik.handleChange}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Tags (Maximum 4)
                            </Typography>
                            <TagInput
                                value={formik.values.tags}
                                onChange={handleTagsChange}
                                maxTags={4}
                            />
                            {formik.touched.tags && formik.errors.tags && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                    {formik.errors.tags}
                                </Typography>
                            )}
                            <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                {formik.values.tags.map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => handleDeleteTag(tag)}
                                        size="small"
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Before Images *
                            </Typography>
                            <FileUploadSection
                                files={formik.values.beforeImages}
                                onDrop={handleDropBefore}
                                onRemove={handleRemoveBefore}
                                onRemoveAll={handleRemoveAllBefore}
                                accept={{ 'image/*': [] }}
                                caption="Attach before photos"
                                onUpdate={handleUpdateFilesBefore}
                                updateFields={[{
                                    placeholder: 'Describe what\'s shown in this image...',
                                    label: 'Description',
                                    name: 'description',
                                    multiline: true,
                                    minRows: 3,
                                    maxRows: 4
                                }]}
                            />
                            {formik.touched.beforeImages && formik.errors.beforeImages && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                                    {formik.errors.beforeImages}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                After Images *
                            </Typography>
                            <FileUploadSection
                                files={formik.values.afterImages}
                                onDrop={handleDropAfter}
                                onRemove={handleRemoveAfter}
                                onRemoveAll={handleRemoveAllAfter}
                                accept={{ 'image/*': [] }}
                                caption="Attach after photos"
                                onUpdate={handleUpdateFilesAfter}
                                updateFields={[{
                                    placeholder: 'Describe what\'s shown in this image...',
                                    label: 'Description',
                                    name: 'description',
                                    multiline: true,
                                    minRows: 3,
                                    maxRows: 4
                                }]}
                            />
                            {formik.touched.afterImages && formik.errors.afterImages && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                                    {formik.errors.afterImages}
                                </Typography>
                            )}
                        </Box>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                            <Button
                                onClick={handleClose}
                                color="error"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={formik.handleSubmit}
                                disabled={!formik.isValid || formik.isSubmitting}
                            >
                                {isEditMode ? 'Save Changes' : 'Add to Portfolio'}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>

            <SpecialtySelectForm
                open={addSpecOpen}
                onClose={() => setAddSpecOpen(false)}
                onSpecialtyChange={handleSpecialtyAdded}
                selectedSpecialties={localSpecialties}
            />
        </>
    );
};

PortfolioCreateModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    tradeId: PropTypes.string.isRequired,
    currentPortfolio: PropTypes.object,
    isEditMode: PropTypes.bool
};

PortfolioCreateModal.defaultProps = {
    currentPortfolio: {},
    isEditMode: false
};
