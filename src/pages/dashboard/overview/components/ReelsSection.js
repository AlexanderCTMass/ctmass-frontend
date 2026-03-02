import { useState, useEffect, useCallback, memo } from 'react';
import {
    Box,
    Typography,
    Stack,
    IconButton,
    CircularProgress,
    Paper
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { reelsApi } from 'src/api/reels';
import ManageReelsModal from '../modals/ManageReelsModal';

const REEL_WIDTH = 140;
const REEL_HEIGHT = 220;

const ReelCard = memo(({ reel, onDelete }) => {
    const handleDelete = useCallback(
        (e) => {
            e.stopPropagation();
            onDelete(reel);
        },
        [reel, onDelete]
    );

    return (
        <Box
            sx={{
                width: REEL_WIDTH,
                height: REEL_HEIGHT,
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                flexShrink: 0
            }}
        >
            <img
                src={reel.preview}
                alt={reel.title || 'Reel'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {reel.title && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.65))'
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}
                    >
                        {reel.title}
                    </Typography>
                </Box>
            )}
            <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                    width: 26,
                    height: 26
                }}
            >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
});

const AddReelCard = memo(({ onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            width: REEL_WIDTH,
            height: REEL_HEIGHT,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'border-color 0.3s ease',
            '&:hover': {
                borderColor: 'success.main'
            }
        }}
    >
        <AddIcon sx={{ color: 'text.disabled', fontSize: 36 }} />
    </Box>
));

const DashboardReelsSection = ({ userId }) => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchReels = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await reelsApi.getUserReels(userId);
            setReels(data);
        } catch (error) {
            console.error('Failed to fetch reels:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchReels();
    }, [fetchReels]);

    const handleDelete = useCallback(async (reel) => {
        try {
            await reelsApi.deleteReel(reel.id, reel.previewPath, reel.content);
            setReels((prev) => prev.filter((r) => r.id !== reel.id));
            toast.success('Reel deleted');
        } catch (error) {
            console.error('Failed to delete reel:', error);
            toast.error('Failed to delete reel');
        }
    }, []);

    const handleReelAdded = useCallback((reel) => {
        setReels((prev) => [reel, ...prev]);
    }, []);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                Reels
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        pb: 1,
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': { height: 4 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'action.hover', borderRadius: 2 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 }
                    }}
                >
                    {reels.map((reel) => (
                        <ReelCard key={reel.id} reel={reel} onDelete={handleDelete} />
                    ))}
                    <AddReelCard onClick={() => setModalOpen(true)} />
                </Stack>
            )}

            <ManageReelsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                userId={userId}
                onSuccess={handleReelAdded}
            />
        </Paper>
    );
};

DashboardReelsSection.propTypes = {
    userId: PropTypes.string
};

export default DashboardReelsSection;
