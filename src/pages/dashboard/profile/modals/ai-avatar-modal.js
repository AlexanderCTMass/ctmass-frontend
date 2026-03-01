import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import {
    Avatar,
    Box,
    Button,
    Chip,
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
    Fade
} from '@mui/material';
import {alpha, useTheme} from '@mui/material/styles';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import toast from 'react-hot-toast';
import {cabinetApi} from 'src/api/cabinet';
import {generateAiAvatars} from 'src/api/ai/avatar';
import {storage} from 'src/libs/firebase';

const GENERATION_VARIANTS_COUNT = 3;
const DEFAULT_PROMPT = 'Professional, realistic business headshot, neutral background, photo-realistic, 4k';
const QUICK_STYLE_OPTIONS = [
    {
        label: 'Studio portrait',
        prompt: 'Studio portrait, corporate lighting, subtle gradient background, photo-realistic, 4k'
    },
    {
        label: 'On-job',
        prompt: 'On-the-job scene, professional attire, natural lighting, candid but confident expression'
    },
    {
        label: 'Business headshot',
        prompt: 'Business headshot, clean background, confident smile, sharp focus, photo-realistic'
    }
];

const GENERATION_MESSAGES = [
    {
        emoji: '🎨',
        text: 'Analyzing your photo and finding the perfect style...',
    },
    {
        emoji: '✨',
        text: 'AI is working its magic to create your avatars...',
    },
    {
        emoji: '🎭',
        text: 'Trying different expressions and poses...',
    },
    {
        emoji: '⚡',
        text: 'Adding professional touches and enhancements...',
    },
    {
        emoji: '🌟',
        text: 'Almost there! Adding final details...',
    }
];

const readFileNameExtension = (file) => {
    if (!file?.type) return 'png';
    const parts = file.type.split('/');
    return parts[1] || 'png';
};

// Helper function to fetch image as blob
const fetchImageAsBlob = async (url) => {
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }
        return await response.blob();
    } catch (error) {
        console.error('[AI Avatar] Error fetching image:', error);
        throw error;
    }
};

