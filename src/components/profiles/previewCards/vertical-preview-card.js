import React from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Card,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { buildPreviewFeatures, buildPreviewHighlight, buildStatusStyles } from './base-preview-card';

const SURFACE_DARK = '#1E252E';

const FEATURE_ICONS = {
    bolt: BoltRoundedIcon,
    star: StarRoundedIcon,
    check: CheckRoundedIcon,
    medal: MilitaryTechRoundedIcon,
    work: HandymanRoundedIcon,
    shield: ShieldRoundedIcon,
    clock: ScheduleRoundedIcon
};

const getToneColor = (theme, tone) => theme.palette[tone]?.main || theme.palette.primary.main;

const ToneIcon = ({ theme, tone = 'success', icon = 'check', solid = false, size = 22 }) => {
    const Icon = FEATURE_ICONS[icon] || CheckRoundedIcon;
    const color = getToneColor(theme, tone);

    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: solid ? color : 'transparent',
                border: solid ? 'none' : `2.5px solid ${color}`
            }}
        >
            <Icon sx={{ fontSize: solid ? size * 0.62 : size * 0.5, color: solid ? '#fff' : color }} />
        </Box>
    );
};

const VerticalPreviewCard = ({ data, theme }) => {
    if (!data || !theme) {
        console.warn('VerticalPreviewCard: missing required props');
        return null;
    }

    const isDark = theme.palette.mode === 'dark';
    const statusStyles = buildStatusStyles(theme, data.statusKey);
    const highlight = buildPreviewHighlight(data);
    const features = buildPreviewFeatures(data);
    const subtitle = data.roleLabel || data.specialtyLabel;
    const specialtyList = (data.specialtyList || []).filter(Boolean).slice(0, 4);
    const specialties = specialtyList.length === 1 && specialtyList[0] === subtitle ? [] : specialtyList;
    const reviewsCount = Number(data.reviewsCount) || 0;
    const hasReviews = reviewsCount > 0;
    const description = features.length ? null : data.description;
    const hasPanelContent = Boolean(data.locationLabel || features.length || specialties.length || description);

    const panelBg = isDark ? '#161D25' : '#FFFFFF';
    const panelText = isDark ? '#F1F5F9' : '#0F172A';
    const panelMuted = alpha(panelText, 0.55);
    const dotColor = statusStyles.bgcolor;

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 320,
                mx: 'auto',
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: panelBg,
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)'
                }
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', pt: '82%' }}>
                <Avatar
                    src={data.image}
                    alt={data.title}
                    variant="square"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        fontSize: 44,
                        fontWeight: 800,
                        color: theme.palette.grey[500],
                        bgcolor: theme.palette.grey[isDark ? 800 : 200]
                    }}
                >
                    {data.avatarInitial || data.title?.charAt(0).toUpperCase()}
                </Avatar>

                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0) 42%)'
                    }}
                />

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ position: 'absolute', top: 12, left: 12, right: 12 }}
                >
                    {highlight ? (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{
                                minWidth: 0,
                                px: 0.8,
                                py: 0.6,
                                borderRadius: 999,
                                bgcolor: alpha('#FFFFFF', 0.92),
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)'
                            }}
                        >
                            <ToneIcon theme={theme} tone={highlight.tone} icon={highlight.icon} solid size={20} />
                            <Box sx={{ minWidth: 0, pr: 0.5 }}>
                                <Typography noWrap sx={{ fontSize: 12, fontWeight: 800, lineHeight: 1.15, color: '#0F172A' }}>
                                    {highlight.label}
                                </Typography>
                                {highlight.caption && (
                                    <Typography noWrap sx={{ fontSize: 9.5, fontWeight: 600, lineHeight: 1.25, color: alpha('#0F172A', 0.55) }}>
                                        {highlight.caption}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    ) : (
                        <Box />
                    )}

                    <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                        sx={{
                            flexShrink: 1,
                            minWidth: 0,
                            px: 1.1,
                            py: 0.75,
                            borderRadius: 999,
                            bgcolor: alpha('#0F172A', 0.62),
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)'
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                flexShrink: 0,
                                borderRadius: '50%',
                                bgcolor: dotColor,
                                boxShadow: `0 0 0 3px ${alpha(dotColor, 0.3)}`
                            }}
                        />
                        <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF' }}>
                            {data.statusLabel || 'Available'}
                        </Typography>
                        {data.priceLabel && (
                            <Typography
                                noWrap
                                sx={{
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    color: theme.palette.warning.light
                                }}
                            >
                                {data.priceLabel}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Box
                sx={{
                    bgcolor: SURFACE_DARK,
                    color: '#FFFFFF',
                    px: 2,
                    pt: 1.5,
                    pb: hasPanelContent ? 4 : 2
                }}
            >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                    <Typography
                        noWrap
                        title={data.title}
                        sx={{ minWidth: 0, fontSize: 19, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' }}
                    >
                        {data.title}
                    </Typography>

                    {data.isVerified && (
                        <Stack
                            direction="row"
                            spacing={0.4}
                            alignItems="center"
                            sx={{ flexShrink: 0, px: 0.8, py: 0.3, borderRadius: 999, bgcolor: '#FFFFFF' }}
                        >
                            <ToneIcon theme={theme} tone="success" icon="check" size={13} />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#0F172A' }}>Verified</Typography>
                        </Stack>
                    )}

                    {data.isPro && (
                        <Stack
                            direction="row"
                            spacing={0.4}
                            alignItems="center"
                            sx={{
                                flexShrink: 0,
                                px: 0.8,
                                py: 0.3,
                                borderRadius: 999,
                                border: `1.5px solid ${alpha('#FFFFFF', 0.35)}`
                            }}
                        >
                            <WorkspacePremiumRoundedIcon sx={{ fontSize: 12, color: theme.palette.warning.light }} />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#FFFFFF' }}>Pro</Typography>
                        </Stack>
                    )}
                </Stack>

                {subtitle && (
                    <Typography
                        noWrap
                        title={subtitle}
                        sx={{ mt: 0.25, fontSize: 13.5, fontWeight: 500, color: alpha('#FFFFFF', 0.72) }}
                    >
                        {subtitle}
                    </Typography>
                )}

                {hasReviews ? (
                    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 0.8, minWidth: 0 }}>
                        <Rating
                            size="small"
                            readOnly
                            precision={0.5}
                            value={data.ratingValue || 0}
                            sx={{
                                fontSize: 17,
                                flexShrink: 0,
                                '& .MuiRating-iconFilled': { color: theme.palette.warning.main },
                                '& .MuiRating-iconEmpty': { color: alpha('#FFFFFF', 0.25) }
                            }}
                        />
                        <Typography noWrap sx={{ fontSize: 12, fontWeight: 800 }}>
                            {data.ratingDisplay || (data.ratingValue || 0).toFixed(1)}
                        </Typography>
                        <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 600, color: alpha('#FFFFFF', 0.55) }}>
                            {`· ${reviewsCount} review${reviewsCount === 1 ? '' : 's'}`}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography sx={{ mt: 0.8, fontSize: 11.5, fontWeight: 600, color: alpha('#FFFFFF', 0.5) }}>
                        No reviews yet
                    </Typography>
                )}
            </Box>

            {hasPanelContent && (
                <Box
                    sx={{
                        position: 'relative',
                        flexGrow: 1,
                        px: 1.25,
                        pb: 1.25,
                        background: isDark
                            ? 'linear-gradient(180deg, #10161D 0%, #131A22 100%)'
                            : 'linear-gradient(180deg, #F3F5FB 0%, #ECEFF9 100%)'
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            mt: -3,
                            p: 1.75,
                            borderRadius: '18px',
                            bgcolor: panelBg,
                            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)'
                        }}
                    >
                        <Stack spacing={1.25}>
                            {data.locationLabel && (
                                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
                                    <LocationOnRoundedIcon sx={{ fontSize: 18, color: theme.palette.error.main, flexShrink: 0 }} />
                                    <Typography
                                        noWrap
                                        title={data.locationLabel}
                                        sx={{ fontSize: 13, fontWeight: 800, color: panelText }}
                                    >
                                        {data.locationLabel}
                                    </Typography>
                                </Stack>
                            )}

                            {description && (
                                <Typography
                                    sx={{
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        color: alpha(panelText, 0.7),
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {description}
                                </Typography>
                            )}

                            {features.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
                                        columnGap: 1,
                                        rowGap: 1
                                    }}
                                >
                                    {features.map((feature) => (
                                        <Stack key={feature.label} direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0 }}>
                                            <ToneIcon
                                                theme={theme}
                                                tone={feature.tone}
                                                icon={feature.icon}
                                                solid={feature.solid}
                                                size={22}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography noWrap title={feature.label} sx={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2, color: panelText }}>
                                                    {feature.label}
                                                </Typography>
                                                {feature.caption && (
                                                    <Typography noWrap sx={{ fontSize: 10, fontWeight: 500, lineHeight: 1.3, color: panelMuted }}>
                                                        {feature.caption}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    ))}
                                </Box>
                            )}

                            {specialties.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: panelMuted, mb: 0.3 }}>
                                        Specialties
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.55, color: panelText }}>
                                        {specialties.join(' / ')}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Box>
            )}
        </Card>
    );
};

VerticalPreviewCard.propTypes = {
    data: PropTypes.shape({
        image: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        specialtyLabel: PropTypes.string.isRequired,
        specialtyList: PropTypes.arrayOf(PropTypes.string),
        roleLabel: PropTypes.string,
        description: PropTypes.string,
        locationLabel: PropTypes.string,
        priceLabel: PropTypes.string,
        priceType: PropTypes.string,
        ratingValue: PropTypes.number,
        ratingDisplay: PropTypes.string,
        reviewsCount: PropTypes.number,
        completedProjects: PropTypes.number,
        avatarInitial: PropTypes.string,
        registrationDuration: PropTypes.string,
        isVerified: PropTypes.bool,
        isPro: PropTypes.bool,
        highlight: PropTypes.shape({
            label: PropTypes.string,
            caption: PropTypes.string,
            tone: PropTypes.string,
            icon: PropTypes.string
        }),
        features: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            caption: PropTypes.string,
            tone: PropTypes.string,
            icon: PropTypes.string,
            solid: PropTypes.bool
        })),
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
        specialtyList: [],
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
