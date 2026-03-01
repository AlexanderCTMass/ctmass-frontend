import { useEffect, useState, useRef } from 'react';
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Stack
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { roles } from 'src/roles';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { profileApi } from 'src/api/profile';
import { Seo } from 'src/components/seo';
import useDictionary from 'src/hooks/use-dictionaries';
import WelcomeSection from './components/WelcomeSection';
import RequestsSection from './components/RequestsSection';
import NotificationsSection from './components/NotificationsSection';
import ConnectionsSection from './components/ConnectionsSection';
import StatisticsSection from './components/StatisticsSection';
import { UserPosts } from "src/components/blog/user-posts";
import { profileService } from "src/service/profile-service";
import { UserListings } from "src/components/listings/user-listings";

const OverviewPage = () => {
    const { user } = useAuth();
    const isHomeowner = user?.role === roles.CUSTOMER;
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);

    const { specialties, services: dictionaryServices } = useDictionary();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            if (!specialties || Object.keys(specialties).length === 0) {
                return;
            }

            if (fetchedRef.current) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                fetchedRef.current = true;
                const allSpecialtiesArray = Object.values(specialties);
                const data = await extendedProfileApi.getUserData(user.id, allSpecialtiesArray);
                setProfile(data);

                const userServices = await profileApi.getUserServices(user.id).catch(() => []);
                setServices(userServices);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
                fetchedRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id, specialties]);

    useEffect(() => {
        return () => {
            fetchedRef.current = false;
        };
    }, []);

    if (loading) {
        return (
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const userName = profileService.getUserName(user);
    return (
        <>
            <Seo title="Overview" />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                    px: 6
                }}
            >
                <Container maxWidth={false}>
                    <Stack spacing={4}>
                        <WelcomeSection
                            profile={profile}
                            reviews={profile?.reviews || []}
                            services={services}
                            dictionaryServices={dictionaryServices}
                            isHomeowner={isHomeowner}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                <RequestsSection user={user} isHomeowner={isHomeowner} />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                <NotificationsSection userId={user?.id} />
                            </Grid>
                        </Grid>

                        <ConnectionsSection profile={profile} userSpecialties={profile?.specialties} />

                        {!isHomeowner && <StatisticsSection userId={user?.id} />}

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <UserPosts
                                    userId={user?.id}
                                    userName={userName}
                                    maxPosts={5}
                                    showActions={true}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <UserListings
                                    userId={user?.id}
                                    userName={userName}
                                    maxPosts={5}
                                    showActions={true}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default OverviewPage;
