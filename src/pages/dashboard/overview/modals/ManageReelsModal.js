import { useState, useCallback, useMemo, memo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Stack,
    IconButton,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { reelsApi } from 'src/api/reels';

const checkVideoDuration = (file) =>
    new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            const { duration } = video;
            if (duration < 1 || duration > 90) {
                reject(new Error(`Video must be 1–90 seconds (${Math.round(duration)}s)`));
            } else {
                resolve(duration);
            }
        };
        video.onerror = () => reject(new Error('Failed to read video metadata'));
        video.src = URL.createObjectURL(file);
    });

const PreviewDropzone = memo(({ value, onChange }) => {
    const onDrop = useCallback(
        (files) => {
            if (files[0]) onChange(files[0]);
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        onDrop
    });

    return (
        <Box
            {...getRootProps()}
            sx={{
                width: 120,
                height: 90,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                bgcolor: 'action.hover',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main' }
            }}
        >
            <input {...getInputProps()} />
            {value ? (
                <img
                    src={URL.createObjectURL(value)}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <AddPhotoAlternateIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
            )}
        </Box>
    );
});

const ContentItem = memo(({ item, onRemove }) => (
    <Box
        sx={{
            width: 80,
            height: 80,
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            flexShrink: 0
        }}
    >
        {item.type === 'video' ? (
            <video
                src={item.preview}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted
            />
        ) : (
            <img
                src={item.preview}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        )}
        <IconButton
            size="small"
            onClick={onRemove}
            sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                width: 20,
                height: 20
            }}
        >
            <CloseIcon sx={{ fontSize: 12 }} />
        </IconButton>
        {item.type === 'video' && (
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 2,
                    left: 2,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    borderRadius: 0.5,
                    px: 0.5
                }}
            >
                <Typography variant="caption" sx={{ color: 'white', fontSize: 9 }}>
                    VIDEO
                </Typography>
            </Box>
        )}
    </Box>
));

const ContentDropzone = memo(({ items, onChange }) => {
    const MAX_CONTENT = 3;

    const onDrop = useCallback(
        async (files) => {
            const remaining = MAX_CONTENT - items.length;
            const toProcess = files.slice(0, remaining);

            const results = [];
            for (const file of toProcess) {
                const isVideo = file.type.startsWith('video/');
                if (isVideo) {
                    try {
                        await checkVideoDuration(file);
                    } catch (err) {
                        toast.error(err.message);
                        continue;
                    }
                }
                results.push({
                    file,
                    type: isVideo ? 'video' : 'image',
                    preview: URL.createObjectURL(file)
                });
            }

            if (results.length > 0) {
                onChange([...items, ...results]);
            }
        },
        [items, onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [], 'video/*': [] },
        maxFiles: MAX_CONTENT,
        disabled: items.length >= MAX_CONTENT,
        onDrop
    });

    const handleRemove = useCallback(
        (index) => {
            onChange(items.filter((_, i) => i !== index));
        },
        [items, onChange]
    );

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
                {items.map((item, index) => (
                    <ContentItem
                        key={item.preview}
                        item={item}
                        onRemove={() => handleRemove(index)}
                    />
                ))}
                {items.length < MAX_CONTENT && (
                    <Box
                        {...getRootProps()}
                        sx={{
                            width: 80,
                            height: 80,
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: 'action.hover',
                            transition: 'border-color 0.2s',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <input {...getInputProps()} />
                        <AddPhotoAlternateIcon sx={{ color: 'text.disabled' }} />
                    </Box>
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
                Up to 3 files: images or videos (1–90 seconds)
            </Typography>
        </Stack>
    );
});

const ManageReelsModal = ({ open, onClose, userId, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [preview, setPreview] = useState(null);
    const [content, setContent] = useState([]);
    const [saving, setSaving] = useState(false);

    const isValid = useMemo(() => preview !== null && content.length > 0, [preview, content]);

    const handleClose = useCallback(() => {
        if (saving) return;
        setTitle('');
        setDescription('');
        setPreview(null);
        setContent([]);
        onClose();
    }, [saving, onClose]);

    const handleSave = useCallback(async () => {
        if (!isValid || !userId) return;

        setSaving(true);
        try {
            const { url: previewUrl, path: previewPath } = await reelsApi.uploadFile(
                preview,
                'preview',
                userId
            );

            const uploadedContent = await Promise.all(
                content.map(async (item) => {
                    const { url, path } = await reelsApi.uploadFile(item.file, 'content', userId);
                    return { type: item.type, url, path };
                })
            );

            const reel = await reelsApi.addReel(userId, {
                title,
                description,
                preview: previewUrl,
                previewPath,
                content: uploadedContent
            });

            toast.success('Reel added!');
            onSuccess(reel);
            handleClose();
        } catch (error) {
            console.error('Failed to add reel:', error);
            toast.error('Failed to add reel');
        } finally {
            setSaving(false);
        }
    }, [isValid, userId, preview, content, title, description, onSuccess, handleClose]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Add Reel</Typography>
                    <IconButton onClick={handleClose} disabled={saving} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="Optional"
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Optional"
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Preview Image{' '}
                            <Typography component="span" color="error.main">
                                *
                            </Typography>
                        </Typography>
                        <PreviewDropzone value={preview} onChange={setPreview} />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Content{' '}
                            <Typography component="span" color="error.main">
                                *
                            </Typography>
                        </Typography>
                        <ContentDropzone items={content} onChange={setContent} />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isValid || saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {saving ? 'Saving...' : 'Save Reel'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ManageReelsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string,
    onSuccess: PropTypes.func.isRequired
};

export default ManageReelsModal;
