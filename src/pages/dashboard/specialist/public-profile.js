import {useCallback, useEffect, useState} from 'react';
import MessageChatSquareIcon from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import UserPlus02Icon from '@untitled-ui/icons-react/build/esm/UserPlus02';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    IconButton, Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from '@mui/material';
import {blueGrey} from '@mui/material/colors';
import {socialApi} from 'src/api/social';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {SocialConnections} from 'src/sections/dashboard/social/social-connections';
import {SocialTimeline} from 'src/sections/dashboard/social/social-timeline';
import {useAuth} from "src/hooks/use-auth";
import {SpecialistCover} from "src/sections/dashboard/specialist-profile/public/specialist-profile-cover";
import {useParams} from "react-router";
import {SpecialistTimeline} from "../../../sections/dashboard/specialist-profile/public/specialist-timeline";
import {servicesFeedApi} from "../../../api/servicesFeed";
import {doc, deleteDoc} from "firebase/firestore";
import {firestore, storage} from "../../../libs/firebase";
import toast from "react-hot-toast";
import {useDispatch, useSelector} from "../../../store";
import {profileApi} from "../../../api/profile";
import {thunks} from "../../../thunks/dictionary";
import {deleteObject, ref} from "firebase/storage";

const tabs = [
    {label: 'Timeline', value: 'timeline'}
    // {label: 'Connections (test view)', value: 'connections'}
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

    console.log(userSpecialties);
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
            const response = await servicesFeedApi.getPosts({userId: user.id});
            const posts = [];
            response.forEach((doc) => {
                const id = doc.id;
                posts.push({id, ...doc.data()});

            });

            if (isMounted()) {
                setPosts(posts);
                const reviews = posts.filter((p) => p.type === "review");
                setProfileRatingCounts(reviews.length);
                if (reviews.length > 0) {
                    let result = reviews.reduce((sum, current) => sum + current.rating, 0);
                    setProfileRating(result / reviews.length);
                }
                console.log(posts);
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

const useConnections = (search = '') => {
    const [connections, setConnections] = useState([]);
    const isMounted = useMounted();

    const handleConnectionsGet = useCallback(async () => {
        const response = await socialApi.getConnections();

        if (isMounted()) {
            setConnections(response);
        }
    }, [isMounted]);

    useEffect(() => {
            handleConnectionsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [search]);

    return connections.filter((connection) => {
        return connection.name?.toLowerCase().includes(search);
    });
};

export const Page = () => {
    const profile = useProfile();
    const userSpecialties = useUserSpecialties();
    const [currentTab, setCurrentTab] = useState('timeline');
    const [status, setStatus] = useState('not_connected');
    const [posts, handlePostRemove, handlePostsGet, profileRating, profileRatingCounts] = usePosts();
    const [connectionsQuery, setConnectionsQuery] = useState('');
    const connections = useConnections(connectionsQuery);

    usePageView();

    const handleConnectionAdd = useCallback(() => {
        setStatus('pending');
    }, []);

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const handleConnectionsQueryChange = useCallback((event) => {
        setConnectionsQuery(event.target.value);
    }, []);

    if (!profile) {
        return null;
    }

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
                <Container maxWidth="lg">
                    <div>
                        <SpecialistCover profile={profile}/>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            sx={{mt: 5}}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
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
                                    <Typography
                                        color="text.secondary"
                                        variant="overline"
                                    >
                                        Public link for share:
                                        {' '}
                                        <Link
                                            component={RouterLink}
                                            href={process.env.REACT_APP_HOST_P+"/specialist/" + profile.profilePage}
                                            underline="hover"
                                            variant="overline"
                                        >
                                            {process.env.REACT_APP_HOST_P}
                                            /specialist/
                                            {profile.profilePage}
                                        </Link>

                                    </Typography>
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
                                    href={paths.dashboard.profile}
                                >
                                    Profile settings
                                </Button>
                            </Stack>
                            <Tooltip title="More options">
                                <IconButton>
                                    <SvgIcon>
                                        <DotsHorizontalIcon/>
                                    </SvgIcon>
                                </IconButton>
                            </Tooltip>
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
                        {currentTab === 'connections' && (
                            <SocialConnections
                                connections={connections}
                                onQueryChange={handleConnectionsQueryChange}
                                query={connectionsQuery}
                            />
                        )}
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default Page;
