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
    Paper
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { formatDistanceToNow } from 'date-fns';

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

export const CommentItem = ({
                                comment,
                                depth = 0,
                                onLike,
                                onReply,
                                onReplyLike
                            }) => {
    const { user } = useAuth();
    const snackbar = useSnackbar();
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(depth < 2); // Автоматически показываем до 2 уровня
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (!user) {
            snackbar.warning('Please sign in to like');
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            await onLike(comment.id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyText.trim() || !user) return;

        setIsSubmittingReply(true);
        try {
            const newReply = await onReply(replyText, comment.id);
            if (newReply) {
                setReplyText('');
                setShowReply(false);
                setShowReplies(true);
                snackbar.success('Reply added');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            snackbar.error('Failed to add reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const maxDepth = 5; // Максимальная глубина вложенности
    const canReply = user && depth < maxDepth;
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <Box sx={{
            ml: depth * 3,
            mt: depth === 0 ? 2 : 1,
            position: 'relative'
        }}>
            {/* Линия-связка для вложенных комментариев */}
            {depth > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: -20,
                        top: 20,
                        width: 20,
                        height: 'calc(100% - 30px)',
                        borderLeft: '2px solid',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        borderRadius: '0 0 0 8px'
                    }}
                />
            )}

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    bgcolor: depth === 0 ? 'background.paper' : 'action.hover'
                }}
            >
                <Stack spacing={1}>
                    {/* Заголовок комментария */}
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                            src={comment.authorAvatar}
                            sx={{ width: 32, height: 32 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle2">
                                    {comment.authorName}
                                </Typography>
                                <Typography color="text.secondary" variant="caption">
                                    {formatDate(comment.createdAt)}
                                </Typography>
                            </Stack>

                            {/* Текст комментария */}
                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                {comment.content}
                            </Typography>

                            {/* Действия */}
                            <Stack
                                direction="row"
                                spacing={3}
                                sx={{ mt: 1, alignItems: 'center' }} // Добавлено выравнивание по центру
                            >
                                <Stack direction="row">
                                <IconButton
                                    size="small"
                                    onClick={handleLike}
                                    color={comment.isLiked ? 'primary' : 'default'}
                                    disabled={!user || isLiking}
                                    sx={{ p: 0.5 }} // Уменьшаем внутренние отступы
                                >
                                    <SvgIcon fontSize="small">
                                        {comment.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                    </SvgIcon>
                                </IconButton>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        lineHeight: 1, // Убираем лишнюю высоту строки
                                        alignSelf: 'center' // Дополнительное выравнивание
                                    }}
                                >
                                    {comment.likes || 0}
                                </Typography>

                                </Stack>
                                {canReply && (
                                    <Button
                                        size="small"
                                        startIcon={<SvgIcon fontSize="small"><ReplyIcon /></SvgIcon>}
                                        onClick={() => setShowReply(!showReply)}
                                        sx={{ ml: 'auto' }} // Опционально: прижимает кнопку Reply вправо
                                    >
                                        Reply
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Форма ответа */}
                    <Collapse in={showReply}>
                        <Box sx={{ mt: 2, ml: 5 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={`Reply to ${comment.authorName}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                multiline
                                rows={2}
                                disabled={isSubmittingReply}
                                autoFocus
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    onClick={() => setShowReply(false)}
                                    disabled={isSubmittingReply}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleReplySubmit}
                                    disabled={!replyText.trim() || isSubmittingReply}
                                >
                                    {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                                </Button>
                            </Stack>
                        </Box>
                    </Collapse>

                    {/* Кнопка показа/скрытия ответов */}
                    {hasReplies && (
                        <Box sx={{ ml: 5, mt: 1 }}>
                            <Button
                                size="small"
                                onClick={() => setShowReplies(!showReplies)}
                                sx={{ textTransform: 'none' }}
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies.length}
                                {' '}{comment.replies.length === 1 ? 'reply' : 'replies'}
                            </Button>
                        </Box>
                    )}

                    {/* Вложенные ответы */}
                    {hasReplies && showReplies && (
                        <Collapse in={showReplies}>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        depth={depth + 1}
                                        onLike={onReplyLike}
                                        onReply={onReply}
                                        onReplyLike={onReplyLike}
                                    />
                                ))}
                            </Stack>
                        </Collapse>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};