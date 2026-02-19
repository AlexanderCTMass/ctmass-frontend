import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    Link,
    Stack,
    SvgIcon,
    TextField,
    Typography,
    Unstable_Grid2 as Grid,
    Alert,
    Snackbar
} from '@mui/material';
import {BreadcrumbsSeparator} from 'src/components/breadcrumbs-separator';
import {FileDropzone} from 'src/components/file-dropzone';
import {QuillEditor} from 'src/components/quill-post-editor';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useAuth} from 'src/hooks/use-auth';
import {paths} from 'src/paths';
import {fileToBase64} from 'src/utils/file-to-base64';
import {blogService} from 'src/service/blog-service';
import { GalleryUploader } from 'src/sections/dashboard/blog/gallery-uploader';
import {BlogHeader, BlogHeaderActions} from "src/sections/dashboard/blog/blog-header";

const Page = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [cover, setCover] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [gallery, setGallery] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
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
    const handleImageUploadStart = useCallback(() => {
        setUploadingImage(true);
    }, []);

    const handleImageUploadEnd = useCallback((success) => {
        setUploadingImage(false);
    }, []);

    const handleCoverDrop = useCallback(async ([file]) => {
        if (file) {
            const data = await fileToBase64(file);
            setCover(data);
            setCoverFile(file);
        }
    }, []);

    const handleCoverRemove = useCallback(() => {
        setCover(null);
        setCoverFile(null);
    }, []);

    const handleInputChange = useCallback((e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }, []);

    const handleContentChange = useCallback((value) => {
        setFormData(prev => ({...prev, content: value}));
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
            const newPost = await blogService.createPost(
                { ...formData, gallery },
                user,
                coverFile
            );

            setSnackbar({
                open: true,
                message: 'Post created successfully!',
                severity: 'success'
            });

            setTimeout(() => {
                navigate(paths.dashboard.blog.postDetails.replace(':postId', newPost.id));
            }, 1500);

        } catch (error) {
            console.error('Error creating post:', error);
            setSnackbar({
                open: true,
                message: 'Error creating post. Please try again.',
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    return (
        <>
            <Seo title="Blog: Post Create"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <BlogHeader
                        title="Create a new post"
                        breadcrumbs={[{ label: 'Create' }]}
                        action={
                            <BlogHeaderActions.Create
                                onCancel={() => navigate(paths.dashboard.blog.index)}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        }
                    />

                    <Stack spacing={3}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">
                                            Basic details
                                        </Typography>
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

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">
                                            Post cover
                                        </Typography>
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
                                                    <Typography
                                                        align="center"
                                                        color="text.secondary"
                                                        variant="h6"
                                                    >
                                                        Select a cover image
                                                    </Typography>
                                                    <Typography
                                                        align="center"
                                                        color="text.secondary"
                                                        sx={{mt: 1}}
                                                        variant="subtitle1"
                                                    >
                                                        Image used for the blog post cover and also for Open Graph meta
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
                                                accept={{'image/*': []}}
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

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">
                                            Content
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Write your post content here. You can add images, videos, and formatting.
                                        </Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <QuillEditor
                                            placeholder="Write something amazing..."
                                            minHeight={200} // Минимальная высота
                                            value={formData.content}
                                            onChange={handleContentChange}
                                            disabled={isSubmitting || uploadingImage}
                                            onImageUploadStart={handleImageUploadStart}
                                            onImageUploadEnd={handleImageUploadEnd}
                                            autoFocus={false}
                                            sx={{
                                                width: '100%',
                                                '& .ql-editor': {
                                                    fontSize: '1rem',
                                                    lineHeight: 1.6
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Секция галереи - добавить после секции контента */}
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">
                                            Gallery
                                        </Typography>
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

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid xs={12} md={4}>
                                        <Typography variant="h6">
                                            Meta
                                        </Typography>
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

                    <Box
                        sx={{
                            display: {
                                sm: 'none'
                            },
                            mt: 2
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            fullWidth
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish changes'}
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Page;