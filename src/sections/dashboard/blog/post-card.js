import {forwardRef} from 'react';
import {format} from 'date-fns';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import {safeFormatDate} from 'src/utils/date-utils';

export const PostCard = forwardRef((props, ref) => {
    const {
        id,
        authorAvatar,
        authorName,
        authorId,
        category,
        cover,
        publishedAt,
        readTime,
        shortDescription,
        title,
        likes = 0,
        comments = 0,
        onClick,
        sx,
        ...other
    } = props;

    const publishedDate = safeFormatDate(publishedAt, 'MMM d, yyyy', 'Recently');

    return (
        <Card
            ref={ref}
            sx={sx}
            {...other}
        >
            <CardActionArea onClick={onClick}>
                {cover && (
                    <Box
                        sx={{
                            backgroundImage: `url(${cover})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            height: 200
                        }}
                    />
                )}
                <CardContent>
                    <Stack spacing={2}>
                        <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Chip
                                label={category || 'Uncategorized'}
                                size="small"
                            />
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {publishedDate} • {readTime || '1 min read'}
                            </Typography>
                        </Stack>
                        <div>
                            <Typography variant="h6">
                                {title}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}
                            >
                                {shortDescription}
                            </Typography>
                        </div>
                        <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Avatar src={authorAvatar} sx={{ height: 32, width: 32 }} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Здесь можно добавить фильтрацию по автору
                                        console.log('Filter by author:', authorId);
                                    }}
                                >
                                    {authorName}
                                </Typography>
                            </Stack>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={0.5}
                                >
                                    <SvgIcon
                                        color="action"
                                        fontSize="small"
                                    >
                                        <FavoriteIcon/>
                                    </SvgIcon>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {likes}
                                    </Typography>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={0.5}
                                >
                                    <SvgIcon
                                        color="action"
                                        fontSize="small"
                                    >
                                        <CommentIcon/>
                                    </SvgIcon>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
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