import { useMemo } from 'react';
import {
    Box,
    CircularProgress,
    Stack
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { roles } from 'src/roles';
import { useUserData } from 'src/queries/use-user-data';
import { useUserServices } from 'src/queries/use-user-services';
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
import TagsSection from './components/TagsSection';
import DashboardReelsSection from './components/ReelsSection';
import { DashPage } from 'src/components/ctmass-ui';

const OverviewPage = () => {
    const { user } = useAuth();
    const isHomeowner = user?.role === roles.CUSTOMER;

    const { specialties, services: dictionaryServices } = useDictionary();

    const allSpecialtiesArray = useMemo(() => Object.values(specialties || {}), [specialties]);
    const { data: profile, isLoading: loading } = useUserData(user?.id, allSpecialtiesArray);
    const { data: services = [] } = useUserServices(user?.id);

    const initialTags = useMemo(() => profile?.profile?.tags || [], [profile?.profile?.tags]);

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
            <DashPage>
                    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
                        <WelcomeSection
                            profile={profile}
                            reviews={profile?.reviews || []}
                            services={services}
                            dictionaryServices={dictionaryServices}
                            isHomeowner={isHomeowner}
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 3.5 }}>
                            <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
                                <RequestsSection user={user} isHomeowner={isHomeowner} />
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
                                <NotificationsSection userId={user?.id} />
                            </Box>
                        </Stack>

                        {profile?.profile?.plan === 'Pro' && (
                            <DashboardReelsSection userId={user?.id} />
                        )}

                        <ConnectionsSection profile={profile} userSpecialties={profile?.specialties} />

                        {!isHomeowner && (
                            <TagsSection
                                userId={user?.id}
                                initialTags={initialTags}
                            />
                        )}

                        {!isHomeowner && <StatisticsSection userId={user?.id} />}

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 3.5 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <UserPosts
                                    userId={user?.id}
                                    userName={userName}
                                    maxPosts={5}
                                    showActions={true}
                                />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <UserListings
                                    userId={user?.id}
                                    userName={userName}
                                    maxPosts={5}
                                    showActions={true}
                                />
                            </Box>
                        </Stack>
                    </Stack>
            </DashPage>
        </>
    );
};

export default OverviewPage;
