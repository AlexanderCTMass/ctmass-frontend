import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { AD_ACCEPTED_TYPES, AD_ASPECT_RATIO, AD_MAX_FILE_BYTES } from 'src/constants/partner-ads';
import { outlinedButtonSx, pa } from './tokens';

const readDimensions = (url) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = url;
    });

export const CreativeDropzone = ({ title, hint, previewUrl, onSelect, onRemove, error, compact = false }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState('');
    const [warning, setWarning] = useState('');

    const handleFile = async (file) => {
        if (!file) return;
        setLocalError('');
        setWarning('');
        if (!AD_ACCEPTED_TYPES.includes(file.type)) {
            setLocalError('Use a JPG, PNG or WEBP image.');
            return;
        }
        if (file.size > AD_MAX_FILE_BYTES) {
            setLocalError('The image is larger than 5 MB.');
            return;
        }
        const url = URL.createObjectURL(file);
        const size = await readDimensions(url);
        if (size) {
            const ratio = size.width / size.height;
            if (Math.abs(ratio - AD_ASPECT_RATIO) > 0.35 || size.width < 900) {
                setWarning(
                    `This image is ${size.width}×${size.height}px. For the sharpest result use 1200×400px (3:1).`
                );
            }
        }
        onSelect(file, url);
    };

    const message = localError || error;

    return (
        <Stack spacing={1}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: pa.text }}>{title}</Typography>
            <Box
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    handleFile(event.dataTransfer.files?.[0]);
                }}
                sx={{
                    border: `1.5px dashed ${message ? pa.danger : dragging ? pa.primary : pa.borderStrong}`,
                    borderRadius: pa.radius,
                    bgcolor: dragging ? pa.primarySoft : pa.surfaceMuted,
                    p: compact ? 2 : 3,
                    textAlign: 'center',
                    transition: 'all 120ms ease'
                }}
            >
                {previewUrl ? (
                    <Stack spacing={1.5} alignItems="center">
                        <Box
                            component="img"
                            src={previewUrl}
                            alt=""
                            sx={{
                                width: '100%',
                                maxHeight: compact ? 90 : 140,
                                objectFit: 'contain',
                                borderRadius: '10px',
                                bgcolor: pa.surface
                            }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" sx={outlinedButtonSx} onClick={() => inputRef.current?.click()}>
                                Replace
                            </Button>
                            {onRemove ? (
                                <Button size="small" sx={{ textTransform: 'none', color: pa.danger }} onClick={onRemove}>
                                    Remove
                                </Button>
                            ) : null}
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: pa.primarySoft,
                                color: pa.primaryHover,
                                display: 'grid',
                                placeItems: 'center'
                            }}
                        >
                            <CloudUploadOutlinedIcon />
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: pa.text }}>Drag an image here</Typography>
                        <Typography sx={{ fontSize: 12.5, color: pa.textMuted, maxWidth: 260 }}>{hint}</Typography>
                        <Button size="small" variant="outlined" sx={outlinedButtonSx} onClick={() => inputRef.current?.click()}>
                            Choose file
                        </Button>
                    </Stack>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={AD_ACCEPTED_TYPES.join(',')}
                    hidden
                    onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.target.value = '';
                    }}
                />
            </Box>
            {message ? <Typography sx={{ fontSize: 12.5, color: pa.danger }}>{message}</Typography> : null}
            {!message && warning ? (
                <Typography sx={{ fontSize: 12.5, color: pa.warningText }}>{warning}</Typography>
            ) : null}
        </Stack>
    );
};

CreativeDropzone.propTypes = {
    title: PropTypes.string.isRequired,
    hint: PropTypes.string,
    previewUrl: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    error: PropTypes.string,
    compact: PropTypes.bool
};
