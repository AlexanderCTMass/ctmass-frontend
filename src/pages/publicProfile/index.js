import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {useDispatch} from 'react-redux';
import {useNavigate, useParams} from 'react-router-dom';
import MessageChatSquare from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import {useAuth} from 'src/hooks/use-auth';
import useDictionary from 'src/hooks/use-dictionaries';
import {Seo} from 'src/components/seo';
import {extendedProfileApi} from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import {SpecialistQRBusinessCard} from 'src/sections/dashboard/specialist-profile/public/specialist-qr-business-card';
import {projectsApi} from 'src/api/projects';
import {ProjectStatus} from 'src/enums/project-state';
import {projectsLocalApi} from 'src/api/projects/project-local-storage';
import {chatApi} from 'src/api/chat/newApi';
import {profileApi} from 'src/api/profile';
import {messengerActions} from 'src/slices/messenger';
import {paths} from 'src/paths';
import SectionNav from './components/SectionNav';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';
import TagsSection from './components/TagsSection';
import ServicesSection from './components/ServicesSection';
import PortfolioGallery from './components/PortfolioGallery';
import EducationSection from './components/EducationSection';
import ConnectionsSection from './components/ConnectionsSection';
import CommunityAttributesSection from './components/CommunityAttributesSection';
import FaqSection from './components/FaqSection';
import ReviewsSection from './components/ReviewsSection';
import ReelsSection from './components/ReelsSection';
import { UserPosts } from "src/components/blog/user-posts";
import { profileService } from "src/service/profile-service";
import {UserPosts} from "src/components/blog/user-posts";
import {profileService} from "src/service/profile-service";
import {UserListings} from "src/components/listings/user-listings";

const getProfileUrl = (profile) =>
    `${process.env.REACT_APP_HOST_P ?? ''}/contractors/first1000/${profile?.profilePage || profile?.id || ''}`;

const formatLocation = (profile) => {
    const address = profile?.profile?.address;
    if (!address) {
        return '';
    }

    const parts = [
        address.location?.place_name,
        address.city,
        address.state,
        address.country
    ].filter(Boolean);

    return parts.join(', ');
};

const isDateInFuture = (value) => {
    if (!value) {
        return false;
    }
    const busyDate = new Date(value);
    if (Number.isNaN(busyDate.getTime())) {
        return false;
    }
    const today = new Date();
    busyDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return busyDate >= today;
};

const formatResponseTime = (profile) => {
    if (!profile) {
        return '—';
    }

    const raw =
        profile.profile?.responseTime ??
        profile.profile?.responseTimeHours ??
        profile.profile?.responseTimeMinutes;

    if (raw === null || raw === undefined) {
        return '—';
    }

    if (typeof raw === 'number') {
        if (raw >= 24) {
            const days = Math.round(raw / 24);
            return `${days} day${days === 1 ? '' : 's'}`;
        }
        return `${raw} hour${raw === 1 ? '' : 's'}`;
    }

    return String(raw);
};

