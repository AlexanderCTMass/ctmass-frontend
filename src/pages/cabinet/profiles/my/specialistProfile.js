import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography,
    useMediaQuery
} from "@mui/material";
import { trackMouseMove, trackClick, trackKPI } from "src/libs/analytics/behavior";
import { enableMouseTracking } from 'src/libs/analytics/mouseTracking'
import { startTrace } from 'src/libs/analytics/tracePerfomance'
import Advertisement from "./Advertisement";
import Reviews from "./Reviews";
import ProfileHeader from "./profileHeader/ProfileHeader";
import About from "./About";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import SearchIcon from '@untitled-ui/icons-react/build/esm/SearchSm';

import PortfolioGrid from "./portfolio/PortfolioGrid";
import ProjectModal from "./portfolio/ProjectModal";
import { extendedProfileApi } from "./data/extendedProfileApi";
import { useAuth } from "src/hooks/use-auth";
import { useParams } from "react-router";
import { useSearchParams } from "src/hooks/use-search-params";
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { Seo } from "src/components/seo";
import useDictionary from "src/hooks/use-dictionaries";
import { roles } from "src/roles";
import { SpecialtiesView } from "src/pages/cabinet/profiles/my/specialties-view";
import { SpecialistQRBusinessCard } from "src/sections/dashboard/specialist-profile/public/specialist-qr-business-card";
import ProfileCompletionProgress from "src/components/profile-completion-progress";
import DonationBadge from "src/components/stripe/donation-badge";
import HandshakeIcon from '@mui/icons-material/Handshake';
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { ProjectStatus } from "src/enums/project-state";
import { useNavigate } from "react-router-dom";
import { PopoverMenu } from "src/components/popover-menu";
import WhatsAppButton from "src/components/whatsapp-message-button";
import { formatUSPhoneForWhatsApp } from "src/utils/regexp";
import Tags from "src/pages/cabinet/profiles/my/Tags";
import { profileApi } from "src/api/profile";
import MessageChatSquare from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import { useDispatch } from 'react-redux';
import { messengerActions } from "src/slices/messenger";
import { chatApi } from "src/api/chat/newApi";
import { DEFAULT_PRIVACY } from "src/slices/profile";
import Connections from "src/pages/cabinet/profiles/my/Connections/Connections";

function getPageUrl(profile) {
    return process.env.REACT_APP_HOST_P + "/contractors/first1000/" + (profile.profilePage || profile.id);
}

const containerStyles = (isMobile) => ({
    maxWidth: "100vw",
    padding: 3,
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: 5,
    borderRadius: 2,
});

