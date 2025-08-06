import React, {useEffect, useState} from 'react';
import {Box, LinearProgress, Typography, Chip, Tooltip, useTheme, useMediaQuery} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {profileApi} from "src/api/profile";
import {ERROR} from "src/libs/log";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

const useProfileSubscription = (profileId) => {
    const [profile, setProfile] = useState(null);
    const [educations, setEducations] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile;
        let unsubscribeEducations;
        let unsubscribePortfolio;
        let unsubscribeSpecialties;

        const fetchAndSubscribe = async () => {
            try {
                // 1. Получаем и подписываемся на основной профиль
                const initialProfile = await profileApi.get(profileId);
                setProfile(initialProfile);

                const initSpecialties = await profileApi.getUserSpecialtiesById(profileId);
                setSpecialties(initSpecialties);

                // 2. Получаем и подписываемся на подколлекцию educations
                const initialEducations = await extendedProfileApi.getEducation(profileId);
                setEducations(initialEducations);

                const iniPortfolio = await extendedProfileApi.getPortfolio(profileId);
                setPortfolio(iniPortfolio);

                unsubscribeProfile = await profileApi.subscribe(profileId, (updatedProfile) => {
                    setProfile(updatedProfile);
                });

                unsubscribeProfile = await profileApi.subscribeSpecialties(profileId, (updatedProfile) => {
                    setSpecialties(updatedProfile);
                });

                unsubscribeEducations = await profileApi.subscribeEducations(profileId, (updatedEducations) => {
                    setEducations(updatedEducations);
                });

                unsubscribePortfolio = await profileApi.subscribePortfolio(profileId, (updatedEducations) => {
                    setPortfolio(updatedEducations);
                });

                setLoading(false);
            } catch (err) {
                ERROR(err);
                setLoading(false);
            }
        };

        fetchAndSubscribe();

        return () => {
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeEducations) unsubscribeEducations();
            if (unsubscribePortfolio) unsubscribePortfolio();
            if (unsubscribeSpecialties) unsubscribeSpecialties();
        };
    }, [profileId]);

    return {profile, educations, portfolio, specialties, loading};
};

const ProfileCompletionProgress = ({
                                       profileId,
                                       emailHandler,
                                       phoneHandler,
                                       businessNameHandler,
                                       avatarHandler,
                                       aboutHandler,
                                       hourlyRateHandler,
                                       addressHandler,
                                       educationsHandler,
                                       specialtiesHandler,
                                       portfolioHandler,
                                       reviewsHandler
                                   }) => {
    const {profile, educations, portfolio, specialties, loading} = useProfileSubscription(profileId);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (loading) return <Typography>Loading profile...</Typography>;
    if (!profile) return null;

    const profileFields = [
        {
            key: 'email',
            label: 'Email',
            completed: !!profile?.email,
            tooltip: 'Your primary contact email',
            handler: emailHandler
        },
        /* {
             key: 'phone',
             label: 'Phone',
             completed: !!profile?.phone,
             tooltip: 'Add your phone number to get more client calls',
             handler: phoneHandler
         },*/
        {
            key: 'businessName',
            label: isMobile ? 'Business' : 'Business Name',
            completed: !!profile?.businessName,
            tooltip: 'Make your profile more professional with a business name',
            handler: businessNameHandler
        },
        {
            key: 'avatar',
            label: isMobile ? 'Photo' : 'Profile Photo',
            completed: !!profile?.avatar,
            tooltip: 'Add a photo to make your profile 5x more likely to be contacted',
            handler: avatarHandler
        },
        {
            key: 'about',
            label: 'About',
            completed: !!profile?.about,
            tooltip: 'Tell clients about your skills and experience',
            handler: aboutHandler
        },
        {
            key: 'address',
            label: 'Address',
            completed: !!profile?.address,
            tooltip: 'Add your location to appear in local searches',
            handler: addressHandler
        },
        {
            key: 'educations',
            label: isMobile ? 'Edu' : 'Education',
            completed: educations?.length > 0,
            tooltip: 'Show your qualifications to build trust',
            handler: educationsHandler
        },
        {
            key: 'specialties',
            label: isMobile ? 'Spec' : 'Specialties',
            completed: specialties?.length > 0,
            tooltip: 'List your specialties to attract the right clients',
            handler: specialtiesHandler
        },
        {
            key: 'hourlyRate',
            label: 'Standard Hourly Rate',
            completed: !!profile?.hourlyRate,
            tooltip: 'What\'s your standard hourly rate',
            handler: hourlyRateHandler
        },
        {
            key: 'portfolio',
            label: isMobile ? 'Work' : 'Portfolio',
            completed: portfolio?.length > 0,
            tooltip: 'Showcase your best work with images and descriptions',
            handler: portfolioHandler
        },
        /*{
            key: 'reviews',
            label: 'Reviews',
            completed: !!profile?.reviews?.length,
            tooltip: 'Ask satisfied clients to leave reviews',
            handler: reviewsHandler
        }*/
    ];

    const completedCount = profileFields.filter(field => field.completed).length;
    const completionPercentage = (completedCount / profileFields.length) * 100;
    const incompleteFields = profileFields.filter(field => !field.completed);

    if (completionPercentage === 100) return null;

    return (
        <Box sx={{
            width: '100%',
            p: isMobile ? 1 : 2,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            boxSizing: 'border-box'
        }}>
            <Box display="flex" alignItems="center" mb={1}>
                <Typography variant={isMobile ? 'body2' : 'subtitle2'} sx={{mr: 1}}>
                    Profile Strength: {Math.round(completionPercentage)}%
                </Typography>
                <Tooltip title="Complete your profile to stand out from other professionals">
                    <InfoOutlined fontSize="small" color="action"/>
                </Tooltip>
            </Box>

            <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                    height: isMobile ? 6 : 8,
                    borderRadius: 4,
                    mb: isMobile ? 1 : 2
                }}
            />

            {incompleteFields.length > 0 && (
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        To be more competitive:
                    </Typography>
                    <Box sx={{
                        mt: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: isMobile ? 0.5 : 1
                    }}>
                        {incompleteFields.map((field) => (
                            <Tooltip key={field.key} title={field.tooltip}>
                                <Chip
                                    label={field.label}
                                    size={isMobile ? 'small' : 'medium'}
                                    variant="outlined"
                                    onClick={() => {
                                        if (field.handler) field.handler();
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: isMobile ? '0.7rem' : '0.8125rem',
                                        m: isMobile ? '2px' : 0
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ProfileCompletionProgress;