import React, { useState } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Tags = ({ tags: initialTags = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tags, setTags] = useState(initialTags);
    const [inputValue, setInputValue] = useState('');
    const theme = useTheme();

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            if (!tags.includes(inputValue.trim())) {
                setTags([...tags, inputValue.trim()]);
            }
            setInputValue('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    const handleSave = () => {
        setIsEditing(false);
        onSave(tags); // Передаем обновленные теги в родительский компонент
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTags(initialTags); // Возвращаем исходные теги
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
            {/* Заголовок */}
            <Typography variant="h6" color="text.secondary" sx={{ mt: 4, mb: 1 }}>
                TAGS
            </Typography>
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
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Add tag and press Enter"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleAddTag}
                    />
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