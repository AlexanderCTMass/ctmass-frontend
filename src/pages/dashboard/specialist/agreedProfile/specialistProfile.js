import React, {useCallback, useEffect, useState} from "react";
import {Box, useMediaQuery} from "@mui/material";
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


const containerStyles = (isMobile, isMyProfile) => ({
    maxWidth: "100vw",
    padding: isMobile ? 1 : 3,
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 2 : 3,
    backgroundColor: "white",
    borderRadius: 2,
    ...(!isMyProfile
        ? {
            marginTop: isMobile ? '20%' : '5%',
            marginLeft: isMobile ? '7%' : '18.6%',
            marginRight: isMobile ? 0 : '5%',
        }
        : {
            marginLeft: isMobile ? 0 : '3%',
            marginRight: isMobile ? 0 : '3%',
        }),
});

const ProfilePage = () => {
    const [initProfile, setInitProfile] = useState(null);
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState([]);
    const {user} = useAuth();
    let {profileId} = useParams();
    const isMyProfile = !profileId;


    const [editMode, setEditMode] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [selectedProject, setSelectedProject] = useState(null);
    debugger

    if (!profileId && user) {
        profileId = user.id;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!profileId) return;
                const userData = await extendedProfileApi.getUserData(profileId);
                setProfile(userData);
                setInitProfile(JSON.parse(JSON.stringify(userData)));
                setProject(userData.portfolio || []);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchData();
    }, [profileId, user?.id]);


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

    if (profile) {
        return (
            <Box sx={containerStyles(isMobile, isMyProfile)}>
                <Box sx={{
                    flex: 2,
                    order: isMobile ? 2 : 1,
                    width: '100%'
                }}>
                    <ProfileHeader
                        isOwnProfile={user.id===profileId}
                        profile={profile}
                        editMode={editMode}
                        handleSave={handleSave}
                        setProfile={setProfile}
                        setEditMode={setEditMode}
                    />
                    {/*<SmartAvailabilityCalendar editMode={editMode}/>*/}
                    <About
                        editMode={editMode}
                        profile={profile}
                        setProfile={setProfile}
                    />
                    <ServicesAndPrices
                        profile={profile}
                        editMode={editMode}
                        setProfile={setProfile}
                    />
                    <Education
                        education={profile?.education}
                        editMode={editMode}
                        setProfile={setProfile}
                    />
                    <CertificatesAndLicencies
                        profile={profile}
                    />
                    <ConnectionsAndFriend
                        currentUserId={profileId}
                    />
                </Box>

                {/* Правая колонка (на десктопе) / нижний блок (на мобильных) */}
                <Box sx={{
                    flex: 1,
                    order: isMobile ? 2 : 2,
                    width: '100%'
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
                </Box>
            </Box>
        );
    }
}

export default React.memo(ProfilePage);