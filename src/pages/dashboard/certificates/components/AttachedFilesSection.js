import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    IconButton,
    Typography
} from '@mui/material';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { PhotosDropzone } from 'src/components/photos-dropzone';

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ type }) => {
    if (type && type.startsWith('image/')) {
        return <ImageOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
    }
    return <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
};

const AttachedFilesSection = ({ files, onDrop, onRemove, onTogglePublic }) => {
    const handlePublicToggle = useCallback((index, checked) => {
        onTogglePublic(index, checked);
    }, [onTogglePublic]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <AttachFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                        Section 3: Attached Files
                    </Typography>
                </Box>

                <PhotosDropzone
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    caption="Click to upload or drag and drop"
                    maxFiles={5}
                    onDrop={onDrop}
                    onRemove={() => {}}
                    onRemoveAll={() => {}}
                />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
                    Supports PDF, JPG, PNG. Max 5 files, 10MB each.
                </Typography>

                {files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        {files.map((file, index) => (
                            <Box
                                key={file.id || index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    mb: 1
                                }}
                            >
                                <FileIcon type={file.type} />

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={500} noWrap>
                                        {file.name}
                                    </Typography>
                                    {file.size && (
                                        <Typography variant="caption" color="text.secondary">
                                            {formatFileSize(file.size)}
                                        </Typography>
                                    )}
                                </Box>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={file.isPublic !== false}
                                            onChange={(e) => handlePublicToggle(index, e.target.checked)}
                                            sx={{ color: 'primary.main' }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">Public</Typography>
                                    }
                                    sx={{ mr: 0 }}
                                />

                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(index)}
                                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

AttachedFilesSection.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            url: PropTypes.string,
            size: PropTypes.number,
            type: PropTypes.string,
            isPublic: PropTypes.bool
        })
    ).isRequired,
    onDrop: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onTogglePublic: PropTypes.func.isRequired
};

export default memo(AttachedFilesSection);
