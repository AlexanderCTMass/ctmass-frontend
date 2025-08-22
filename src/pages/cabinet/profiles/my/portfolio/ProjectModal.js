import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createPortal } from 'react-dom';
import {
    Dialog,
    IconButton,
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Stack,
    CircularProgress,
    Rating,
    Divider,
    Avatar,
    Alert
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../../../../../hooks/use-auth';
import { extendedProfileApi } from '../data/extendedProfileApi';
import * as React from "react";
import { formatDateRange, getValidDate } from "src/utils/date-locale";
import Fancybox from "src/components/myfancy/myfancybox";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import { Preview } from "src/components/myfancy/image-preview";
import { profileApi } from "src/api/profile";
import { profileService } from "src/service/profile-service";
import { ReviewRequestMessageArea } from "src/components/review-request-message-edit-area";
import { ERROR, INFO } from "src/libs/log";
import { projectFlow } from "src/flows/project/project-flow";
import toast from "react-hot-toast";
import { projectsApi } from "src/api/projects";

// Validation schema for the form
const reviewRequestSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    message: Yup.string()
        .required('Message is required')
        .min(10, 'Message should be at least 10 characters')
});

const useReview = (projectId, specialistId, setProject) => {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            const reviews = await extendedProfileApi.getReviews(specialistId);
            const find = reviews.find((rev) => rev.projectId === projectId);

            if (find) {
                const author = find.authorId ? await profileApi.get(find.authorId) : { businessName: 'Unknown customer' };
                setReview({
                    ...find,
                    author: author,
                });
            } else setReview(null);
            setLoading(false);
        }

        if (projectId && specialistId) {
            fetchData();
        }
    }, [projectId, specialistId]);

    return { review, reviewLoading: loading };
}


