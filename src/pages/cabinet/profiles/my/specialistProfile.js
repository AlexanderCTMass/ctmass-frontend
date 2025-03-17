import React, {useCallback, useEffect, useState} from "react";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Container,
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
import ServicesAndPrices from "./ServicesAndPrices";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import ConnectionsAndFriend from "./ConnectionsAndFriend";
import PropTypes from "prop-types";

import PortfolioGrid from "./portfolio/PortfolioGrid";
import ProjectModal from "./portfolio/ProjectModal";
import {SmartAvailabilityCalendar} from "./AvailabilityCalendar";
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


const containerStyles = (isMobile) => ({
    maxWidth: "100vw",
    padding: 3,
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: 5,
    borderRadius: 2,
});

const ProfilePage = () => {
    const [initProfile, setInitProfile] = useState(null);
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState([]);
    const {user} = useAuth();
    let {profileId} = useParams();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || undefined;
    const returnLabel = searchParams.get('returnLabel') || "Back";
    const isMyProfile = !profileId || profileId === user.id;

    const [editMode, setEditMode] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [selectedProject, setSelectedProject] = useState(null);

    if (!profileId && user) {
        profileId = user.id;
    }
    const {loading, specialties, services} = useDictionary();
    const [allSpecialties, setAllSpecialties] = useState([]);
    const [allServices, setAllServices] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            if (loading) {
                setAllSpecialties(Object.values(specialties.byId));
                setAllServices(Object.values(services.byId));
            }
        };
        fetchData();
    }, [loading]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!profileId || allSpecialties.length === 0) return;
                const userData = await extendedProfileApi.getUserData(profileId, specialties);
                setProfile(userData);
                setProject(userData.portfolio || []);
                setInitProfile(JSON.parse(JSON.stringify(userData)));
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchData();
    }, [profileId, user?.id, allSpecialties]);


    const handleSave = useCallback(async () => {
        setEditMode(false);

        const updatedData = {
            profile: profile.profile,
            specialties: profile.specialties,
            education: profile.education,
            portfolio: profile.portfolio,
        };

        const initData = {
            profile: initProfile.profile,
            specialties: initProfile.specialties,
            education: initProfile.education,
            portfolio: initProfile.portfolio,
        };

        try {
            await extendedProfileApi.updateUserData(profileId, updatedData, initData);
            console.log("Profile updated successfully");
            setInitProfile(profile)
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    }, [profile, project]);

    const handleCardClick = (project) => {
        setSelectedProject(project);
    };


    return (<>
        <Seo title="Cabinet: My profile"/>
        <Box
            component="main"
            sx={{
                flexGrow: 1,
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
                        {isMyProfile &&
                            <Button
                                component={RouterLink}
                                href={paths.cabinet.projects.find.index}
                                startIcon={(
                                    <SvgIcon>
                                        <PlusIcon/>
                                    </SvgIcon>
                                )}
                                variant="text"
                            >
                                Go to find project to work
                            </Button>}
                    </Stack>
                </Stack>

                {!profile ? (
                    <CircularProgress color="inherit"/>
                ) : (<>

                        <Box sx={containerStyles(isMobile)}>
                            <Box sx={{
                                flex: 2,
                                order: isMobile ? 2 : 1,
                                width: '100%'
                            }}>
                                <ProfileHeader
                                    isOwnProfile={user.id === profileId}
                                    profile={profile}
                                    editMode={editMode}
                                    handleSave={handleSave}
                                    setProfile={setProfile}
                                    setEditMode={setEditMode}
                                />
                                <About
                                    editMode={editMode}
                                    profile={profile}
                                    setProfile={setProfile}
                                />
                                {profile?.profile?.role === 'WORKER' &&
                                    <div>
                                        <ServicesAndPrices
                                            profile={profile}
                                            editMode={editMode}
                                            setProfile={setProfile}
                                            allSpecialties={allSpecialties}
                                            allServices={allServices}
                                        />
                                        <Education
                                            education={profile?.education}
                                            editMode={editMode}
                                            setProfile={setProfile}
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
                                        <Reviews profile={profile} setProfile={setProfile}/>
                                        <Box mt={3}>
                                            <PortfolioGrid
                                                portfolio={profile?.portfolio || []}
                                                setProfile={setProfile}
                                                onCardClick={handleCardClick}
                                                editMode={editMode}
                                                userId={profileId}
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
                    </>
                )}
            </Container>
        </Box></>);

}

export default React.memo(ProfilePage);