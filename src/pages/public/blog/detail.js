import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Avatar,
    Box,
    Container,
    Divider,
    Stack,
    Typography,
    Chip,
    Alert,
    CircularProgress,
    Button,
    Breadcrumbs,
    Link,
    Paper,
    IconButton,
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { PostContent } from 'src/sections/dashboard/blog/post-content';
import { PostGallery } from 'src/sections/dashboard/blog/post-gallery';
import { PublicCommentSection } from 'src/sections/public/blog/comment-section';
import { BreadcrumbsSeparator } from 'src/components/breadcrumbs-separator';
import { RouterLink } from 'src/components/router-link';

const Page = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const isMounted = useMounted();
    const theme = useTheme();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likeStatus, setLikeStatus] = useState({ likes: 0, isLiked: false });
    const [shareTooltip, setShareTooltip] = useState('Copy link');

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
                setLikeStatus({
                    likes: postData.likes || 0,
                    isLiked: false
                });
                setError(null);
            }
        } catch (err) {
            console.error('Error loading post:', err);
            if (isMounted()) {
                setError('Failed to load post. It may have been deleted.');
            }
        } finally {
            if (isMounted()) {
                setLoading(false);
            }
        }
    }, [postId, isMounted]);

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.shortDescription,
                    url: url
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback to copy link
            await navigator.clipboard.writeText(url);
            setShareTooltip('Copied!');
            setTimeout(() => setShareTooltip('Copy link'), 2000);
        }
    };

    const handleSocialShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
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
                    <Button
                        component={RouterLink}
                        href={paths.blog.index}
                        sx={{ mt: 2 }}
                    >
                        Back to Blog
                    </Button>
                </Container>
            </Box>
        );
    }

    const publishedAt = post.publishedAt
        ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
        : 'Recently published';

    return (
        <>
            <Seo
                title={post.seoTitle || post.title}
                description={post.seoDescription || post.shortDescription}
                ogImage={post.cover}
            />

            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    {/* Breadcrumbs */}
                    <Breadcrumbs separator={<BreadcrumbsSeparator />} sx={{ mb: 4 }}>
                        <Link
                            color="text.primary"
                            component={RouterLink}
                            href={paths.index}
                            variant="subtitle2"
                        >
                            Home
                        </Link>
                        <Link
                            color="text.primary"
                            component={RouterLink}
                            href={paths.blog.index}
                            variant="subtitle2"
                        >
                            Blog
                        </Link>
                        <Typography color="text.secondary" variant="subtitle2">
                            {post.title}
                        </Typography>
                    </Breadcrumbs>

                    {/* Hero Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 6 },
                            mb: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            borderRadius: 2
                        }}
                    >
                        <Stack spacing={3}>
                            <Chip
                                label={post.category || 'Uncategorized'}
                                color="primary"
                                variant="outlined"
                                sx={{ alignSelf: 'flex-start' }}
                            />

                            <Typography variant="h2" component="h1">
                                {post.title}
                            </Typography>

                            <Typography variant="h5" color="text.secondary" fontWeight="normal">
                                {post.shortDescription}
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                justifyContent="space-between"
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar
                                        src={post.author?.avatar}
                                        sx={{ width: 56, height: 56 }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {post.author?.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {publishedAt} • {post.readTime}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                    <Tooltip title={shareTooltip}>
                                        <IconButton onClick={handleShare}>
                                            <ShareIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton onClick={() => handleSocialShare('facebook')}>
                                        <FacebookIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleSocialShare('twitter')}>
                                        <TwitterIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleSocialShare('linkedin')}>
                                        <LinkedInIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Cover Image */}
                    {post.cover && (
                        <Box
                            sx={{
                                width: '100%',
                                height: { xs: 250, sm: 400, md: 500 },
                                mb: 4,
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: theme.shadows[5]
                            }}
                        >
                            <Box
                                component="img"
                                src={post.cover}
                                alt={post.title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>
                    )}

                    {/* Content */}
                    {post.content && (
                        <Container maxWidth="md" sx={{ py: 4 }}>
                            <PostContent content={post.content} />
                        </Container>
                    )}

                    {/* Gallery */}
                    {post.gallery && post.gallery.length > 0 && (
                        <Box sx={{ py: 4 }}>
                            <Typography variant="h4" gutterBottom align="center">
                                Gallery
                            </Typography>
                            <PostGallery images={post.gallery} />
                        </Box>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ py: 4, flexWrap: 'wrap', gap: 1 }}>
                            {post.tags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => navigate(`${paths.blog.index}?tag=${tag}`)}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Stack>
                    )}

                    <Divider sx={{ my: 4 }} />

                    {/* Comments Section */}
                    <PublicCommentSection postId={post.id} />

                    {/* Related Posts */}
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h4" gutterBottom align="center">
                            You might also like
                        </Typography>
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                            Discover more articles from our blog
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            href={paths.blog.index}
                            sx={{ display: 'block', mx: 'auto', width: 'fit-content' }}
                        >
                            Browse All Articles
                        </Button>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default Page;