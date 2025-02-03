import React, {useCallback, useState} from "react";
import {Box, Divider, useMediaQuery} from "@mui/material";
import Advertisement from "./Advertisement";
import {mockProfile} from "./mockProfile";
import Portfolio from "./Portfolio";
import Reviews from "./Reviews";
import ProfileHeader from "./ProfileHeader";
import About from "./About";
import ServicesAndPrices from "./ServicesAndPrices";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import ConnectionsAndFriend from "./ConnectionsAndFriend";
import PropTypes from "prop-types";
import {allSpecss} from "./allSpecs";

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
    const allSpecs =  allSpecss;
    const [editMode, setEditMode] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const handleEditToggle = useCallback(() => {
        setEditMode(prev => !prev);
    }, []);

    const handleSave = useCallback(() => {
        setEditMode(false);
        // Логика сохранения данных
    }, []);

    const handleUpload = (newPortfolio) => {
        setProfile(prev => ({
            ...prev,
            portfolio: newPortfolio
        }));
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
                <Divider sx={{my: 2, mt: "30px"}}/>
                <About
                    editMode={editMode}
                    profile={profile}
                    setProfile={setProfile}
                />
                <ServicesAndPrices
                    services={profile.services}
                    editMode={editMode}
                    allSpecs={allSpecs}
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
                    <Portfolio
                        profile={profile}
                        onUpload={handleUpload}
                        editMode={editMode}
                    />
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