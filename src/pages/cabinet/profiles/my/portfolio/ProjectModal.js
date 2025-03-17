import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {Dialog, IconButton, Box, Typography, Button, TextField, Paper, Stack, CircularProgress} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../../../../../hooks/use-auth';
import { extendedProfileApi } from '../data/extendedProfileApi';

const ProjectModal = ({ setProject, project, onClose, setProfile, profile }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [localProject, setLocalProject] = useState({
        ...project,
        images: project.images.map(image => ({
            ...image,
            isLiked: image.isLiked || false
        }))
    });

    useEffect(() => {
        setLocalProject({
            ...project,
            images: project.images.map(image => ({
                ...image,
                isLiked: image.isLiked || false
            }))
        });
    }, [project]);

    useEffect(() => {
        setIsImageLoaded(false);
    }, [currentImageIndex]);

    const commentsEndRef = useRef(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLike = async (imageId) => {
        setProfile(prev => {
            const updatedPortfolio = prev.portfolio.map(p => {
                if (p.id === project.id) {
                    const updatedImages = p.images.map(img => {
                        if (img.id === imageId) {
                            const likes = Array.isArray(img.likes) ? img.likes : [];
                            const hasLiked = img.likes.includes(user.id);
                            return { ...img, likes: hasLiked ? likes.filter(id => id !== user.id) : [...likes, user.id] };
                        }
                        return img;
                    });
                    setProject({ ...project, images: updatedImages });
                    return { ...p, images: updatedImages };
                }
                return p;
            });
            return { ...prev, portfolio: updatedPortfolio };
        });
        await extendedProfileApi.like(project.id, imageId, user.id);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (commentText.trim().length === 0) return;

        const newComment = {
            id: Date.now(),
            user: user.businessName,
            userId: user.id,
            text: commentText.trim(),
            timestamp: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            await extendedProfileApi.addComment(profile.profile.id, project.id, currentImage.id, newComment);

            setLocalProject(prev => {
                const updatedImages = prev.images.map((image, index) => {
                    if (index === currentImageIndex) {
                        return {
                            ...image,
                            comments: [...(image.comments || []), newComment]
                        };
                    }
                    return image;
                });

                return { ...prev, images: updatedImages };
            });

            setCommentText('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmitting(false); // Останавливаем загрузку
        }
    };

    const currentImage = localProject.images[currentImageIndex] || {};
    const currentImageComments = currentImage.comments || [];

    return createPortal(
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{project.title}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseOutlinedIcon />
                    </IconButton>
                </Stack>

                <Box sx={{ position: 'relative', textAlign: 'center', mt: 2 }}>
                    {project.images.length > 1 && (
                        <>
                            <IconButton
                                sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)' }}
                                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + localProject.images.length) % localProject.images.length)}
                            >
                                <ChevronLeftIcon />
                            </IconButton>

                            <IconButton
                                sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)' }}
                                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % localProject.images.length)}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    )}

                    {!isImageLoaded && <LoadingSpinner />}
                    <img
                        src={currentImage.url}
                        alt={currentImage.description}
                        onLoad={() => setIsImageLoaded(true)}
                        style={{
                            width: '100%',
                            maxHeight: '60vh',
                            objectFit: 'contain',
                            display: isImageLoaded ? 'block' : 'none'
                        }}
                    />

                    <IconButton
                        sx={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.8)' }}
                        onClick={() => handleLike(currentImage.id)}
                    >
                        <FavoriteBorderOutlinedIcon color={currentImage.likes?.includes(user.id) ? 'error' : 'inherit'} />
                        <Typography>{currentImage?.likes?.length || 0}</Typography>
                    </IconButton>
                </Box>

                <Typography sx={{ mt: 2 }}>{currentImage.description}</Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1">Comments</Typography>
                    {currentImageComments.map(comment => (
                        <Paper key={comment.id} sx={{ p: 2, mt: 1 }}>
                            <Typography variant="body2" fontWeight="bold">{comment.user}</Typography>
                            <Typography variant="body2">{comment.text}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {new Date(comment.timestamp).toLocaleDateString('ru-RU')}
                            </Typography>
                        </Paper>
                    ))}
                    <div ref={commentsEndRef} />
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment to the project..."
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={handleCommentSubmit}
                        disabled={commentText.trim().length === 0 || isSubmitting}
                        sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send'}
                    </Button>
                </Stack>
            </Paper>
        </Dialog>,
        document.body
    );
};

export default ProjectModal;
