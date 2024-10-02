import {useCallback, useEffect, useState} from 'react';
import {subDays, subHours, subMinutes, subMonths} from 'date-fns';
import {
    Box, Button, Card,
    CardContent,
    Container,
    Divider,
    Stack,
    Tab,
    Tabs,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {AccountBillingSettings} from 'src/sections/dashboard/account/account-billing-settings';
import {AccountGeneralSettings} from 'src/sections/dashboard/account/account-general-settings';
import {AccountNotificationsSettings} from 'src/sections/dashboard/account/account-notifications-settings';
import {AccountTeamSettings} from 'src/sections/dashboard/account/account-team-settings';
import {AccountSecuritySettings} from 'src/sections/dashboard/account/account-security-settings';
import {useAuth} from "../../hooks/use-auth";
import toast from 'react-hot-toast';
import {storage} from "../../libs/firebase";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {profileApi} from "src/api/profile";
import {AccountSpecialistSettings} from "src/sections/dashboard/account/account-specialist-settings";
import {useDispatch, useSelector} from "../../store";
import {thunks} from "../../thunks/dictionary";

const now = new Date();

const tabs = [
    {label: 'General', value: 'general'},
    {label: 'Specialist', value: 'specialist'}
    // {label: 'Billing', value: 'billing'},
    // {label: 'Team', value: 'team'},
    // {label: 'Notifications', value: 'notifications'},
    // {label: 'Security', value: 'security'}
];


const useUserSpecialties = (userId) => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);
    const [userSpecialties, setUserSpecialties] = useState([]);

    useEffect(() => {
        const asyncFn = async () => {
            await dispatch(thunks.getDictionary());
            const newVar = await profileApi.getUserSpecialtiesById(userId);
            setUserSpecialties(newVar);
        };
        asyncFn();

    }, [userId]);


    return userSpecialties.map((uS) => {
        return specialties.byId[uS.specialty];
    })
};

const Page = () => {
    const auth = useAuth();
    const [user, setUser] = useState(auth.user);
    const [currentTab, setCurrentTab] = useState('general');

    const userSpecialties = useUserSpecialties(user.id);

    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const handleProfileChange = useCallback(async (values) => {
        await profileApi.update(user.id, values);
        setUser(await profileApi.get(user.id));
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
    }, []);

    return (
        <>
            <Seo title="Dashboard: Profile"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Stack
                        spacing={3}
                        sx={{mb: 3}}
                    >
                        <Typography variant="h4">
                            Profile
                        </Typography>
                        {/*<div>
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
                        </div>*/}
                    </Stack>

                    <AccountGeneralSettings
                        avatar={user.avatar || ''}
                        email={user.email || ''}
                        businessName={user.businessName || ''}
                        profilePage={user.profilePage || ''}
                        name={user.name || ''}
                        phone={user.phone || ''}
                        handleProfileChange={handleProfileChange}
                        handleAvatarChange={handleAvatarChange}
                    />

                    <AccountSpecialistSettings
                        userId={user.id || ''}
                        publicProfile={user.publicProfile || false}
                        openToWork={user.openToWork || false}
                        address={user.address}
                        userSpecialties={userSpecialties}
                        handleProfileChange={handleProfileChange}
                        handleAvatarChange={handleAvatarChange}
                    />

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
                    {currentTab === 'notifications' && <AccountNotificationsSettings/>}
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
                    <Stack spacing={4}>
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
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Page;
