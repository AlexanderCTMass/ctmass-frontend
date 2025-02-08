import {useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {FiHeart, FiMessageCircle, FiX, FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import styles from './ProjectModal.module.css';
import {Button, Typography} from "@mui/material";

const ProjectModal = ({project, onClose}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [localProject, setLocalProject] = useState({
        ...project,
        images: project.images.map(image => ({
            ...image,
            isLiked: image.isLiked || false
        }))
    });

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

    const handleLike = (imageId) => {
        setLocalProject(prev => ({
            ...prev,
            images: prev.images.map(image =>
                image.id === imageId
                    ? {
                        ...image,
                        likes: image.likes ? (image.isLiked ? image.likes - 1 : image.likes + 1) : 1,
                        isLiked: !image.isLiked
                    }
                    : image
            )
        }));
    };

    const totalLikes = localProject.images.reduce((sum, image) => sum + image?.likes, 0);
    const totalComments = localProject.images.reduce((sum, image) => sum + image?.comments?.length, 0);

    const handleCommentSubmit = e => {
        e.preventDefault();
        if (commentText.trim().length === 0) return;

        const newComment = {
            id: Date.now(),
            user: 'Current User',
            text: commentText.trim(),
            timestamp: new Date().toISOString()
        };

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
    };

    const currentImage = localProject.images[currentImageIndex] || {};
    const currentImageComments = currentImage.comments || [];

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{project.title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FiX size={24}/>
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
                                    <FiChevronLeft size={32}/>
                                </button>
                                <button
                                    className={styles.navButton}
                                    onClick={() => setCurrentImageIndex(prev =>
                                        (prev + 1) % localProject.images.length
                                    )}
                                >
                                    <FiChevronRight size={32}/>
                                </button>
                            </div>
                        )}
                        <img
                            src={currentImage.url}
                            alt={currentImage.description}
                            className={styles.mainImage}
                        />
                        <button
                            className={`${styles.imageLikeButton} ${currentImage.isLiked ? styles.liked : ''}`}
                            onClick={() => handleLike(currentImage.id)}
                        >
                            <FiHeart size={24}/>
                            <span>{currentImage.likes}</span>
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