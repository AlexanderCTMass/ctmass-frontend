import { Skeleton, Stack } from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cabinetApi } from 'src/api/cabinet';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { AccountNotificationsSettings } from 'src/sections/dashboard/account/account-notifications-settings';
import { AccountPushSettings } from 'src/sections/dashboard/account/account-push-settings';
import { BackLink, DashPage, Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import { RADIUS } from 'src/theme/ctmass-tokens';

const ProfileNotificationsPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            setLoading(true);
            const result = await cabinetApi.getNotificationPreferences(user.id);
            setProfile(result);
        } catch (error) {
            console.error(error);
            toast.error("We couldn't load your notification settings.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleProfileChange = useCallback(
        async (updates) => {
            if (!user) {
                return;
            }

            try {
                await cabinetApi.updateNotificationPreferences(user.id, updates.notificationPreferences);
                setProfile((prev) => ({
                    ...prev,
                    notificationPreferences: updates.notificationPreferences
                }));
            } catch (error) {
                console.error(error);
                toast.error("We couldn't update your notification settings.");
                throw error;
            }
        },
        [user]
    );

    return (
        <>
            <Seo title="Notifications" />
            <DashPage
                title="Notifications"
                subtitle="Choose how and how often CTMASS keeps you posted."
                back={<BackLink href={paths.dashboard.profile.information}>Profile settings</BackLink>}
                maxWidth="lg"
            >
                <Stack spacing={{ xs: 2.5, md: 3 }}>
                    <AccountPushSettings />
                    <Surface>
                        <SurfaceHeader
                            icon={<MailOutlineRoundedIcon />}
                            title="Email"
                            subtitle="New responses, messages and project updates."
                        />
                        {loading || !profile ? (
                            <Stack spacing={1.25}>
                                <Skeleton variant="rounded" height={140} sx={{ borderRadius: RADIUS.inner }} />
                                <Skeleton variant="rounded" height={64} sx={{ borderRadius: RADIUS.inner }} />
                            </Stack>
                        ) : (
                            <AccountNotificationsSettings
                                user={profile}
                                handleProfileChange={handleProfileChange}
                            />
                        )}
                    </Surface>
                </Stack>
            </DashPage>
        </>
    );
};

export default ProfileNotificationsPage;
