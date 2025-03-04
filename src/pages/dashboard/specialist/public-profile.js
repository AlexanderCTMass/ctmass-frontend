import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    IconButton,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import {socialApi} from 'src/api/social';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {useAuth} from "src/hooks/use-auth";
import {SpecialistCover} from "src/sections/dashboard/specialist-profile/public/specialist-profile-cover";
import {SpecialistTimeline} from "../../../sections/dashboard/specialist-profile/public/specialist-timeline";
import {servicesFeedApi} from "../../../api/servicesFeed";
import {deleteDoc, doc} from "firebase/firestore";
import {firestore, storage} from "../../../libs/firebase";
import toast from "react-hot-toast";
import {useDispatch, useSelector} from "../../../store";
import {profileApi} from "../../../api/profile";
import {thunks} from "../../../thunks/dictionary";
import {deleteObject, ref} from "firebase/storage";
import {roles} from "../../../roles";
import {SharingProfileMenu} from "../../../components/sharing-profile-menu";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import {
    SpecialistQRBusinessCard
} from "../../../sections/dashboard/specialist-profile/public/specialist-qr-business-card";
import {useRouter} from "../../../hooks/use-router";
import {useSettings} from "../../../hooks/use-settings";
import {ProfileConnections} from "../../../sections/dashboard/specialist-profile/public/profile-connections";
import {useConnections} from "../../../hooks/use-connections";
import CertificatesCarousel from "../../../sections/dashboard/specialist-profile/public/CertificatesCarousel";

const tabs = [
    {label: 'Timeline', value: 'timeline'},
    {label: 'Connections', value: 'connections'},
    {label: 'Certificates', value: 'certificates'}
];

