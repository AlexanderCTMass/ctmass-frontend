import React, {useCallback, useState} from "react";
import {Box, Button, useMediaQuery} from "@mui/material";
import Advertisement from "./Advertisement";
import {mockProfile} from "./mockProfile";
import Reviews from "./Reviews";
import ProfileHeader from "./ProfileHeader";
import About from "./About";
import ServicesAndPrices from "./ServicesAndPrices";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import ConnectionsAndFriend from "./ConnectionsAndFriend";
import PropTypes from "prop-types";
import {projects} from "./portfolio/data/projects";

import PortfolioGrid from "./portfolio/PortfolioGrid";
import ProjectModal from "./portfolio/ProjectModal";
import {SmartAvailabilityCalendar} from "./AvailabilityCalendar";
import ProjectEditorModal from "./portfolio/ProjectEditorModal";


const containerStyles = (isMobile) => ({
    maxWidth: "100vw",
    padding: isMobile ? 1 : 3,
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 2 : 3,
    backgroundColor: "white",
    borderRadius: 2,
    marginLeft: isMobile ? 0 : "3%",
    marginRight: isMobile ? 0 : "3%",
});

const ProfilePage = ({isOwnProfile = true}) => {
    const [profile, setProfile] = useState(() => mockProfile);
    const [project, setProject] = useState(() => projects);
    const [editMode, setEditMode] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const handleEditToggle = useCallback(() => {
        setEditMode(prev => !prev);
    }, []);

    const handleSave = useCallback(() => {
        setEditMode(false);
        // Логика сохранения данных
    }, []);

    const [selectedProject, setSelectedProject] = useState(null);

    const handleCardClick = (project) => {
        setSelectedProject(project);
    };


    return (
        <Box sx={containerStyles(isMobile)}>
            {/* Основной контент */}
            <Box sx={{
                flex: 2,
                order: isMobile ? 2 : 1,
                width: '100%'
            }}>
                <ProfileHeader
                    isOwnProfile={isOwnProfile}
                    profile={profile}
                    editMode={editMode}
                    handleEditToggle={handleEditToggle}
                    handleSave={handleSave}
                    setProfile={setProfile}
                />
                <SmartAvailabilityCalendar editMode={editMode}/>

                {/*<SmartAvailabilityCalendar mode="view" />*/}
                <About
                    editMode={editMode}
                    profile={profile}
                    setProfile={setProfile}
                />
                <ServicesAndPrices
                    specialties={profile.specialties}
                    editMode={editMode}
                />
                <Education
                    education={profile.education}
                    editMode={editMode}
                    setProfile={setProfile}
                />
                <CertificatesAndLicencies
                    certs={profile.education.flatMap(edu => edu.certificates || [])}
                />
                <ConnectionsAndFriend
                    friends={profile.friends}
                />
            </Box>

            {/* Правая колонка (на десктопе) / нижний блок (на мобильных) */}
            <Box sx={{
                flex: 1,
                order: isMobile ? 2 : 2,
                width: '100%'
            }}>
                <Reviews profile={profile}/>
                <Box mt={3}>
                    <PortfolioGrid
                        projects={project}
                        setProject={setProject}
                        onCardClick={handleCardClick}
                        editMode={editMode}
                    />
                    {selectedProject && (
                        <ProjectModal
                            project={selectedProject}
                            onClose={() => setSelectedProject(null)}
                        />
                    )}
                    <Advertisement profile={profile}/>
                </Box>
            </Box>
        </Box>
    );
};

ProfilePage.propTypes = {
    isOwnProfile: PropTypes.bool
};

export default React.memo(ProfilePage);