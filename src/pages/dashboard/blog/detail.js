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
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Button
} from '@mui/material';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { paths } from 'src/paths';
import { PostCommentAdd } from 'src/sections/dashboard/blog/post-comment-add';
import { PostNewsletter } from 'src/sections/dashboard/blog/post-newsletter';
import { PostContent } from 'src/sections/dashboard/blog/post-content';
import { PostGallery } from 'src/sections/dashboard/blog/post-gallery';
import { CommentItem } from 'src/sections/dashboard/blog/comment-item';
import { LikeButton } from 'src/components/like-button';
import { BlogHeader, BlogHeaderActions, canEditPost } from 'src/sections/dashboard/blog/blog-header';
import { RouterLink } from 'src/components/router-link';

const Page = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { user } = useAuth();
    const isMounted = useMounted();
    const snackbar = useSnackbar();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPermissionAlert, setShowPermissionAlert] = useState(false);
    const [likeStatus, setLikeStatus] = useState({ likes: 0, isLiked: false });

    usePageView();

    // Загрузка поста
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
                setComments(postData.comments || []);

                if (user) {
                    const likeStatusData = await blogService.getPostLikeStatus(postId, user.id);
                    setLikeStatus(likeStatusData);
                } else {
                    setLikeStatus({
                        likes: postData.likes || 0,
                        isLiked: false
                    });
                }

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
    }, [postId, isMounted, user]);

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    // Обновление статуса лайка при изменении пользователя
    useEffect(() => {
        const updateLikeStatus = async () => {
            if (post && user) {
                const likeStatusData = await blogService.getPostLikeStatus(post.id, user.id);
                setLikeStatus(likeStatusData);
            } else if (post) {
                setLikeStatus({
                    likes: post.likes || 0,
                    isLiked: false
                });
            }
        };

        updateLikeStatus();
    }, [user, post]);

    // Удаление поста
    const handleDeletePost = async () => {
        setIsDeleting(true);
        try {
            await blogService.deletePost(postId, user);
            snackbar.success('Post deleted successfully');
            setTimeout(() => {
                navigate(paths.dashboard.blog.index);
            }, 1500);
        } catch (error) {
            console.error('Error deleting post:', error);
            snackbar.error('Error deleting post');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Добавление комментария
    const handleAddComment = async (comment) => {
        try {
            const newComment = await blogService.addComment(postId, comment, user);
            setComments(prev => [...prev, newComment]);
            snackbar.success('Comment added successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            snackbar.error('Error adding comment');
            throw error;
        }
    };

    // Лайк комментария или ответа
    const handleItemLike = useCallback(async (itemId) => {
        if (!user) {
            snackbar.warning('Please sign in to like');
            return;
        }

        try {
            const updatedItem = await blogService.toggleItemLike(postId, itemId, user.id);

            // Рекурсивное обновление комментариев
            const updateCommentTree = (comments) => {
                return comments.map(comment => {
                    if (comment.id === itemId) {
                        return updatedItem;
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentTree(comment.replies)
                        };
                    }
                    return comment;
                });
            };

            setComments(prevComments => updateCommentTree(prevComments));
        } catch (error) {
            console.error('Error toggling like:', error);
            snackbar.error('Failed to update like');
            throw error;
        }
    }, [user, postId, snackbar]);

    // Ответ на комментарий
    const handleReply = useCallback(async (replyText, parentId) => {
        if (!user) {
            snackbar.warning('Please sign in to reply');
            return;
        }

        try {
            const newReply = await blogService.addReply(postId, parentId, replyText, user);

            // Обновляем дерево комментариев
            const addReplyToTree = (comments) => {
                return comments.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply]
                        };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: addReplyToTree(comment.replies)
                        };
                    }
                    return comment;
                });
            };

            setComments(prevComments => addReplyToTree(prevComments));
            snackbar.success('Reply added');
            return newReply;
        } catch (error) {
            console.error('Error adding reply:', error);
            snackbar.error('Failed to add reply');
            throw error;
        }
    }, [user, postId, snackbar]);

    // Лайк поста
    const handlePostLike = useCallback(async (postId, isLiking) => {
        if (!user) {
            snackbar.warning('Please sign in to like posts');
            return;
        }

        try {
            const result = await blogService.togglePostLike(postId, user.id, isLiking);
            setLikeStatus({
                likes: result.likes,
                isLiked: result.isLiked
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            snackbar.error('Failed to update like');
            throw error;
        }
    }, [user, snackbar]);

    // Редактирование поста
    const handleEditClick = () => {
        if (canEditPost(post, user)) {
            navigate(paths.dashboard.blog.postEdit.replace(':postId', post.id));
        } else {
            setShowPermissionAlert(true);
            setTimeout(() => setShowPermissionAlert(false), 3000);
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
                    <Button component={RouterLink} href={paths.dashboard.blog.index} sx={{ mt: 2 }}>
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
            <Seo title={post.seoTitle || post.title} />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <BlogHeader
                        title="Post"
                        breadcrumbs={[{ label: post.title || 'Details' }]}
                        showPermissionAlert={showPermissionAlert}
                        permissionMessage="You don't have permission to edit this post"
                        action={
                            <BlogHeaderActions.Details
                                post={post}
                                user={user}
                                onEdit={handleEditClick}
                                onDelete={() => setDeleteDialogOpen(true)}
                            />
                        }
                    />

                    <Stack spacing={3}>
                        <div>
                            <Chip label={post.category || 'Uncategorized'} />
                        </div>

                        <Typography variant="h3">
                            {post.title}
                        </Typography>

                        <Typography color="text.secondary" variant="subtitle1">
                            {post.shortDescription}
                        </Typography>

                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            sx={{ mt: 3 }}
                        >
                            <Avatar src={post.author?.avatar} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2">
                                    By {post.author?.name} • {publishedAt}
                                </Typography>
                                <Typography color="text.secondary" variant="body2">
                                    {post.readTime} • {likeStatus.likes} likes • {comments.length} comments
                                </Typography>
                            </Box>

                            <LikeButton
                                postId={post.id}
                                likes={likeStatus.likes}
                                isLiked={likeStatus.isLiked}
                                onLike={handlePostLike}
                                size="large"
                            />
                        </Stack>
                    </Stack>

                    {post.cover && (
                        <Box
                            sx={{
                                backgroundImage: `url(${post.cover})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                borderRadius: 1,
                                height: 380,
                                mt: 3
                            }}
                        />
                    )}

                    {post.content && (
                        <Container maxWidth="md" sx={{ py: 3 }}>
                            <PostContent content={post.content} />
                        </Container>
                    )}

                    {post.gallery && post.gallery.length > 0 && (
                        <Container maxWidth="xl" sx={{ py: 3 }}>
                            <PostGallery images={post.gallery} />
                        </Container>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={2}>
                        <Typography variant="h5">
                            Comments ({comments.length})
                        </Typography>

                        {comments.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                No comments yet. Be the first to comment!
                            </Typography>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onLike={handleItemLike}
                                    onReply={handleReply}
                                    onReplyLike={handleItemLike}
                                />
                            ))
                        )}
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <PostCommentAdd onAdd={handleAddComment} />

                    <Box sx={{ mt: 8 }}>
                        <PostNewsletter />
                    </Box>
                </Container>
            </Box>

            {/* Диалог удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{post.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeletePost} color="error" disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={snackbar.handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={snackbar.handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Page;