import {useCallback, useEffect, useState} from 'react';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
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
    Typography, useMediaQuery
} from '@mui/material';
import {socialApi} from 'src/api/social';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {paths} from 'src/paths';
import {SocialConnections} from 'src/sections/dashboard/social/social-connections';
import {useAuth} from "src/hooks/use-auth";
import {SpecialistCover} from "src/sections/dashboard/specialist-profile/public/specialist-profile-cover";
import {SpecialistTimeline} from "src/sections/dashboard/specialist-profile/public/specialist-timeline";
import {servicesFeedApi} from "src/api/servicesFeed";
import {addDoc, collection, deleteDoc, doc} from "firebase/firestore";
import {firestore} from "src/libs/firebase";
import toast from "react-hot-toast";
import {useParams} from "react-router";
import {profileApi} from "../api/profile";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import {blueGrey} from "@mui/material/colors";
import {useRouter} from "../hooks/use-router";
import {RouterLink} from "../components/router-link";
import {Issuer} from "../utils/auth";
import {useSearchParams} from "../hooks/use-search-params";
import {useDialog} from "../hooks/use-dialog";
import {PostReviewDialog} from "../sections/dashboard/specialist-profile/public/post-review-dialog";
import {useDispatch, useSelector} from "../store";
import {thunks} from "../thunks/dictionary";
import {roles} from "../roles";
import {ProfileConnections} from "../sections/dashboard/specialist-profile/public/profile-connections";
import UserPlus02Icon from "@untitled-ui/icons-react/build/esm/UserPlus02";
import {useConnection, useConnections} from "../hooks/use-connections";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const tabs = [
    {label: 'Timeline', value: 'timeline'},
    {label: 'Connections', value: 'connections'}
];
const loginPaths = {
    [Issuer.Amplify]: paths.auth.amplify.login,
    [Issuer.Auth0]: paths.auth.auth0.login,
    [Issuer.Firebase]: paths.auth.firebase.login,
    [Issuer.JWT]: paths.auth.jwt.login
};

