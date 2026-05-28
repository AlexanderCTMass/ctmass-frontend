import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Paper,
    Stack,
    Typography,
    Link
} from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ProjectModal from 'src/pages/cabinet/profiles/my/portfolio/ProjectModal';
import { BeforeAfterSlider } from 'src/components/before-after-slider';
import { resolvePortfolioMedia } from 'src/utils/portfolio-media';

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

    const { before, after, single, hasBeforeAfter } = resolvePortfolioMedia(project);

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
                    beforeImage={before}
                    afterImage={after}
                    onContainerClick={handleClick}
                />
            ) : (
                <SingleImageContent
                    thumbnail={single}
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
        const filtered = (portfolio || []).filter(
            (p) => p.public !== false && Boolean(resolvePortfolioMedia(p).single)
        );
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
