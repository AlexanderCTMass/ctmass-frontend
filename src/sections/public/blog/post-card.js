import { forwardRef } from 'react';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Stack,
    Typography,
    alpha
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

export const PublicPostCard = forwardRef((props, ref) => {
    const theme = useTheme();
    const {
        id,
        authorAvatar,
        authorName,
        category,
        cover,
        publishedAt,
        readTime,
        shortDescription,
        title,
        likes = 0,
        comments = 0,
        onClick,
        featured = false,
        sx,
        ...other
    } = props;

    const publishedDate = publishedAt
        ? format(new Date(publishedAt), 'MMM d, yyyy')
        : 'Recently';

    return (
        <Card
            ref={ref}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[10]
                },
                ...(featured && {
                    border: '2px solid',
                    borderColor: 'primary.main',
                    position: 'relative',
                    '&::before': {
                        content: '"Featured"',
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        zIndex: 1
                    }
                }),
                ...sx
            }}
            {...other}
        >
            <CardActionArea onClick={onClick} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {cover && (
                    <Box
                        sx={{
                            position: 'relative',
                            pt: '56.25%', // 16:9 aspect ratio
                            overflow: 'hidden',
                            bgcolor: 'grey.100'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${cover})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                        />
                    </Box>
                )}

                <CardContent sx={{ flex: 1, p: 3 }}>
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Chip
                                label={category || 'Uncategorized'}
                                size="small"
                                color={featured ? 'primary' : 'default'}
                                variant={featured ? 'filled' : 'outlined'}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {publishedDate} • {readTime || '1 min read'}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {shortDescription}
                        </Typography>

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 'auto', pt: 2 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar
                                    src={authorAvatar}
                                    sx={{ width: 32, height: 32 }}
                                />
                                <Typography variant="subtitle2" color="text.primary">
                                    {authorName}
                                </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <FavoriteIcon
                                        sx={{
                                            fontSize: 18,
                                            color: likes > 0 ? 'error.main' : 'action.disabled'
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {likes}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CommentIcon sx={{ fontSize: 18, color: 'action.disabled' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        {comments}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
});