import React from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { buildStatusStyles, getPriceMeta } from './base-preview-card';

const VerticalPreviewCard = ({ data, theme }) => {
    if (!data || !theme) {
        console.warn('VerticalPreviewCard: missing required props');
        return null;
    }

    const statusStyles = buildStatusStyles(theme, data.statusKey);
    const priceMeta = getPriceMeta(data.priceType);
    const PriceIcon = priceMeta.Icon;

    return (
        <Card
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                width: '100%',
                maxWidth: 280,
                mx: 'auto',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', pt: '100%' }}>
                <Avatar
                    src={data.image}
                    alt={data.title}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        bgcolor: theme.palette.grey[200]
                    }}
                    variant="square"
                >
                    {data.avatarInitial || data.title?.charAt(0).toUpperCase()}
                </Avatar>

                {data.priceLabel && (
                    <Chip
                        icon={<PriceIcon />}
                        label={data.priceLabel}
                        color={priceMeta.color}
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                                px: 1
                            },
                            '& .MuiChip-icon': {
                                fontSize: 14,
                                ml: 0.75
                            }
                        }}
                    />
                )}
            </Box>

            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                    {data.registrationDuration && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {data.registrationDuration}
                        </Typography>
                    )}

                    <Chip
                        size="small"
                        label={data.statusLabel || 'Unknown'}
                        sx={{
                            bgcolor: statusStyles.bgcolor,
                            color: statusStyles.color,
                            fontSize: '0.65rem',
                            height: 20,
                            textTransform: 'capitalize',
                            borderRadius: '10px',
                            '& .MuiChip-label': {
                                px: 1
                            }
                        }}
                    />
                </Stack>

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    title={data.title}
                >
                    {data.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: '0.8rem',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    title={data.specialtyLabel}
                >
                    {data.specialtyLabel}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating
                        size="small"
                        value={data.ratingValue || 0}
                        readOnly
                        precision={0.5}
                        sx={{
                            fontSize: '1rem',
                            '& .MuiRating-iconFilled': {
                                color: theme.palette.warning.main
                            }
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: theme.palette.grey[100],
                            px: 1,
                            py: 0.25,
                            borderRadius: 12,
                            gap: 0.5
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            {data.ratingDisplay || data.ratingValue?.toFixed(1) || '0.0'}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            {data.reviewsCount || 0}
                        </Typography>
                    </Box>
                </Box>

                {data.locationLabel && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={data.locationLabel}
                    >
                        <span>📍</span>
                        {data.locationLabel}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

VerticalPreviewCard.propTypes = {
    data: PropTypes.shape({
        image: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        specialtyLabel: PropTypes.string.isRequired,
        locationLabel: PropTypes.string,
        priceLabel: PropTypes.string,
        priceType: PropTypes.string,
        ratingValue: PropTypes.number,
        ratingDisplay: PropTypes.string,
        reviewsCount: PropTypes.number,
        avatarInitial: PropTypes.string,
        registrationDuration: PropTypes.string,
        statusKey: PropTypes.string.isRequired,
        statusLabel: PropTypes.string.isRequired
    }).isRequired,
    theme: PropTypes.object.isRequired
};

VerticalPreviewCard.defaultProps = {
    data: {
        image: '/assets/avatars/defaultUser.jpg',
        title: 'Your trade title',
        specialtyLabel: 'Specialist',
        locationLabel: '',
        priceLabel: '$55/hr',
        ratingValue: 0,
        ratingDisplay: '0.0',
        reviewsCount: 0,
        avatarInitial: '',
        registrationDuration: null,
        statusKey: 'available',
        statusLabel: 'Available'
    }
};

export default VerticalPreviewCard;
