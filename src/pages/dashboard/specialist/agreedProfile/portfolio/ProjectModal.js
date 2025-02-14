import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import styles from './ProjectModal.module.css';
import {Button, Typography} from "@mui/material";
import {extendedProfileApi} from "./data/extendedProfileApi";
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../../../../../hooks/use-auth';

const ProjectModal = ({setProject, project, onClose, setProfile, profile}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [localProject, setLocalProject] = useState({
        ...project,
        images: project.images.map(image => ({
            ...image,
            isLiked: image.isLiked || false
        }))
    });
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const { user } = useAuth(); // Получаем данные текущего пользователя

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

    const onLike = useCallback(async (projectId, imageId, userId) => {
        setProfile(prev => {
            const updatedPortfolio = prev.portfolio.map(project => {
                if (project.id === projectId) {
                    const updatedImages = project.images?.map(image => {
                        if (image.id === imageId) {
                            const likes = Array.isArray(image.likes) ? image.likes : [];
                            const hasLiked = image.likes?.includes(userId);
                            return {
                                ...image,
                                likes: hasLiked
                                    ? likes.filter(id => id !== userId)
                                    : [...likes, userId],
                            };
                        }
                        return image;
                    });
                    setProject({...project, images: updatedImages});
                    return {...project, images: updatedImages};
                }
                return project;
            });
            return {...prev, portfolio: updatedPortfolio};
        });
        await extendedProfileApi.like(projectId, imageId, userId)
    }, [setProfile, setProject]);

    const commentsEndRef = useRef(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleLike = (imageId, e) => {
        e.stopPropagation();
        onLike(project.id, imageId, user.id); // Используем ID текущего пользователя
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (commentText.trim().length === 0) return;

        const newComment = {
            id: Date.now(),
            user: user.businessName, // Используем данные текущего пользователя
            userId: user.id, // Добавляем ID пользователя
            text: commentText.trim(),
            timestamp: new Date().toISOString()
        };

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

                return {
                    ...prev,
                    images: updatedImages
                };
            });

            setCommentText('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    const currentImage = localProject.images[currentImageIndex] || {};
    const currentImageComments = currentImage.comments || [];

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{project.title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <CloseOutlinedIcon size={24}/>
                    </button>
                </div>

                <div className={styles.scrollContainer}>
                    <div className={styles.imageSection}>
                        {project.images.length > 1 && (
                            <div className={styles.imageNavigation}>
                                <button
                                    className={styles.navButton}
                                    onClick={() => setCurrentImageIndex(prev =>
                                        (prev - 1 + localProject.images.length) % localProject.images.length
                                    )}
                                >
                                    <ChevronLeftIcon size={32}/>
                                </button>
                                <button
                                    className={styles.navButton}
                                    onClick={() => setCurrentImageIndex(prev =>
                                        (prev + 1) % localProject.images.length
                                    )}
                                >
                                    <ChevronRightIcon size={32}/>
                                </button>
                            </div>
                        )}
                        {!isImageLoaded && <LoadingSpinner />} {/* Показываем спиннер, пока изображение не загрузилось */}
                        <img
                            src={currentImage.url}
                            key={currentImage.id}
                            alt={currentImage.description}
                            className={styles.mainImage}
                            style={{ display: isImageLoaded ? "block" : "none" }}
                            onLoad={() => setIsImageLoaded(true)}
                        />
                        <button
                            className={`${styles.imageLikeButton} ${currentImage.likes?.includes(user.id) ? styles.liked : ''}`}
                            onClick={(e) => handleLike(currentImage.id, e)}
                        >
                            <FavoriteBorderOutlinedIcon size={24}/>
                            <span>{currentImage?.likes?.length}</span>
                        </button>
                    </div>

                    <div className={styles.projectInfo}>
                        <Typography sx={{textAlign: 'justify'}}>{currentImage.description}</Typography>

                        <div className={styles.metaSection}>
                            <time className={styles.projectDate}>
                                {new Date(project.date).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </time>
                        </div>
                    </div>

                    <div className={styles.commentsSection}>
                        {currentImageComments.map(comment => (
                            <div key={comment.id} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentAuthor}>{comment.user}</span>
                                    <time className={styles.commentTime}>
                                        {new Date(comment.timestamp).toLocaleDateString('ru-RU')}
                                    </time>
                                </div>
                                <p className={styles.commentText}>{comment.text}</p>
                            </div>
                        ))}
                        <div ref={commentsEndRef}/>
                    </div>
                </div>

                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.currentTarget.value)}
                        placeholder="Add a comment to the project..."
                        className={styles.commentInput}
                    />
                    <Button
                        type="submit"
                        variant="outlined"
                        disabled={commentText.trim().length === 0}
                    >
                        Send
                    </Button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ProjectModal;