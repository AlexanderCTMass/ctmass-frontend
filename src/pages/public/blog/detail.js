import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { PostContent } from 'src/sections/dashboard/blog/post-content';
import { PostGallery } from 'src/sections/dashboard/blog/post-gallery';
import { PublicCommentSection } from 'src/sections/public/blog/comment-section';
import { RouterLink } from 'src/components/router-link';
import { BackLink, blueprintBackdropSx, btn, cardTitleSx, EmptyState, focusRingSx, formScopeSx, navyPanelSx, StatusPill, Surface } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';

const Page = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const isMounted = useMounted();

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
                return;
            }
        } else {
            await navigator.clipboard.writeText(url);
            setShareTooltip('Link copied');
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
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 15, md: 19 }, pb: 10 }}>
                <Container maxWidth="md">
                    <Skeleton variant="rounded" height={28} width={120} sx={{ borderRadius: RADIUS.pill }} />
                    <Skeleton variant="rounded" height={96} sx={{ mt: 2, borderRadius: RADIUS.inner }} />
                    <Skeleton variant="rounded" height={360} sx={{ mt: 4, borderRadius: RADIUS.panel }} />
                </Container>
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 15, md: 19 }, pb: 10, bgcolor: BRAND.mist }}>
                <Container maxWidth="sm">
                    <EmptyState
                        icon={<ArticleOutlinedIcon />}
                        title="Article not found"
                        text="It may have been removed by the author."
                        action={<Button component={RouterLink} href={paths.blog.index} sx={btn.green}>Browse the blog</Button>}
                    />
                </Container>
            </Box>
        );
    }

    const publishedAt = post.publishedAt
        ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
        : 'Recently published';

    const shareButtons = [
        { key: 'copy', label: shareTooltip, icon: <LinkRoundedIcon />, onClick: handleShare },
        { key: 'facebook', label: 'Share on Facebook', icon: <FacebookIcon />, onClick: () => handleSocialShare('facebook') },
        { key: 'twitter', label: 'Share on X', icon: <TwitterIcon />, onClick: () => handleSocialShare('twitter') },
        { key: 'linkedin', label: 'Share on LinkedIn', icon: <LinkedInIcon />, onClick: () => handleSocialShare('linkedin') }
    ];

    return (
        <>
            <Seo
                title={post.seoTitle || post.title}
                description={post.seoDescription || post.shortDescription}
                ogImage={post.cover}
            />

            <Box component="main" sx={{ flexGrow: 1, pb: 10 }}>
                <Box sx={{ ...blueprintBackdropSx, pt: { xs: 15, md: 19 }, pb: { xs: 4, md: 6 } }}>
                    <Container maxWidth="md" sx={{ position: 'relative' }}>
                        <BackLink href={paths.blog.index}>Blog</BackLink>
                        {post.category && <StatusPill tone="navy" sx={{ display: 'flex', width: 'fit-content', mb: 2 }}>{post.category}</StatusPill>}
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 32, sm: 42, md: 52 }, overflowWrap: 'anywhere' }}>
                            {post.title}
                        </Typography>
                        {post.shortDescription && (
                            <Typography sx={{ mt: 2, color: BRAND.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.55, fontWeight: 500, textWrap: 'pretty' }}>
                                {post.shortDescription}
                            </Typography>
                        )}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                            sx={{ mt: { xs: 3, md: 4 }, gap: 2 }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar src={post.author?.avatar} sx={{ width: 48, height: 48, bgcolor: BRAND.navy, fontWeight: 800 }}>
                                    {(post.author?.name || '?').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>{post.author?.name || 'CTMASS member'}</Typography>
                                    <Typography sx={{ fontSize: 14, color: BRAND.muted }}>
                                        {publishedAt}{post.readTime ? `, ${post.readTime}` : ''}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                {shareButtons.map((item) => (
                                    <Tooltip key={item.key} title={item.label}>
                                        <IconButton
                                            aria-label={item.label}
                                            onClick={item.onClick}
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                color: BRAND.navy,
                                                bgcolor: '#FFFFFF',
                                                border: `1px solid ${alpha(BRAND.navy, 0.12)}`,
                                                '&:hover': { bgcolor: BRAND.navy, color: '#FFFFFF' }
                                            }}
                                        >
                                            {item.icon}
                                        </IconButton>
                                    </Tooltip>
                                ))}
                            </Stack>
                        </Stack>
                    </Container>
                </Box>

                {post.cover && (
                    <Container maxWidth="lg" sx={{ mt: { xs: 0, md: 1 } }}>
                        <Box
                            sx={{
                                overflow: 'hidden',
                                aspectRatio: { xs: '4 / 3', md: '21 / 9' },
                                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                                boxShadow: SHADOW.md,
                                bgcolor: BRAND.mist
                            }}
                        >
                            <Box component="img" src={post.cover} alt={post.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </Box>
                    </Container>
                )}

                <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 } }}>
                    {post.content && (
                        <Box
                            sx={{
                                color: BRAND.ink,
                                fontSize: { xs: 16, md: 18 },
                                lineHeight: 1.75,
                                '& h1, & h2, & h3, & h4': { fontFamily: FONT.display, color: BRAND.navy, letterSpacing: '-0.015em', lineHeight: 1.25 },
                                '& a': { color: BRAND.green, fontWeight: 600 },
                                '& img': { maxWidth: '100%', borderRadius: RADIUS.inner },
                                '& blockquote': { m: 0, my: 3, pl: 2.5, borderLeft: `3px solid ${BRAND.green}`, color: BRAND.muted }
                            }}
                        >
                            <PostContent content={post.content} />
                        </Box>
                    )}

                    {post.gallery && post.gallery.length > 0 && (
                        <Box sx={{ mt: { xs: 5, md: 6 } }}>
                            <Typography component="h2" sx={{ ...cardTitleSx, fontSize: { xs: 22, md: 26 }, mb: 2.5 }}>Gallery</Typography>
                            <PostGallery images={post.gallery} />
                        </Box>
                    )}

                    {post.tags && post.tags.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" sx={{ mt: { xs: 4, md: 5 }, gap: 1 }}>
                            {post.tags.map((tag) => (
                                <Box
                                    key={tag}
                                    component="button"
                                    type="button"
                                    onClick={() => navigate(`${paths.blog.index}?tag=${tag}`)}
                                    sx={{
                                        height: 34,
                                        px: 1.5,
                                        border: `1px solid ${alpha(BRAND.navy, 0.12)}`,
                                        borderRadius: RADIUS.pill,
                                        bgcolor: '#FFFFFF',
                                        color: BRAND.navy,
                                        font: 'inherit',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: BRAND.navy },
                                        ...focusRingSx
                                    }}
                                >
                                    #{tag}
                                </Box>
                            ))}
                        </Stack>
                    )}

                    <Surface sx={{ mt: { xs: 5, md: 6 }, ...formScopeSx }}>
                        <PublicCommentSection postId={post.id} />
                    </Surface>

                    <Box
                        sx={{
                            ...navyPanelSx,
                            mt: { xs: 5, md: 6 },
                            p: { xs: 3, md: 4 },
                            borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                            boxShadow: SHADOW.lg
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ position: 'relative', gap: 2.5 }}>
                            <Box>
                                <Typography sx={{ ...displayTitleSx, color: '#FFFFFF', fontSize: { xs: 24, md: 28 } }}>Keep reading</Typography>
                                <Typography sx={{ mt: 0.75, color: alpha('#FFFFFF', 0.74) }}>More tips and stories from the CTMASS community.</Typography>
                            </Box>
                            <Button component={RouterLink} href={paths.blog.index} sx={{ ...btn.green, flexShrink: 0 }}>
                                Browse all articles
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default Page;
