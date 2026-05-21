import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export const BeforeAfterSlider = ({ beforeImage, afterImage, onContainerClick, height, interactive = true }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = useCallback((clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    }, [isDragging, handleMove]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback((e) => {
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        handleMove(touch.clientX);
    }, [isDragging, handleMove]);

    useEffect(() => {
        if (!interactive) return undefined;
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [interactive, isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const handleContainerClick = useCallback((e) => {
        if (interactive && e.target.closest('[data-slider-handle]')) return;
        onContainerClick?.();
    }, [interactive, onContainerClick]);

    return (
        <Box
            ref={containerRef}
            onClick={handleContainerClick}
            sx={{
                position: 'relative',
                width: '100%',
                height: height || '100%',
                overflow: 'hidden',
                cursor: isDragging ? 'ew-resize' : (onContainerClick ? 'pointer' : 'default'),
                userSelect: 'none'
            }}
        >
            <Box
                component="img"
                src={afterImage}
                alt="After"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />

            <Box
                component="img"
                src={beforeImage}
                alt="Before"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: '#f44336',
                    color: '#fff',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 2,
                    opacity: sliderPosition > 15 ? 1 : 0,
                    transition: 'opacity 0.2s'
                }}
            >
                Before
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: '#4caf50',
                    color: '#fff',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 2,
                    opacity: sliderPosition < 85 ? 1 : 0,
                    transition: 'opacity 0.2s'
                }}
            >
                After
            </Box>

            {interactive ? (
                <Box
                    data-slider-handle
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: `${sliderPosition}%`,
                        transform: 'translateX(-50%)',
                        height: '100%',
                        width: 4,
                        bgcolor: '#fff',
                        cursor: 'ew-resize',
                        zIndex: 3,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        },
                        '&::after': {
                            content: '"\\2194"',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 16,
                            color: '#333',
                            zIndex: 4
                        }
                    }}
                />
            ) : (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: `${sliderPosition}%`,
                        transform: 'translateX(-50%)',
                        height: '100%',
                        width: 3,
                        bgcolor: '#fff',
                        boxShadow: '0 0 4px rgba(0,0,0,0.25)',
                        zIndex: 3,
                        pointerEvents: 'none'
                    }}
                />
            )}
        </Box>
    );
};

BeforeAfterSlider.propTypes = {
    beforeImage: PropTypes.string.isRequired,
    afterImage: PropTypes.string.isRequired,
    onContainerClick: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    interactive: PropTypes.bool
};

export default BeforeAfterSlider;
