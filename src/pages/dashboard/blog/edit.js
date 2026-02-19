import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Stack,
    Card,
    CardContent,
    TextField,
    Typography,
    Unstable_Grid2 as Grid,
    Alert,
    Snackbar,
    CircularProgress,
    Button
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useMounted } from 'src/hooks/use-mounted';
import { paths } from 'src/paths';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { blogService } from 'src/service/blog-service';
import { QuillEditor } from 'src/components/quill-editor';
import { FileDropzone } from 'src/components/file-dropzone';
import { GalleryUploader } from 'src/sections/dashboard/blog/gallery-uploader';
import {BlogHeader, BlogHeaderActions, canEditPost} from 'src/sections/dashboard/blog/blog-header';
import {RouterLink} from "src/components/router-link";

const Page = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { postId } = useParams();
    const isMounted = useMounted();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cover, setCover] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [removeCover, setRemoveCover] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [redirecting, setRedirecting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        content: '',
        category: '',
        seoTitle: '',
        seoDescription: ''
    });

    usePageView();

    const loadPost = useCallback(async () => {
        if (!postId) {
            setError('Post ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const postData = await blogService.getPostById(postId);

            if (isMounted()) {
                setPost(postData);
                setFormData({
                    title: postData.title || '',
                    shortDescription: postData.shortDescription || '',
                    content: postData.content || '',
                    category: postData.category || '',
                    seoTitle: postData.seoTitle || '',
                    seoDescription: postData.seoDescription || ''
                });
                setCover(postData.cover || null);
                setGallery(postData.gallery || []);
                setError(null);
            }
        } catch (err) {
            console.error('Error loading post:', err);
            if (isMounted()) {
                setError('Failed to load post');
            }
        } finally {
            if (isMounted()) {
                setLoading(false);
            }
        }
    }, [postId, isMounted]);

    useEffect(() => {
        // Проверяем права при загрузке страницы
        if (post && !canEditPost(post, user) && !redirecting) {
            setRedirecting(true);
            setSnackbar({
                open: true,
                message: 'You do not have permission to edit this post',
                severity: 'error'
            });

            setTimeout(() => {
                navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
            }, 2000);
        }
    }, [post, user, navigate, postId, redirecting]);

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    const handleCancel = () => {
        navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
    };

    const handleCoverDrop = useCallback(async ([file]) => {
        if (file) {
            const data = await fileToBase64(file);
            setCover(data);
            setCoverFile(file);
            setRemoveCover(false);
        }
    }, []);

    const handleCoverRemove = useCallback(() => {
        setCover(null);
        setCoverFile(null);
        setRemoveCover(true);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleContentChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, content: value }));
    }, []);

    const handleImageUploadStart = useCallback(() => {
        setUploadingImage(true);
    }, []);

    const handleImageUploadEnd = useCallback(() => {
        setUploadingImage(false);
    }, []);

    const handleSubmit = async () => {
        if (!formData.title || !formData.shortDescription) {
            setSnackbar({
                open: true,
                message: 'Please fill in required fields',
                severity: 'error'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await blogService.updatePost(
                postId,
                { ...formData, gallery },
                user,
                coverFile,
                removeCover
            );

            setSnackbar({
                open: true,
                message: 'Post updated successfully!',
                severity: 'success'
            });

            setTimeout(() => {
                navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
            }, 1500);

        } catch (error) {
            console.error('Error updating post:', error);
            setSnackbar({
                open: true,
                message: 'Error updating post. Please try again.',
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <Alert severity="error">{error || 'Post not found'}</Alert>
                    <Button component={RouterLink} href={paths.dashboard.blog.index} sx={{ mt: 2 }}>
                        Back to Blog
                    </Button>
                </Container>
            </Box>
        );
    }


    // Если нет прав и происходит редирект, показываем заглушку
    if (redirecting) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography color="text.secondary">
                        Redirecting to post view...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <>
            <Seo title="Blog: Post Edit" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <BlogHeader
                        title="Edit Post"
                        breadcrumbs={[
                            { label: post?.title, href: paths.dashboard.blog.postDetails.replace(':postId', postId) },
                            { label: 'Edit' }
                        ]}
                        action={
                            <BlogHeaderActions.Edit
                                post={post}
                                user={user}
                                onCancel={handleCancel}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        }
                    />

                    <Stack spacing={3}>
                        {/* Basic Details Card */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">Basic details</Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Post title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                disabled={isSubmitting}
                                            />
                                            <TextField
                                                fullWidth
                                                required
                                                label="Short description"
                                                name="shortDescription"
                                                value={formData.shortDescription}
                                                onChange={handleInputChange}
                                                multiline
                                                rows={3}
                                                disabled={isSubmitting}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Technology, Design, Business"
                                                disabled={isSubmitting}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Cover Image Card */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">Post cover</Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <Stack spacing={3}>
                                            {cover ? (
                                                <Box
                                                    sx={{
                                                        backgroundImage: `url(${cover})`,
                                                        backgroundPosition: 'center',
                                                        backgroundSize: 'cover',
                                                        borderRadius: 1,
                                                        height: 230,
                                                        mt: 3
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        alignItems: 'center',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        border: 1,
                                                        borderRadius: 1,
                                                        borderStyle: 'dashed',
                                                        borderColor: 'divider',
                                                        height: 230,
                                                        mt: 3,
                                                        p: 3
                                                    }}
                                                >
                                                    <Typography align="center" color="text.secondary" variant="h6">
                                                        No cover image
                                                    </Typography>
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }} variant="subtitle1">
                                                        Upload a new cover image below
                                                    </Typography>
                                                </Box>
                                            )}
                                            <div>
                                                <Button
                                                    color="inherit"
                                                    disabled={!cover || isSubmitting}
                                                    onClick={handleCoverRemove}
                                                >
                                                    Remove photo
                                                </Button>
                                            </div>
                                            <FileDropzone
                                                accept={{ 'image/*': [] }}
                                                maxFiles={1}
                                                onDrop={handleCoverDrop}
                                                caption="(SVG, JPG, PNG, or gif maximum 900x400)"
                                                disabled={isSubmitting}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Content Card */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">Content</Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <QuillEditor
                                            placeholder="Write something"
                                            sx={{ height: 330 }}
                                            value={formData.content}
                                            onChange={handleContentChange}
                                            disabled={isSubmitting || uploadingImage}
                                            onImageUploadStart={handleImageUploadStart}
                                            onImageUploadEnd={handleImageUploadEnd}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Gallery Card */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">Gallery</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Add multiple images to create a gallery
                                        </Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <GalleryUploader
                                            images={gallery}
                                            onChange={setGallery}
                                            disabled={isSubmitting}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Meta Card */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">Meta</Typography>
                                    </Grid>
                                    <Grid xs={12} lg={8}>
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="SEO title"
                                                name="seoTitle"
                                                value={formData.seoTitle}
                                                onChange={handleInputChange}
                                                helperText="Leave empty to use post title"
                                                disabled={isSubmitting}
                                            />
                                            <TextField
                                                fullWidth
                                                label="SEO description"
                                                name="seoDescription"
                                                value={formData.seoDescription}
                                                onChange={handleInputChange}
                                                multiline
                                                rows={2}
                                                helperText="Leave empty to use short description"
                                                disabled={isSubmitting}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                </Container>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Page;