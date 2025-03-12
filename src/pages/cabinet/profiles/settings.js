import {Backdrop, Box, CircularProgress, Container, Divider, Stack, Tab, Tabs, Typography} from '@mui/material';
import {subDays, subHours, subMinutes, subMonths} from 'date-fns';
import debug from "debug";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import toast from 'react-hot-toast';
import {dictionaryApi} from "src/api/dictionary";
import {profileApi} from "src/api/profile";
import {usersApi} from "src/api/users";
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {AccountBillingSettings} from 'src/sections/dashboard/account/account-billing-settings';
import {AccountGeneralSettings} from 'src/sections/dashboard/account/account-general-settings';
import {AccountNotificationsSettings} from 'src/sections/dashboard/account/account-notifications-settings';
import {AccountSecuritySettings} from 'src/sections/dashboard/account/account-security-settings';
import {AccountSpecialistSettings} from "src/sections/dashboard/account/account-specialist-settings";
import {AccountTeamSettings} from 'src/sections/dashboard/account/account-team-settings';
import {useAuth} from "src/hooks/use-auth";
import {storage} from "src/libs/firebase";

const logger = debug("[Profile Settings]")

const now = new Date();

const initTabs = [
    {label: 'General', value: 'general'},
    {label: 'Specialist', value: 'specialist'},
    // {label: 'Billing', value: 'billing'},
    // {label: 'Team', value: 'team'},
    {label: 'Notifications', value: 'notifications'},
    {label: 'Security', value: 'security'}
];

const useProfile = () => {
    const auth = useAuth();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(false);

    const handleProfileGet = () => {
        setLoading(true);
        logger("start fetching");
        usersApi.getUser(auth.user.id).then(user => {
            logger("user", user);
            profileApi.getUserSpecialtiesById(user.id).then(userSpecialties => {
                logger("start map user specialties", userSpecialties);

                dictionaryApi.getAllSpecialties().then(specialties => {
                    setUser({
                        ...user, specialties: userSpecialties.length === 0 ? [] :
                            userSpecialties.map((uS) => {
                                return specialties.byId[uS.specialty];
                            })
                    });
                }).finally(() => setLoading(false))
            });
        });
    }

    useEffect(() => {
            handleProfileGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [auth]);
    return {user, loading, handleProfileGet}
};

const Page = () => {
    const {user, loading, handleProfileGet} = useProfile();
    const [currentTab, setCurrentTab] = useState('general');
    const [tabs, setTabs] = useState(initTabs);
    usePageView();

    useEffect(() => {
        if (user) {
            setTabs(initTabs.filter((tab) => {
                if (tab.value === 'specialist')
                    return user.serviceProvided;

                return true;
            }))
        }
    }, [user]);

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const handleProfileChange = useCallback(async (values) => {
        await profileApi.update(user.id, values);
        handleProfileGet();
    }, [user]);

    const handleAvatarChange = useCallback(async (e) => {
        try {
            if (e.target.files) {
                const file = e.target.files[0];

                const storageRef = ref(storage, '/avatar/' + user.id + '-' + file.name);
                uploadBytes(storageRef, file).then((snapshot) => {
                    getDownloadURL(storageRef).then((url) => {
                        handleProfileChange({
                            avatar: url
                        });
                        toast.success("Images upload successfully!");
                    })
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }, [user]);

    return (
        !user ? <> <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={loading}
            >
                <CircularProgress color="inherit"/>
            </Backdrop></>
            :
            <>
                <Seo title="Cabinet: Profile settings"/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                    }}
                >
                    <Container maxWidth="xl">
                        <Stack
                            spacing={3}
                            sx={{mb: 3}}
                        >
                            <Typography variant="h2">
                                Profile settings
                            </Typography>
                            <div>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={handleTabsChange}
                                    scrollButtons="auto"
                                    textColor="primary"
                                    value={currentTab}
                                    variant="scrollable"
                                >
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.value}
                                            label={tab.label}
                                            value={tab.value}
                                        />
                                    ))}
                                </Tabs>
                                <Divider/>
                            </div>
                        </Stack>
                        {currentTab === 'general' && (
                            <AccountGeneralSettings
                                user={user}
                                handleProfileChange={handleProfileChange}
                                handleAvatarChange={handleAvatarChange}
                            />)}
                        {currentTab === 'specialist' && (
                            <AccountSpecialistSettings
                                user={user}
                                handleProfileChange={handleProfileChange}
                                handleAvatarChange={handleAvatarChange}
                            />)}
                        {currentTab === 'billing' && (
                            <AccountBillingSettings
                                plan="standard"
                                invoices={[
                                    {
                                        id: '5547409069c59755261f5546',
                                        amount: 4.99,
                                        createdAt: subMonths(now, 1).getTime()
                                    },
                                    {
                                        id: 'a3e17f4b551ff8766903f31f',
                                        amount: 4.99,
                                        createdAt: subMonths(now, 2).getTime()
                                    },
                                    {
                                        id: '28ca7c66fc360d8203644256',
                                        amount: 4.99,
                                        createdAt: subMonths(now, 3).getTime()
                                    }
                                ]}
                            />
                        )}
                        {currentTab === 'team' && (
                            <AccountTeamSettings
                                members={[
                                    {
                                        avatar: '/assets/avatars/avatar-cao-yu.png',
                                        email: 'cao.yu@devias.io',
                                        name: 'Cao Yu',
                                        role: 'Owner'
                                    },
                                    {
                                        avatar: '/assets/avatars/avatar-siegbert-gottfried.png',
                                        email: 'siegbert.gottfried@devias.io',
                                        name: 'Siegbert Gottfried',
                                        role: 'Standard'
                                    }
                                ]}
                            />
                        )}
                        {currentTab === 'notifications' &&
                            <AccountNotificationsSettings notifications={user.notifications || []}
                                                          handleProfileChange={handleProfileChange}/>}
                        {currentTab === 'security' && (
                            <AccountSecuritySettings
                                loginEvents={[
                                    {
                                        id: '1bd6d44321cb78fd915462fa',
                                        createdAt: subDays(subHours(subMinutes(now, 5), 7), 1).getTime(),
                                        ip: '95.130.17.84',
                                        type: 'Credential login',
                                        userAgent: 'Chrome, Mac OS 10.15.7'
                                    },
                                    {
                                        id: 'bde169c2fe9adea5d4598ea9',
                                        createdAt: subDays(subHours(subMinutes(now, 25), 9), 1).getTime(),
                                        ip: '95.130.17.84',
                                        type: 'Credential login',
                                        userAgent: 'Chrome, Mac OS 10.15.7'
                                    }
                                ]}
                            />
                        )}
                        {/* <Stack spacing={4}>
                        <Card>
                            <CardContent>
                                <Grid
                                    container
                                    spacing={3}
                                >
                                    <Grid
                                        xs={12}
                                        md={4}
                                    >
                                        <Typography variant="h6">
                                            Delete Account
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        md={8}
                                    >
                                        <Stack
                                            alignItems="flex-start"
                                            spacing={3}
                                        >
                                            <Typography variant="subtitle1">
                                                Delete your account and all of your source data. This is irreversible.
                                            </Typography>
                                            <Button
                                                color="error"
                                                variant="outlined"
                                            >
                                                Delete account
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>*/}
                    </Container>
                </Box>
            </>
    );
};

export default Page;