export const AiAvatarModal = ({
                                  open,
                                  onClose,
                                  userId,
                                  currentAvatarUrl,
                                  generationsLeft = 5,
                                  dailyLimit = 5,
                                  onGenerationsChange,
                                  onAvatarApplied
                              }) => {
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const referencePreviewRef = useRef(null);
    const variantUrlsRef = useRef([]);
    const [referenceImage, setReferenceImage] = useState(null); // { file, previewUrl }
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [variants, setVariants] = useState([]);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [localGenerationsLeft, setLocalGenerationsLeft] = useState(generationsLeft);
    const [referenceError, setReferenceError] = useState('');
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const hasVariants = variants.length > 0;
    const selectedVariant = useMemo(
        () => variants.find((variant) => variant.id === selectedVariantId) || null,
        [variants, selectedVariantId]
    );

    const cleanupVariantUrls = useCallback(() => {
        variantUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
        });
        variantUrlsRef.current = [];
    }, []);

    const cleanupReferencePreview = useCallback(() => {
        if (referencePreviewRef.current) {
            URL.revokeObjectURL(referencePreviewRef.current);
            referencePreviewRef.current = null;
        }
    }, []);

    const resetState = useCallback(() => {
        cleanupVariantUrls();
        cleanupReferencePreview();
        setVariants([]);
        setSelectedVariantId(null);
        setGenerating(false);
        setSaving(false);
        setReferenceError('');
    }, [cleanupReferencePreview, cleanupVariantUrls]);

    const assignReferenceImage = useCallback((file, previewUrl) => {
        cleanupReferencePreview();
        referencePreviewRef.current = previewUrl;
        setReferenceImage({file, previewUrl});
    }, [cleanupReferencePreview]);

    useEffect(() => {
        if (!open) {
            resetState();
            return;
        }

        setPrompt((prev) => prev || DEFAULT_PROMPT);
        setLocalGenerationsLeft(generationsLeft);
    }, [open, generationsLeft, resetState]);

    useEffect(() => {
        if (!open || !currentAvatarUrl) {
            return;
        }

        let isCancelled = false;

        const hydrateFromExistingAvatar = async () => {
            try {
                const response = await fetch(currentAvatarUrl, {mode: 'cors'});
                if (!response.ok) {
                    throw new Error('Unable to fetch current avatar');
                }
                const blob = await response.blob();
                if (isCancelled) return;

                const extension = readFileNameExtension({type: blob.type});
                const file = new File([blob], `current-avatar.${extension}`, {type: blob.type || 'image/jpeg'});
                const previewUrl = URL.createObjectURL(blob);
                assignReferenceImage(file, previewUrl);
            } catch (error) {
                console.warn('[AI Avatar] Failed to use existing avatar as reference:', error);
            }
        };

        hydrateFromExistingAvatar();

        return () => {
            isCancelled = true;
        };
    }, [open, currentAvatarUrl, assignReferenceImage]);

    useEffect(() => () => {
        cleanupVariantUrls();
        cleanupReferencePreview();
    }, [cleanupReferencePreview, cleanupVariantUrls]);

    // Эффект для смены сообщений во время генерации
    useEffect(() => {
        let intervalId;

        if (generating && !hasVariants) {
            setCurrentMessageIndex(0);
            intervalId = setInterval(() => {
                setCurrentMessageIndex((prev) =>
                    prev < GENERATION_MESSAGES.length - 1 ? prev + 1 : prev
                );
            }, 3000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [generating, hasVariants]);

    const handleFileChange = useCallback(
        async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file (JPG or PNG).');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            assignReferenceImage(file, previewUrl);
            setReferenceError('');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [assignReferenceImage]
    );

    const handleQuickStyleClick = useCallback((stylePrompt) => {
        setPrompt(stylePrompt);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!referenceImage?.file) {
            setReferenceError('Upload a reference photo before generating avatars.');
            toast.error('Upload a reference photo first.');
            return;
        }

        if (localGenerationsLeft <= 0) {
            toast.error('No AI generations left for today.');
            return;
        }

        try {
            setGenerating(true);
            setReferenceError('');
            cleanupVariantUrls();

            // 1. Сначала загружаем reference image в Firebase Storage
            const timestamp = Date.now();
            const fileExtension = referenceImage.file.name.split('.').pop() || 'png';
            const storageRef = ref(storage, `temp/ai-reference/${userId}/${timestamp}.${fileExtension}`);

            await uploadBytes(storageRef, referenceImage.file, {
                contentType: referenceImage.file.type || 'image/png'
            });

            // 2. Получаем публичный URL загруженного изображения
            const imageUrl = await getDownloadURL(storageRef);

            // 3. Генерируем аватары используя URL из Firebase
            const outputs = await generateAiAvatars({
                imageUrl,
                prompt,
                count: GENERATION_VARIANTS_COUNT
            });

            if (!outputs || !outputs.length) {
                toast.error('The AI did not return any images. Please try again.');
                return;
            }

            // 4. Для каждого URL получаем blob и создаем локальный URL для отображения
            const mappedVariants = [];

            for (const item of outputs) {
                try {
                    // Получаем blob из URL
                    const blob = await fetchImageAsBlob(item.url);

                    // Создаем локальный URL для отображения
                    const localUrl = URL.createObjectURL(blob);
                    variantUrlsRef.current.push(localUrl);

                    mappedVariants.push({
                        id: item.id,
                        url: localUrl, // Используем локальный URL для отображения
                        originalUrl: item.url, // Сохраняем оригинальный URL для сохранения
                        blob: blob, // Сохраняем blob на случай, если понадобится
                        fileName: item.fileName
                    });
                } catch (error) {
                    console.error('[AI Avatar] Error processing variant:', error);
                    toast.error(`Failed to load one of the generated images: ${error.message}`);
                }
            }

            if (mappedVariants.length === 0) {
                toast.error('Failed to load generated images. Please try again.');
                return;
            }

            setVariants(mappedVariants);
            setSelectedVariantId(mappedVariants[0]?.id ?? null);

            // 5. Обновляем счетчик генераций
            const nextLeft = Math.max(0, localGenerationsLeft - 1);
            setLocalGenerationsLeft(nextLeft);
            onGenerationsChange?.(nextLeft);

            if (userId) {
                await cabinetApi.updateAiAvatarQuota(userId, nextLeft);
            }

            toast.success(`Successfully generated ${mappedVariants.length} avatar(s)!`);

        } catch (error) {
            console.error('[AI Avatar] generation error:', error);
            toast.error(error?.message || 'Failed to generate avatars. Please try again in a moment.');
        } finally {
            setGenerating(false);
        }
    }, [
        cleanupVariantUrls,
        localGenerationsLeft,
        onGenerationsChange,
        prompt,
        referenceImage?.file,
        userId
    ]);

    const handleSaveSelected = useCallback(async () => {
        if (!selectedVariant) {
            toast.error('Select one of the generated avatars first.');
            return;
        }
        if (!userId) {
            toast.error('User context is missing.');
            return;
        }

        try {
            setSaving(true);

            // Используем оригинальный URL из Firebase Storage для сохранения
            // или загружаем blob если нужно сохранить в другое место
            const downloadUrl = selectedVariant.originalUrl || selectedVariant.url;

            await cabinetApi.updateAvatar(userId, downloadUrl);

            toast.success('AI avatar saved successfully!');
            onAvatarApplied?.(downloadUrl, localGenerationsLeft);
            onClose();
        } catch (error) {
            console.error('[AI Avatar] save error:', error);
            toast.error('Failed to save AI avatar. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [localGenerationsLeft, onAvatarApplied, onClose, selectedVariant, userId]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const currentMessage = GENERATION_MESSAGES[currentMessageIndex];

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={handleCancel}
        >
            <DialogTitle
                sx={{
                    pb: 2,
                    pr: 2
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack spacing={1} pr={1.5}>
                        <Typography variant="h6" fontWeight={700}>
                            AI-Generate Avatar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate unique profile pictures using AI.
                        </Typography>
                    </Stack>

                    <IconButton size="small" onClick={handleCancel} sx={{mt: -0.5}}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: {xs: 3, sm: 4}
                }}
            >
                <Stack spacing={3}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                            p: 2
                        }}
                    >
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                            For higher client trust and better visibility, we recommend uploading a real profile photo.
                            Specialists with photos rank higher in search results and attract more bookings.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Stack spacing={2}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.8),
                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {referenceImage?.previewUrl ? (
                                        <Box
                                            component="img"
                                            src={referenceImage.previewUrl}
                                            alt="Reference"
                                            sx={{width: '100%', height: '100%', objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <Avatar
                                            sx={{
                                                width: '70%',
                                                height: '70%',
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                color: theme.palette.primary.main,
                                                fontSize: 56
                                            }}
                                        >
                                            AI
                                        </Avatar>
                                    )}
                                </Box>

                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon/>}
                                    component="label"
                                    sx={{textTransform: 'none', borderRadius: 2}}
                                >
                                    Change photo
                                    <input
                                        ref={fileInputRef}
                                        hidden
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Button>

                                <Typography variant="caption" color="text.secondary">
                                    (JPG/PNG, min 800×800 pixels)
                                </Typography>

                                {referenceError && (
                                    <Typography variant="caption" color="error">
                                        {referenceError}
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={7.65}>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Style selection"
                                    placeholder="e.g., “Professional, realistic”"
                                    fullWidth
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                />

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {QUICK_STYLE_OPTIONS.map((option) => (
                                        <Chip
                                            key={option.label}
                                            label={option.label}
                                            onClick={() => handleQuickStyleClick(option.prompt)}
                                            clickable
                                            color={prompt === option.prompt ? 'primary' : 'default'}
                                            variant={prompt === option.prompt ? 'filled' : 'outlined'}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 999
                                            }}
                                        />
                                    ))}
                                </Stack>

                                <Stack
                                    direction={{xs: 'column', sm: 'row'}}
                                    spacing={2}
                                    alignItems={{xs: 'stretch', sm: 'center'}}
                                >
                                    <LoadingButton
                                        loading={generating}
                                        startIcon={<AutoAwesomeIcon/>}
                                        variant="contained"
                                        onClick={handleGenerate}
                                        disabled={localGenerationsLeft <= 0}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            px: 2.75,
                                            py: 1
                                        }}
                                    >
                                        Generate avatars
                                    </LoadingButton>

                                    <Typography variant="body2" color="text.secondary" sx={{ml: {sm: 1}}}>
                                        Generations left today: {localGenerationsLeft} of {dailyLimit}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Stack spacing={2}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Generated variants
                        </Typography>

                        {generating && !hasVariants && (
                            <Fade in={generating}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: 280,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                        borderRadius: 3,
                                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                        p: 4
                                    }}
                                >
                                    <CircularProgress
                                        size={60}
                                        thickness={4}
                                        sx={{
                                            mb: 3,
                                            color: theme.palette.primary.main
                                        }}
                                    />

                                    <Fade in={true} key={currentMessageIndex}>
                                        <Stack spacing={1} alignItems="center">
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontSize: '2.5rem',
                                                    lineHeight: 1
                                                }}
                                            >
                                                {currentMessage.emoji}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color="text.primary"
                                                fontWeight={500}
                                                sx={{
                                                    animation: 'pulse 2s infinite',
                                                    '@keyframes pulse': {
                                                        '0%': { opacity: 0.8 },
                                                        '50%': { opacity: 1 },
                                                        '100%': { opacity: 0.8 },
                                                    }
                                                }}
                                            >
                                                {currentMessage.text}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ mt: 2 }}
                                            >
                                                This will take about 30 seconds
                                            </Typography>
                                        </Stack>
                                    </Fade>
                                </Box>
                            </Fade>
                        )}

                        {!generating && !hasVariants && (
                            <Typography variant="body2" color="text.secondary">
                                Generate avatars to see options here.
                            </Typography>
                        )}

                        {hasVariants && (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: 'repeat(1, minmax(0, 1fr))',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        md: 'repeat(3, minmax(0, 1fr))'
                                    }
                                }}
                            >
                                {variants.map((variant) => {
                                    const isSelected = variant.id === selectedVariantId;
                                    return (
                                        <Box
                                            key={variant.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    setSelectedVariantId(variant.id);
                                                }
                                            }}
                                            sx={{
                                                position: 'relative',
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                                                boxShadow: isSelected
                                                    ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.16)}`
                                                    : 'none',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={variant.url}
                                                alt="AI avatar option"
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    aspectRatio: '1 / 1'
                                                }}
                                            />

                                            {isSelected && (
                                                <CheckCircleIcon
                                                    color="primary"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        fontSize: 28,
                                                        backgroundColor: theme.palette.common.white,
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    px: {xs: 3, sm: 4},
                    py: 3,
                    justifyContent: 'flex-end',
                    gap: 1.5
                }}
            >
                <Button
                    onClick={handleCancel}
                    variant="text"
                    sx={{
                        textTransform: 'none',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2
                    }}
                >
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    disabled={!selectedVariant}
                    loading={saving}
                    onClick={handleSaveSelected}
                    sx={{
                        textTransform: 'none',
                        px: 2.75,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: 'none'
                    }}
                >
                    Save selected avatar
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};