const useProfile = () => {
    const isMounted = useMounted();
    const {profileId} = useParams();
    const {user, isAuthenticated, issuer} = useAuth();

    const router = useRouter();

    if (!isAuthenticated) {
        const returnTo = window.location.href;
        const searchParams = new URLSearchParams({
            returnTo: returnTo,
            message: "<p>To view the profile of a specialist, leave a review about his work, you need to log in. If you don't have a resident profile yet, then you can go through a <a href=\"/auth/firebase/register?returnTo=" + returnTo + "\">quick registration</a>.</p>"
        }).toString();
        const href = loginPaths[issuer] + `?${searchParams}`;
        router.replace(href);
        return
    }
    if (profileId === user.profilePage || profileId === user.id) {
        if (user.role === roles.CUSTOMER) {
            router.replace(paths.dashboard.customerProfile.index);
        } else {
            router.replace(paths.dashboard.specialistProfile.index);
        }
    }
    const [profile, setProfile] = useState(null);

    const handleProfileGet = useCallback(async () => {
        try {
            const response = await profileApi.getForProfilePage(profileId);

            if (isMounted()) {
                setProfile(response);
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

const usePosts = (profile) => {
    const isMounted = useMounted();
    const [posts, setPosts] = useState([]);
    const [reviewPost, setReviewPost] = useState();
    const [profileRating, setProfileRating] = useState(0);
    const [profileRatingCounts, setProfileRatingCounts] = useState(0);
    const searchParams = useSearchParams();
    const postId = searchParams.get("postId");
    const postReviewAdd = searchParams.get("postReviewAdd");
    const {user} = useAuth();

    const handlePostsGet = useCallback(async () => {
        try {
            if (!profile) {
                return;
            }
            const response = profile.role === roles.CUSTOMER ?
                await servicesFeedApi.getPostsForCustomer({userId: profile.id, email: profile.email}) :
                await servicesFeedApi.getPosts({userId: profile.id});
            const posts = [];
            response.forEach((doc) => {
                const id = doc.id;
                posts.push({id, ...doc.data()});
            });

            if (isMounted()) {
                setPosts(posts);

                const reviews = posts.filter((p) => (p.postType === "project" && p.rating > 0));
                setProfileRatingCounts(reviews.length);
                if (reviews.length > 0) {
                    let result = reviews.reduce((sum, current) => sum + current.rating, 0);
                    setProfileRating(result / reviews.length);
                }
                if (postId) {
                    const revPost = posts.filter((p) => {
                        return p.id === postId;

                    })[0];

                    if (revPost) {
                        setReviewPost(revPost);
                    } else {
                        setReviewPost(null);
                    }
                } else setReviewPost(null);

            }
        } catch (err) {
            // console.error(err);
        }
    }, [isMounted, profile]);

    const handlePostRemove = async (post) => {
        try {
            let userSpecRef = doc(firestore, "specialistPosts", post.id);
            await deleteDoc(userSpecRef);
            handlePostsGet().then().catch();
            toast.success('remove!');
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }

    useEffect(() => {
            handlePostsGet().then().catch();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [profile]);

    return [posts, handlePostRemove, handlePostsGet, profileRating, profileRatingCounts, reviewPost, setReviewPost];
};

const useUserSpecialties = (profile) => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);
    const [userSpecialties, setUserSpecialties] = useState([]);

    useEffect(() => {
        async function fetchData() {
            if (!profile) {
                return;
            }
            const newVar = await profileApi.getUserSpecialtiesById(profile.id);
            setUserSpecialties(newVar);
        }

        fetchData();
    }, [profile]);

    useEffect(() => {
            dispatch(thunks.getDictionary());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userSpecialties]);

    return userSpecialties.map((uS) => {
        return specialties.byId[uS.specialty];
    })
};

export const Page = () => {
    const profile = useProfile();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const userSpecialties = useUserSpecialties(profile);
    const {user} = useAuth();

    const [currentTab, setCurrentTab] = useState('timeline');
    const [status, setStatus] = useState('not_connected');
    const [posts, handlePostRemove, handlePostsGet, profileRating, profileRatingCounts, reviewPost, setReviewPost] = usePosts(profile);
    const [connections, handleConnectionsGet] = useConnections(profile);
    const [connection, handleConnectionGet, handleConnectionAdd, handleConnectionCancel] = useConnection(user, profile, handleConnectionsGet);
    usePageView();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    if (!profile) {
        return null;
    }


    const cover = profile.cover || "/assets/covers/abstract-1-4x3-large.png";
    const avatar = profile.avatar;
    return (
        <>
            <Seo title={"Specialist Profile: " + profile.businessName}/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <div>
                        <Box
                            style={{backgroundImage: `url(${cover})`}}
                            sx={{
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                borderRadius: 1,
                                height: 348,
                                position: 'relative',
                                '&:hover': {
                                    '& button': {
                                        visibility: 'visible'
                                    }
                                }
                            }}
                        >
                        </Box>
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
                                    src={avatar}
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
                                            href={process.env.REACT_APP_HOST_P + "/specialist/" + profile.profilePage}
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
                                                href={process.env.REACT_APP_HOST_P + "/specialist/" + profile.profilePage}
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
                                {/* <Button
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
                                </Button>*/}
                                {!connection ? (
                                    <Button
                                        onClick={handleConnectionAdd}
                                        size="small"
                                        startIcon={(
                                            <SvgIcon>
                                                <UserPlus02Icon/>
                                            </SvgIcon>
                                        )}
                                        variant="outlined"
                                    >
                                        Connect
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleConnectionCancel}
                                            size="small"
                                            startIcon={(
                                                <SvgIcon>
                                                    <PersonRemoveIcon/>
                                                </SvgIcon>
                                            )}
                                            color={"error"}
                                            variant="outlined"
                                        >
                                            Cancel connection
                                        </Button>
                                        {connection.status !== 'connected' &&
                                            <Button
                                                onClick={handleConnectionAdd}
                                                size="small"
                                                startIcon={(
                                                    <SvgIcon>
                                                        <UserPlus02Icon/>
                                                    </SvgIcon>
                                                )}
                                                color={"info"}
                                                variant="outlined"
                                            >
                                                Accept connection
                                            </Button>}
                                    </>
                                )}
                            </Stack>
                            <Tooltip title="Request to connect">
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
                                isOwner={profile.id === user.id}
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
                            <ProfileConnections
                                connections={connections}
                                user={profile}
                            />
                        )}
                    </Box>
                </Container>
            </Box>
            {reviewPost &&
                <PostReviewDialog
                    open={reviewPost}
                    user={user}
                    handlePostsGet={handlePostsGet}
                    key={reviewPost.id}
                    post={reviewPost}
                    rating={reviewPost.rating || 0}
                    comments={reviewPost.comments || []}
                    createdAt={reviewPost.createdAt ? reviewPost.createdAt.toDate() : new Date()}
                    isLiked={reviewPost.likes && reviewPost.likes.find(item => item === user.id)}
                    likes={reviewPost.likes ? reviewPost.likes.length : 0}
                    media={reviewPost.media}
                    message={reviewPost.message}
                    onClose={()=> {
                        setReviewPost(null);
                    }}
                />}
        </>
    );
};

export default Page;
