import { useState } from 'react';
import {
    Avatar,
    Box,
    IconButton,
    Stack,
    SvgIcon,
    Typography,
    Collapse,
    TextField,
    Button,
    Divider
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { blogService } from 'src/service/blog-service';

// Компонент для отдельного ответа
const ReplyItem = ({ reply, onLike, onReply, depth = 0 }) => {
    const { user } = useAuth();
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const snackbar = useSnackbar();
    const formatDate = (date) => {
        if (!date) return 'recently';
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 'recently';

            const now = new Date();
            const diffMs = now - dateObj;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

            return dateObj.toLocaleDateString();
        } catch (error) {
            return 'recently';
        }
    };

    const handleLike = async () => {
        if (!user) {
            snackbar.warning('Please sign in to like replies');
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            await onLike(reply.id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onReply(replyText, reply.id);
            setReplyText('');
            setShowReply(false);
        }
    };

    return (
        <Box sx={{
            ml: depth * 3,
            mt: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1
        }}>
            <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar src={reply.authorAvatar} sx={{ width: 32, height: 32 }} />
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2">{reply.authorName}</Typography>
                            <Typography color="text.secondary" variant="caption">
                                {formatDate(reply.createdAt)}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {reply.content}
                        </Typography>

                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <IconButton
                                size="small"
                                onClick={handleLike}
                                color={reply.isLiked ? 'primary' : 'default'}
                                disabled={!user || isLiking}
                            >
                                <SvgIcon fontSize="small">
                                    {reply.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                </SvgIcon>
                            </IconButton>
                            <Typography variant="body2" color="text.secondary">
                                {reply.likes || 0}
                            </Typography>

                            {user && (
                                <Button
                                    size="small"
                                    startIcon={<SvgIcon fontSize="small"><ReplyIcon /></SvgIcon>}
                                    onClick={() => setShowReply(!showReply)}
                                >
                                    Reply
                                </Button>
                            )}
                        </Stack>

                        <Collapse in={showReply}>
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    multiline
                                    rows={2}
                                />
                                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                                    <Button size="small" onClick={() => setShowReply(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleReplySubmit}
                                        disabled={!replyText.trim()}
                                    >
                                        Reply
                                    </Button>
                                </Stack>
                            </Box>
                        </Collapse>
                    </Box>
                </Stack>
            </Stack>
        </Box>
    );
};

// Основной компонент комментария
export const PostComment = (props) => {
    const {
        id,
        authorAvatar,
        authorName,
        content,
        createdAt,
        likes = 0,
        isLiked = false,
        onLike,
        onReply,
        replies: initialReplies = []
    } = props;

    const { user } = useAuth();
    const snackbar = useSnackbar();
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState(initialReplies);
    const [isLiking, setIsLiking] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const formatDate = (date) => {
        if (!date) return 'recently';
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 'recently';

            const now = new Date();
            const diffMs = now - dateObj;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

            return dateObj.toLocaleDateString();
        } catch (error) {
            return 'recently';
        }
    };

    const handleLike = async () => {
        if (!user) {
            snackbar.warning('Please sign in to like comments');
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            await onLike?.(id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyText.trim() || !user) return;

        setIsSubmittingReply(true);
        try {
            const newReply = await onReply?.(replyText, id);
            if (newReply) {
                setReplies(prev => [...prev, newReply]);
                setReplyText('');
                setShowReply(false);
                setShowReplies(true);
                snackbar.success('Reply added successfully');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            snackbar.error('Failed to add reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleReplyLike = async (replyId) => {
        try {
            // Здесь должен быть вызов API для лайка ответа
            console.log('Like reply:', replyId);
        } catch (error) {
            console.error('Error liking reply:', error);
        }
    };

    const handleReplyToReply = async (replyText, parentReplyId) => {
        try {
            // Здесь должен быть вызов API для ответа на ответ
            console.log('Reply to reply:', { replyText, parentReplyId });
        } catch (error) {
            console.error('Error adding nested reply:', error);
        }
    };

    const timeAgo = formatDate(createdAt);

    return (
        <Stack spacing={2}>
            <Stack alignItems="flex-start" direction="row" spacing={2}>
                <Avatar src={authorAvatar} />
                <Box sx={{ flex: 1 }}>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <Typography variant="subtitle2">{authorName}</Typography>
                        <Typography color="text.secondary" variant="caption">
                            {timeAgo}
                        </Typography>
                    </Stack>

                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                        {content}
                    </Typography>

                    <Stack alignItems="center" direction="row" spacing={2} sx={{ mt: 1 }}>
                        <IconButton
                            size="small"
                            onClick={handleLike}
                            color={isLiked ? 'primary' : 'default'}
                            disabled={!user || isLiking}
                        >
                            <SvgIcon fontSize="small">
                                {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                            </SvgIcon>
                        </IconButton>
                        <Typography color="text.secondary" variant="body2">
                            {likes}
                        </Typography>

                        {user && (
                            <Button
                                size="small"
                                startIcon={<SvgIcon fontSize="small"><ReplyIcon /></SvgIcon>}
                                onClick={() => setShowReply(!showReply)}
                            >
                                Reply
                            </Button>
                        )}
                    </Stack>

                    <Collapse in={showReply}>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                multiline
                                rows={2}
                                disabled={isSubmittingReply}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                                <Button size="small" onClick={() => setShowReply(false)} disabled={isSubmittingReply}>
                                    Cancel
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleReplySubmit}
                                    disabled={!replyText.trim() || isSubmittingReply}
                                >
                                    {isSubmittingReply ? 'Posting...' : 'Reply'}
                                </Button>
                            </Stack>
                        </Box>
                    </Collapse>

                    {replies.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                size="small"
                                onClick={() => setShowReplies(!showReplies)}
                                sx={{ mb: 1 }}
                            >
                                {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                            </Button>
                            <Collapse in={showReplies}>
                                <Divider sx={{ my: 1 }} />
                                <Stack spacing={2}>
                                    {replies.map((reply) => (
                                        <ReplyItem
                                            key={reply.id}
                                            reply={reply}
                                            onLike={handleReplyLike}
                                            onReply={handleReplyToReply}
                                        />
                                    ))}
                                </Stack>
                            </Collapse>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Stack>
    );
};