import { useState } from 'react';
import {
    IconButton,
    SvgIcon,
    Typography,
    Tooltip,
    Box,
    Badge,
    CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from 'src/hooks/use-auth';
import { useSnackbar } from 'src/hooks/use-snackbar';

export const LikeButton = ({
                               postId,
                               likes = 0,
                               isLiked = false,
                               onLike,
                               size = 'medium',
                               showCount = true,
                               disabled = false,
                               sx
                           }) => {
    const { user } = useAuth();
    const snackbar = useSnackbar();
    const [liked, setLiked] = useState(isLiked);
    const [likeCount, setLikeCount] = useState(likes);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = async () => {
        if (!user) {
            snackbar.warning('Please sign in to like posts');
            return;
        }

        if (disabled || isSubmitting) return;

        setIsSubmitting(true);

        // Оптимистичное обновление UI
        const previousLiked = liked;
        const previousCount = likeCount;

        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await onLike(postId, newLiked);
        } catch (error) {
            // Откатываем изменения при ошибке
            console.error('Error in like handler:', error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
            snackbar.error('Failed to update like');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tooltipTitle = !user
        ? 'Sign in to like'
        : liked
            ? 'Unlike'
            : 'Like';

    // Безопасное отображение счетчика
    const displayCount = typeof likeCount === 'number' ? likeCount : 0;

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', ...sx }}>
            <Tooltip title={tooltipTitle}>
        <span>
          <IconButton
              onClick={handleLike}
              disabled={!user || disabled || isSubmitting}
              color={liked ? 'error' : 'default'}
              size={size}
              sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                      transform: 'scale(1.1)'
                  },
                  '&:active': {
                      transform: 'scale(0.95)'
                  },
                  ...(liked && {
                      color: 'error.main',
                      '&:hover': {
                          color: 'error.dark'
                      }
                  })
              }}
          >
            {isSubmitting ? (
                <CircularProgress size={size === 'small' ? 20 : 24} color="inherit" />
            ) : (
                <Badge
                    badgeContent={showCount && size !== 'small' ? displayCount : null}
                    color="primary"
                    max={999}
                    showZero
                    sx={{
                        '& .MuiBadge-badge': {
                            right: -8,
                            top: 8
                        }
                    }}
                >
                    <SvgIcon fontSize={size}>
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </SvgIcon>
                </Badge>
            )}
          </IconButton>
        </span>
            </Tooltip>
            {showCount && size === 'small' && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, minWidth: 20 }}>
                    {displayCount}
                </Typography>
            )}
        </Box>
    );
};