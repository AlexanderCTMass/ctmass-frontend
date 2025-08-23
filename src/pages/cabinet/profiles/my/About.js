import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, IconButton, Stack, SvgIcon, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { Edit } from "@mui/icons-material";
import AboutMeModal from "src/pages/cabinet/profiles/my/AboutMeModal";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { INFO } from "src/libs/log";
import useDictionary from "src/hooks/use-dictionaries";
import { profileApi } from "src/api/profile";
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";


const useProfile = (profile) => {
    const { categories, specialties, services, loading } = useDictionary();
    const [filledProfile, setFilledProfile] = useState({});
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        setIsFetching(false);
        const fetchData = async () => {
            const specialtiesList = profile?.specialties.map(uS => specialties.byId[uS.specialty]) || [];

            setFilledProfile({ ...profile.profile, specialties: specialtiesList, education: profile.education });
            setIsFetching(true);
        };

        if (loading && profile) {
            fetchData();
        }
    }, [loading, profile]);

    return { filledProfile, isFetching };
};


const About = ({ profile, setProfile, isMyProfile }) => {
    const [aboutEdit, setAboutEdit] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { filledProfile, isFetching } = useProfile(profile);

    INFO("About", profile);

    const handleAboutChange = async (value) => {
        const temp = {
            ...profile.profile,
            about: value
        };

        setProfile(prev => ({
            ...prev,
            profile: temp
        }));

        await extendedProfileApi.updateProfileInfo(profile.profile.id, temp);
    };

    const handleSaveAbout = (text) => {
        handleAboutChange(text);
        setAboutEdit(false);
    };

    const isAboutEmpty = (about) => {
        if (!about) return true;
        return about.length === 0;
    };

    if (!isFetching) {
        return <CircularProgress />
    }

    return (
        <Box
            component="section"
            sx={{ mr: 1.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary" sx={{ mt: 4, mb: 1 }}>
                    ABOUT
                </Typography>
                {isMyProfile && (
                    <IconButton
                        onClick={() => setAboutEdit(true)}
                        sx={{
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <Tooltip title="Edit about">
                            <SvgIcon fontSize="small">
                                <EditIcon />
                            </SvgIcon>
                        </Tooltip>
                    </IconButton>
                )}
            </Stack>

            <Box>
                {!isAboutEmpty(profile?.profile?.about) ? (
                    <Typography
                        variant="body2"
                        sx={{ textAlign: 'justify', whiteSpace: 'pre-line' }}
                    >
                        {profile?.profile?.about}
                    </Typography>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'justify', fontSize: '14px', mt: 1 }}
                    >
                        No information provided
                    </Typography>
                )}
            </Box>

            <AboutMeModal
                open={aboutEdit}
                onClose={() => setAboutEdit(false)}
                onSave={handleSaveAbout}
                profile={filledProfile}
                initialText={filledProfile.about || ''}
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