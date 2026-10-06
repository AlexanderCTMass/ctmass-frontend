import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FALLBACK_IMAGE, buildStatusStyles } from './base-preview-card';

const SURFACE_DARK = '#1E252E';
const COMPACT = '@container (max-width: 230px)';

const stripPlatformPrefix = (value) => (value || '').toString().replace(/^on\s+\S*tmass\s*/i, '').trim();

const glassPill = {
    borderRadius: 999,
    bgcolor: alpha('#0F172A', 0.6),
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)'
};

const Photo = ({ data, theme }) => {
    const hasPhoto = data.image && data.image !== FALLBACK_IMAGE;

    if (hasPhoto) {
        return (
            <Box
                component="img"
                src={data.image}
                alt={data.title}
                loading="lazy"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                }}
            />
        );
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(120% 90% at 20% 10%, ${alpha(theme.palette.primary.light, 0.55)} 0%, transparent 60%), linear-gradient(160deg, #2A3A8F 0%, #1F2D77 55%, #121B4D 100%)`
            }}
        >
            <Typography
                sx={{
                    fontSize: 72,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: alpha('#FFFFFF', 0.9),
                    [COMPACT]: { fontSize: 52 }
                }}
            >
                {data.avatarInitial || data.title?.charAt(0).toUpperCase()}
            </Typography>
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
    const dotColor = statusStyles.bgcolor;
    const subtitle = data.specialtyList?.[0] || data.specialtyLabel || 'Specialist';
    const reviewsCount = Number(data.reviewsCount) || 0;
    const hasReviews = reviewsCount > 0;
    const projects = Number(data.completedProjects) || 0;
    const headline = data.roleLabel || (projects > 0 ? `${projects} project${projects === 1 ? '' : 's'} completed` : '');
    const extraSpecialties = (data.specialtyList || []).filter(Boolean).filter((item) => item !== subtitle).slice(0, 3);
    const detailsLine = extraSpecialties.length ? extraSpecialties.join(', ') : '';
    const memberFor = stripPlatformPrefix(data.registrationDuration);
    const infoText = (data.specialtyList || []).filter(Boolean).join(' / ') || data.description || 'View profile';

    const panelBg = isDark ? '#161D25' : '#FFFFFF';
    const panelText = isDark ? '#F1F5F9' : '#0F172A';
    const panelMuted = alpha(panelText, 0.55);

    return (
        <Card
            elevation={0}
            sx={{
                containerType: 'inline-size',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                maxWidth: 320,
                mx: 'auto',
                borderRadius: '22px',
                overflow: 'hidden',
                bgcolor: isDark ? '#10161D' : '#EEF0FA',
                boxShadow: '0 14px 34px rgba(31, 45, 119, 0.12)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 24px 48px rgba(31, 45, 119, 0.22)'
                },
                '&:hover img': { transform: 'scale(1.05)' }
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', pt: '82%', overflow: 'hidden', flexShrink: 0 }}>
                <Photo data={data} theme={theme} />

                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0) 38%, rgba(15,23,42,0) 75%, rgba(30,37,46,0.45) 100%)'
                    }}
                />

                <Tooltip title={infoText} arrow placement="top">
                    <Box
                        sx={{
                            ...glassPill,
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            [COMPACT]: { display: 'none' }
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>
                </Tooltip>

                <Stack
                    spacing={0.6}
                    alignItems="flex-end"
                    sx={{ position: 'absolute', top: 10, right: 10, left: 46, [COMPACT]: { left: 8, top: 8, right: 8 } }}
                >
                    <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{ ...glassPill, maxWidth: '100%', minWidth: 0, px: 1.1, py: 0.6 }}
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
                        <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF', [COMPACT]: { fontSize: 10.5 } }}>
                            {data.statusLabel || 'Available'}
                        </Typography>
                        {data.priceLabel && (
                            <Typography
                                noWrap
                                sx={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF', pl: 0.5, [COMPACT]: { display: 'none' } }}
                            >
                                {data.priceLabel}
                            </Typography>
                        )}
                    </Stack>
                    {data.priceLabel && (
                        <Box
                            sx={{
                                display: 'none',
                                px: 1,
                                py: 0.35,
                                borderRadius: 999,
                                bgcolor: '#1F2D77',
                                color: '#FFFFFF',
                                fontSize: 10.5,
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                [COMPACT]: { display: 'block' }
                            }}
                        >
                            {data.priceLabel}
                        </Box>
                    )}
                </Stack>
            </Box>

            <Box
                sx={{
                    bgcolor: SURFACE_DARK,
                    color: '#FFFFFF',
                    px: 2,
                    pt: 1.5,
                    pb: 4,
                    [COMPACT]: { px: 1.5, pt: 1.25, pb: 3.5 }
                }}
            >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                            <Typography
                                noWrap
                                title={data.title}
                                sx={{
                                    minWidth: 0,
                                    fontSize: 19,
                                    fontWeight: 800,
                                    lineHeight: 1.25,
                                    letterSpacing: '-0.01em',
                                    [COMPACT]: { fontSize: 15 }
                                }}
                            >
                                {data.title}
                            </Typography>
                            {data.isPro && (
                                <WorkspacePremiumRoundedIcon sx={{ flexShrink: 0, fontSize: 17, color: theme.palette.warning.light }} />
                            )}
                        </Stack>
                        <Typography
                            noWrap
                            title={subtitle}
                            sx={{ mt: 0.25, fontSize: 14, fontWeight: 500, color: alpha('#FFFFFF', 0.62), [COMPACT]: { fontSize: 12 } }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>

                    <Stack alignItems="flex-end" sx={{ flexShrink: 0, pt: 0.25, [COMPACT]: { display: 'none' } }}>
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                            <StarOutlineRoundedIcon sx={{ fontSize: 19, color: theme.palette.warning.main }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                                {hasReviews ? data.ratingDisplay || (data.ratingValue || 0).toFixed(1) : '-.-'}
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: alpha('#FFFFFF', 0.7) }}>
                            {hasReviews ? `${reviewsCount} review${reviewsCount === 1 ? '' : 's'}` : 'No reviews'}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        display: 'none',
                        mt: 1,
                        pt: 0.9,
                        borderTop: `1px solid ${alpha('#FFFFFF', 0.12)}`,
                        [COMPACT]: { display: 'flex' }
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.3}>
                        <StarRoundedIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />
                        <Typography sx={{ fontSize: 11.5, fontWeight: 800 }}>
                            {hasReviews ? data.ratingDisplay || (data.ratingValue || 0).toFixed(1) : '-.-'}
                        </Typography>
                    </Stack>
                    <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 600, color: alpha('#FFFFFF', 0.6) }}>
                        {hasReviews ? `${reviewsCount} review${reviewsCount === 1 ? '' : 's'}` : 'No reviews'}
                    </Typography>
                </Stack>
            </Box>

            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', px: 1.25, pb: 1.25, [COMPACT]: { px: 0.75, pb: 0.75 } }}>
                <Box
                    sx={{
                        position: 'relative',
                        flexGrow: 1,
                        mt: -3,
                        p: 1.75,
                        borderRadius: '18px',
                        bgcolor: panelBg,
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
                        [COMPACT]: { p: 1.25, borderRadius: '14px' }
                    }}
                >
                    <Stack spacing={1.1} sx={{ [COMPACT]: { gap: 0.75 } }}>
                        {(headline || detailsLine) && (
                            <Box sx={{ minWidth: 0, [COMPACT]: { display: 'none' } }}>
                                {headline && (
                                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 800, color: panelText }}>
                                        {headline}
                                    </Typography>
                                )}
                                {detailsLine && (
                                    <Typography noWrap title={detailsLine} sx={{ mt: 0.25, fontSize: 11.5, fontWeight: 500, color: panelMuted }}>
                                        {detailsLine}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {data.locationLabel && (
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                <LocationOnRoundedIcon
                                    sx={{ fontSize: 18, color: theme.palette.error.main, flexShrink: 0, [COMPACT]: { fontSize: 15 } }}
                                />
                                <Typography
                                    noWrap
                                    title={data.locationLabel}
                                    sx={{ minWidth: 0, fontSize: 13, fontWeight: 800, color: panelText, [COMPACT]: { fontSize: 11 } }}
                                >
                                    {data.locationLabel}
                                </Typography>
                            </Stack>
                        )}

                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                            <VerifiedUserOutlinedIcon
                                sx={{
                                    fontSize: 17,
                                    flexShrink: 0,
                                    color: data.isVerified ? theme.palette.success.main : panelMuted,
                                    [COMPACT]: { fontSize: 14 }
                                }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 800, color: panelText, lineHeight: 1.25, [COMPACT]: { fontSize: 10.5 } }}>
                                    {data.isVerified ? 'Verified with CTMASS' : 'Member of CTMASS'}
                                </Typography>
                                {memberFor && (
                                    <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 500, color: panelMuted, lineHeight: 1.3, [COMPACT]: { fontSize: 9.5 } }}>
                                        {memberFor}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
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
        statusKey: PropTypes.string.isRequired,
        statusLabel: PropTypes.string.isRequired
    }).isRequired,
    theme: PropTypes.object.isRequired
};

VerticalPreviewCard.defaultProps = {
    data: {
        image: FALLBACK_IMAGE,
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
