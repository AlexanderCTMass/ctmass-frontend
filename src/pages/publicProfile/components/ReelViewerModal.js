import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    Box,
    Dialog,
    IconButton,
    Slider,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { reelsApi } from 'src/api/reels';
import { useAuth } from 'src/hooks/use-auth';

const IMAGE_DURATION_MS = 4000;

const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

const ProgressBars = memo(({ count, currentIndex, progress, onGoTo }) => {
    if (count <= 1) return null;
    return (
        <Box
            sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                display: 'flex',
                gap: '4px',
                zIndex: 10
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    onClick={() => onGoTo(i)}
                    sx={{
                        flex: 1,
                        height: 3,
                        bgcolor: 'rgba(255,255,255,0.35)',
                        borderRadius: 999,
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            width:
                                i < currentIndex
                                    ? '100%'
                                    : i === currentIndex
                                    ? `${progress}%`
                                    : '0%',
                            bgcolor: 'success.main',
                            borderRadius: 999
                        }}
                    />
                </Box>
            ))}
        </Box>
    );
});

const RightActions = memo(({ views, likes, isLiked, onLike, onShare, likeDisabled }) => (
    <Box
        sx={{
            position: 'absolute',
            right: 12,
            bottom: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
            zIndex: 10
        }}
    >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon
                sx={{ color: 'white', fontSize: 22, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
            />
            <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
                {views}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton
                size="small"
                onClick={onLike}
                disabled={likeDisabled}
                sx={{ color: isLiked ? 'success.main' : 'white', p: 0 }}
            >
                <FavoriteIcon
                    sx={{ fontSize: 22, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
                />
            </IconButton>
            <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
                {likes}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={onShare} sx={{ color: 'white', p: 0 }}>
                <ShareIcon
                    sx={{ fontSize: 22, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
                />
            </IconButton>
            <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
                Share
            </Typography>
        </Box>
    </Box>
));

const ReelViewerModal = ({ open, onClose, reel }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [views, setViews] = useState(0);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showCenterIcon, setShowCenterIcon] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);

    const videoRef = useRef(null);
    const progressRef = useRef(0);
    const animFrameRef = useRef(null);
    const centerIconTimerRef = useRef(null);
    const viewsIncrementedRef = useRef(false);
    const touchStartXRef = useRef(null);

    const slides = reel?.content || [];
    const currentSlideData = slides[currentSlide];
    const isVideo = currentSlideData?.type === 'video';
    const isFullscreenMode = isMobile || isFullscreen;

    useEffect(() => {
        if (open && reel) {
            setCurrentSlide(0);
            setProgress(0);
            progressRef.current = 0;
            setIsPlaying(true);
            setIsFullscreen(false);
            setViews(reel.views || 0);
            setLikes(reel.likes || 0);
            setIsLiked((reel.likedBy || []).includes(user?.id));
            setVideoCurrentTime(0);
            setVideoDuration(0);
            viewsIncrementedRef.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, reel?.id]);

    useEffect(() => {
        if (open && reel?.id && !viewsIncrementedRef.current) {
            viewsIncrementedRef.current = true;
            reelsApi.incrementViews(reel.id)
                .then(() => setViews((prev) => prev + 1))
                .catch(() => {});
        }
    }, [open, reel?.id]);

    const goToSlide = useCallback(
        (index) => {
            if (index >= slides.length) {
                onClose();
                return;
            }
            if (index < 0) return;
            cancelAnimationFrame(animFrameRef.current);
            setCurrentSlide(index);
            setProgress(0);
            progressRef.current = 0;
            setIsPlaying(true);
            setVideoCurrentTime(0);
            setVideoDuration(0);
        },
        [slides.length, onClose]
    );

    const goNext = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
    const goPrev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

    useEffect(() => {
        if (!open || isVideo || !isPlaying || !currentSlideData) return;

        const startProgress = progressRef.current;
        const startTime = Date.now();
        const remainingMs = (1 - startProgress / 100) * IMAGE_DURATION_MS;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(
                startProgress + (elapsed / remainingMs) * (100 - startProgress),
                100
            );
            progressRef.current = newProgress;
            setProgress(newProgress);
            if (newProgress >= 100) {
                goNext();
            } else {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [open, currentSlide, isVideo, isPlaying, goNext, currentSlideData]);

    useEffect(() => {
        if (!isVideo || !open) return;
        setShowCenterIcon(true);
        clearTimeout(centerIconTimerRef.current);
        centerIconTimerRef.current = setTimeout(() => setShowCenterIcon(false), 2000);
        return () => clearTimeout(centerIconTimerRef.current);
    }, [currentSlide, isVideo, open]);

    useEffect(() => {
        if (!videoRef.current || !isVideo) return;
        if (isPlaying) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, isVideo, currentSlide]);

    const handleVideoTimeUpdate = useCallback(() => {
        if (!videoRef.current || isDraggingScrubber) return;
        const { currentTime, duration } = videoRef.current;
        if (duration) {
            const p = (currentTime / duration) * 100;
            progressRef.current = p;
            setProgress(p);
            setVideoCurrentTime(currentTime);
        }
    }, [isDraggingScrubber]);

    const handleVideoEnded = useCallback(() => goNext(), [goNext]);

    const handleVideoMetadata = useCallback(() => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
        }
    }, []);

    const handleVideoClick = useCallback(() => {
        const newPlaying = !isPlaying;
        setIsPlaying(newPlaying);
        setShowCenterIcon(true);
        clearTimeout(centerIconTimerRef.current);
        centerIconTimerRef.current = setTimeout(() => setShowCenterIcon(false), 2000);
    }, [isPlaying]);

    const handleScrubberChange = useCallback(
        (_, val) => {
            if (videoRef.current && videoDuration) {
                const newTime = (val / 100) * videoDuration;
                videoRef.current.currentTime = newTime;
                setVideoCurrentTime(newTime);
                progressRef.current = val;
                setProgress(val);
            }
        },
        [videoDuration]
    );

    const handleLike = useCallback(async () => {
        if (!user || user.isAnonymous || !reel?.id) return;
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikes((prev) => prev + (newLiked ? 1 : -1));
        try {
            await reelsApi.toggleLike(reel.id, user.id, newLiked);
        } catch {
            setIsLiked(!newLiked);
            setLikes((prev) => prev + (newLiked ? -1 : 1));
        }
    }, [user, reel?.id, isLiked]);

    const handleShare = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('showStories', reel?.id);
        navigator.clipboard.writeText(url.toString()).catch(() => {});
    }, [reel?.id]);

    const handleTouchStart = useCallback((e) => {
        touchStartXRef.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (touchStartXRef.current === null) return;
            const dx = touchStartXRef.current - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 50) {
                if (dx > 0) goNext();
                else goPrev();
            }
            touchStartXRef.current = null;
        },
        [goNext, goPrev]
    );

    if (!reel || !slides.length) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullScreen={isFullscreenMode}
            PaperProps={{
                sx: {
                    width: isFullscreenMode ? '100%' : 390,
                    height: isFullscreenMode ? '100%' : 700,
                    m: 0,
                    overflow: 'hidden',
                    bgcolor: '#000',
                    borderRadius: isFullscreenMode ? 0 : 2
                }
            }}
        >
            <Box
                sx={{ width: '100%', height: '100%', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {isVideo ? (
                    <video
                        ref={videoRef}
                        key={currentSlideData.url}
                        src={currentSlideData.url}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnded}
                        onLoadedMetadata={handleVideoMetadata}
                        onClick={handleVideoClick}
                    />
                ) : (
                    <Box
                        onClick={goNext}
                        sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
                    >
                        <img
                            src={currentSlideData.url}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </Box>
                )}

                <ProgressBars
                    count={slides.length}
                    currentIndex={currentSlide}
                    progress={progress}
                    onGoTo={goToSlide}
                />

                {(reel.title || reel.description) && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: slides.length > 1 ? 36 : 16,
                            left: 16,
                            right: 72,
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}
                    >
                        {reel.title && (
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                    textShadow: '0 1px 4px rgba(0,0,0,0.9)'
                                }}
                            >
                                {reel.title}
                            </Typography>
                        )}
                        {reel.description && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                }}
                            >
                                {reel.description}
                            </Typography>
                        )}
                    </Box>
                )}

                {showCenterIcon && isVideo && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}
                    >
                        {isPlaying ? (
                            <PauseIcon
                                sx={{
                                    color: 'white',
                                    fontSize: 64,
                                    opacity: 0.9,
                                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))'
                                }}
                            />
                        ) : (
                            <PlayArrowIcon
                                sx={{
                                    color: 'white',
                                    fontSize: 64,
                                    opacity: 0.9,
                                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))'
                                }}
                            />
                        )}
                    </Box>
                )}

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.45)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
                        zIndex: 20
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <RightActions
                    views={views}
                    likes={likes}
                    isLiked={isLiked}
                    onLike={handleLike}
                    onShare={handleShare}
                    likeDisabled={!user || user.isAnonymous}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        px: 2,
                        pb: 2,
                        pt: 1,
                        background: isVideo
                            ? 'linear-gradient(transparent, rgba(0,0,0,0.55))'
                            : 'none',
                        zIndex: 10
                    }}
                >
                    {isVideo && (
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: 'white', minWidth: 82, flexShrink: 0 }}
                            >
                                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                            </Typography>
                            <Slider
                                value={progress}
                                onChange={handleScrubberChange}
                                onMouseDown={() => setIsDraggingScrubber(true)}
                                onMouseUp={() => setIsDraggingScrubber(false)}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    setIsDraggingScrubber(true);
                                }}
                                onTouchEnd={() => setIsDraggingScrubber(false)}
                                sx={{
                                    color: 'success.main',
                                    height: 4,
                                    py: 0,
                                    '& .MuiSlider-thumb': { width: 12, height: 12 }
                                }}
                            />
                        </Box>
                    )}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                                size="small"
                                onClick={() => setIsFullscreen((prev) => !prev)}
                                sx={{ color: 'white' }}
                            >
                                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default ReelViewerModal;
