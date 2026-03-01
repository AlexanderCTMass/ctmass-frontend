import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
    Link
} from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ProjectModal from 'src/pages/cabinet/profiles/my/portfolio/ProjectModal';

const BeforeAfterSlider = ({ beforeImage, afterImage, onContainerClick }) => {
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
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const handleContainerClick = useCallback((e) => {
        if (e.target.closest('[data-slider-handle]')) return;
        onContainerClick?.();
    }, [onContainerClick]);

    return (
        <Box
            ref={containerRef}
            onClick={handleContainerClick}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                cursor: isDragging ? 'ew-resize' : 'pointer',
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
        </Box>
    );
};

const SingleImageContent = ({ thumbnail, isLoaded, onLoad }) => (
    <>
        {!isLoaded && (
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'grey.200',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}
            />
        )}
        <Box
            component="img"
            src={thumbnail}
            alt=""
            onLoad={onLoad}
            sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLoaded ? 'block' : 'none'
            }}
        />
    </>
);

const PortfolioGalleryCard = ({ project, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const hasBeforeAfter = Boolean(project.beforeImage && project.afterImage);

    const handleClick = useCallback(() => {
        onClick(project);
    }, [onClick, project]);

    return (
        <Box
            onClick={!hasBeforeAfter ? handleClick : undefined}
            sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '4 / 3',
                backgroundColor: 'background.default',
                boxShadow: 2,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}
        >
            {hasBeforeAfter ? (
                <BeforeAfterSlider
                    beforeImage={project.beforeImage}
                    afterImage={project.afterImage}
                    onContainerClick={handleClick}
                />
            ) : (
                <SingleImageContent
                    thumbnail={project.thumbnail}
                    isLoaded={isLoaded}
                    onLoad={() => setIsLoaded(true)}
                />
            )}

            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
                    pointerEvents: 'none'
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    color: '#fff',
                    pointerEvents: 'none'
                }}
            >
                <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    noWrap
                    sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                    {project.title}
                </Typography>
                {project.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                        <Typography
                            variant="caption"
                            sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            noWrap
                        >
                            {project.location}
                        </Typography>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

const PortfolioGallery = ({ portfolio, profileData, setProfileData }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const sortedPortfolio = useMemo(() => {
        const filtered = (portfolio || []).filter(p => p.public !== false);
        return filtered.sort((a, b) => {
            if (a.order === undefined) return 1;
            if (b.order === undefined) return -1;
            return a.order - b.order;
        });
    }, [portfolio]);

    const visibleProjects = useMemo(
        () => expanded ? sortedPortfolio : sortedPortfolio.slice(0, 8),
        [sortedPortfolio, expanded]
    );

    const hasMore = sortedPortfolio.length > 8;
    const hasPortfolio = sortedPortfolio.length > 0;

    const handleCardClick = useCallback((project) => {
        setSelectedProject(project);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedProject(null);
    }, []);

    const handleToggleExpanded = useCallback(() => {
        setExpanded(prev => !prev);
    }, []);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CollectionsIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Portfolio Gallery
                    </Typography>
                </Stack>

                {!hasPortfolio ? (
                    <Typography variant="body2" color="text.secondary">
                        No portfolio projects yet.
                    </Typography>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)',
                                    lg: 'repeat(4, 1fr)'
                                }
                            }}
                        >
                            {visibleProjects.map((project) => (
                                <PortfolioGalleryCard
                                    key={project.id}
                                    project={project}
                                    onClick={handleCardClick}
                                />
                            ))}
                        </Box>

                        {hasMore && (
                            <Box display="flex" justifyContent="flex-end">
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={handleToggleExpanded}
                                    sx={{
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    {expanded
                                        ? 'Show fewer projects'
                                        : `View all projects`}
                                </Link>
                            </Box>
                        )}
                    </>
                )}
            </Stack>

            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    setProject={setSelectedProject}
                    onClose={handleCloseModal}
                    profile={profileData}
                    setProfile={setProfileData}
                />
            )}
        </Paper>
    );
};

PortfolioGallery.propTypes = {
    portfolio: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
        location: PropTypes.string,
        thumbnail: PropTypes.string,
        beforeImage: PropTypes.string,
        afterImage: PropTypes.string,
        images: PropTypes.array,
        public: PropTypes.bool,
        order: PropTypes.number
    })),
    profileData: PropTypes.object,
    setProfileData: PropTypes.func
};

PortfolioGallery.defaultProps = {
    portfolio: [],
    profileData: null,
    setProfileData: undefined
};

export default PortfolioGallery;
