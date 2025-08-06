import React, {useCallback, useEffect, useState} from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Typography,
    useMediaQuery
} from "@mui/material";
import Advertisement from "./Advertisement";
import Reviews from "./Reviews";
import ProfileHeader from "./profileHeader/ProfileHeader";
import About from "./About";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import ConnectionsAndFriend from "./ConnectionsAndFriend";
import SearchIcon from '@untitled-ui/icons-react/build/esm/SearchSm';

import PortfolioGrid from "./portfolio/PortfolioGrid";
import ProjectModal from "./portfolio/ProjectModal";
import {extendedProfileApi} from "./data/extendedProfileApi";
import {useAuth} from "../../../../hooks/use-auth";
import {useParams} from "react-router";
import {useSearchParams} from "src/hooks/use-search-params";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {Seo} from "src/components/seo";
import useDictionary from "src/hooks/use-dictionaries";
import {roles} from "src/roles";
import {SpecialtiesView} from "src/pages/cabinet/profiles/my/specialties-view";
import {SpecialistQRBusinessCard} from "src/sections/dashboard/specialist-profile/public/specialist-qr-business-card";
import ProfileCompletionProgress from "src/components/profile-completion-progress";
import DonationBadge from "src/components/stripe/donation-badge";
import HandshakeIcon from '@mui/icons-material/Handshake';
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {ProjectStatus} from "src/enums/project-state";
import {useNavigate} from "react-router-dom";
import {PopoverMenu} from "src/components/popover-menu";
import WhatsAppButton from "src/components/whatsapp-message-button";
import {formatUSPhoneForWhatsApp} from "src/utils/regexp";
import Tags from "src/pages/cabinet/profiles/my/Tags";
import {profileApi} from "src/api/profile";
import {SpecialistRecommendations} from "src/pages/cabinet/profiles/my/my-recomendations";
import toast from "react-hot-toast";


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

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const {user} = useAuth();
    let {profileId} = useParams();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || undefined;
    const returnLabel = searchParams.get('returnLabel') || "Back";
    const [updateProfileState, setUpdateProfileState] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [selectedProject, setSelectedProject] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);
    const navigate = useNavigate();

    if (!profileId && user) {
        profileId = user.id;
    }
    const isMyProfile = profileId === user?.profilePage || profileId === user?.id;

    const {loading, specialties, services} = useDictionary();
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

    const handleCardClick = (project) => {
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

    const handleSaveTags = useCallback(
        async (newTags) => {
            try {
                console.log('Saving tags:', newTags);
                await profileApi.update(profile?.profile?.id, {tags: newTags});
                setProfile(prev => ({...prev, tags: newTags}));
            } catch (error) {
                console.error('Failed to save tags:', error);
                // Можно добавить обработку ошибки (например, показать уведомление)
            }
        },
        [profile?.profile?.id] // Зависимости
    );

    const getProposeButton = () => {
        return <PopoverMenu
            title={"Project request form"}
            icon={<HandshakeIcon/>}
            fullWidth={true}
            variant={"contained"}
            description={"Select the specialty of this professional from the list"}
            items={profile?.specialties.map((spec) => {
                if (spec) return (
                    {
                        title: allSpecialties[0][spec.specialty]?.label,
                        onClick: () => {
                            createSearchParamsForProposeProject(spec.specialty);
                        },
                    }
                )
            })}/>;
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
        <Seo title={!isMyProfile ? "Specialist profile" : "Cabinet: My profile"}/>
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
                    <SvgIcon sx={{mr: 1}}>
                        <ArrowLeftIcon/>
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
                    sx={{mb: 4}}
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
                                        <SearchIcon/>
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
                                        <PlusIcon/>
                                    </SvgIcon>
                                )}
                                variant="text"
                            >
                                Find contractor
                            </Button>)}
                    </Stack>}
                </Stack>

                {!profile ? (
                    <CircularProgress color="inherit"/>
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
                                />
                                {!isMyProfile && isMobile &&
                                    <Stack sx={{mt: 2}} direction={"column"} spacing={1}>
                                        {getProposeButton()}
                                        {getWhatsAppMessageButton()}
                                    </Stack>
                                }
                                <About
                                    profile={profile}
                                    setProfile={setProfile}
                                    isMyProfile={isMyProfile}
                                />
                                <Tags
                                    tags={profile?.profile?.tags}
                                    onSave={handleSaveTags}
                                />
                                {profile?.profile?.role === 'WORKER' &&
                                    <div>
                                        <SpecialtiesView isMyProfile={isMyProfile} profile={profile.profile}
                                                         setProfile={setProfile}/>
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
                                        />
                                        <CertificatesAndLicencies
                                            profile={profile}
                                        />
                                    </div>}
                                {/*<ConnectionsAndFriend
                                    profile={profile}
                                />*/}
                                <SpecialistRecommendations
                                    recommendationIds={profile?.profile?.recommendations}
                                    isMyProfile={isMyProfile}
                                    onAddRecommendation={async (specialist) => {
                                        try {
                                            // Create updated recommendations array
                                            const updatedRecommendations = [
                                                ...(profile.profile.recommendations || []),
                                                specialist.id
                                            ];

                                            // Update profile in Firestore
                                            await profileApi.update(user.id, {
                                                recommendations: updatedRecommendations
                                            });

                                            // Update local state or refetch profile
                                            setProfile(prev => ({
                                                ...prev,
                                                profile: {
                                                    ...prev.profile,
                                                    recommendations: updatedRecommendations
                                                }
                                            }));

                                            // Show success message
                                            toast.success(`${specialist.businessName} added to recommendations`);
                                        } catch (error) {
                                            console.error('Failed to add recommendation:', error);
                                            toast.error('Failed to add recommendation');
                                        }
                                    }}
                                    onRemoveRecommendation={async (specialistId) => {
                                        try {
                                            // Filter out the removed recommendation
                                            const updatedRecommendations =
                                                (profile.profile.recommendations || []).filter(id => id !== specialistId);

                                            // Update profile in Firestore
                                            await profileApi.update(user.id, {
                                                recommendations: updatedRecommendations
                                            });

                                            // Update local state or refetch profile
                                            setProfile(prev => ({
                                                ...prev,
                                                profile: {
                                                    ...prev.profile,
                                                    recommendations: updatedRecommendations
                                                }
                                            }));

                                            // Show success message
                                            toast.success('Recommendation removed');
                                        } catch (error) {
                                            console.error('Failed to remove recommendation:', error);
                                            toast.error('Failed to remove recommendation');
                                        }
                                    }}
                                />
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
                                        <Stack direction={"column"} spacing={1} sx={{mb: 4}}>
                                            {getProposeButton()}
                                            {getWhatsAppMessageButton()}
                                        </Stack>
                                    }

                                    {isMyProfile &&
                                        <>
                                            <DonationBadge donationAmount={profile?.profile?.totalDonations}/>
                                            <Divider sx={{my: 2}}/>
                                        </>}
                                    <Reviews profile={profile} setProfile={setProfile} isMyProfile={isMyProfile}
                                             setUpdateProfileState={setUpdateProfileState}/>
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
                                        <Advertisement profile={profile}/>
                                    </Box>
                                </Box>}
                        </Box>
                        <SpecialistQRBusinessCard open={qrOpen} url={getPageUrl(profile?.profile || {})}
                                                  user={profile?.profile}
                                                  userSpecialties={profile?.specialties} onClose={handleQrClose}/>
                    </>
                )}
            </Container>
        </Box>

    </>);

}

export default React.memo(ProfilePage);