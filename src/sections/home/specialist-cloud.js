import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PropTypes from 'prop-types';
import { mapSpecialistToPreviewData } from 'src/utils/preview-card-utils';
import { paths } from 'src/paths';
import { useRouter } from 'src/hooks/use-router';
import { StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TILE_SIZES = [82, 66, 74, 60, 70];
const TILE_TONES = [
    `linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
    `linear-gradient(150deg, ${BRAND.green} 0%, ${BRAND.greenDeep} 100%)`,
    `linear-gradient(150deg, #3B4A9C 0%, ${BRAND.navy} 100%)`
];

const STATUS_TONE = {
    available: 'green',
    busy: 'amber',
    on_review: 'muted',
    hidden: 'muted',
    fix_it: 'amber'
};

const initialOf = (specialist) => (specialist.businessName || specialist.name || '?').trim().charAt(0).toUpperCase();

const SpecialistTile = ({ specialist, size, tone, sx }) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: `${Math.round(size * 0.26)}px`,
            overflow: 'hidden',
            border: '3px solid #FFFFFF',
            background: tone,
            boxShadow: SHADOW.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: size * 0.38,
            ...sx
        }}
    >
        {specialist.avatar ? (
            <Box
                component="img"
                src={specialist.avatar}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
        ) : initialOf(specialist)}
    </Box>
);

const OrbitalAvatarCard = ({ specialist, index, total, orbitRadius, onClick, animationsPaused }) => {
    const MIN_ANGLE = 110;
    const MAX_ANGLE = 340;
    const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;

    const baseAngle = (MIN_ANGLE + (index * (ANGLE_RANGE / Math.max(total - 1, 1)))) * (Math.PI / 180);
    const offsetAngle = useRef((Math.random() - 0.5) * 0.2);
    const minRad = MIN_ANGLE * (Math.PI / 180);
    const maxRad = MAX_ANGLE * (Math.PI / 180);
    const angle = Math.min(maxRad, Math.max(minRad, baseAngle + offsetAngle.current));

    const x = Math.cos(angle) * orbitRadius;
    const y = Math.sin(angle) * orbitRadius;

    const size = TILE_SIZES[index % TILE_SIZES.length];
    const tone = TILE_TONES[index % TILE_TONES.length];
    const rotateAngle = useRef((Math.random() - 0.5) * 12);
    const floatParams = useRef({
        xOffset: (Math.random() - 0.5) * 14,
        yOffset: (Math.random() - 0.5) * 14,
        rotateOffset: (Math.random() - 0.5) * 4,
        duration: 5 + Math.random() * 3
    });

    const isInUpperHalf = angle < Math.PI;
    const shouldFloat = !animationsPaused && !prefersReducedMotion;
    const label = specialist.businessName || specialist.name;

    return (
        <motion.div
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={label ? `Show ${label}` : 'Show specialist'}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
            animate={shouldFloat ? {
                x: [x + floatParams.current.xOffset, x - floatParams.current.xOffset, x + floatParams.current.xOffset],
                y: [y + floatParams.current.yOffset, y - floatParams.current.yOffset, y + floatParams.current.yOffset],
                rotate: [
                    rotateAngle.current + floatParams.current.rotateOffset,
                    rotateAngle.current - floatParams.current.rotateOffset,
                    rotateAngle.current + floatParams.current.rotateOffset
                ]
            } : { x, y, rotate: rotateAngle.current }}
            transition={shouldFloat ? {
                duration: floatParams.current.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
            } : { duration: 0 }}
            whileHover={{ scale: 1.12, rotate: 0, zIndex: 20, transition: { duration: 0.25 } }}
            style={{ position: 'absolute', left: '50%', top: '50%', cursor: 'pointer', zIndex: 5, outline: 'none' }}
        >
            <Box sx={{ position: 'relative', transform: 'translate(-50%, -50%)' }}>
                <SpecialistTile specialist={specialist} size={size} tone={tone} />
                {label && (
                    <motion.div
                        initial={{ opacity: 0, y: isInUpperHalf ? 6 : -6 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'absolute',
                            [isInUpperHalf ? 'bottom' : 'top']: -36,
                            left: '50%',
                            translateX: '-50%',
                            whiteSpace: 'nowrap',
                            backgroundColor: BRAND.navy,
                            color: '#FFFFFF',
                            padding: '6px 14px',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 700,
                            pointerEvents: 'none',
                            boxShadow: SHADOW.md,
                            zIndex: 30
                        }}
                    >
                        {label}
                    </motion.div>
                )}
            </Box>
        </motion.div>
    );
};

