import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { formatDistanceToNowStrict } from 'date-fns';
import { LISTING_CATEGORIES } from 'src/service/listing-service';
import { focusRingSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export const formatListingPrice = (listing) => {
    if (listing.price === 0) return 'Free';
    if (listing.price === undefined || listing.price === null || listing.price === '') return 'Ask';
    return `$${Number(listing.price).toLocaleString('en-US')}`;
};

const timeAgo = (value) => {
    if (!value) return '';
    const date = new Date(value?.toDate ? value.toDate() : value);
    if (Number.isNaN(date.getTime())) return '';
    return `${formatDistanceToNowStrict(date)} ago`;
};

export const ListingTile = ({ listing, onOpen, onLike, isLiked, canLike = true, layout = 'grid', compact = false }) => {
    const categoryLabel = LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label || listing.category;
    const image = listing.images?.[0];
    const isList = layout === 'list';
    const description = stripHtml(listing.description);

    const handleLike = (event) => {
        event.stopPropagation();
        onLike?.(listing.id, !isLiked);
    };

    return (
        <Box
            component="article"
            role="link"
            tabIndex={0}
            onClick={() => onOpen(listing)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') onOpen(listing);
            }}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: isList ? 'row' : 'column' },
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.sm,
                transition: 'box-shadow .25s ease, border-color .25s ease',
                '&:hover': { boxShadow: SHADOW.md, borderColor: alpha(BRAND.navy, 0.16) },
                '&:hover .listing-image': { transform: 'scale(1.04)' },
                ...focusRingSx
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    flexShrink: 0,
                    width: { xs: '100%', sm: isList ? 260 : '100%' },
                    aspectRatio: { xs: compact ? '16 / 11' : '4 / 3', sm: isList ? 'auto' : (compact ? '16 / 11' : '4 / 3') },
                    minHeight: { sm: isList ? 200 : 0 },
                    overflow: 'hidden',
                    bgcolor: BRAND.mist
                }}
            >
                {image ? (
                    <Box
                        className="listing-image"
                        component="img"
                        src={image}
                        alt={listing.title}
                        loading="lazy"
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s cubic-bezier(.2,.8,.2,1)' }}
                    />
                ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, color: alpha(BRAND.navy, 0.3) }}>
                        <LocalOfferOutlinedIcon sx={{ fontSize: 44 }} />
                    </Stack>
                )}

                <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', top: 12, left: 12 }}>
                    {listing.type === 'urgent' && <StatusPill tone="danger" sx={{ bgcolor: BRAND.danger, color: '#FFFFFF' }}>Urgent</StatusPill>}
                    {listing.type === 'featured' && <StatusPill sx={{ bgcolor: BRAND.navy, color: '#FFFFFF' }}>Featured</StatusPill>}
                    {listing.status === 'sold' && <StatusPill sx={{ bgcolor: BRAND.ink, color: '#FFFFFF' }}>Sold</StatusPill>}
                </Stack>

                {canLike && onLike && (
                    <IconButton
                        aria-label={isLiked ? 'Remove from saved' : 'Save listing'}
                        onClick={handleLike}
                        sx={{
                            position: 'absolute',
                            top: compact ? 8 : 10,
                            right: compact ? 8 : 10,
                            width: compact ? 34 : 38,
                            height: compact ? 34 : 38,
                            bgcolor: alpha('#FFFFFF', 0.92),
                            color: isLiked ? BRAND.danger : BRAND.navy,
                            boxShadow: SHADOW.sm,
                            '&:hover': { bgcolor: '#FFFFFF' }
                        }}
                    >
                        {isLiked ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
                    </IconButton>
                )}

                <Box
                    sx={{
                        position: 'absolute',
                        left: compact ? 10 : 12,
                        bottom: compact ? 10 : 12,
                        px: compact ? 1.25 : 1.5,
                        py: 0.5,
                        borderRadius: RADIUS.pill,
                        bgcolor: '#FFFFFF',
                        boxShadow: SHADOW.md,
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: compact ? 15 : 17,
                        color: listing.price === 0 ? BRAND.green : BRAND.navy,
                        fontVariantNumeric: 'tabular-nums'
                    }}
                >
                    {formatListingPrice(listing)}
                    {listing.priceType === 'negotiable' && (
                        <Box component="span" sx={{ ml: 0.5, fontFamily: FONT.body, fontSize: 12, fontWeight: 600, color: BRAND.muted }}>
                            or best offer
                        </Box>
                    )}
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', p: compact ? { xs: 1.5, md: 1.75 } : { xs: 2, md: 2.25 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography noWrap sx={{ fontSize: 12, fontWeight: 700, color: BRAND.green }}>
                        {categoryLabel}
                    </Typography>
                    <Typography noWrap sx={{ flexShrink: 0, fontSize: 12, color: BRAND.muted }}>
                        {timeAgo(listing.createdAt)}
                    </Typography>
                </Stack>
                <Typography
                    component="h3"
                    sx={{
                        mt: 0.75,
                        fontFamily: FONT.display,
                        fontWeight: 700,
                        fontSize: compact ? 15 : 17,
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                        color: BRAND.navy,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {listing.title}
                </Typography>
                {isList && description && (
                    <Typography
                        sx={{
                            mt: 0.75,
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: BRAND.muted,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {description}
                    </Typography>
                )}
                {listing.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1, color: BRAND.muted, minWidth: 0 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                        <Typography noWrap sx={{ fontSize: 13, fontWeight: 500 }}>{listing.location}</Typography>
                    </Stack>
                )}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 'auto', pt: compact ? 1.25 : 1.75 }}
                >
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1, pt: compact ? 1.25 : 1.5, borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                        <Avatar src={listing.author?.avatar || undefined} sx={{ width: compact ? 22 : 26, height: compact ? 22 : 26, fontSize: 11, fontWeight: 800, color: BRAND.navy, bgcolor: alpha(BRAND.green, 0.16) }}>
                            {(listing.author?.name || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: BRAND.ink }}>
                            {listing.author?.name || 'CTMASS member'}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ color: BRAND.muted, flexShrink: 0 }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{listing.views || 0}</Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};
