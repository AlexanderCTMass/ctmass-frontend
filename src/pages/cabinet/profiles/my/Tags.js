import React, { useState, useCallback } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const normalize = (tag = '') =>
    tag.replace(/^#/, '').trim().toLowerCase();

const splitInput = (value = '') =>
    value
        .split(',')
        .map(normalize)
        .filter(Boolean);

const Tags = ({ tags: initialTags = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tags, setTags] = useState(initialTags.map(normalize));
    const [inputValue, setInputValue] = useState('');

    const addMany = useCallback((list) => {
        if (!list.length) return;
        setTags((prev) => {
            const merged = [...prev];
            list.forEach((t) => !merged.includes(t) && merged.push(t));
            return merged;
        });
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const parts = splitInput(inputValue);
            addMany(parts);
            setInputValue('');
        }
    };

    const handleBlur = () => {
        const parts = splitInput(inputValue);
        addMany(parts);
        setInputValue('');
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    const handleSave = () => {
        setIsEditing(false);
        onSave(tags);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTags(initialTags.map(normalize));
        setInputValue('');
    };

    return (
        <Box
            sx={{
                position: 'relative',
                '&:hover .edit-button': {
                    opacity: 1
                }
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 4, mb: 1 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                    TAGS
                </Typography>
                <Tooltip
                    title={
                        <Typography variant="caption">
                            By adding hashtags you can mark yourself as part of a group — like
                            a trade union, school graduation, or project team. <br />
                            Example: <strong>#HVAC2025</strong> unites everyone from one
                            class. Later, click the hashtag to instantly find all your
                            group-mates.
                        </Typography>
                    }
                    arrow
                    placement="right"
                >
                    <InfoOutlinedIcon color="action" fontSize="small" />
                </Tooltip>
            </Stack>
            {/* Заголовок */}
            {/* Кнопки редактирования (появляются при наведении) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1
                }}
            >
                {!isEditing ? (
                    <IconButton
                        className="edit-button"
                        size="small"
                        onClick={() => setIsEditing(true)}
                        sx={{
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            '&:focus': { opacity: 1 }
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                ) : (
                    <>
                        <IconButton size="small" onClick={handleSave}>
                            <CheckIcon fontSize="small" color="success" />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel}>
                            <CloseIcon fontSize="small" color="error" />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Контент - зависит от состояния */}
            {isEditing ? (
                <Stack spacing={1}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Type tag and press Enter or comma"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
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
                            }
                        }}
                    />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                    >
                        Press “Enter” or “,” to add a tag.
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={() => handleDeleteTag(tag)}
                            />
                        ))}
                    </Stack>
                </Stack>
            ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {tags.length > 0 ? (
                        tags.map((tag) => (
                            <Chip key={tag} label={tag} />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No tags added yet
                        </Typography>
                    )}
                </Stack>
            )}
        </Box>
    );
};

export default Tags;