const PublicProfilePage = () => {
    const { profileId: paramsProfileId } = useParams();
    const [searchParams] = useSearchParams();
    const {profileId: paramsProfileId} = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        specialties: dictionarySpecialties,
        services: dictionaryServices,
        loading: dictionaryLoading
    } = useDictionary();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrOpen, setQrOpen] = useState(false);
    const [completedProjects, setCompletedProjects] = useState(undefined);
    const [activeSection, setActiveSection] = useState('about');
    const [servicesAvailable, setServicesAvailable] = useState(false);
    const [reelsAvailable, setReelsAvailable] = useState(false);
    const [socialGroupsDictionary, setSocialGroupsDictionary] = useState([]);

    const requestRef = useRef(0);
    const clickLockRef = useRef(false);
    const clickLockTimeoutRef = useRef(null);
    const profileId = paramsProfileId || user?.id || null;

    useEffect(() => {
        let mounted = true;

        const fetchSocialGroups = async () => {
            try {
                const groups = await profileApi.getAllSocialGroups();
                if (mounted) {
                    setSocialGroupsDictionary(groups);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setSocialGroupsDictionary([]);
                }
            }
        };

        fetchSocialGroups();

        return () => {
            mounted = false;
        };
    }, []);

    const specialtiesCollection = useMemo(() => {
        if (!dictionarySpecialties || !Array.isArray(dictionarySpecialties.allIds)) {
            return [];
        }
        return dictionarySpecialties.allIds
            .map((id) => dictionarySpecialties.byId?.[id])
            .filter(Boolean);
    }, [dictionarySpecialties]);

    const socialGroupsDictionaryMap = useMemo(() => {
        const map = {};
        (socialGroupsDictionary || []).forEach((item) => {
            const key = item.value || item.id;
            if (key) {
                map[key] = item;
            }
        });
        return map;
    }, [socialGroupsDictionary]);

    const fetchProfileData = useCallback(
        async (specialtiesOverride = []) => {
            if (!profileId) {
                setProfileData(null);
                setLoading(false);
                return;
            }

            const requestId = ++requestRef.current;
            setLoading(true);

            try {
                const data = await extendedProfileApi.getUserData(
                    profileId,
                    Array.isArray(specialtiesOverride) ? specialtiesOverride : []
                );

                if (requestRef.current === requestId) {
                    setProfileData(data || null);
                }
            } catch (error) {
                if (requestRef.current === requestId) {
                    setProfileData(null);
                }
            } finally {
                if (requestRef.current === requestId) {
                    setLoading(false);
                }
            }
        },
        [profileId]
    );

    useEffect(() => {
        if (!profileId) {
            setProfileData(null);
            setLoading(false);
            return;
        }
        fetchProfileData([]);
    }, [fetchProfileData, profileId]);

    useEffect(() => {
        if (!profileId) {
            return;
        }
        if (dictionaryLoading && !specialtiesCollection.length) {
            return;
        }
        fetchProfileData(specialtiesCollection);
    }, [dictionaryLoading, specialtiesCollection, fetchProfileData, profileId]);

    useEffect(() => {
        let mounted = true;

        const fetchCompletedProjects = async () => {
            if (!profileId) {
                return;
            }

            try {
                const snapshot = await projectsApi.getProjects({
                    filters: {
                        contractor: {id: profileId},
                        state: ProjectStatus.COMPLETED
                    },
                    rowsPerPage: 500
                });

                if (mounted) {
                    setCompletedProjects(snapshot?.size ?? 0);
                }
            } catch (error) {
                if (mounted) {
                    setCompletedProjects(undefined);
                }
            }
        };

        fetchCompletedProjects();

        return () => {
            mounted = false;
        };
    }, [profileId]);

    useEffect(() => {
        setServicesAvailable(false);
    }, [profileData?.profile?.id]);

    const hasEducation = useMemo(
        () =>
            Array.isArray(profileData?.education) &&
            profileData.education.some(
                (item) =>
                    !item?.isDeleted &&
                    (item?.description ||
                        item?.degree ||
                        item?.issuingOrganization ||
                        (Array.isArray(item?.certificates) &&
                            item.certificates.some((cert) => cert && cert.isPublic !== false)))
            ),
        [profileData]
    );

    const communityGroups = useMemo(
        () => (Array.isArray(profileData?.profile?.socialGroups) ? profileData.profile.socialGroups : []),
        [profileData]
    );

    const hasCommunityAttributes = communityGroups.length > 0;
    const communitySummary =
        profileData?.profile?.communitySummary ||
        profileData?.profile?.communityDescription ||
        '';

    const communityHasData = useMemo(
        () => hasCommunityAttributes || Boolean((communitySummary || '').trim()),
        [hasCommunityAttributes, communitySummary]
    );

    const faqItems = useMemo(
        () =>
            Array.isArray(profileData?.profile?.faq)
                ? profileData.profile.faq.filter((item) => item && (item.question || item.answer))
                : [],
        [profileData]
    );

    const hasFaq = faqItems.length > 0;

    const aboutHasData = useMemo(() => {
        const about = typeof profileData?.profile?.about === 'string' ? profileData.profile.about.trim() : '';
        const hasTags = Array.isArray(profileData?.profile?.tags) && profileData.profile.tags.length > 0;
        const hasMetrics =
            Boolean(profileData?.profile?.plan) ||
            Boolean(profileData?.profile?.rating) ||
            Boolean(profileData?.profile?.reviewsCount);
        return Boolean(about) || hasTags || hasMetrics;
    }, [profileData]);

    const connectionsHasData = useMemo(() => {
        const connections = profileData?.profile?.connections;
        if (!connections || typeof connections !== 'object') {
            return false;
        }
        return Object.values(connections).some(
            (value) => Array.isArray(value) && value.filter(Boolean).length > 0
        );
    }, [profileData]);

    const sections = useMemo(
        () => [
            {
                id: 'about',
                label: 'About',
                hasData: aboutHasData
            },
            {
                id: 'reels',
                label: 'Reels',
                hasData: reelsAvailable
            },
            {
                id: 'tags',
                label: 'Tags',
                hasData: (profileData?.profile?.tags || []).length > 0
            },
            {
                id: 'services',
                label: 'Services',
                hasData: servicesAvailable
            },
            {
                id: 'portfolio',
                label: 'Portfolio',
                hasData: Array.isArray(profileData?.portfolio) && profileData.portfolio.length > 0
            },
            {
                id: 'reviews',
                label: 'Reviews',
                hasData: Array.isArray(profileData?.reviews) && profileData.reviews.length > 0
            },
            {
                id: 'education',
                label: 'Education & Certificates',
                hasData: hasEducation
            },
            {
                id: 'connections',
                label: 'Connections & Friends',
                hasData: connectionsHasData
            },
            {
                id: 'community',
                label: 'Community attributes',
                hasData: communityHasData
            },
            {
                id: 'faq',
                label: 'FAQ',
                hasData: hasFaq
            },
            {
                id: 'blog',
                label: 'Blog',
                hasData: true
            },
            {
                id: 'listings',
                label: 'Listings',
                hasData: true
            }
        ],
        [aboutHasData, servicesAvailable, reelsAvailable, profileData?.profile?.tags, profileData?.portfolio, profileData?.reviews, hasEducation, connectionsHasData, communityHasData, hasFaq]
    );

    useEffect(() => {
        if (!sections.length) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (clickLockRef.current) return;
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: '-100px 0px -50% 0px',
                threshold: 0
            }
        );

        const targets = sections
            .map((section) => document.getElementById(section.id))
            .filter(Boolean);

        targets.forEach((el) => observer.observe(el));

        return () => {
            targets.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, [sections, loading]);

    const handleSectionClick = useCallback((id) => {
        setActiveSection(id);
        clickLockRef.current = true;
        if (clickLockTimeoutRef.current) {
            clearTimeout(clickLockTimeoutRef.current);
        }
        clickLockTimeoutRef.current = setTimeout(() => {
            clickLockRef.current = false;
        }, 1200);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    }, []);

    const handleOpenQr = useCallback(() => {
        setQrOpen(true);
    }, []);

    const handleCloseQr = useCallback(() => {
        setQrOpen(false);
    }, []);

    const handleCall = useCallback(() => {
        const phone = profileData?.profile?.phone;
        if (!phone) {
            return;
        }
        window.location.href = `tel:${phone}`;
    }, [profileData]);

    const handleSendMessage = useCallback(async () => {
        if (!user || !profileData?.profile?.id) {
            return;
        }

        const threadId = await chatApi.startChat(user.id, profileData.profile.id);
        dispatch(messengerActions.selectThread(threadId));
        dispatch(messengerActions.open());
    }, [dispatch, user, profileData]);

    const handleRequestBooking = useCallback(
        (specialtyId) => {
            if (!specialtyId || !profileData?.profile?.id) {
                return;
            }

            projectsLocalApi.storeProject({
                state: ProjectStatus.DRAFT,
                specialtyId,
                proposerUserId: profileData.profile.id
            });

            navigate(paths.request.create);
        },
        [navigate, profileData]
    );

    const requestItems = useMemo(
        () =>
            (profileData?.specialties || [])
                .map((spec) => {
                    const specialtyId = spec?.specialty || spec?.id;
                    if (!specialtyId) {
                        return null;
                    }

                    const label =
                        spec?.label ||
                        dictionarySpecialties?.byId?.[specialtyId]?.label ||
                        'Specialty';

                    return {
                        title: label,
                        onClick: () => handleRequestBooking(specialtyId)
                    };
                })
                .filter(Boolean),
        [profileData, dictionarySpecialties, handleRequestBooking]
    );

    const status = useMemo(() => {
        const busyUntil = profileData?.profile?.busyUntil;
        if (isDateInFuture(busyUntil)) {
            return {
                label: `Busy until ${new Date(busyUntil).toLocaleDateString()}`,
                color: 'warning'
            };
        }

        return {
            label: 'Active',
            color: 'success'
        };
    }, [profileData]);

    const shareUrl = profileData?.profile
        ? getProfileUrl(profileData.profile)
        : `${process.env.REACT_APP_HOST_P ?? ''}/contractors/first1000`;

    if (loading) {
        return (
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress/>
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <MessageChatSquare fontSize="large"/>
                    <Typography variant="h6">Profile not found</Typography>
                    <Typography variant="body2" color="text.secondary">
                        The profile you are looking for does not exist or is unavailable.
                    </Typography>
                </Stack>
            </Box>
        );
    }

    const rating =
        profileData?.profile?.rating ??
        profileData?.profile?.reviewsRating ??
        (profileData?.profile?.reviews
            ? Number(profileData.profile.reviews).toFixed(1)
            : '—');

    const reviewsCount =
        profileData?.reviews?.length ??
        profileData?.profile?.reviewsCount ??
        '—';

    const responseTime = formatResponseTime(profileData);
    const specialtyLookup = dictionarySpecialties?.byId ?? {};
    const isOwnProfile = Boolean(user) && !user.isAnonymous && user.id === profileData?.profile?.id;
    const isHomeowner = profileData?.profile?.role === roles.CUSTOMER;

    const displaySections = isHomeowner
        ? sections.filter((s) => ['about', 'reels', 'reviews', 'connections'].includes(s.id))
        : sections;

    return (
        <>
            <Seo title={`${profileData.profile?.businessName || 'Specialist'} • Profile`}/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 14,
                    backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6)
                }}
            >
                <Container
                    maxWidth={false}
                    sx={{
                        maxWidth: {xs: '100%', xl: '80%'},
                        px: {xs: 2, md: 3}
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={3}>
                            <SectionNav
                                sections={displaySections}
                                activeId={activeSection}
                                onSectionClick={handleSectionClick}
                            />
                        </Grid>

                        <Grid item xs={12} md={9}>
                            <Stack spacing={4} sx={{width: '100%'}}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: {md: 'none'},
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        p: 1.5
                                    }}
                                >
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {displaySections.map((section) => (
                                            <Button
                                                key={section.id}
                                                size="small"
                                                variant={activeSection === section.id ? 'contained' : 'text'}
                                                onClick={() => handleSectionClick(section.id)}
                                            >
                                                {section.label}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Paper>

                                <Box id="about" sx={{scrollMarginTop: 120}}>
                                    <Stack spacing={3}>
                                        <HeroSection
                                            profile={profileData}
                                            status={status}
                                            locationLabel={formatLocation(profileData)}
                                            onOpenQr={handleOpenQr}
                                            shareUrl={shareUrl}
                                        />

                                        <StatsSection
                                            plan={profileData?.profile?.plan}
                                            rating={rating}
                                            reviewsCount={reviewsCount}
                                            completedProjects={completedProjects}
                                            responseTime={responseTime}
                                        />

                                        <CTASection
                                            phone={profileData?.profile?.phone}
                                            onCall={handleCall}
                                            onSendMessage={user && !user.isAnonymous ? handleSendMessage : undefined}
                                            requestItems={requestItems}
                                        />

                                        <TagsSection tags={profileData?.profile?.tags || []}/>
                                    </Stack>
                                </Box>

                                <Box id="services" sx={{scrollMarginTop: 120}}>
                                    <ServicesSection
                                        profile={profileData}
                                        dictionarySpecialties={dictionarySpecialties}
                                        dictionaryServices={dictionaryServices}
                                        onRequest={handleRequestBooking}
                                        onAvailabilityChange={setServicesAvailable}
                                    />
                                    {isOwnProfile && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                                            onClick={() => navigate(paths.dashboard.overview)}
                                            sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </Box>

                                <Box id="portfolio" sx={{scrollMarginTop: 120}}>
                                    <PortfolioGallery
                                        portfolio={profileData?.portfolio}
                                        profileData={profileData}
                                        setProfileData={setProfileData}
                                    />
                                </Box>

                                <Box id="reviews" sx={{scrollMarginTop: 120}}>
                                    <ReviewsSection
                                        profileData={profileData}
                                        setProfileData={setProfileData}
                                        dictionarySpecialties={dictionarySpecialties}
                                        dictionaryServices={dictionaryServices}
                                    />
                                </Box>

                                <Box id="education" sx={{scrollMarginTop: 120}}>
                                    <EducationSection
                                        education={profileData?.education || []}
                                        summary={
                                            profileData?.profile?.educationSummary ||
                                            profileData?.profile?.educationDescription ||
                                            profileData?.profile?.educationText ||
                                            ''
                                        }
                                    />
                                </Box>

                                <Box id="connections" sx={{scrollMarginTop: 120}}>
                                    <ConnectionsSection
                                        profileId={profileData?.profile?.id}
                                        specialtyLookup={specialtyLookup}
                                    />
                                    {isOwnProfile && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                                            onClick={() => navigate(paths.dashboard.overview)}
                                            sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </Box>

                                <Box id="community" sx={{scrollMarginTop: 120}}>
                                    <CommunityAttributesSection
                                        groups={communityGroups}
                                        dictionary={socialGroupsDictionaryMap}
                                        summary={communitySummary}
                                    />
                                </Box>

                                <Box id="faq" sx={{scrollMarginTop: 120}}>
                                    <FaqSection items={faqItems}/>
                                </Box>

                                <Grid id="blog" container spacing={0}>
                                    <Grid item xs={12} md={12}>
                                        <UserPosts
                                            userId={profileId}
                                            userName={profileService.getUserName(profileData?.profile)}
                                            maxPosts={5}
                                            showActions={true}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid id="listings" container spacing={0}>
                                    <Grid item xs={12} md={12}>
                                        <UserListings
                                            userId={profileId}
                                            userName={profileService.getUserName(profileData?.profile)}
                                            maxPosts={5}
                                            showActions={true}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>

                <SpecialistQRBusinessCard
                    open={qrOpen}
                    onClose={handleCloseQr}
                    user={profileData?.profile}
                    userSpecialties={profileData?.specialties}
                    url={shareUrl}
                />
            </Box>
        </>
    );
};

export default memo(PublicProfilePage);