const FeaturedSpecialistCard = ({ specialist, data, compact }) => {
    const photoWidth = compact ? 92 : 128;
    const statusTone = STATUS_TONE[data.statusKey] || 'green';

    return (
        <Box
            sx={{
                display: 'flex',
                gap: compact ? 1.5 : 2,
                p: compact ? 1.25 : 1.5,
                bgcolor: '#FFFFFF',
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.lg,
                transition: 'box-shadow .25s ease, transform .25s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 24px 48px ${alpha(BRAND.navy, 0.18)}` },
                '&:hover .cloud-card-cta': { color: BRAND.green, gap: '8px' }
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: photoWidth,
                    alignSelf: 'stretch',
                    minHeight: compact ? 112 : 148,
                    borderRadius: RADIUS.inner,
                    overflow: 'hidden',
                    background: TILE_TONES[0],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: compact ? 34 : 44
                }}
            >
                {specialist.avatar ? (
                    <Box component="img" src={specialist.avatar} alt={data.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : initialOf(specialist)}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', py: compact ? 0.25 : 0.5, pr: compact ? 0.5 : 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <StatusPill tone={statusTone} sx={{ height: 22, flexShrink: 0 }}>{data.statusLabel}</StatusPill>
                    {data.registrationDuration && !compact && (
                        <Typography noWrap sx={{ fontSize: 12, color: BRAND.muted, minWidth: 0 }}>
                            {data.registrationDuration}
                        </Typography>
                    )}
                </Stack>
                <Typography
                    noWrap
                    sx={{ mt: 1, fontFamily: FONT.display, fontWeight: 800, fontSize: compact ? 16 : 19, letterSpacing: '-0.015em', lineHeight: 1.2, color: BRAND.navy }}
                >
                    {data.title}
                </Typography>
                <Typography noWrap sx={{ mt: 0.25, fontSize: 13, color: BRAND.muted }}>
                    {data.specialtyLabel}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                    <StarRoundedIcon sx={{ fontSize: 18, color: data.reviewsCount ? '#F5A524' : alpha(BRAND.navy, 0.25) }} />
                    {data.reviewsCount ? (
                        <Typography sx={{ fontSize: 13, color: BRAND.ink }}>
                            <Box component="span" sx={{ fontWeight: 800 }}>{data.ratingDisplay}</Box>
                            <Box component="span" sx={{ color: BRAND.muted }}>{` (${data.reviewsCount} ${data.reviewsCount === 1 ? 'review' : 'reviews'})`}</Box>
                        </Typography>
                    ) : (
                        <Typography sx={{ fontSize: 13, color: BRAND.muted }}>New on CTMASS</Typography>
                    )}
                </Stack>

                {data.locationLabel && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, color: BRAND.muted, minWidth: 0 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                        <Typography noWrap sx={{ fontSize: 13 }}>{data.locationLabel}</Typography>
                    </Stack>
                )}

                {!compact && (
                    <Box
                        className="cloud-card-cta"
                        sx={{ mt: 'auto', pt: 1.25, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 13, fontWeight: 700, color: BRAND.navy, transition: 'color .2s ease, gap .2s ease' }}
                    >
                        View profile
                        <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export const SpecialistsCloud = ({ specialists = [] }) => {
    const theme = useTheme();
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [animationsPaused, setAnimationsPaused] = useState(
        () => typeof document !== 'undefined' && document.visibilityState !== 'visible'
    );
    const autoPlayRef = useRef(null);

    useEffect(() => {
        const onVisibilityChange = () => {
            setAnimationsPaused(document.visibilityState !== 'visible');
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    const displaySpecialists = specialists.slice(0, 6);
    const activeSpecialist = displaySpecialists[activeIndex] || displaySpecialists[0];
    const otherSpecialists = displaySpecialists.filter((specialist) => specialist.id !== activeSpecialist?.id);

    const orbitRadius = downSm ? 40 : downMd ? 100 : 120;

    useEffect(() => {
        if (!isAutoPlay || displaySpecialists.length <= 1 || animationsPaused) return undefined;

        autoPlayRef.current = setInterval(() => {
            if (document.visibilityState === 'visible') {
                setActiveIndex((prev) => (prev + 1) % displaySpecialists.length);
            }
        }, 4000);

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlay, displaySpecialists.length, animationsPaused]);

    const handleManualChange = (callback) => {
        setIsAutoPlay(false);
        callback();
        setTimeout(() => setIsAutoPlay(true), 8000);
    };

    const handleSpecialistClick = (specialistId) => {
        setIsAutoPlay(false);
        router.push(paths.specialist.publicPage.replace(':profileId', specialistId));
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    if (!displaySpecialists.length || !activeSpecialist) {
        return null;
    }

    const activePreviewData = mapSpecialistToPreviewData(activeSpecialist, theme);

    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: 300, sm: 350, md: 450 },
                width: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 0, height: 0 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSpecialist.id}
                            initial={{ opacity: 0, scale: 0.92, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                            onClick={() => handleSpecialistClick(activeSpecialist.id)}
                            style={{
                                cursor: 'pointer',
                                position: 'absolute',
                                left: '90%',
                                top: '90%',
                                zIndex: 10,
                                width: downSm ? '280px' : downMd ? '330px' : '390px'
                            }}
                        >
                            <FeaturedSpecialistCard specialist={activeSpecialist} data={activePreviewData} compact={downSm} />
                        </motion.div>
                    </AnimatePresence>

                    {otherSpecialists.map((specialist, index) => (
                        <OrbitalAvatarCard
                            key={specialist.id}
                            specialist={specialist}
                            index={index}
                            total={otherSpecialists.length}
                            orbitRadius={orbitRadius}
                            onClick={() => handleManualChange(() => {
                                const newIndex = displaySpecialists.findIndex((s) => s.id === specialist.id);
                                setActiveIndex(newIndex);
                            })}
                            animationsPaused={animationsPaused}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

SpecialistsCloud.propTypes = {
    specialists: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        businessName: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        rating: PropTypes.number
    }))
};

export default SpecialistsCloud;
