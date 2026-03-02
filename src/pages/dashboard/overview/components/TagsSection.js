import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TagInput from 'src/components/TagInput';
import TagSpecialistModal from 'src/pages/cabinet/profiles/my/TagSpecialistModal';
import { profileApi } from 'src/api/profile';

const normalize = (tag = '') => tag.replace(/^#/, '').trim().toLowerCase();

const TagsSection = ({ userId, initialTags }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tags, setTags] = useState((initialTags || []).map(normalize));
    const [saving, setSaving] = useState(false);
    const savedTagsRef = useRef((initialTags || []).map(normalize));
    const [tagStats, setTagStats] = useState({});
    const [loadingStats, setLoadingStats] = useState(false);
    const [modalTag, setModalTag] = useState(null);

    useEffect(() => {
        if (!isEditing) {
            const normalized = (initialTags || []).map(normalize);
            savedTagsRef.current = normalized;
            setTags(normalized);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTags]);

    const loadStats = useCallback(async (list) => {
        if (!list.length) return;
        setLoadingStats(true);
        try {
            const stats = await profileApi.getTagsCounters(list.slice(0, 10));
            setTagStats(stats);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (!isEditing) loadStats(tags);
    }, [tags, isEditing, loadStats]);

    const handleDelete = useCallback((tagToDelete) => {
        setTags((prev) => prev.filter((t) => t !== tagToDelete));
    }, []);

    const handleSave = useCallback(async () => {
        if (!userId) return;
        setSaving(true);
        try {
            await profileApi.upsertTags(userId, tags);
            savedTagsRef.current = [...tags];
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }, [userId, tags]);

    const handleCancel = useCallback(() => {
        setTags(savedTagsRef.current);
        setIsEditing(false);
    }, []);

    const normalizedDisplay = useMemo(() => tags, [tags]);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <LocalOfferIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Tags &amp; Keywords
                        </Typography>
                        <Tooltip
                            title={
                                <Typography variant="caption">
                                    By adding hashtags you can mark yourself as part of a group — like a trade union,
                                    school graduation, or project team. Example: <strong>#HVAC2025</strong> unites everyone
                                    from one class.
                                </Typography>
                            }
                            arrow
                            placement="right"
                        >
                            <InfoOutlinedIcon color="action" fontSize="small" />
                        </Tooltip>
                    </Stack>

                    {!isEditing ? (
                        <IconButton size="small" onClick={() => setIsEditing(true)}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <IconButton size="small" onClick={handleSave} disabled={saving}>
                                {saving ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" color="success" />}
                            </IconButton>
                            <IconButton size="small" onClick={handleCancel} disabled={saving}>
                                <CloseIcon fontSize="small" color="error" />
                            </IconButton>
                        </Stack>
                    )}
                </Stack>

                {isEditing ? (
                    <Stack spacing={1}>
                        <TagInput value={tags} onChange={(v) => setTags(v.map(normalize))} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            Start typing — press "Enter", "," or pick from the list to add.
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map((t) => (
                                <Chip key={t} label={t} onDelete={() => handleDelete(t)} />
                            ))}
                        </Box>
                    </Stack>
                ) : normalizedDisplay.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {normalizedDisplay.map((tag) => (
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
                                variant="outlined"
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'success.light', color: 'common.white' }
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <Stack alignItems="flex-start" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            No tags added yet
                        </Typography>
                        <Button size="small" variant="outlined" onClick={() => setIsEditing(true)}>
                            Add tags
                        </Button>
                    </Stack>
                )}
            </Stack>

            {modalTag && <TagSpecialistModal tag={modalTag} onClose={() => setModalTag(null)} />}
        </Paper>
    );
};

TagsSection.propTypes = {
    userId: PropTypes.string,
    initialTags: PropTypes.arrayOf(PropTypes.string)
};

TagsSection.defaultProps = {
    userId: null,
    initialTags: []
};

export default TagsSection;
