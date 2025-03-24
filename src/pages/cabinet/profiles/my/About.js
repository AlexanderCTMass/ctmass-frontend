import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Stack, Typography, useMediaQuery} from "@mui/material";
import {Edit} from "@mui/icons-material";
import AboutMeModal from "src/pages/cabinet/profiles/my/AboutMeModal";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

const About = ({profile, setProfile, isMyProfile}) => {
    const [aboutEdit, setAboutEdit] = useState(false);

    const handleAboutChange = (value) => {
        const temp = {
            ...profile.profile,
            about: value
        };
        debugger

        setProfile(prev => ({
            ...prev,
            profile: temp
        }));

        extendedProfileApi.updateProfileInfo(profile.profile.id, temp)
    };

    const handleSaveAbout = (text) => {
        handleAboutChange(text);
        setAboutEdit(false);
    };

    const isAboutEmpty = (about) => {
        if (!about) return true;
        return about.length === 0;
    };

    return (
        <Box component="section" sx={{mr: 1.5}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary" sx={{mt: 4, mb: 1}}>
                    ABOUT
                </Typography>
                {isMyProfile && (
                    <Edit fontSize="small"
                          onClick={() => {
                              setAboutEdit(true)
                          }}
                          sx={{
                              cursor: "pointer",
                              transition: "transform 0.2s ease-in-out",
                              "&:hover": {
                                  transform: "scale(1.2)",
                              },
                          }}
                    />)}
            </Stack>

            <Box>
                {!isAboutEmpty(profile?.profile?.about) ? (
                    <Typography
                        variant="body2"
                        sx={{textAlign: 'justify'}}
                    > {profile?.profile?.about} </Typography>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{textAlign: 'justify', fontSize: '14px', mt: 1}}
                    >
                        No information provided
                    </Typography>
                )}
            </Box>

            <AboutMeModal
                open={aboutEdit}
                onClose={() => setAboutEdit(false)}
                onSave={handleSaveAbout}
                initialText={profile?.profile?.about || ''}
            />
        </Box>
    );
};

About.propTypes = {
    editMode: PropTypes.bool.isRequired,
    profile: PropTypes.shape({
        about: PropTypes.string
    }).isRequired,
    setProfile: PropTypes.func.isRequired
};

export default memo(About);