const useProfile = () => {
    const isMounted = useMounted();
    const {user} = useAuth();

    const [profile, setProfile] = useState(null);

    const handleProfileGet = useCallback(async () => {
        try {
            const response = await socialApi.getProfile();

            if (isMounted()) {
                setProfile({...user, response});
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);


    useEffect(() => {
            handleProfileGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return profile;
};


const useUserSpecialties = () => {
    const {user} = useAuth();
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);
    const [userSpecialties, setUserSpecialties] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const newVar = await profileApi.getUserSpecialtiesById(user.id);
            setUserSpecialties(newVar);
        }

        fetchData();
    }, []);

    useEffect(() => {
            dispatch(thunks.getDictionary());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userSpecialties]);

    return userSpecialties.map((uS) => {
        return specialties.byId[uS.specialty];
    })
};

const usePosts = () => {
    const isMounted = useMounted();
    const [posts, setPosts] = useState([]);
    const {user} = useAuth();
    const [profileRating, setProfileRating] = useState(0);
    const [profileRatingCounts, setProfileRatingCounts] = useState(0);

    const handlePostsGet = useCallback(async () => {
        try {
            const posts = await servicesFeedApi.getPosts({userId: user.id});
            if (isMounted()) {
                setPosts(posts);
                const reviews = posts.filter((p) => (p.postType === "project" && p.rating > 0));
                setProfileRatingCounts(reviews.length);
                if (reviews.length > 0) {
                    let result = reviews.reduce((sum, current) => sum + current.rating, 0);
                    setProfileRating(result / reviews.length);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    const handlePostRemove = async (post) => {
        try {
            if (post.photos) {
                post.photos.forEach(photo => {
                    const imgRef = ref(storage, photo);
                    deleteObject(imgRef).then(async () => {
                        toast.success('Photo remove!');
                    }).catch((error) => {
                        throw error;
                    });
                })
            }

            let userSpecRef = doc(firestore, "specialistPosts", post.id);
            await deleteDoc(userSpecRef);
            handlePostsGet();
            toast.success('remove!');
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }

    useEffect(() => {
            handlePostsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return [posts, handlePostRemove, handlePostsGet, profileRating, profileRatingCounts];
};


function getPageUrl(profile) {
    return process.env.REACT_APP_HOST_P + "/specialist/" + profile.profilePage;
}

export const Page = () => {
    const profile = useProfile();
    const router = useRouter();
    const userSpecialties = useUserSpecialties();
    const [currentTab, setCurrentTab] = useState('timeline');
    const [status, setStatus] = useState('not_connected');
    const [qrOpen, setQrOpen] = useState(false);
    const [posts, handlePostRemove, handlePostsGet, profileRating, profileRatingCounts] = usePosts();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const settings = useSettings();
    const [connections, handleConnectionsGet] = useConnections(profile);

    usePageView();

    const handleQrOpen = useCallback(() => {
        setQrOpen(true);
    }, []);
    const handleQrClose = useCallback(() => {
        setQrOpen(false);
    }, []);

    const handleConnectionAdd = useCallback(() => {
        setStatus('pending');
    }, []);

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);


    if (!profile) {
        return null;
    }

    let specialistProfileUrl = getPageUrl(profile);
    return (
        <>
            <Seo title="Dashboard: Specialist Profile"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth={settings.stretch ? false : 'xl'}>
                    <div>
                        <SpecialistCover profile={profile}/>
                        <Stack
                            alignItems="center"
                            direction={mdUp ? "column" : "row"}
                            spacing={2}
                            sx={{
                                mt: {
                                    md: 5,
                                    xs: -5
                                }
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction={mdUp ? "column" : "row"}
                                spacing={2}
                            >
                                <Avatar
                                    src={profile.avatar}
                                    sx={{
                                        height: 64,
                                        width: 64
                                    }}
                                />
                                <div>
                                    <Typography variant="h4">
                                        {profile.businessName}
                                    </Typography>
                                    {!mdUp ? (<Typography
                                        color="text.secondary"
                                        variant="overline"
                                    >
                                        Public link for share:
                                        {' '}
                                        <Link
                                            component={RouterLink}
                                            href={specialistProfileUrl}
                                            underline="hover"
                                            variant="overline"
                                        >
                                            {process.env.REACT_APP_HOST_P}
                                            /specialist/
                                            {profile.profilePage}
                                        </Link>

                                    </Typography>) : (
                                        <Typography
                                            color="text.secondary"
                                            variant="overline"
                                        > Public link for share:
                                            {' '}
                                            <Link
                                                component={RouterLink}
                                                href={specialistProfileUrl}
                                                underline="hover"
                                                variant="overline"
                                            >
                                                .../
                                                {profile.profilePage}
                                            </Link>

                                        </Typography>
                                    )}
                                </div>
                            </Stack>
                            <Box sx={{flexGrow: 1}}/>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                                sx={{
                                    display: {
                                        md: 'block',
                                        xs: 'none'
                                    }
                                }}
                            >
                                <Button
                                    component="a"
                                    size="small"
                                    startIcon={(
                                        <SvgIcon>
                                            <ManageAccountsIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="outlined"
                                    href={paths.dashboard.userSettings}
                                >
                                    Profile settings
                                </Button>
                            </Stack>
                            <Stack
                                alignItems="center"
                                direction="row">
                                <Tooltip title="Profile settings" sx={{
                                    display: {
                                        md: 'none',
                                        xs: 'block'
                                    }
                                }}>
                                    <IconButton component="a" href={paths.dashboard.userSettings}>
                                        <SvgIcon>
                                            <ManageAccountsIcon/>
                                        </SvgIcon>
                                    </IconButton>
                                </Tooltip>
                                <SharingProfileMenu url={specialistProfileUrl}
                                                    user={profile}/>
                                <Tooltip title="QR business card">
                                    <IconButton onClick={handleQrOpen}>
                                        <SvgIcon>
                                            <QrCode2Icon/>
                                        </SvgIcon>
                                    </IconButton>
                                </Tooltip>
                                {/*<Tooltip title="More options">
                                <IconButton>
                                    <SvgIcon>
                                        <DotsHorizontalIcon/>
                                    </SvgIcon>
                                </IconButton>
                            </Tooltip>*/}
                            </Stack>
                        </Stack>
                    </div>
                    <Tabs
                        indicatorColor="primary"
                        onChange={handleTabsChange}
                        scrollButtons="auto"
                        sx={{mt: 5}}
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
                    <Box sx={{mt: 3}}>
                        {currentTab === 'timeline' && (
                            <SpecialistTimeline
                                isOwner={true}
                                posts={posts}
                                profile={profile}
                                userSpecialties={userSpecialties}
                                handlePostsGet={handlePostsGet}
                                handlePostRemove={handlePostRemove}
                                profileRating={profileRating}
                                profileRatingCounts={profileRatingCounts}
                            />
                        )}
                        {currentTab === 'certificates' && (
                            <CertificatesCarousel userId={profile.id}/>
                        )}
                        {currentTab === 'connections' && (
                            <ProfileConnections user={profile}
                                                connections={connections}
                            />
                        )}
                    </Box>
                </Container>
            </Box>
            <SpecialistQRBusinessCard open={qrOpen} url={specialistProfileUrl} user={profile}
                                      userSpecialties={userSpecialties} onClose={handleQrClose}/>
        </>
    );
};

export default Page;
