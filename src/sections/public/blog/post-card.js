import { forwardRef } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { format } from 'date-fns';
import { focusRingSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const safeDate = (value) => {
    if (!value) return 'Recently';
    const date = new Date(value?.toDate ? value.toDate() : value);
    return Number.isNaN(date.getTime()) ? 'Recently' : format(date, 'MMM d, yyyy');
};

export const PublicPostCard = forwardRef((props, ref) => {
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

    return (
        <Box
            ref={ref}
            component="article"
            role="link"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter') onClick?.();
            }}
            sx={{
                height: '100%',
                display: 'grid',
                gridTemplateColumns: featured ? { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.25fr) minmax(0, 1fr)' } : 'minmax(0, 1fr)',
                gridTemplateRows: featured ? undefined : 'auto 1fr',
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                borderRadius: { xs: RADIUS.card, md: featured ? RADIUS.panel : RADIUS.card },
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.sm,
                transition: 'box-shadow .25s ease, border-color .25s ease',
                '&:hover': { boxShadow: SHADOW.md, borderColor: alpha(BRAND.navy, 0.16) },
                '&:hover .post-cover': { transform: 'scale(1.04)' },
                '&:hover .post-title': { color: BRAND.navyHover },
                ...focusRingSx,
                ...sx
            }}
            {...other}
        >
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    aspectRatio: featured ? { xs: '16 / 10', md: 'auto' } : '16 / 10',
                    minHeight: featured ? { md: 380 } : 0,
                    bgcolor: BRAND.mist
                }}
            >
                {cover ? (
                    <Box
                        className="post-cover"
                        component="img"
                        src={cover}
                        alt={title}
                        loading="lazy"
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s cubic-bezier(.2,.8,.2,1)' }}
                    />
                ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, color: alpha(BRAND.navy, 0.3) }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 48 }} />
                    </Stack>
                )}
                {category && (
                    <StatusPill tone="navy" sx={{ position: 'absolute', top: 14, left: 14, bgcolor: alpha('#FFFFFF', 0.92), boxShadow: SHADOW.sm }}>
                        {category}
                    </StatusPill>
                )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, p: featured ? { xs: 2.5, md: 4 } : { xs: 2.25, md: 2.5 }, justifyContent: featured ? 'center' : 'flex-start' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND.muted }}>
                    {safeDate(publishedAt)}{readTime ? `, ${readTime}` : ''}
                </Typography>
                <Typography
                    className="post-title"
                    component="h3"
                    sx={{
                        mt: 1,
                        fontFamily: FONT.display,
                        fontWeight: featured ? 800 : 700,
                        fontSize: featured ? { xs: 22, md: 32 } : 19,
                        lineHeight: featured ? 1.15 : 1.3,
                        letterSpacing: featured ? '-0.025em' : '-0.01em',
                        color: BRAND.navy,
                        textWrap: 'balance',
                        display: '-webkit-box',
                        WebkitLineClamp: featured ? 3 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'anywhere',
                        transition: 'color .2s ease'
                    }}
                >
                    {title}
                </Typography>
                {shortDescription && (
                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: featured ? 16 : 14,
                            lineHeight: 1.6,
                            color: BRAND.muted,
                            display: '-webkit-box',
                            WebkitLineClamp: featured ? 4 : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {shortDescription}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: featured ? 3 : 'auto', pt: 2, borderTop: featured ? 0 : `1px solid ${alpha(BRAND.navy, 0.08)}` }}
                >
                    <Avatar src={authorAvatar} sx={{ width: 30, height: 30, fontSize: 13, bgcolor: BRAND.navy }}>
                        {(authorName || '?').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: BRAND.ink }}>
                        {authorName || 'CTMASS member'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: BRAND.muted, flexShrink: 0, '& svg': { fontSize: 17 } }}>
                        <Stack direction="row" alignItems="center" spacing={0.4}>
                            <FavoriteBorderRoundedIcon />
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{likes}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.4}>
                            <ChatBubbleOutlineRoundedIcon />
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{comments}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
});

PublicPostCard.displayName = 'PublicPostCard';