const ProjectModal = ({ setProject, project, onClose, setProfile, profile }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { review, reviewLoading } = useReview(project?.id, profile?.profile.id);
    const [createRequest, setCreateRequest] = useState(false);

    // Formik initialization
    const formik = useFormik({
        initialValues: {
            email: '',
            message: ''
        },
        validationSchema: reviewRequestSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            INFO("handleSubmitRequest", values);
            try {
                const user = profile?.profile;
                await projectFlow.sendReviewRequestPastClients(user.id, user.name, user.email, project, values.email, values.message);
                setProject({ ...project, customerEmail: values.email });
                toast.success("Request successfully sent!");
                window.location.reload();
            } catch (e) {
                ERROR(e);
                toast.error(e.message);
            } finally {
                setSubmitting(false);
                setCreateRequest(false);
            }
        }
    });

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
                            const hasLiked = img?.likes?.includes(user.id);
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

            setProfile(prev => {
                const updatedPortfolio = prev.portfolio.map(p => {
                    if (p.id === project.id) {
                        const updatedImages = p.images.map((img, idx) => {
                            if (idx === currentImageIndex) {
                                return {
                                    ...img,
                                    comments: [...(img.comments || []), newComment]
                                };
                            }
                            return img;
                        });
                        return { ...p, images: updatedImages };
                    }
                    return p;
                });
                return { ...prev, portfolio: updatedPortfolio };
            });

            setCommentText('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Получаем текущий проект из профиля
    const currentProject = profile.portfolio.find(p => p.id === project.id) || project;
    const currentImage = currentProject.images[currentImageIndex] || {};
    const currentImageComments = currentImage.comments || [];

    return createPortal(
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{currentProject.title}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseOutlinedIcon />
                    </IconButton>
                </Stack>
                <Stack direction="column" sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} divider={<span>·</span>}>
                        <Typography
                            variant="body2">{formatDateRange(getValidDate(currentProject.date), getValidDate(currentProject.date))}</Typography>
                        <Typography variant="body2">{currentProject.location}</Typography>
                    </Stack>
                    <Typography variant="body1">{currentProject.shortDescription}</Typography>
                </Stack>

                {/* Customer Review Section */}
                {reviewLoading ? (<LoadingSpinner />) :
                    (review ? (
                        <Box sx={{ mt: 3 }}>
                            <Paper sx={{ p: 2, mt: 1 }}>
                                <Typography variant="subtitle1">Customer Review</Typography>

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Avatar src={review.author.avatar} sx={{ width: 40, height: 40 }} />
                                        <Typography variant="body1" fontWeight="bold">
                                            {review.author.businessName}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {getValidDate(review.date).toLocaleDateString()}
                                        </Typography>
                                        <Rating
                                            value={review.rating}
                                            readOnly
                                            precision={0.5}
                                            size="small"
                                        />
                                    </Stack>
                                </Stack>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {review.text}
                                </Typography>
                            </Paper>
                        </Box>
                    ) : (<>
                        {user?.id === profile?.profile?.id && !createRequest && (
                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={() => setCreateRequest(true)}
                                disabled={project?.customerEmail}
                            >
                                Create Review Request
                            </Button>
                        )}
                    </>))}

                {createRequest ? (
                    <Paper sx={{ p: 2, mt: 1 }}>
                        <form onSubmit={formik.handleSubmit}>
                            <Stack spacing={2} direction="column">
                                <Alert severity="info" variant={"standard"} sx={{ fontSize: '12px' }}>
                                    The link to your profile and the review form will be added automatically to the
                                    footer
                                    of the letter.
                                </Alert>

                                <TextField
                                    fullWidth
                                    label="Client Email"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    required
                                />

                                <ReviewRequestMessageArea
                                    profile={profile}
                                    label="Message"
                                    initialValue={formik.values.message}
                                    name="message"
                                    onTextChange={(value) => formik.setFieldValue('message', value)}
                                    error={formik.touched.message && Boolean(formik.errors.message)}
                                    helperText={formik.touched.message && formik.errors.message}
                                />
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            formik.resetForm();
                                            setCreateRequest(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={formik.isSubmitting || !formik.isValid}
                                    >
                                        {formik.isSubmitting ? (
                                            <CircularProgress size={24} />
                                        ) : 'Send Request'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </Paper>
                ) :
                    (<Paper sx={{ p: 2, mt: 1 }}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>Project Gallery
                            ({currentProject.images.length})</Typography>
                        <Box sx={{ position: 'relative', textAlign: 'center', mt: 2 }}>
                            {currentProject.images.length > 1 && (
                                <>
                                    <IconButton
                                        sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)' }}
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + currentProject.images.length) % currentProject.images.length)}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>

                                    <IconButton
                                        sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)' }}
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % currentProject.images.length)}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                </>
                            )}

                            {!isImageLoaded && <LoadingSpinner />}
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                <a data-fancybox="gallery" href={currentImage.url}
                                    data-caption={currentImage.description}
                                    className={"my-fancy-link2"}
                                    style={{ display: 'inline-block' }}
                                >
                                    <img
                                        src={currentImage.url}
                                        alt={currentImage.description}
                                        onLoad={() => setIsImageLoaded(true)}
                                        style={{
                                            width: '100%',
                                            maxHeight: '40vh',
                                            objectFit: 'contain',
                                            display: isImageLoaded ? 'block' : 'none'
                                        }}
                                    />
                                </a>
                            </Fancybox>


                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 16,
                                    right: 16,
                                    backgroundColor: 'rgba(255,255,255,0.8)'
                                }}
                                onClick={() => {
                                    if (user) handleLike(currentImage.id)
                                }}
                            >
                                <FavoriteBorderOutlinedIcon
                                    color={currentImage.likes?.includes(user.id) ? 'error' : 'inherit'} />
                                <Typography>{currentImage?.likes?.length || 0}</Typography>
                            </IconButton>
                        </Box>

                        {user && (
                            <>
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2">Photo Comments</Typography>
                                    <Typography sx={{ mb: 2 }}>{currentImage.description}</Typography>
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
                                        placeholder="Add a comment to the photo..."
                                        label="Comment"
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        onClick={handleCommentSubmit}
                                        disabled={commentText.trim().length === 0 || isSubmitting}
                                        sx={{
                                            minWidth: '100px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send'}
                                    </Button>
                                </Stack>
                            </>)}
                    </Paper>)}
            </Paper>
        </Dialog>,
        document.body
    );
};

export default ProjectModal;