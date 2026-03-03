import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { buildStatusStyles } from './base-preview-card';

const HorizontalPreviewCard = ({ data, theme }) => {
    const statusStyles = buildStatusStyles(theme, data.statusKey);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                overflow: 'hidden',
                boxShadow: 'none',
                // backgroundColor: alpha(theme.palette.primary.main, 0.015),
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[3]
                }
            }}
        >
            {/* Контейнер для фото 1:1 */}
            <Box
                sx={{
                    position: 'relative',
                    width: { xs: '100%', sm: 140, md: 140 },
                    flexShrink: 0,
                    aspectRatio: '1/1.4', // Соотношение 1:1
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        bgcolor: theme.palette.grey[100]
                    }}
                >
                    <Box
                        component="img"
                        src={data.image}
                        alt={data.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.05)'
                            }
                        }}
                    />

                    {/* Бейдж с ценой */}
                    <Chip
                        label={data.priceLabel}
                        color="warning"
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            '& .MuiChip-label': {
                                px: 1
                            }
                        }}
                    />
                </Box>
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: { xs: 2, sm: 2.5 },
                    '&:last-child': { pb: { xs: 2, sm: 2.5 } }
                }}
            >
                {/* Верхняя строка: длительность регистрации и статус */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 0.5 }}
                >
                    {data.registrationDuration && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {data.registrationDuration}
                        </Typography>
                    )}

                    <Chip
                        size="small"
                        label={data.statusLabel}
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

                {/* Название */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {data.title}
                </Typography>

                {/* Специализация */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {data.specialtyLabel}
                </Typography>

                {/* Рейтинг и отзывы */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                        size="small"
                        value={data.ratingValue}
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
                            {data.ratingDisplay}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            {data.reviewsCount}
                        </Typography>
                    </Box>
                </Box>

                {/* Локация с иконкой */}
                {data.locationLabel && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.7rem',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span>📍</span>
                        {data.locationLabel}
                    </Typography>
                )}

                {/* Краткое описание (опционально) */}
                {data.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            fontSize: '0.7rem',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mt: 0.5
                        }}
                    >
                        {data.description}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default HorizontalPreviewCard;