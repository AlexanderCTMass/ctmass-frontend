import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Divider,
    Alert,
    Button,
    TextField,
    Paper,
    Stack,
    Avatar,
    IconButton,
    Collapse,
    SvgIcon,
    Link as MuiLink
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import { formatDistanceToNow } from 'date-fns';
import { blogService } from 'src/service/blog-service';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

// Компонент для отображения одного комментария (только чтение)
const PublicComment = ({ comment, depth = 0 }) => {
    const [showReplies, setShowReplies] = useState(depth < 2);

    const formatDate = (date) => {
        if (!date) return 'recently';
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 'recently';
            return formatDistanceToNow(dateObj, { addSuffix: true });
        } catch (error) {
            return 'recently';
        }
    };

    return (
        <Box sx={{
            ml: depth * 3,
            mt: depth === 0 ? 2 : 1,
            position: 'relative'
        }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar src={comment.authorAvatar} sx={{ width: 32, height: 32 }} />
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">
                                    {comment.authorName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(comment.createdAt)}
                                </Typography>
                            </Stack>

                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {comment.content}
                            </Typography>

                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <ThumbUpOutlinedIcon fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary">
                                        {comment.likes || 0}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {comment.replies && comment.replies.length > 0 && (
                        <>
                            <Button
                                size="small"
                                onClick={() => setShowReplies(!showReplies)}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
                            </Button>

                            <Collapse in={showReplies}>
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    {comment.replies.map((reply) => (
                                        <PublicComment
                                            key={reply.id}
                                            comment={reply}
                                            depth={depth + 1}
                                        />
                                    ))}
                                </Stack>
                            </Collapse>
                        </>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

export const PublicCommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadComments = async () => {
            try {
                const post = await blogService.getPostById(postId);
                setComments(post.comments || []);
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                setLoading(false);
            }
        };

        loadComments();
    }, [postId]);

    const totalComments = comments.reduce((count, comment) => {
        return count + 1 + (comment.replies?.length || 0);
    }, 0);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Comments ({totalComments})
            </Typography>

            <Alert
                severity="info"
                sx={{ mb: 4 }}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        component={RouterLink}
                        href={paths.login}
                    >
                        Sign In
                    </Button>
                }
            >
                Please sign in to join the conversation.
            </Alert>

            <Divider sx={{ mb: 4 }} />

            {loading ? (
                <Typography align="center" color="text.secondary">
                    Loading comments...
                </Typography>
            ) : comments.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        No comments yet. Be the first to share your thoughts!
                    </Typography>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        href={paths.login}
                    >
                        Sign in to comment
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {comments.map((comment) => (
                        <PublicComment key={comment.id} comment={comment} />
                    ))}
                </Stack>
            )}
        </Box>
    );
};