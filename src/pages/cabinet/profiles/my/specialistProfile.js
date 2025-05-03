import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, CircularProgress, Container, Link, Stack, SvgIcon, Typography, useMediaQuery} from "@mui/material";
import Advertisement from "./Advertisement";
import Reviews from "./Reviews";
import ProfileHeader from "./profileHeader/ProfileHeader";
import About from "./About";
import ServicesAndPrices from "./ServicesAndPrices";
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
import DonateButton from "src/components/stripe/donate-button";


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
    const isMyProfile = !profileId || profileId === user?.profilePage || profileId === user?.id;
    const [updateProfileState, setUpdateProfileState] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [selectedProject, setSelectedProject] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);

    if (!profileId && user) {
        profileId = user.id;
    }
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
    let specialistProfileUrl = process.env.REACT_APP_HOST_P + paths.reviewForm.specialist.replace(":specialistId", profileId);
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
                    direction="row"
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
                    <Stack
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
                    </Stack>
                </Stack>

                {!profile ? (
                    <CircularProgress color="inherit"/>
                ) : (<>
                        <DonateButton/>
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
                                <About
                                    profile={profile}
                                    setProfile={setProfile}
                                    isMyProfile={isMyProfile}
                                />
                                {profile?.profile?.role === 'WORKER' &&
                                    <div>
                                        <SpecialtiesView isMyProfile={isMyProfile} profile={profile.profile}/>
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
                                <ConnectionsAndFriend
                                    profile={profile}
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
                                    <Reviews profile={profile} setProfile={setProfile} isMyProfile={isMyProfile}
                                             setUpdateProfileState={setUpdateProfileState}/>
                                    <Box mt={3}>
                                        <PortfolioGrid
                                            portfolio={profile?.portfolio || []}
                                            setProfile={setProfile}
                                            profile={profile}
                                            onCardClick={handleCardClick}
                                            userId={profileId}
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
                        <SpecialistQRBusinessCard open={qrOpen} url={specialistProfileUrl} user={profile?.profile}
                                                  userSpecialties={profile?.specialties} onClose={handleQrClose}/>
                    </>
                )}
            </Container>
        </Box>

    </>);

}

export default React.memo(ProfilePage);