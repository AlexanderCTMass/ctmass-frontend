import {
    IconButton,
    ImageListItem,
    LinearProgress,
    TextField,
    Box,
    Stack,
    Grid, Tooltip
} from "@mui/material";
import * as React from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useCallback } from "react";
import PropTypes from "prop-types";

export const PreviewEditable = (props) => {
    const { attach, onRemove, onUpdate, updateFields = [], uploadProgress, ...other } = props;

    const handleChange = useCallback((field) => (e) => {
        onUpdate({
            ...attach,
            [field]: e.target.value
        });
    }, [attach, onUpdate]);

    if (!attach || !attach.preview) return null;

    const isEditableCustomFields = onUpdate && updateFields?.length > 0;
    return (
        <ImageListItem
            key={attach.preview}
            sx={{
                position: 'relative'
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={isEditableCustomFields ? 4 : 12}>
                    <a
                        data-fancybox="gallery"
                        href={attach.preview}
                        className={"my-fancy-link"}
                        key={attach}
                    >
                        {attach.preview.includes('video') ? (
                            <video
                                src={attach.preview}
                                controls
                                style={{
                                    width: '100%',
                                    height: "120px",
                                    borderRadius: 4
                                }}
                            />
                        ) : (
                            <img
                                src={attach.preview}
                                alt="preview"
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: "120px",
                                    objectFit: 'cover',
                                    borderRadius: 4
                                }}
                            />
                        )}
                    </a>
                </Grid>
                {isEditableCustomFields &&
                    <Grid item xs={12} sm={8}>
                        <Stack spacing={1}>
                            {updateFields?.map((field) => {
                                return (
                                    <TextField
                                        key={field.name}
                                        size={field.size || 'small'}
                                        label={field.label}
                                        value={attach[field.name] || ''}
                                        onChange={handleChange(field.name)}
                                        placeholder={field.placeholder}
                                        fullWidth
                                        multiline={field.multiline || false}
                                        minRows={field.minRows || 1}
                                        maxRows={field.maxRows || 1}
                                    />
                                )
                            })}
                        </Stack>
                    </Grid>}
            </Grid>
            <Tooltip title="Remove attachment">
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.main',
                            color: 'common.white'
                        }
                    }}
                    onClick={onRemove}
                >
                    <HighlightOffIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            {uploadProgress && uploadProgress[attach.file?.name] !== undefined && (
                <LinearProgress
                    variant="determinate"
                    value={uploadProgress[attach.file.name]}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderRadius: 4
                    }}
                />
            )}
        </ImageListItem>
    );
};

PreviewEditable.propTypes = {
    attach: PropTypes.shape({
        preview: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        file: PropTypes.object
    }),
    onRemove: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    uploadProgress: PropTypes.object
};