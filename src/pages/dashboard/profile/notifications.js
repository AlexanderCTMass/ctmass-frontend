import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cabinetApi } from 'src/api/cabinet';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { AccountNotificationsSettings } from 'src/sections/dashboard/account/account-notifications-settings';

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
            toast.error('Не удалось загрузить настройки уведомлений');
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
                toast.error('Не удалось обновить настройки уведомлений');
                throw error;
            }
        },
        [user]
    );

    return (
        <>
            <Seo title="Profile settings — Notifications" />
            <Box
                component="main"
                sx={{
                    px: { xs: 2, sm: 3, lg: 6 },
                    py: { xs: 7, sm: 8 },
                    maxWidth: 1280,
                    // mx: 'auto'
                }}
            >
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700}>
                            Profile settings
                        </Typography>
                    </Stack>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={4}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <NotificationsActiveOutlinedIcon color="primary" />
                                    <Typography variant="h6">
                                        Notification preferences
                                    </Typography>
                                </Stack>

                                {loading || !profile ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: 320
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <AccountNotificationsSettings
                                        user={profile}
                                        handleProfileChange={handleProfileChange}
                                    />
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </>
    );
};

export default ProfileNotificationsPage;