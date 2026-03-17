import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PropTypes from 'prop-types';
import { reelsApi } from 'src/api/reels';
import ReelViewerModal from './ReelViewerModal';

const REEL_WIDTH = 140;
const REEL_HEIGHT = 220;
const GAP = 12;
const SCROLL_STEP = 3 * (REEL_WIDTH + GAP);
const VIEWED_KEY = 'ctmass_viewedReels';

const getViewedSet = () => {
    try {
        return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]'));
    } catch {
        return new Set();
    }
};

const markViewed = (reelId) => {
    try {
        const set = getViewedSet();
        set.add(reelId);
        localStorage.setItem(VIEWED_KEY, JSON.stringify([...set]));
    } catch {
        //
    }
};

const ReelCard = memo(({ reel, isViewed, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            width: REEL_WIDTH,
            height: REEL_HEIGHT,
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0,
            cursor: 'pointer',
            border: isViewed ? 'none' : '3px solid',
            borderColor: isViewed ? 'transparent' : 'primary.main',
            boxSizing: 'border-box',
            '&:hover img': {
                transform: 'scale(1.05)'
            }
        }}
    >
        <img
            src={reel.preview}
            alt={reel.title || 'Reel'}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s ease'
            }}
        />
        {reel.title && (
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'white',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {reel.title}
                </Typography>
            </Box>
        )}
    </Box>
));

const PublicReelsSection = ({ userId, onAvailabilityChange, initialOpenReelId }) => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewedReels, setViewedReels] = useState(() => getViewedSet());
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [openReel, setOpenReel] = useState(null);

    const scrollRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        reelsApi
            .getUserReels(userId)
            .then((data) => {
                setReels(data);
                onAvailabilityChange?.(data.length > 0);
                if (initialOpenReelId) {
                    const target = data.find((r) => r.id === initialOpenReelId);
                    if (target) setOpenReel(target);
                }
            })
            .catch(() => {
                setReels([]);
                onAvailabilityChange?.(false);
            })
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, onAvailabilityChange]);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const left = Math.round(el.scrollLeft);
        const max = Math.round(el.scrollWidth - el.clientWidth);
        setCanScrollLeft(left > 5);
        setCanScrollRight(left < max - 5);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || reels.length === 0) return;
        updateScrollState();

        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => ro.disconnect();
    }, [reels, updateScrollState]);

    const scrollLeft = useCallback(() => {
        scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }, []);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (touchStartX.current === null) return;
            const dx = touchStartX.current - e.changedTouches[0].clientX;
            const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);

            if (Math.abs(dx) > 50 && dy < Math.abs(dx)) {
                if (dx > 0 && canScrollRight) scrollRight();
                else if (dx < 0 && canScrollLeft) scrollLeft();
            }

            touchStartX.current = null;
            touchStartY.current = null;
        },
        [canScrollLeft, canScrollRight, scrollLeft, scrollRight]
    );

    const handleOpenReel = useCallback(
        (reel) => {
            if (!viewedReels.has(reel.id)) {
                markViewed(reel.id);
                setViewedReels((prev) => new Set([...prev, reel.id]));
            }
            setOpenReel(reel);
        },
        [viewedReels]
    );

    const gradientOverlayBase = useMemo(
        () => ({
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 60,
            cursor: 'pointer',
            zIndex: 1
        }),
        []
    );

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    backgroundColor: 'background.paper'
                }}
            >
                <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <OndemandVideoIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Reels
                        </Typography>
                    </Stack>

                    {!loading && reels.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No Reels added.
                        </Typography>
                    ) : (
                        <Box
                            sx={{ position: 'relative' }}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <Box
                                ref={scrollRef}
                                onScroll={updateScrollState}
                                sx={{
                                    display: 'flex',
                                    gap: `${GAP}px`,
                                    overflowX: 'scroll',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    pb: 0.5
                                }}
                            >
                                {reels.map((reel) => (
                                    <ReelCard
                                        key={reel.id}
                                        reel={reel}
                                        isViewed={viewedReels.has(reel.id)}
                                        onClick={() => handleOpenReel(reel)}
                                    />
                                ))}
                            </Box>

                            {canScrollLeft && (
                                <Box
                                    onClick={scrollLeft}
                                    sx={{
                                        ...gradientOverlayBase,
                                        left: 0,
                                        background:
                                            'linear-gradient(to right, rgba(0,0,0,0.25), transparent)'
                                    }}
                                />
                            )}

                            {canScrollRight && (
                                <Box
                                    onClick={scrollRight}
                                    sx={{
                                        ...gradientOverlayBase,
                                        right: 0,
                                        background: 'linear-gradient(to left, rgba(0,0,0,0.25), transparent)'
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </Stack>
            </Paper>

            <ReelViewerModal
                open={!!openReel}
                onClose={() => setOpenReel(null)}
                reel={openReel}
            />
        </>
    );
};

PublicReelsSection.propTypes = {
    userId: PropTypes.string,
    onAvailabilityChange: PropTypes.func,
    initialOpenReelId: PropTypes.string
};

export default memo(PublicReelsSection);
