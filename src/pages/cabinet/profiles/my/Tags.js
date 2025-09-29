import { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Chip,
    Stack,
    Typography,
    Tooltip,
    IconButton,
    CircularProgress,
    SvgIcon
} from '@mui/material';
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TagInput from 'src/components/TagInput';
import TagSpecialistModal from './TagSpecialistModal';
import { profileApi } from 'src/api/profile';

const normalize = (tag = '') =>
    tag.replace(/^#/, '').trim().toLowerCase();

const Tags = ({ tags: initialTags = [], onSave, isMyProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tags, setTags] = useState(initialTags.map(normalize));
    const [isHovered, setIsHovered] = useState(false);

    const [tagStats, setTagStats] = useState({});
    const [loadingStats, setLoadingStats] = useState(false);

    const [modalTag, setModalTag] = useState(null);

    const loadStats = useCallback(async (list) => {
        setLoadingStats(true);

        try {
            setTagStats(await profileApi.getTagsCounters(list.slice(0, 10)));
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (!isEditing) loadStats(tags);
    }, [tags, isEditing, loadStats]);

    const handleDelete = (tagToDelete) => {
        setTags(prev => prev.filter(t => t !== tagToDelete))
    };

    const handleSave = async () => {
        setIsEditing(false);
        await onSave?.(tags);
    };

    const handleCancel = () => {
        setTags(initialTags.map(normalize));
        setIsEditing(false);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                mt: 4
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
            {isMyProfile && (<Box
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
                        onClick={() => setIsEditing(true)}
                        sx={{
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <Tooltip title="Edit tags">
                            <SvgIcon fontSize="small">
                                <EditIcon />
                            </SvgIcon>
                        </Tooltip>
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
            </Box>)}

            {/* Контент - зависит от состояния */}
            {isEditing ? (
                <Stack spacing={1}>
                    <TagInput value={tags} onChange={(v) => setTags(v.map(normalize))} />
                    {/* <TextField
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
                    /> */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                    >
                        Start typing — press “Enter”, “,” or pick from the list to add.
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                        {tags.map(t => (
                            <Chip key={t} label={t} onDelete={() => handleDelete(t)} />
                        ))}
                    </Stack>
                </Stack>
            ) : (
                <Stack direction="row" flexWrap="wrap" spacing={1}>
                    {tags.length ? (
                        tags.map((tag) => (
                            <Chip
                                key={tag}
                                clickable
                                label={
                                    loadingStats ? (
                                        <CircularProgress size={10} />
                                    ) : (
                                        `${tag}  ${tagStats[tag] ?? 0}`
                                    )
                                }
                                onClick={() => setModalTag(tag)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'background .15s',
                                    '&:hover': { bgcolor: 'success.light', color: 'common.white' }
                                }}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No tags added yet
                        </Typography>
                    )}
                </Stack>
            )}

            {modalTag && <TagSpecialistModal tag={modalTag} onClose={() => setModalTag(null)} />}
        </Box>
    );
};

export default Tags;