const TabPanel = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const { user } = useAuth();
    let { profileId } = useParams();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || undefined;
    const returnLabel = searchParams.get('returnLabel') || "Back";
    const [updateProfileState, setUpdateProfileState] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [selectedProject, setSelectedProject] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [eduDialogOpen, setEduDialogOpen] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch();

    if (!profileId && user) {
        profileId = user.id;
    }
    const isMyProfile = profileId === user?.profilePage || profileId === user?.id;

    const { loading, specialties, services } = useDictionary();
    const [allSpecialties, setAllSpecialties] = useState([]);
    const [allServices, setAllServices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (loading) {
                setAllSpecialties(Object.values(specialties));
                setAllServices(Object.values(services.byId));
            }
        };
        fetchData();
    }, [loading]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!profileId || allSpecialties.length === 0) return;
                const userData = await extendedProfileApi.getUserData(profileId, allSpecialties);
                setProfile(userData);

            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchData();
    }, [profileId, user?.id, allSpecialties]);

    useEffect(() => {
        const t = startTrace("load_profile_page");

        return () => t.stop();
    }, []);

    useEffect(() => {
        enableMouseTracking(({ x, y, t }) => {
            trackMouseMove(x, y, t);
        });

        trackKPI("open_specialist_profile", {
            profileId,
            myProfile: isMyProfile
        });
    }, []);

    useEffect(() => {
        const startedAt = Date.now();
        return () => {
            trackKPI("profile_read_time", {
                profileId,
                seconds: Math.round((Date.now() - startedAt) / 1000)
            });
        };
    }, []);

    const getSendMessageButton = () => {
        if (isMyProfile) return null;
        return (
            <Button
                variant="contained"
                startIcon={(
                    <SvgIcon>
                        <MessageChatSquare />
                    </SvgIcon>
                )}
                onClick={async () => {

                    trackClick("send_message_button", {
                        profileId: profile?.profile?.id
                    });

                    const threadId = await chatApi.startChat(user.id, profile.profile.id);
                    dispatch(messengerActions.selectThread(threadId));
                    dispatch(messengerActions.open());
                }}
            >
                Send message
            </Button>
        );
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);

        trackKPI("profile_tab_change", {
            tab: newValue === 0 ? "ABOUT" : "CONNECTIONS",
            profileId
        });
    };


    const handleCardClick = (project) => {
        trackKPI("open_portfolio_project", {
            profileId,
            projectId: project.id
        });

        setSelectedProject(project);
    };
    const handleQrOpen = useCallback(() => {
        setQrOpen(true);
    }, []);
    const handleQrClose = useCallback(() => {
        setQrOpen(false);
    }, []);

    const createSearchParamsForProposeProject = (specialtyId) => {
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            specialtyId: specialtyId,
            proposerUserId: profileId,
        })
        navigate(paths.request.create);
    }

    const handleSaveTags = useCallback(async (newTags) => {
        try {
            await profileApi.upsertTags(profile.profile.id, newTags);
            setProfile(prev => ({ ...prev, profile: { ...prev.profile, tags: newTags } }));
        } catch (e) {
            console.error(e);
        }
    }, [profile?.profile?.id]);

    const privacySettings = profile?.profile?.privacySettings ?? DEFAULT_PRIVACY;

    const getProposeButton = () => {
        return <PopoverMenu
            title={"Project request form"}
            icon={<HandshakeIcon />}
            fullWidth={true}
            variant={"contained"}
            description={"Select the specialty of this professional from the list"}
            items={profile?.specialties.map((spec) => {
                if (spec) return (
                    {
                        title: allSpecialties[0][spec.specialty]?.label,
                        onClick: () => {
                            trackClick("propose_project_button", {
                                profileId: profile?.profile?.id,
                                specialtyId: spec.specialty
                            })

                            createSearchParamsForProposeProject(spec.specialty);
                        },
                    }
                )
            })} />;
    }
    const getWhatsAppMessageButton = () => {
        if (!profile?.profile?.phone) {
            return null;
        }
        const phone = formatUSPhoneForWhatsApp(profile?.profile?.phone);
        if (!phone) {
            return null;
        }
        return (<WhatsAppButton
            text={"Good day! I’d like to present you with a project opportunity."}
            title={"Contact specialist"}
            phoneNumber={phone}
        />)
    }
    return (<>
        <Seo title={!isMyProfile ? "Specialist profile" : "Cabinet: My profile"} />
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                py: user ? 16 : 16
            }}
        >
            <Container maxWidth="lg">
                {returnTo && <Link
                    color="text.primary"
                    component={RouterLink}
                    href={returnTo}
                    sx={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        mb: 4
                    }}
                    underline="hover"
                >
                    <SvgIcon sx={{ mr: 1 }}>
                        <ArrowLeftIcon />
                    </SvgIcon>
                    <Typography variant="subtitle2">
                        {returnLabel}
                    </Typography>
                </Link>}

                <Stack
                    direction={isMobile ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={4}
                    sx={{ mb: 4 }}
                >
                    <Stack spacing={1}>
                        <Typography variant="h2">
                            {isMyProfile ? "My profile" : (profile?.profile?.role === 'WORKER' ? "Specialist profile" : "Profile")}
                        </Typography>
                    </Stack>
                    {!isMobile && <Stack
                        direction="row"
                        alignItems="center"
                        spacing={3}
                    >
                        {isMyProfile && (user.role === roles.WORKER ?
                            <Button
                                component={RouterLink}
                                href={paths.cabinet.projects.find.index}
                                startIcon={(
                                    <SvgIcon>
                                        <SearchIcon />
                                    </SvgIcon>
                                )}
                                variant="text"
                            >
                                Go to find project to work
                            </Button> :
                            <Button
                                component={RouterLink}
                                href={paths.cabinet.projects.create}
                                startIcon={(
                                    <SvgIcon>
                                        <PlusIcon />
                                    </SvgIcon>
                                )}
                                variant="text"
                            >
                                Find contractor
                            </Button>)}
                    </Stack>}
                </Stack>

                {!profile ? (
                    <CircularProgress color="inherit" />
                ) : (<>
                    {isMyProfile && user.role === roles.WORKER &&
                        <ProfileCompletionProgress profileId={profile?.profile?.id}
                        />}
                    <Box sx={containerStyles(isMobile)}>
                        <Box sx={{
                            flex: 2,
                            order: isMobile ? 2 : 1,
                            width: '100%'
                        }}>
                            <ProfileHeader
                                isOwnProfile={isMyProfile}
                                profile={profile}
                                setProfile={setProfile}
                                handleQrOpen={handleQrOpen}
                                privacySettings={privacySettings}
                            />
                            {!isMyProfile && isMobile &&
                                <Stack sx={{ mt: 2 }} direction={"column"} spacing={1}>
                                    {getProposeButton()}
                                    {getSendMessageButton()}
                                    {getWhatsAppMessageButton()}
                                </Stack>
                            }

                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                                <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
                                    <Tab label="ABOUT" id="profile-tab-0" />
                                    <Tab label="CONNECTIONS" id="profile-tab-1" />
                                </Tabs>
                            </Box>

                            <TabPanel value={activeTab} index={0}>
                                <About
                                    profile={profile}
                                    setProfile={setProfile}
                                    isMyProfile={isMyProfile}
                                />
                                <Tags
                                    tags={profile?.profile?.tags}
                                    onSave={handleSaveTags}
                                    isMyProfile={isMyProfile}
                                />
                                {profile?.profile?.role === 'WORKER' &&
                                    <div>
                                        <SpecialtiesView isMyProfile={isMyProfile} profile={profile.profile}
                                            setProfile={setProfile} />
                                        {/* <ServicesAndPrices
                                            profile={profile}
                                            setProfile={setProfile}
                                            allSpecialties={allSpecialties}
                                            allServices={allServices}
                                            isMyProfile={isMyProfile}
                                        />*/}
                                        <Education
                                            education={profile?.education}
                                            profile={profile}
                                            setProfile={setProfile}
                                            isMyProfile={isMyProfile}
                                            dialogOpen={eduDialogOpen}
                                            setDialogOpen={setEduDialogOpen}
                                        />
                                        <CertificatesAndLicencies
                                            profile={profile}
                                            setProfile={setProfile}
                                            isMyProfile={isMyProfile}
                                            onAddCertificate={() => setEduDialogOpen(true)}
                                        />
                                    </div>}
                            </TabPanel>

                            <TabPanel value={activeTab} index={1}>
                                <Connections
                                    profile={profile}
                                    setProfile={setProfile}
                                    isMyProfile={isMyProfile}
                                />
                            </TabPanel>
                        </Box>

                        {/* Правая колонка (на десктопе) / нижний блок (на мобильных) */}
                        {profile?.profile?.role === 'WORKER' &&
                            <Box sx={{
                                flex: 1,
                                order: isMobile ? 2 : 2,
                                width: '100%',
                                overflow: 'visible', height: 'auto'
                            }}>
                                {!isMyProfile && !isMobile &&
                                    <Stack direction={"column"} spacing={1} sx={{ mb: 4 }}>
                                        {getProposeButton()}
                                        {getSendMessageButton()}
                                        {getWhatsAppMessageButton()}
                                    </Stack>
                                }

                                {isMyProfile &&
                                    <>
                                        <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                                        <Divider sx={{ my: 2 }} />
                                    </>}
                                <Reviews profile={profile} setProfile={setProfile} isMyProfile={isMyProfile}
                                    setUpdateProfileState={setUpdateProfileState} />
                                <Box mt={3}>
                                    <PortfolioGrid
                                        portfolio={profile?.portfolio || []}
                                        setProfile={setProfile}
                                        profile={profile}
                                        onCardClick={handleCardClick}
                                        userId={profile?.profile?.id}
                                        isMyProfile={isMyProfile}
                                        updateProfileState={updateProfileState}
                                        setUpdateProfileState={setUpdateProfileState}
                                    />
                                    {selectedProject && (
                                        <ProjectModal
                                            setProject={setSelectedProject}
                                            project={selectedProject}
                                            onClose={() => setSelectedProject(null)}
                                            setProfile={setProfile}
                                            profile={profile}
                                        />
                                    )}
                                    <Advertisement profile={profile} />
                                </Box>
                            </Box>}
                    </Box>
                    <SpecialistQRBusinessCard open={qrOpen} url={getPageUrl(profile?.profile || {})}
                        user={profile?.profile}
                        userSpecialties={profile?.specialties} onClose={handleQrClose} />
                </>
                )}
            </Container>
        </Box>

    </>);

}

export default React.memo(ProfilePage);