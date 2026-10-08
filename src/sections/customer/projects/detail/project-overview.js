import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Fancybox from 'src/components/myfancy/myfancybox';
import { Preview } from 'src/components/myfancy/image-preview';
import { ProjectSummary } from 'src/sections/customer/projects/detail/project-summary';
import { ProjectInnerSummary } from 'src/sections/customer/projects/detail/project-inner-summary';
import { ProjectSchedulingPanel } from './scheduling/project-scheduling-panel';
import { ProjectStatus } from 'src/enums/project-state';
import { roles } from 'src/roles';
import { Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';

export const ProjectOverview = (props) => {
    const { project, specialties, isMyResponded, serviceLabel, role, user, createDate, onOpenChat, ...other } = props;

    const images = project.attach || [];
    const isWorker = role === roles.WORKER;
    const showScheduling = [ProjectStatus.AWAITING_SCHEDULE, ProjectStatus.MEETING_SCHEDULED].includes(project.status);

    return (
        <Box
            {...other}
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 380px' },
                gap: { xs: 2.5, md: 3 },
                alignItems: 'start'
            }}
        >
            <Box sx={{ minWidth: 0, display: 'grid', gap: { xs: 2.5, md: 3 } }}>
                <Surface>
                    <SurfaceHeader icon={<DescriptionOutlinedIcon />} title="Description" />
                    <Box
                        sx={{
                            color: BRAND.ink,
                            fontSize: 16,
                            lineHeight: 1.7,
                            overflowWrap: 'anywhere',
                            '& p': { m: 0, mb: 1.5 },
                            '& p:last-of-type': { mb: 0 },
                            '& ul, & ol': { pl: 3 }
                        }}
                    >
                        {project.description
                            ? <div dangerouslySetInnerHTML={{ __html: project.description }} />
                            : <Typography sx={{ color: BRAND.muted }}>No description added yet.</Typography>}
                    </Box>
                    {showScheduling && (
                        <ProjectSchedulingPanel project={project} role={role} user={user} sx={{ mt: 3 }} />
                    )}
                </Surface>

                <Surface>
                    <SurfaceHeader
                        icon={<PhotoLibraryOutlinedIcon />}
                        title="Photos and videos"
                        subtitle={images.length ? `${images.length} ${images.length === 1 ? 'file' : 'files'}` : 'No photos added yet.'}
                        sx={{ mb: images.length ? { xs: 2.5, md: 3 } : 0 }}
                    />
                    {images.length > 0 && (
                        <Fancybox options={{ Carousel: { infinite: false } }}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                                    gap: 1.25,
                                    '& a': {
                                        display: 'block',
                                        aspectRatio: '1 / 1',
                                        overflow: 'hidden',
                                        borderRadius: RADIUS.tile,
                                        border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                                        bgcolor: BRAND.mist
                                    },
                                    '& a > *': { width: '100%', height: '100%' },
                                    '& img, & video': { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s ease' },
                                    '& a:hover img': { transform: 'scale(1.04)' }
                                }}
                            >
                                {images.map((url) => (
                                    <a key={url} data-fancybox="gallery" href={url} className="my-fancy-link">
                                        <Preview attach={{ preview: url }} />
                                    </a>
                                ))}
                            </Box>
                        </Fancybox>
                    )}
                </Surface>
            </Box>

            <Box sx={{ minWidth: 0, display: 'grid', gap: 2 }}>
                <ProjectSummary isMyResponded={isMyResponded} project={project} role={role} user={user} onOpenChat={onOpenChat} />
                {!isWorker && <ProjectInnerSummary project={project} />}
            </Box>
        </Box>
    );
};

ProjectOverview.propTypes = {
    project: PropTypes.object.isRequired
};
